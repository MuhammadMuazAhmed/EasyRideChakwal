import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '@/features/auth/api';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api-client';

export function useAuth() {
  const { token, admin, isAuthenticated, logout: clearSession } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (secret: string) => adminLogin(secret),
    onSuccess: (res) => {
      useAuthStore.getState().setSession(res.token, res.admin);
      toast.success(`Welcome back, ${res.admin.name}`);
      navigate('/', { replace: true });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.isMissingEndpoint) {
        toast.error('Admin login API is not deployed yet — see BACKEND_REQUIREMENTS.md', { duration: 6000 });
        return;
      }
      toast.error(error instanceof ApiError ? error.message : 'Login failed');
    },
  });

  function logout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return { token, admin, isAuthenticated, login: loginMutation.mutate, isLoggingIn: loginMutation.isPending, logout };
}
