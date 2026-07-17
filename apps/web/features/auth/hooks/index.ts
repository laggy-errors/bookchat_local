import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import { useUserStore } from '../../../stores/user-store';

/**
 * Mutation for signing in.
 */
export function useLoginMutation() {
  const setSession = useUserStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; passwordPlain: string }) => authService.login(data),
    onSuccess: (response) => {
      setSession(response.user, response.accessToken, response.refreshToken);
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Mutation for user registration.
 */
export function useRegisterMutation() {
  const setSession = useUserStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; passwordHash: string; username?: string }) =>
      authService.register(data),
    onSuccess: (response) => {
      setSession(response.user, response.accessToken, response.refreshToken);
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Mutation to request password recovery.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

/**
 * Mutation to reset user password using token.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { token: string; passwordPlain: string }) => authService.resetPassword(data),
  });
}

/**
 * Mutation to request a new email verification.
 */
export function useRequestVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.requestVerification(email),
  });
}

/**
 * Mutation to verify user email address.
 */
export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

/**
 * General helper hook to access auth state from Zustand.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, logout, initializeAuth } = useUserStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    initializeAuth,
  };
}
