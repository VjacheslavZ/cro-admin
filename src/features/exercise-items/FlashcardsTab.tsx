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
  frontText: z.string().min(1, 'Required'),
  translationRu: z.string().min(1, 'Required'),
  translationUk: z.string().min(1, 'Required'),
  translationEn: z.string().min(1, 'Required'),
  sortOrder: z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

interface Item {
  id: string;
  frontText: string;
  translationRu: string;
  translationUk: string;
  translationEn: string;
  sortOrder: number;
}

export function FlashcardsTab({ topicId }: { topicId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery<Item[]>({
    queryKey: ['flashcard-items', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics/${topicId}/flashcard-items`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      frontText: '',
      translationRu: '',
      translationUk: '',
      translationEn: '',
      sortOrder: 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (editing) {
        await apiClient.patch(`/admin/flashcard-items/${editing.id}`, data);
      } else {
        await apiClient.post('/admin/flashcard-items', { ...data, topicId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-items', topicId] });
      reset({
        frontText: '',
        translationRu: '',
        translationUk: '',
        translationEn: '',
        sortOrder: 0,
      });
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/flashcard-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-items', topicId] });
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
          reset({
            frontText: '',
            translationRu: '',
            translationUk: '',
            translationEn: '',
            sortOrder: 0,
          });
        }}
      >
        {showForm ? 'Cancel' : 'Add Item'}
      </Button>

      {showForm && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box component="form" onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                {...register('frontText')}
                label="Front Text (HR)"
                size="small"
                error={!!errors.frontText}
                helperText={errors.frontText?.message}
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
              <TableCell>Front Text</TableCell>
              <TableCell>EN</TableCell>
              <TableCell>RU</TableCell>
              <TableCell>UK</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.frontText}</TableCell>
                <TableCell>{item.translationEn}</TableCell>
                <TableCell>{item.translationRu}</TableCell>
                <TableCell>{item.translationUk}</TableCell>
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
