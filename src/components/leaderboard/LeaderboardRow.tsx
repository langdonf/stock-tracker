import { User } from '@/types/portfolio';
import { TableCell, TableRow, Typography } from '@mui/material';
import PortfolioTrendBar from './PortfolioTrendBar';
import React from 'react';

interface LeaderboardRowProps {
  user: User;
  index: number;
  currentPrices: Record<string, { currentPrice: number }>;
  dollarChange: number;
  percentageChange: number;
  isVsTopPositive: boolean;
  isPositive: boolean;
  vsTopDollar: number;
  vsTopPercentage: number;
}

// Color constants
const POSITIVE_COLOR = '#2ECC71';
const NEGATIVE_COLOR = '#E74C3C';

export default function LeaderboardRow({
  user,
  currentPrices,
  dollarChange,
  percentageChange,
  isPositive,
  vsTopDollar,
  index,
  isVsTopPositive,
  vsTopPercentage,
}: LeaderboardRowProps) {
  // Update historical values when currentPrices change
  React.useEffect(() => {
    const updateHistoricalValues = async () => {
      try {
        const response = await fetch(`/api/users/${user._id}/portfolio/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentPrices),
        });

        if (!response.ok) {
          throw new Error('Failed to update historical values');
        }
      } catch (err) {
        console.error('Error updating historical values:', err);
      }
    };

    if (Object.keys(currentPrices).length > 0) {
      updateHistoricalValues();
    }
  }, [user._id, currentPrices]);

  return (
    <TableRow
      key={user._id}
      sx={{
        backgroundColor: index % 2 === 0 ? '#161B22' : '#0D1117',
        '&:hover': { backgroundColor: '#21262D' },
      }}>
      <TableCell
        sx={{
          width: '48px',
          backgroundColor: 'inherit',
        }}
      >
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography variant="subtitle1">{user.name}</Typography>
      </TableCell>
      <TableCell align="center">$50.00</TableCell>
      <TableCell align="center">
        ${(user.cashRemaining + user.portfolio.reduce((total, stock) => {
          const currentPrice = currentPrices[stock.ticker]?.currentPrice || stock.purchasePrice;
          return total + stock.shares * currentPrice;
        }, 0)).toFixed(2)}
      </TableCell>
      <TableCell align="center">${user.cashRemaining.toFixed(2)}</TableCell>
      <TableCell
        align="center"
        sx={{
          color: isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
          fontWeight: 'medium',
        }}
      >
        {dollarChange >= 0 ? '+' : ''}
        {dollarChange.toFixed(2)}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          color: isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
          fontWeight: 'medium',
        }}
      >
        {percentageChange >= 0 ? '+' : ''}
        {percentageChange.toFixed(2)}%
      </TableCell>
      <TableCell
        align="center"
        sx={{
          color: isVsTopPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
          fontWeight: 'medium',
        }}
      >
        {vsTopDollar >= 0 ? '+' : ''}
        {vsTopDollar.toFixed(2)}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          color: isVsTopPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
          fontWeight: 'medium',
        }}
      >
        {vsTopPercentage >= 0 ? '+' : ''}
        {vsTopPercentage.toFixed(2)}%
      </TableCell>
      <TableCell align="center">
        <PortfolioTrendBar
          userId={user._id}
        />
      </TableCell>
    </TableRow>
  );
}
