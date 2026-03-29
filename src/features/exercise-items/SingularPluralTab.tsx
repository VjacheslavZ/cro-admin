import { useState } from 'react';
import { CircularProgress, Alert, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { useTablePagination } from '../../shared/hooks/useTablePagination';
import {
  SingularPluralForm,
  type SingularPluralFormData,
  type SingularPluralItem,
} from './components/SingularPluralForm';
import { SingularPluralTable } from './components/SingularPluralTable';

export function SingularPluralTab({ topicId }: { topicId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SingularPluralItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: items,
    isLoading,
    error,
  } = useQuery<SingularPluralItem[]>({
    queryKey: ['singular-plural-items', topicId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/topics/${topicId}/singular-plural-items`);
      return data;
    },
  });

  const { paginatedItems, Pagination } = useTablePagination(items);

  const [serverError, setServerError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: SingularPluralFormData) => {
      if (editing) {
        await apiClient.patch(`/admin/singular-plural-items/${editing.id}`, data);
      } else {
        await apiClient.post('/admin/singular-plural-items', { ...data, topicId });
      }
    },
    onSuccess: () => {
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ['singular-plural-items', topicId] });
      setEditing(null);
      setShowForm(false);
    },
    onError: (err: unknown) => {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setServerError((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        setServerError('An error occurred');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/singular-plural-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singular-plural-items', topicId] });
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

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      {showForm && (
        <SingularPluralForm
          topicId={topicId}
          editing={editing}
          isPending={saveMutation.isPending}
          onSubmit={(d) => saveMutation.mutate(d)}
        />
      )}

      <SingularPluralTable
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
