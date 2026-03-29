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
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { useTablePagination } from '../../shared/hooks/useTablePagination';
import {
  FillInBlankForm,
  type FillInBlankFormData,
  type FillInBlankItem,
} from './components/FillInBlankForm';

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

  const handleEdit = (item: FillInBlankItem) => {
    setEditing(item);
    setShowForm(true);
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

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sentence</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>EN</TableCell>
              <TableCell>UA</TableCell>
              <TableCell>RU</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sentenceHr}</TableCell>
                <TableCell>{item.blankAnswer}</TableCell>
                <TableCell>{item.translationEn}</TableCell>
                <TableCell>{item.translationUk}</TableCell>
                <TableCell>{item.translationRu}</TableCell>
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
        <Pagination />
      </TableContainer>
    </Box>
  );
}
