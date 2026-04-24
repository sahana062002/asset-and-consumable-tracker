import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import LoginPageUI from './LoginPage';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPageContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/scan'} replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      success('Logged in successfully', 'Welcome back!');
      const currentUser = useAuthStore.getState().user;
      navigate(currentUser?.role === 'admin' ? '/dashboard' : '/scan');
    } catch (err: any) {
      error('Login Failed', err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <LoginPageUI 
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
}
