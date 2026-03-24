import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  title?: string;
  message?: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  title = 'Delete',
  message = 'Are you sure? This action cannot be undone.',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isPending}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
