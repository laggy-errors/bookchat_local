import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { config } from '../config';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username } = req.body;
      const result = await authService.register({
        email,
        passwordHash: password,
        username,
      });
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({
        email,
        passwordPlain: password,
      });
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh({ refreshToken });
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(200).json({
        status: 'success',
        message: 'Successfully logged out and session revoked',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: 'If the email matches a registered user, a reset link has been dispatched.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword({ token, passwordPlain: password });
      res.status(200).json({
        status: 'success',
        message: 'Password successfully updated.',
      });
    } catch (error) {
      next(error);
    }
  }

  async requestEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.requestEmailVerification(email);
      res.status(200).json({
        status: 'success',
        message: 'Verification link has been dispatched to your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      res.status(200).json({
        status: 'success',
        message: 'Email has been successfully verified.',
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!config.googleClientId || !config.googleClientSecret) {
        res.status(400).send(`
          <html>
            <body style="font-family: sans-serif; padding: 2rem; background: #faf9f5; color: #1a0f08;">
              <h2>Google OAuth Configuration Missing</h2>
              <p>Please configure the <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> environment variables in AI Studio.</p>
              <button onclick="window.close()" style="padding: 0.5rem 1rem; border: 1px solid #1a0f08; background: #fff; cursor: pointer;">Close Window</button>
            </body>
          </html>
        `);
        return;
      }

      const redirectUri = `${config.appUrl.replace(/\/$/, '')}/auth/google/callback`;
      const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, error } = req.query;

      if (error) {
        throw new Error(String(error));
      }

      if (!code) {
        throw new Error('Authorization code not provided');
      }

      const redirectUri = `${config.appUrl.replace(/\/$/, '')}/auth/google/callback`;

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: String(code),
          client_id: config.googleClientId!,
          client_secret: config.googleClientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to exchange code for token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json() as { access_token: string };
      const googleAccessToken = tokenData.access_token;

      // Fetch user profile from Google
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile from Google');
      }

      const googleProfile = await profileResponse.json() as {
        sub: string;
        email: string;
        name: string;
        picture?: string;
      };

      // Perform login or register
      const result = await authService.loginOrRegisterWithGoogle({
        googleId: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name,
        avatarUrl: googleProfile.picture,
      });

      // Send the tokens to the opening window using postMessage and close the popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  data: ${JSON.stringify(result)}
                }, '*');
                window.close();
              } else {
                localStorage.setItem('access_token', '${result.accessToken}');
                localStorage.setItem('refresh_token', '${result.refreshToken}');
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window now.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Google OAuth callback error:', err);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; padding: 2rem; background: #faf9f5; color: #1a0f08;">
            <h2>Google Authentication Failed</h2>
            <p style="color: #c92a2a;">${err?.message || 'An unexpected error occurred.'}</p>
            <button onclick="window.close()" style="padding: 0.5rem 1rem; border: 1px solid #1a0f08; background: #fff; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  }
}

export const authController = new AuthController();
