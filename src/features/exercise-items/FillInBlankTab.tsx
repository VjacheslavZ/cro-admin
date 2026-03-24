import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { apiClient } from '../../api/client';

const schema = z.object({
  sentenceHr: z.string().min(1, 'Required'),
  blankAnswer: z.string().min(1, 'Required'),
  translationRu: z.string().min(1, 'Required'),
  translationUk: z.string().min(1, 'Required'),
  translationEn: z.string().min(1, 'Required'),
  sortOrder: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

interface Item {
  id: string;
  sentenceHr: string;
  blankAnswer: string;
  translationRu: string;
  translationUk: string;
  translationEn: string;
  sortOrder: number;
}

export function FillInBlankTab({ topicId }: { topicId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery<Item[]>({
    queryKey: ['fill-in-blank-items', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics/${topicId}/fill-in-blank-items`);
      return data;
    },
  });

  const defaultValues = {
    sentenceHr: '',
    blankAnswer: '',
    translationRu: '',
    translationUk: '',
    translationEn: '',
    sortOrder: 0,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editing) {
        await apiClient.patch(`/admin/fill-in-blank-items/${editing.id}`, data);
      } else {
        await apiClient.post('/admin/fill-in-blank-items', { ...data, topicId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fill-in-blank-items', topicId] });
      reset(defaultValues);
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/fill-in-blank-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fill-in-blank-items', topicId] });
    },
  });

  const handleEdit = (item: Item) => {
    setEditing(item);
    setShowForm(true);
    reset(item);
  };

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">Failed to load items</Alert>;

  return (
    <Box>
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(null);
          setShowForm(!showForm);
          reset(defaultValues);
        }}
      >
        {showForm ? 'Cancel' : 'Add Item'}
      </Button>

      {showForm && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box component="form" onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                {...register('sentenceHr')}
                label="Sentence (HR) — use {{BLANK}}"
                size="small"
                fullWidth
                error={!!errors.sentenceHr}
                helperText={errors.sentenceHr?.message}
              />
              <TextField
                {...register('blankAnswer')}
                label="Blank Answer"
                size="small"
                error={!!errors.blankAnswer}
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
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <CircularProgress size={20} />
              ) : editing ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sentence</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>EN</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sentenceHr}</TableCell>
                <TableCell>{item.blankAnswer}</TableCell>
                <TableCell>{item.translationEn}</TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
