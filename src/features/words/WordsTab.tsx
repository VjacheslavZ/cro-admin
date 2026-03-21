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
  Checkbox,
  Button,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseType } from '@cro/shared';

import { apiClient } from '../../api/client';
import type { CategoryData } from '../categories/CategoriesPage';
import type { WordSetData } from '../word-sets/WordSetsPage';
import type { WordData } from './WordsPage';

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

function hasExerciseType(word: WordData, type: string): boolean {
  return word.exerciseConfigs?.some((c) => c.exerciseType === type && c.enabled) ?? false;
}

interface WordsTabProps {
  onEdit: (word: WordData) => void;
}

export function WordsTab({ onEdit }: WordsTabProps) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>('');
  const [wordSetId, setWordSetId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: categories } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const { data: wordSets } = useQuery<WordSetData[]>({
    queryKey: ['word-sets', categoryId],
    queryFn: async () => {
      const params = categoryId ? { categoryId } : {};
      const { data } = await apiClient.get('/admin/word-sets', { params });
      return data;
    },
  });

  const {
    data: words,
    isLoading,
    error,
  } = useQuery<WordData[]>({
    queryKey: ['words', wordSetId],
    queryFn: async () => {
      const params = wordSetId ? { wordSetId } : {};
      const { data } = await apiClient.get('/admin/words', { params });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/words/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
    onError: (err: unknown) => {
      alert(getAxiosErrorMessage(err));
    },
  });

  const bulkConfigMutation = useMutation({
    mutationFn: async (payload: { wordIds: string[]; exerciseType: string; enabled: boolean }) => {
      await apiClient.post('/admin/words/bulk-exercise-configs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
      setSelectedIds(new Set());
    },
    onError: (err: unknown) => {
      alert(getAxiosErrorMessage(err));
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!words) return;
    if (selectedIds.size === words.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(words.map((w) => w.id)));
    }
  };

  const handleBulkAction = (exerciseType: string, enabled: boolean) => {
    const wordIds = Array.from(selectedIds);
    if (wordIds.length === 0) return;
    bulkConfigMutation.mutate({ wordIds, exerciseType, enabled });
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(e) => {
              setCategoryId(e.target.value);
              setWordSetId('');
              setSelectedIds(new Set());
            }}
          >
            <MenuItem value="">All</MenuItem>
            {categories?.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nameEn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Word Set</InputLabel>
          <Select
            value={wordSetId}
            label="Word Set"
            onChange={(e) => {
              setWordSetId(e.target.value);
              setSelectedIds(new Set());
            }}
          >
            <MenuItem value="">All</MenuItem>
            {wordSets?.map((ws) => (
              <MenuItem key={ws.id} value={ws.id}>
                {ws.nameEn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {selectedIds.size > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleBulkAction(ExerciseType.FLASHCARDS, true)}
            disabled={bulkConfigMutation.isPending}
          >
            Enable Flashcards for selected
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleBulkAction(ExerciseType.FLASHCARDS, false)}
            disabled={bulkConfigMutation.isPending}
          >
            Disable Flashcards for selected
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleBulkAction(ExerciseType.JEDNINA_MNOZINA, true)}
            disabled={bulkConfigMutation.isPending}
          >
            Enable Jednina i Množina for selected
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleBulkAction(ExerciseType.JEDNINA_MNOZINA, false)}
            disabled={bulkConfigMutation.isPending}
          >
            Disable Jednina i Množina for selected
          </Button>
        </Stack>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">Failed to load words</Alert>}

      {!isLoading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={!!words?.length && selectedIds.size === words.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < (words?.length ?? 0)}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell>Base Form</TableCell>
                <TableCell>Plural Form</TableCell>
                <TableCell>Translation (EN)</TableCell>
                <TableCell>Exercise Types</TableCell>
                <TableCell>Sort Order</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {words?.map((word) => (
                <TableRow key={word.id} selected={selectedIds.has(word.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.has(word.id)}
                      onChange={() => toggleSelect(word.id)}
                    />
                  </TableCell>
                  <TableCell>{word.baseForm}</TableCell>
                  <TableCell>{word.pluralForm ?? '—'}</TableCell>
                  <TableCell>{word.translationEn}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {hasExerciseType(word, ExerciseType.JEDNINA_MNOZINA) && (
                        <Chip label="J+M" size="small" color="primary" />
                      )}
                      {hasExerciseType(word, ExerciseType.FLASHCARDS) && (
                        <Chip label="Flash" size="small" color="secondary" />
                      )}
                      {hasExerciseType(word, ExerciseType.MULTIPLE_CHOICE) && (
                        <Chip label="MC" size="small" color="info" />
                      )}
                      {hasExerciseType(word, ExerciseType.FILL_IN_BLANK) && (
                        <Chip label="FIB" size="small" color="warning" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{word.sortOrder}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onEdit(word)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteMutation.mutate(word.id)}
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
