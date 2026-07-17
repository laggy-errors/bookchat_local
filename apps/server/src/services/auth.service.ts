import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: { email: string; passwordHash: string; username?: string }) {
    const emailNormalized = data.email.toLowerCase().trim();
    
    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      throw new BadRequestError('A user with this email address already exists');
    }

    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername) {
        throw new BadRequestError('This username is already taken');
      }
    }

    // Securely hash password
    const saltedPasswordHash = await bcrypt.hash(data.passwordHash, 10);

    // Create user in transaction with an associated profile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: emailNormalized,
          passwordHash: saltedPasswordHash,
          username: data.username || emailNormalized.split('@')[0],
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          displayName: data.username || emailNormalized.split('@')[0],
          bio: 'A newly registered scribe of the ledger.',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'REGISTER',
          entity: 'USER',
          entityId: newUser.id,
          details: `User registered with email: ${emailNormalized}`,
        },
      });

      return newUser;
    });

    // Generate credentials
    const accessToken = this.generateAccessToken(user.id, user.email);
    const { rawToken, expiresAt } = this.generateRefreshTokenDetails();
    const tokenHash = this.hashRefreshToken(rawToken);

    // Store secure hashed refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken: rawToken };
  }

  /**
   * Authenticate a user
   */
  async login(data: { email: string; passwordPlain: string }) {
    const emailNormalized = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(data.passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Create session audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        details: `User logged in successfully`,
      },
    });

    // Generate credentials
    const accessToken = this.generateAccessToken(user.id, user.email);
    const { rawToken, expiresAt } = this.generateRefreshTokenDetails();
    const tokenHash = this.hashRefreshToken(rawToken);

    // Store secure hashed refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken: rawToken };
  }

  /**
   * Rotate refresh and access tokens (Token Rotation pattern)
   */
  async refresh(data: { refreshToken: string }) {
    const tokenHash = this.hashRefreshToken(data.refreshToken);

    // Find token in db
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Verify expiration
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Generate new credentials
    const accessToken = this.generateAccessToken(storedToken.user.id, storedToken.user.email);
    const { rawToken: newRawToken, expiresAt: newExpiresAt } = this.generateRefreshTokenDetails();
    const newTokenHash = this.hashRefreshToken(newRawToken);

    // Replace old refresh token with the new rotated refresh token in transaction
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    return { accessToken, refreshToken: newRawToken };
  }

  /**
   * Revoke a refresh token on logout
   */
  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await prisma.refreshToken.delete({
      where: { tokenHash },
    }).catch(() => {
      // Gracefully catch if token is already deleted
    });
    return { success: true };
  }

  /**
   * Generate password reset token and "send" email (console printed link)
   */
  async forgotPassword(email: string) {
    const emailNormalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      // Security best practice: don't disclose whether email exists
      return { success: true };
    }

    // Generate short-lived reset token (JWT)
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Print to server console to simulate email
    console.log('\n========================================');
    console.log('✉️  [MAIL SIMULATOR] Password Reset Requested');
    console.log(`To: ${emailNormalized}`);
    console.log(`Reset Token JWT: ${resetToken}`);
    console.log(`Click this link to reset password (handled by frontend):`);
    console.log(`http://localhost:3000/auth/reset-password?token=${resetToken}`);
    console.log('========================================\n');

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FORGOT_PASSWORD_REQUEST',
        entity: 'USER',
        entityId: user.id,
        details: `Password reset link generated for email: ${emailNormalized}`,
      },
    });

    return { success: true };
  }

  /**
   * Reset user password using verified token
   */
  async resetPassword(data: { token: string; passwordPlain: string }) {
    let decoded: { userId: string; purpose: string };
    try {
      decoded = jwt.verify(data.token, config.jwtSecret) as { userId: string; purpose: string };
    } catch (e) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password-reset') {
      throw new BadRequestError('Invalid token purpose');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Securely hash new password
    const saltedPasswordHash = await bcrypt.hash(data.passwordPlain, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: saltedPasswordHash },
      });

      // Revoke all refresh tokens on password change
      await tx.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET',
          entity: 'USER',
          entityId: user.id,
          details: 'User password was reset successfully',
        },
      });
    });

    return { success: true };
  }

  /**
   * Request email verification token
   */
  async requestEmailVerification(email: string) {
    const emailNormalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new NotFoundError('User with this email address does not exist');
    }

    // Generate short-lived email verification token
    const verificationToken = jwt.sign(
      { email: emailNormalized, purpose: 'email-verification' },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Print to server console to simulate email
    console.log('\n========================================');
    console.log('✉️  [MAIL SIMULATOR] Email Verification Requested');
    console.log(`To: ${emailNormalized}`);
    console.log(`Verification Token JWT: ${verificationToken}`);
    console.log(`Click this link to verify email (handled by frontend):`);
    console.log(`http://localhost:3000/auth/verify-email?token=${verificationToken}`);
    console.log('========================================\n');

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_VERIFICATION_REQUEST',
        entity: 'USER',
        entityId: user.id,
        details: `Email verification link generated for email: ${emailNormalized}`,
      },
    });

    return { success: true };
  }

  /**
   * Verify email verification token
   */
  async verifyEmail(token: string) {
    let decoded: { email: string; purpose: string };
    try {
      decoded = jwt.verify(token, config.jwtSecret) as { email: string; purpose: string };
    } catch (e) {
      throw new BadRequestError('Invalid or expired email verification token');
    }

    if (decoded.purpose !== 'email-verification') {
      throw new BadRequestError('Invalid token purpose');
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.$transaction(async (tx) => {
      // Record verification in profile bio or custom logs
      await tx.profile.update({
        where: { userId: user.id },
        data: {
          bio: `A verified scribe of the library.`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_VERIFICATION_SUCCESS',
          entity: 'USER',
          entityId: user.id,
          details: `User email verified: ${decoded.email}`,
        },
      });
    });

    return { success: true };
  }

  async loginOrRegisterWithGoogle(data: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    const emailNormalized = data.email.toLowerCase().trim();

    // 1. Check if user already exists with googleId
    let user = await prisma.user.findUnique({
      where: { googleId: data.googleId },
    });

    if (!user) {
      // 2. Check if user exists with the same email
      user = await prisma.user.findUnique({
        where: { email: emailNormalized },
      });

      if (user) {
        // Link the Google account to the existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: data.googleId },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LINK_GOOGLE',
            entity: 'USER',
            entityId: user.id,
            details: `Linked Google account ${data.googleId} to existing email ${emailNormalized}`,
          },
        });
      } else {
        // Find a unique username prefix
        const baseUsername = emailNormalized.split('@')[0];
        let uniqueUsername = baseUsername;
        let count = 1;
        while (true) {
          const existingUserByUsername = await prisma.user.findUnique({
            where: { username: uniqueUsername },
          });
          if (!existingUserByUsername) {
            break;
          }
          uniqueUsername = `${baseUsername}${count}`;
          count++;
        }

        // 3. Create a new User + Profile + AuditLog
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: emailNormalized,
              googleId: data.googleId,
              username: uniqueUsername,
            },
          });

          await tx.profile.create({
            data: {
              userId: newUser.id,
              displayName: data.name || uniqueUsername,
              bio: 'A newly registered scribe of the ledger via Google.',
              avatarUrl: data.avatarUrl || null,
            },
          });

          await tx.auditLog.create({
            data: {
              userId: newUser.id,
              action: 'REGISTER_GOOGLE',
              entity: 'USER',
              entityId: newUser.id,
              details: `User registered with Google email: ${emailNormalized}`,
            },
          });

          return newUser;
        });
      }
    }

    // 4. Create login session audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_GOOGLE',
        entity: 'USER',
        entityId: user.id,
        details: `User logged in successfully via Google`,
      },
    });

    // 5. Generate credentials
    const accessToken = this.generateAccessToken(user.id, user.email);
    const { rawToken, expiresAt } = this.generateRefreshTokenDetails();
    const tokenHash = this.hashRefreshToken(rawToken);

    // Store secure hashed refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken: rawToken };
  }

  private generateAccessToken(id: string, email: string): string {
    return jwt.sign({ id, email }, config.jwtSecret, { expiresIn: '15m' });
  }

  private generateRefreshTokenDetails() {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return { rawToken, expiresAt };
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authService = new AuthService();
