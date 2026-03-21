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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import type { CategoryData } from '../categories/CategoriesPage';
import type { WordSetData } from './WordSetsPage';

const wordSetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  nameHr: z.string().min(1, 'Name (HR) is required'),
  nameRu: z.string().min(1, 'Name (RU) is required'),
  nameUk: z.string().min(1, 'Name (UK) is required'),
  nameEn: z.string().min(1, 'Name (EN) is required'),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be >= 0'),
  isActive: z.boolean(),
});

type WordSetFormData = z.infer<typeof wordSetSchema>;

interface WordSetFormProps {
  wordSet: WordSetData | null;
  onDone: () => void;
}

export function WordSetForm({ wordSet, onDone }: WordSetFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditing = !!wordSet;

  const { data: categories } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<WordSetFormData>({
    resolver: zodResolver(wordSetSchema),
    defaultValues: wordSet
      ? {
          categoryId: wordSet.categoryId,
          nameHr: wordSet.nameHr,
          nameRu: wordSet.nameRu,
          nameUk: wordSet.nameUk,
          nameEn: wordSet.nameEn,
          sortOrder: wordSet.sortOrder,
          isActive: wordSet.isActive,
        }
      : {
          categoryId: '',
          nameHr: '',
          nameRu: '',
          nameUk: '',
          nameEn: '',
          sortOrder: 0,
          isActive: true,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: WordSetFormData) => {
      if (isEditing) {
        const { data: result } = await apiClient.patch(`/admin/word-sets/${wordSet.id}`, data);
        return result;
      }
      const { data: result } = await apiClient.post('/admin/word-sets', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-sets'] });
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

  const onSubmit = (data: WordSetFormData) => {
    setError(null);
    setSuccess(false);
    mutation.mutate(data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Word set {isEditing ? 'updated' : 'created'} successfully
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.categoryId}>
              <InputLabel>Category</InputLabel>
              <Select {...field} label="Category">
                {categories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
            </FormControl>
          )}
        />
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
            <Checkbox {...register('isActive')} defaultChecked={wordSet?.isActive ?? true} />
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
            'Update Word Set'
          ) : (
            'Create Word Set'
          )}
        </Button>
      </Box>
    </Paper>
  );
}
