import { useEffect } from 'react';
import { Box, Button, CircularProgress, TextField, Stack, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { apiClient } from '../../../api/client';

const schema = z.object({
  baseForm: z.string().min(1, 'Required'),
  pluralForm: z.string().min(1, 'Required'),
  translationRu: z.string().min(1, 'Required'),
  translationUk: z.string().min(1, 'Required'),
  translationEn: z.string().min(1, 'Required'),
  sortOrder: z.coerce.number().int().min(0),
});

export type SingularPluralFormData = z.infer<typeof schema>;

export interface SingularPluralItem {
  id: string;
  baseForm: string;
  pluralForm: string;
  translationRu: string;
  translationUk: string;
  translationEn: string;
  sortOrder: number;
}

const defaultValues: SingularPluralFormData = {
  baseForm: '',
  pluralForm: '',
  translationRu: '',
  translationUk: '',
  translationEn: '',
  sortOrder: 0,
};

interface SingularPluralFormProps {
  topicId: string;
  editing: SingularPluralItem | null;
  isPending: boolean;
  onSubmit: (data: SingularPluralFormData) => void;
}

export function SingularPluralForm({
  topicId,
  editing,
  isPending,
  onSubmit,
}: SingularPluralFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SingularPluralFormData>({
    resolver: zodResolver(schema) as never,
    defaultValues,
  });

  useEffect(() => {
    reset(editing ?? defaultValues);
  }, [editing, reset]);

  const validateBaseFormUnique = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      const { data: allItems } = await apiClient.get<SingularPluralItem[]>(
        `/admin/topics/${topicId}/singular-plural-items`,
      );
      const duplicate = allItems.find(
        (item) => item.baseForm === trimmed && item.id !== editing?.id,
      );
      if (duplicate) {
        setError('baseForm', { message: 'This word already exists' });
      } else {
        clearErrors('baseForm');
      }
    } catch {
      // skip validation on network error
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <TextField
            {...register('baseForm', {
              onBlur: (e) => validateBaseFormUnique(e.target.value),
            })}
            label="Base Form"
            size="small"
            error={!!errors.baseForm}
            helperText={errors.baseForm?.message}
          />
          <TextField
            {...register('pluralForm')}
            label="Plural Form"
            size="small"
            error={!!errors.pluralForm}
            helperText={errors.pluralForm?.message}
          />
          <TextField
            {...register('sortOrder')}
            label="Order"
            type="number"
            size="small"
            sx={{ width: 80 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <TextField
            {...register('translationRu')}
            label="Translation (RU)"
            size="small"
            error={!!errors.translationRu}
          />
          <TextField
            {...register('translationUk')}
            label="Translation (UK)"
            size="small"
            error={!!errors.translationUk}
          />
          <TextField
            {...register('translationEn')}
            label="Translation (EN)"
            size="small"
            error={!!errors.translationEn}
          />
        </Stack>
        <Button type="submit" variant="contained" size="small" disabled={isPending}>
          {isPending ? <CircularProgress size={20} /> : editing ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Paper>
  );
}
