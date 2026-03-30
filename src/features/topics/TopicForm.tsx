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
import { RichTextEditor } from '../../shared/components/RichTextEditor';
import type { TopicData } from './TopicsPage';

const topicSchema = z.object({
  nameHr: z.string().min(1, 'Name (HR) is required'),
  nameRu: z.string().min(1, 'Name (RU) is required'),
  nameUk: z.string().min(1, 'Name (UK) is required'),
  nameEn: z.string().min(1, 'Name (EN) is required'),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be >= 0'),
  isActive: z.boolean(),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface TopicFormProps {
  topic: TopicData | null;
  onDone: () => void;
}

export function TopicForm({ topic, onDone }: TopicFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rulesHtml, setRulesHtml] = useState(topic?.rulesHtml ?? '');
  const isEditing = !!topic;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema) as never,
    defaultValues: topic
      ? {
          nameHr: topic.nameHr,
          nameRu: topic.nameRu,
          nameUk: topic.nameUk,
          nameEn: topic.nameEn,
          sortOrder: topic.sortOrder,
          isActive: topic.isActive,
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
    mutationFn: async (data: TopicFormData) => {
      if (isEditing) {
        const { data: result } = await apiClient.patch(`/admin/topics/${topic.id}`, data);
        return result;
      }
      const { data: result } = await apiClient.post('/admin/topics', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
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

  const onSubmit = (data: TopicFormData) => {
    setError(null);
    setSuccess(false);
    mutation.mutate({ ...data, rulesHtml: rulesHtml || null } as never);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Topic {isEditing ? 'updated' : 'created'} successfully
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
          control={<Checkbox {...register('isActive')} defaultChecked={topic?.isActive ?? true} />}
          label="Active"
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 2 }}>
          <RichTextEditor
            key={topic?.id ?? 'new'}
            value={rulesHtml}
            onChange={setRulesHtml}
            label="Rules (Rich Text)"
            placeholder="Enter exercise rules..."
          />
        </Box>
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
            'Update Topic'
          ) : (
            'Create Topic'
          )}
        </Button>
      </Box>
    </Paper>
  );
}
