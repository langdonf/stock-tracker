import { User } from '@/types/portfolio';
import {
  calculateDollarChange,
  calculatePercentageChange,
  calculateVsTopDollar,
  calculateVsTopPercentage,
} from '@/utils/portfolioCalculations';
import { Box, Paper, Table, TableBody, TableContainer } from '@mui/material';
import React, { useEffect } from 'react';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardRow from './LeaderboardRow';
import { fetchStockQuotes } from './utils';

interface LeaderboardTableProps {
  users: User[];
  currentPrices: Record<string, CurrentPrice>;
  setCurrentPrices: (prices: Record<string, CurrentPrice>) => void;
}

interface CurrentPrice {
  currentPrice: number;
}

export default function LeaderboardTable({ users, currentPrices, setCurrentPrices }: LeaderboardTableProps) {
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

  return (
    <Box sx={{ m: 2 }}>
      <TableContainer component={Paper}>
        <Table>
          <LeaderboardHeader />
          <TableBody>
            {users.map((user, index) => {
              const dollarChange = calculateDollarChange(user, currentPrices);
              const percentageChange = calculatePercentageChange(user, currentPrices);
              const isPositive = dollarChange >= 0;
              const vsTopDollar = users[0]
                ? calculateVsTopDollar(user, users[0], currentPrices)
                : 0;
              const vsTopPercentage = users[0]
                ? calculateVsTopPercentage(user, users[0], currentPrices)
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
                    isVsTopPositive={isVsTopPositive}
                  />
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
