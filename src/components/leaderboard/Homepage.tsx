'use client';

import { User } from '@/types/portfolio';
import { calculatePortfolioValue } from '@/utils/portfolioCalculations';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, Button } from '@mui/material';
import { useEffect, useMemo, useState, useCallback } from 'react';
import UserPortfolios from '../userPortfolios/UserPortfolios';
import LeaderboardTable from './LeaderboardTable';
import { deleteStock, fetchUsers, resetDatabase } from './utils';

export default function Homepage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, { currentPrice: number }>>({});

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  // Sort users by total value (portfolio + cash)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = calculatePortfolioValue(a, currentPrices);
      const bValue = calculatePortfolioValue(b, currentPrices);
      return bValue - aValue; // Sort in descending order (highest first)
    });
  }, [users]); // Only depend on users, not currentPrices

  const debouncedSetCurrentPrices = useCallback((prices: Record<string, { currentPrice: number }>) => {
    setCurrentPrices(prevPrices => {
      // Only update if there are actual changes
      const hasChanges = Object.keys(prices).some(
        ticker => prices[ticker].currentPrice !== prevPrices[ticker]?.currentPrice
      );
      return hasChanges ? prices : prevPrices;
    });
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
      <LeaderboardTable 
        users={sortedUsers} 
        currentPrices={currentPrices} 
        setCurrentPrices={debouncedSetCurrentPrices} 
      />
      <UserPortfolios 
        users={sortedUsers} 
        currentPrices={currentPrices}
        handleDeleteStock={handleDeleteStock}
        onStockAdded={handleStockAdded}
      />
    </Box>
  );
}
