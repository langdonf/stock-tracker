import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (name: string) => Promise<void>;
}

export default function AddPlayerDialog({ open, onClose, onAddPlayer }: AddPlayerDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPlayer(name.trim());
      setName('');
      setError('');
      onClose();
    } catch (err) {
      setError('Failed to add player');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Player</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Player Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={isSubmitting}>
          Add Player
        </Button>
      </DialogActions>
    </Dialog>
  );
} 