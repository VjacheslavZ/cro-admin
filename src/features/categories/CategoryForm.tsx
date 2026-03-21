import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import type { CategoryData } from './CategoriesPage';

const categorySchema = z.object({
  nameHr: z.string().min(1, 'Name (HR) is required'),
  nameRu: z.string().min(1, 'Name (RU) is required'),
  nameUk: z.string().min(1, 'Name (UK) is required'),
  nameEn: z.string().min(1, 'Name (EN) is required'),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be >= 0'),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category: CategoryData | null;
  onDone: () => void;
}

export function CategoryForm({ category, onDone }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          nameHr: category.nameHr,
          nameRu: category.nameRu,
          nameUk: category.nameUk,
          nameEn: category.nameEn,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }
      : {
          nameHr: '',
          nameRu: '',
          nameUk: '',
          nameEn: '',
          sortOrder: 0,
          isActive: true,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (isEditing) {
        const { data: result } = await apiClient.patch(`/admin/categories/${category.id}`, data);
        return result;
      }
      const { data: result } = await apiClient.post('/admin/categories', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSuccess(true);
      setError(null);
      if (!isEditing) reset();
      setTimeout(() => onDone(), 1500);
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
        setError('An error occurred');
      }
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    setError(null);
    setSuccess(false);
    mutation.mutate(data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Category {isEditing ? 'updated' : 'created'} successfully
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('nameHr')}
          label="Name (HR)"
          fullWidth
          margin="normal"
          error={!!errors.nameHr}
          helperText={errors.nameHr?.message}
        />
        <TextField
          {...register('nameRu')}
          label="Name (RU)"
          fullWidth
          margin="normal"
          error={!!errors.nameRu}
          helperText={errors.nameRu?.message}
        />
        <TextField
          {...register('nameUk')}
          label="Name (UK)"
          fullWidth
          margin="normal"
          error={!!errors.nameUk}
          helperText={errors.nameUk?.message}
        />
        <TextField
          {...register('nameEn')}
          label="Name (EN)"
          fullWidth
          margin="normal"
          error={!!errors.nameEn}
          helperText={errors.nameEn?.message}
        />
        <TextField
          {...register('sortOrder')}
          label="Sort Order"
          type="number"
          fullWidth
          margin="normal"
          error={!!errors.sortOrder}
          helperText={errors.sortOrder?.message}
        />
        <FormControlLabel
          control={
            <Checkbox {...register('isActive')} defaultChecked={category?.isActive ?? true} />
          }
          label="Active"
          sx={{ mt: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={mutation.isPending}
          sx={{ mt: 2 }}
        >
          {mutation.isPending ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            'Update Category'
          ) : (
            'Create Category'
          )}
        </Button>
      </Box>
    </Paper>
  );
}
