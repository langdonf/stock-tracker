'use client';

import { User } from '@/types/portfolio';
import { calculatePortfolioValue, updateHistoricalValues } from '@/utils/portfolioCalculations';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import UserPortfolios from '../userPortfolios/UserPortfolios';
import LeaderboardTable from './LeaderboardTable';
import { deleteStock, fetchUsers, resetDatabase } from './utils';
import AddPlayerDialog from './AddPlayerDialog';

export default function Homepage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, { currentPrice: number }>>({});
  const [loading, setLoading] = useState(true);
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  const handleLogin = () => {
    setLoginError('');
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
      setLoginOpen(false);
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      // Collect all unique tickers
      const tickers = Array.from(new Set(data.flatMap(user => user.portfolio.map(stock => stock.ticker))));
      let prices: Record<string, { currentPrice: number }> = {};
      if (tickers.length > 0) {
        const { fetchStockQuotes } = await import('./utils');
        prices = await fetchStockQuotes(tickers);
        setCurrentPrices(prices);
      }
      setLoading(false);
    };
    loadAll();
  }, []);

  const debouncedSetCurrentPrices = useCallback((prices: Record<string, { currentPrice: number }>) => {
    setCurrentPrices(prevPrices => {
      // Only update if there are actual changes
      const hasChanges = Object.keys(prices).some(
        ticker => prices[ticker].currentPrice !== prevPrices[ticker]?.currentPrice
      );
      
      if (hasChanges) {
        // Update historical values for all users when prices change
        users.forEach(async (user) => {
          const currentValue = calculatePortfolioValue(user, prices);
          try {
            await updateHistoricalValues(user._id, currentValue);
          } catch (error) {
            console.error(`Failed to update historical values for user ${user._id}:`, error);
          }
        });
      }
      
      return hasChanges ? prices : prevPrices;
    });
  }, [users]);

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

  const handleDeleteStock = async (userId: string, stockId: string, currentValue: number) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      await deleteStock(userId, stockId, currentValue);
      await handleStockAdded();
    } catch (err) {
      console.error('Error selling stock:', err);
    }
  };

  // Sort users by portfolio value when needed
  const sortedUsers = [...users].sort((a, b) => {
    const aValue = calculatePortfolioValue(a, currentPrices);
    const bValue = calculatePortfolioValue(b, currentPrices);
    return bValue - aValue;
  });

  if (loading) return null;
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          {isAdmin && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{ mr: 2 }}
              >
                Reset Game
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={() => setIsAddPlayerDialogOpen(true)}
              >
                Add Player
              </Button>
            </>
          )}
        </Box>
        <Box>
          {isAdmin ? (
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={() => setLoginOpen(true)}>
              Login
            </Button>
          )}
        </Box>
      </Box>

      <LeaderboardTable
        users={sortedUsers}
        currentPrices={currentPrices}
        setCurrentPrices={debouncedSetCurrentPrices}
      />

      <UserPortfolios
        users={users}
        currentPrices={currentPrices}
        handleDeleteStock={handleDeleteStock}
        onStockAdded={handleStockAdded}
        isAdmin={isAdmin}
      />

      <AddPlayerDialog
        open={isAddPlayerDialogOpen}
        onClose={() => setIsAddPlayerDialogOpen(false)}
        onAddPlayer={async (name: string) => {
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name }),
            });

            if (!response.ok) {
              throw new Error('Failed to add player');
            }

            await handleStockAdded();
          } catch (err) {
            console.error('Error adding player:', err);
            throw err;
          }
        }}
      />

      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)}>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={!!loginError}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!loginError}
            helperText={loginError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
          <Button onClick={handleLogin} variant="contained">Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
