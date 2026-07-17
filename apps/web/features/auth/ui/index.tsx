'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} from '../hooks';
import { useUserStore } from '../../../stores/user-store';

// Zod validation schemas for forms
const loginSchema = z.object({
  email: z.string().email('Enter a valid scribe email'),
  password: z.string().min(1, 'Password is required to unlock your ledger'),
});

const registerSchema = z.object({
  email: z.string().email('Enter a valid email identity'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters for security'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter your registered email address'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'New password must be at least 8 characters long'),
});

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;
type ForgotFields = z.infer<typeof forgotPasswordSchema>;
type ResetFields = z.infer<typeof resetPasswordSchema>;

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export function AuthJournal({ isSettling = false }: { isSettling?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setSession = useUserStore((state) => state.setSession);

  // Route actions
  const actionParam = searchParams.get('action');
  const tokenParam = searchParams.get('token');

  const [mode, setMode] = useState<AuthMode>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verificationTriggered = useRef(false);

  // Mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const forgotMutation = useForgotPasswordMutation();
  const resetMutation = useResetPasswordMutation();
  const verifyMutation = useVerifyEmailMutation();

  // Detect URL actions
  useEffect(() => {
    if (actionParam === 'reset-password' && tokenParam) {
      setMode('reset');
    } else if (actionParam === 'verify-email' && tokenParam) {
      setMode('verify');
      if (!verificationTriggered.current) {
        verificationTriggered.current = true;
        // Auto-trigger email verification
        verifyMutation.mutate(tokenParam, {
          onSuccess: (data: any) => {
            setSuccessMessage(data.message || 'Your email has been successfully verified in our logs!');
          },
          onError: (err: any) => {
            setErrorMessage(err.message || 'The verification link has expired or is invalid.');
          },
        });
      }
    } else if (actionParam) {
      setMode('login');
    }
  }, [actionParam, tokenParam]);

  // Form setups
  const loginForm = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '' },
  });

  const forgotForm = useForm<ForgotFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '' },
  });

  const onLoginSubmit = (data: LoginFields) => {
    setErrorMessage(null);
    loginMutation.mutate(
      { email: data.email, passwordPlain: data.password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Invalid email credentials or password.');
        },
      }
    );
  };

  const onRegisterSubmit = (data: RegisterFields) => {
    setErrorMessage(null);
    registerMutation.mutate(
      { email: data.email, passwordHash: data.password, username: data.username },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Registration failed. The email or username may be in use.');
        },
      }
    );
  };

  const onForgotSubmit = (data: ForgotFields) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        setSuccessMessage('A magical parchment containing your reset instructions has been sent to the console.');
        forgotForm.reset();
      },
      onError: (err: any) => {
        setErrorMessage(err.message || 'Could not process password recovery.');
      },
    });
  };

  const onResetSubmit = (data: ResetFields) => {
    if (!tokenParam) {
      setErrorMessage('Missing validation credentials token.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    resetMutation.mutate(
      { token: tokenParam, passwordPlain: data.password },
      {
        onSuccess: () => {
          setSuccessMessage('Your credentials have been successfully updated. You may now sign in.');
          resetForm.reset();
          setTimeout(() => {
            router.push('/');
            setMode('login');
          }, 3000);
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Could not verify or update password.');
        },
      }
    );
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(newMode);
    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();
    resetForm.reset();
  };

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    forgotMutation.isPending ||
    resetMutation.isPending ||
    verifyMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c0f07] via-[#2d160a] to-[#0f0603] flex items-center justify-center p-4 md:p-8 relative select-none overflow-hidden font-sans text-[#f5ebd0]">
      {/* Soft spotlight lighting layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none z-10" />
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(229,193,88,0.06)_0%,transparent_60%)] pointer-events-none z-10" />

      {/* Book Cover Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#4e2713] to-[#241107] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(0,0,0,0.7)] border-2 border-[#1c0a03] p-1.5 z-20 transition-all duration-500 hover:scale-[1.01]">
        {/* Fine gold border/rule inside the cover */}
        <div className="relative border border-leather-border-gold/30 rounded-xl p-6 md:p-8 flex flex-col items-stretch justify-between min-h-[500px]">
          
          {/* Embossed Corner Ornaments */}
          <div className="absolute top-3.5 left-3.5 text-leather-border-gold/30 font-serif text-sm pointer-events-none">⚜</div>
          <div className="absolute top-3.5 right-3.5 text-leather-border-gold/30 font-serif text-sm pointer-events-none">⚜</div>
          <div className="absolute bottom-3.5 left-3.5 text-leather-border-gold/30 font-serif text-sm pointer-events-none">⚜</div>
          <div className="absolute bottom-3.5 right-3.5 text-leather-border-gold/30 font-serif text-sm pointer-events-none">⚜</div>

          {/* Spine Crease Impression on the left edge */}
          <div className="absolute left-0 top-4 bottom-4 w-[6px] bg-gradient-to-r from-black/40 via-transparent to-black/15 pointer-events-none border-r border-[#1a0802]/30" />

          <div className={`flex-1 flex flex-col justify-between transition-all duration-300 ${isSettling ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            {/* Book Header Section */}
            <div className="flex flex-col items-center justify-center mt-2 mb-4">
            <div className="flex items-center gap-1.5 text-[9px] font-sans text-leather-border-gold/50 tracking-widest font-bold uppercase mb-2">
              ⚜ Archival Ledger ⚜
            </div>
            
            {/* Embossed Gold Title */}
            <h1 
              className="text-4xl md:text-5xl font-playfair font-black text-center text-transparent bg-clip-text bg-gradient-to-b from-[#fff2cc] via-[#e5c158] to-[#9a6a15] tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              style={{
                textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.1), -1px -1px 1px rgba(0,0,0,0.8)'
              }}
            >
              BookChat
            </h1>

            {/* Tagline */}
            <p className="text-sm text-[#f5ebd0]/80 font-handwritten italic mt-2 text-center">
              A place to write, together.
            </p>
          </div>

          {/* Tab toggles (Only for login & register modes) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#d5c5a7]/50 border-b border-[#ffe4a0]/10 pb-3 mb-6 select-none">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`relative pb-3 transition-colors cursor-pointer ${
                  mode === 'login' 
                    ? 'text-[#ffe4a0] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-[#e5c158] after:to-transparent' 
                    : 'hover:text-[#ffe4a0]/80'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`relative pb-3 transition-colors cursor-pointer ${
                  mode === 'register' 
                    ? 'text-[#ffe4a0] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-[#e5c158] after:to-transparent' 
                    : 'hover:text-[#ffe4a0]/80'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Main Form content */}
          <div className="flex-1 flex flex-col justify-center">
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    Email Address
                  </label>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="scribe@circulating.org"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[9px] uppercase font-semibold text-leather-border-gold hover:text-white tracking-widest transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#e5c158] via-[#f3e7c4] to-[#c29738] text-[#140904] font-serif font-black py-3 px-4 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_15px_rgba(194,151,56,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-[11px] tracking-wider border border-[#ffe4a0]/30 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffe4a0]/50"
                >
                  {isLoading ? 'Decrypting Seals...' : 'Open the Book'}
                </button>

                {/* Google Sign In button */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage('Contacting Google...');

                    const width = 500;
                    const height = 600;
                    const left = window.screenX + (window.outerWidth - width) / 2;
                    const top = window.screenY + (window.outerHeight - height) / 2;

                    const popup = window.open(
                      '/auth/google',
                      'google-oauth-popup',
                      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
                    );

                    if (!popup) {
                      setErrorMessage('Popup blocked by browser. Please enable popups for this site.');
                      setSuccessMessage(null);
                      return;
                    }

                    const handleMessage = (event: MessageEvent) => {
                      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
                        const { user, accessToken, refreshToken } = event.data.data;
                        
                        setSession(user, accessToken, refreshToken);
                        setSuccessMessage('Signed in successfully! Turning pages...');
                        
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1000);

                        window.removeEventListener('message', handleMessage);
                      }
                    };

                    window.addEventListener('message', handleMessage);

                    const checkClosed = setInterval(() => {
                      if (popup.closed) {
                        clearInterval(checkClosed);
                        window.removeEventListener('message', handleMessage);
                        setSuccessMessage(null);
                      }
                    }, 1000);
                  }}
                  className="w-full mt-2 bg-[#1c0c05]/60 hover:bg-[#251208]/80 text-[#d5c5a7] font-serif font-medium py-2.5 px-4 rounded-lg border border-[#3e2113] shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    Signature Username
                  </label>
                  <input
                    {...registerForm.register('username')}
                    type="text"
                    placeholder="e.g. ScribeArthur"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    Email Address
                  </label>
                  <input
                    {...registerForm.register('email')}
                    type="email"
                    placeholder="scribe@circulating.org"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    Master Key Password
                  </label>
                  <input
                    {...registerForm.register('password')}
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#e5c158] via-[#f3e7c4] to-[#c29738] text-[#140904] font-serif font-black py-3 px-4 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_15px_rgba(194,151,56,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-[11px] tracking-wider border border-[#ffe4a0]/30 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffe4a0]/50"
                >
                  {isLoading ? 'Inscribing Credentials...' : 'Sign Master Scroll 🖋'}
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                <div className="space-y-1 mb-4 text-center">
                  <h2 className="text-xl font-playfair font-black text-[#ffe4a0]">Recover Master Key</h2>
                  <p className="text-xs text-[#d5c5a7]/70 font-serif italic">Retrieve key credentials via dispatch.</p>
                </div>

                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    Inscribed Email Address
                  </label>
                  <input
                    {...forgotForm.register('email')}
                    type="email"
                    placeholder="scribe@circulating.org"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {forgotForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#e5c158] via-[#f3e7c4] to-[#c29738] text-[#140904] font-serif font-black py-3 px-4 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-[11px] tracking-wider border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#ffe4a0]/50"
                  >
                    {isLoading ? 'Dispatching...' : 'Request Dispatch Key ✉️'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-center font-serif text-[11px] text-[#d5c5a7]/70 italic hover:text-[#ffe4a0] transition-colors pt-2 cursor-pointer"
                  >
                    Return to library gates
                  </button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <div className="space-y-1 mb-4 text-center">
                  <h2 className="text-xl font-playfair font-black text-[#ffe4a0]">Inscribe New Key</h2>
                  <p className="text-xs text-[#d5c5a7]/70 font-serif italic">Choose a new password key for your credentials.</p>
                </div>

                <div className="relative">
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[#d5c5a7]/60 mb-1">
                    New Master Key Password
                  </label>
                  <input
                    {...resetForm.register('password')}
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-[#140904] border border-[#3e2113] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] px-4 py-3 text-sm text-[#f5ebd0] placeholder-[#d5c5a7]/20 focus:outline-none focus:border-[#c29738]/50 focus:ring-1 focus:ring-[#c29738]/30 transition-all font-serif"
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-[10px] text-accent-red font-serif italic mt-1">
                      ✦ {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#e5c158] via-[#f3e7c4] to-[#c29738] text-[#140904] font-serif font-black py-3 px-4 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-[11px] tracking-wider border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#ffe4a0]/50"
                >
                  {isLoading ? 'Updating Locks...' : 'Update Master Key 🖋'}
                </button>
              </form>
            )}

            {mode === 'verify' && (
              <div className="space-y-6 text-center py-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ffe4a0]/15 text-[#ffe4a0] text-xl select-none animate-pulse">
                    ⚜
                  </div>
                  <h2 className="text-xl font-playfair font-black text-[#ffe4a0]">Archival Verification</h2>
                  <p className="text-xs text-[#d5c5a7]/70 font-serif italic">Processing cryptographical signatures...</p>
                </div>

                {successMessage && (
                  <div className="p-4 bg-[#2c5e43]/30 border border-[#2c5e43]/50 rounded text-[#a7f3d0] font-serif text-xs italic">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-status-error-bg/20 border border-status-error-border/30 rounded text-accent-red font-serif text-xs italic">
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={() => handleSwitchMode('login')}
                  className="mt-6 inline-flex text-xs font-serif italic text-leather-border-gold hover:text-white transition-colors cursor-pointer"
                >
                  ✦ Turn to front of book (Sign In)
                </button>
              </div>
            )}
          </div>

          {/* Decorative Divider & Footer Warnings */}
          <div className="mt-6 pt-4 border-t border-[#ffe4a0]/10 relative">
            <div className="absolute -top-3.5 right-4 w-7 h-7 rounded-full bg-[#8f2d1b]/30 flex items-center justify-center text-[10px] text-[#ffe4a0] border border-[#ffe4a0]/25 select-none font-bold">
              ❦
            </div>

            {errorMessage && mode !== 'verify' && (
              <div className="text-[11px] text-accent-red font-serif italic leading-relaxed pr-12 animate-fade-in">
                ✦ <span className="font-bold underline uppercase tracking-wider text-[9px] mr-1">Error:</span> {errorMessage}
              </div>
            )}

            {successMessage && mode !== 'verify' && (
              <div className="text-[11px] text-[#a7f3d0] font-serif italic leading-relaxed pr-12 animate-fade-in">
                ✦ <span className="font-bold underline uppercase tracking-wider text-[9px] mr-1">Dispatch:</span> {successMessage}
              </div>
            )}

            {!errorMessage && !successMessage && (
              <div className="text-[10px] text-[#d5c5a7]/50 font-serif italic leading-relaxed pr-12">
                Please keep your master key password strictly secure. Do not share credentials across circulating ledgers.
              </div>
            )}
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
