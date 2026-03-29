import { useState } from 'react';
import { CircularProgress, Alert, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { useTablePagination } from '../../shared/hooks/useTablePagination';
import {
  FlashcardForm,
  type FlashcardFormData,
  type FlashcardItem,
} from './components/FlashcardForm';
import { FlashcardTable } from './components/FlashcardTable';

export function FlashcardsTab({ topicId }: { topicId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FlashcardItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery<FlashcardItem[]>({
    queryKey: ['flashcard-items', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics/${topicId}/flashcard-items`);
      return data;
    },
  });

  const { paginatedItems, Pagination } = useTablePagination(items);

  const saveMutation = useMutation({
    mutationFn: async (data: FlashcardFormData) => {
      if (editing) {
        await apiClient.patch(`/admin/flashcard-items/${editing.id}`, data);
      } else {
        await apiClient.post('/admin/flashcard-items', { ...data, topicId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-items', topicId] });
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
        }}
      >
        {showForm ? 'Cancel' : 'Add Item'}
      </Button>

      {showForm && (
        <FlashcardForm
          editing={editing}
          isPending={saveMutation.isPending}
          onSubmit={(d) => saveMutation.mutate(d)}
        />
      )}

      <FlashcardTable
        items={paginatedItems}
        onEdit={(item) => {
          setEditing(item);
          setShowForm(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeletePending={deleteMutation.isPending}
        Pagination={Pagination}
      />
    </Box>
  );
}
