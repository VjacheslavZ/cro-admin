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
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '../../api/client';
import type { TopicData } from './TopicsPage';

const TYPE_LABELS: Record<string, string> = {
  JEDNINA_MNOZINA: 'Type',
  FLASHCARDS: 'Flash',
  FILL_IN_BLANK: 'FIB',
};

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

interface TopicsTabProps {
  onEdit: (topic: TopicData) => void;
}

export function TopicsTab({ onEdit }: TopicsTabProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: topics,
    isLoading,
    error,
  } = useQuery<TopicData[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/topics');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
    onError: (err: unknown) => {
      alert(getAxiosErrorMessage(err));
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load topics</Alert>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name (HR)</TableCell>
            <TableCell>Name (EN)</TableCell>
            <TableCell>Exercise Types</TableCell>
            <TableCell>Sort Order</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topics?.map((topic) => (
            <TableRow
              key={topic.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/topics/${topic.id}/items`)}
            >
              <TableCell>{topic.nameHr}</TableCell>
              <TableCell>{topic.nameEn}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  {topic.exerciseTypes.map((type) => (
                    <Chip
                      key={type}
                      label={TYPE_LABELS[type] || type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </TableCell>
              <TableCell>{topic.sortOrder}</TableCell>
              <TableCell>
                <Chip
                  label={topic.isActive ? 'Yes' : 'No'}
                  color={topic.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(topic);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(topic.id);
                  }}
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
  );
}
