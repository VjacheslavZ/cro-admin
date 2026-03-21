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
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import type { CategoryData } from '../categories/CategoriesPage';
import type { WordSetData } from './WordSetsPage';

function getAxiosErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return 'An error occurred';
}

interface WordSetsTabProps {
  onEdit: (wordSet: WordSetData) => void;
}

export function WordSetsTab({ onEdit }: WordSetsTabProps) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>('');

  const { data: categories } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const {
    data: wordSets,
    isLoading,
    error,
  } = useQuery<WordSetData[]>({
    queryKey: ['word-sets', categoryId],
    queryFn: async () => {
      const params = categoryId ? { categoryId } : {};
      const { data } = await apiClient.get('/admin/word-sets', { params });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/word-sets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-sets'] });
    },
    onError: (err: unknown) => {
      alert(getAxiosErrorMessage(err));
    },
  });

  return (
    <Box>
      <FormControl sx={{ mb: 2, minWidth: 250 }}>
        <InputLabel>Filter by Category</InputLabel>
        <Select
          value={categoryId}
          label="Filter by Category"
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nameEn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">Failed to load word sets</Alert>}

      {!isLoading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name (HR)</TableCell>
                <TableCell>Name (EN)</TableCell>
                <TableCell>Word Count</TableCell>
                <TableCell>Sort Order</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wordSets?.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>{ws.nameHr}</TableCell>
                  <TableCell>{ws.nameEn}</TableCell>
                  <TableCell>{ws._count?.words ?? 0}</TableCell>
                  <TableCell>{ws.sortOrder}</TableCell>
                  <TableCell>
                    <Chip
                      label={ws.isActive ? 'Yes' : 'No'}
                      color={ws.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onEdit(ws)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteMutation.mutate(ws.id)}
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
      )}
    </Box>
  );
}
