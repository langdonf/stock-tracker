'use client';

import { User } from '@/types/portfolio';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import LeaderboardTable from './LeaderboardTable';
import { fetchUsers, resetDatabase } from './utils';

export default function Homepage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const handleStockAdded = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const handleReset = async () => {
    try {
      await resetDatabase();
      await handleStockAdded();
    } catch (err) {
      console.error('Error in reset flow:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
        <Button
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          variant="outlined"
          color="warning"
          sx={{ mr: 2 }}
        >
          Reset Game
        </Button>
      </Box>
      <LeaderboardTable users={users} onStockAdded={handleStockAdded} />
    </Box>
  );
}
