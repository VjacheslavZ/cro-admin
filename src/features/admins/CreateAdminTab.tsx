import { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../api/client';

const createAdminSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

interface CreateAdminTabProps {
  onCreated: () => void;
}

export function CreateAdminTab({ onCreated }: CreateAdminTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: result } = await apiClient.post('/admin/admins', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setSuccess(true);
      setError(null);
      reset();
      setTimeout(() => onCreated(), 1500);
    },
    onError: (err: unknown) => {
      setSuccess(false);
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError(t('common.error'));
      }
    },
  });

  const onSubmit = (data: CreateAdminFormData) => {
    setError(null);
    setSuccess(false);
    mutation.mutate({ email: data.email, password: data.password });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('admins.created')}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('email')}
          label={t('admins.email')}
          type="email"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          autoComplete="off"
        />
        <TextField
          {...register('password')}
          label={t('admins.password')}
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="new-password"
        />
        <TextField
          {...register('confirmPassword')}
          label={t('admins.confirmPassword')}
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={mutation.isPending}
          sx={{ mt: 2 }}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : t('admins.createAdmin')}
        </Button>
      </Box>
    </Paper>
  );
}
