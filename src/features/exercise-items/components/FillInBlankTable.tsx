import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

import type { FillInBlankItem } from './FillInBlankForm';

interface FillInBlankTableProps {
  items: FillInBlankItem[];
  onEdit: (item: FillInBlankItem) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
  Pagination: () => React.JSX.Element;
}

export function FillInBlankTable({
  items,
  onEdit,
  onDelete,
  isDeletePending,
  Pagination,
}: FillInBlankTableProps) {
  return (
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
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.sentenceHr}</TableCell>
              <TableCell>{item.blankAnswer}</TableCell>
              <TableCell>{item.translationEn}</TableCell>
              <TableCell>{item.translationUk}</TableCell>
              <TableCell>{item.translationRu}</TableCell>
              <TableCell>{item.sortOrder}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => onEdit(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeletePending}
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
  );
}
