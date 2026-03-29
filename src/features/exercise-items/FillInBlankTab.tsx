import { useState } from 'react';
import { CircularProgress, Alert, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { useTablePagination } from '../../shared/hooks/useTablePagination';
import {
  FillInBlankForm,
  type FillInBlankFormData,
  type FillInBlankItem,
} from './components/FillInBlankForm';
import { FillInBlankTable } from './components/FillInBlankTable';

export function FillInBlankTab({ topicId }: { topicId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FillInBlankItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery<FillInBlankItem[]>({
    queryKey: ['fill-in-blank-items', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics/${topicId}/fill-in-blank-items`);
      return data;
    },
  });

  const { paginatedItems, Pagination } = useTablePagination(items);

  const saveMutation = useMutation({
    mutationFn: async (data: FillInBlankFormData) => {
      if (editing) {
        await apiClient.patch(`/admin/fill-in-blank-items/${editing.id}`, data);
      } else {
        await apiClient.post('/admin/fill-in-blank-items', { ...data, topicId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fill-in-blank-items', topicId] });
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
        <FillInBlankForm
          editing={editing}
          isPending={saveMutation.isPending}
          onSubmit={(d) => saveMutation.mutate(d)}
        />
      )}

      <FillInBlankTable
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
