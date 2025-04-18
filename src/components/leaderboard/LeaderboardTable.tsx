import { User } from '@/types/portfolio';
import {
  calculateDollarChange,
  calculatePercentageChange,
  calculatePortfolioValue,
  calculateVsTopDollar,
  calculateVsTopPercentage,
} from '@/utils/portfolioCalculations';
import { Box, Paper, Table, TableBody, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import AddStockModal from '../stocks/AddStockModal';
import StockRow from '../stocks/StockRow';
import LeaderboardRow from './LeaderboardRow';

import LeaderboardHeader from './LeaderboardHeader';
import { addStock, deleteStock, fetchStockQuotes } from './utils';

interface LeaderboardTableProps {
  users: User[];
  onStockAdded: () => void;
}

interface CurrentPrice {
  currentPrice: number;
}

export default function LeaderboardTable({ users, onStockAdded }: LeaderboardTableProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [currentPrices, setCurrentPrices] = useState<Record<string, CurrentPrice>>({});
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Sort users by total value (portfolio + cash)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = calculatePortfolioValue(a, currentPrices);
      const bValue = calculatePortfolioValue(b, currentPrices);
      return bValue - aValue; // Sort in descending order (highest first)
    });
  }, [users, currentPrices]);

  // Fetch prices for all stocks periodically
  useEffect(() => {
    const fetchAllPrices = async () => {
      const tickers = new Set<string>();
      users.forEach(user => {
        user.portfolio.forEach(stock => {
          tickers.add(stock.ticker);
        });
      });

      if (tickers.size === 0) return;

      try {
        const data = await fetchStockQuotes(Array.from(tickers));
        setCurrentPrices(data);
      } catch (error: unknown) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchAllPrices();
  }, [users]);

  const handleRowClick = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAddStock = async (
    userId: string,
    data: { ticker: string; shares: number; purchasePrice: number }
  ) => {
    try {
      await addStock(userId, data);
      onStockAdded();
    } catch (err) {
      console.error('Error adding stock:', err);
      throw err;
    }
  };

  const handleDeleteStock = async (userId: string, stockId: string, currentValue: number) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      await deleteStock(userId, stockId, currentValue);
      onStockAdded();
    } catch (err) {
      console.error('Error selling stock:', err);
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      <TableContainer component={Paper}>
        <Table>
          <LeaderboardHeader />
          <TableBody>
            {sortedUsers.map((user, index) => {
              const dollarChange = calculateDollarChange(user, currentPrices);
              const percentageChange = calculatePercentageChange(user, currentPrices);
              const isPositive = dollarChange >= 0;
              const vsTopDollar = sortedUsers[0]
                ? calculateVsTopDollar(user, sortedUsers[0], currentPrices)
                : 0;
              const vsTopPercentage = sortedUsers[0]
                ? calculateVsTopPercentage(user, sortedUsers[0], currentPrices)
                : 0;
              const isVsTopPositive = vsTopDollar >= 0;

              return (
                <React.Fragment key={user._id}>
                  <LeaderboardRow
                    user={user}
                    currentPrices={currentPrices}
                    isPositive={isPositive}
                    dollarChange={dollarChange}
                    percentageChange={percentageChange}
                    vsTopDollar={vsTopDollar}
                    index={index}
                    vsTopPercentage={vsTopPercentage}
                    expandedUsers={expandedUsers}
                    isVsTopPositive={isVsTopPositive}
                    handleRowClick={handleRowClick}
                    setSelectedUserId={setSelectedUserId}
                    setAddStockModalOpen={setAddStockModalOpen}
                  />
                  <StockRow
                    user={user}
                    currentPrices={currentPrices}
                    expandedUsers={expandedUsers}
                    handleDeleteStock={handleDeleteStock}
                  />
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <AddStockModal
        open={addStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        onSubmit={async data => {
          try {
            await handleAddStock(selectedUserId!, data);
            setAddStockModalOpen(false);
          } catch (err) {
            console.error('Error adding stock:', err);
          }
        }}
        userId={selectedUserId!}
        currentCash={users.find(u => u._id === selectedUserId)?.cashRemaining || 0}
      />
    </Box>
  );
}
