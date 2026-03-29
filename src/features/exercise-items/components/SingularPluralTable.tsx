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

import type { SingularPluralItem } from './SingularPluralForm';

interface SingularPluralTableProps {
  items: SingularPluralItem[];
  onEdit: (item: SingularPluralItem) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
  Pagination: () => React.JSX.Element;
}

export function SingularPluralTable({
  items,
  onEdit,
  onDelete,
  isDeletePending,
  Pagination,
}: SingularPluralTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Base Form</TableCell>
            <TableCell>Plural Form</TableCell>
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
              <TableCell>{item.baseForm}</TableCell>
              <TableCell>{item.pluralForm}</TableCell>
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
