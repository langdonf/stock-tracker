import { User } from '@/types/portfolio';
import { calculatePortfolioValue, calculateStartingValue } from '@/utils/portfolioCalculations';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, IconButton, TableCell, TableRow, Typography } from '@mui/material';

interface CurrentPrice {
  currentPrice: number;
}

interface LeaderboardRowProps {
  user: User;
  index: number;
  handleRowClick: (userId: string) => void;
  setSelectedUserId: (userId: string) => void;
  setAddStockModalOpen: (open: boolean) => void;
  currentPrices: Record<string, CurrentPrice>;
  dollarChange: number;
  percentageChange: number;
  isVsTopPositive: boolean;
  isPositive: boolean;
  vsTopDollar: number;
  vsTopPercentage: number;
  expandedUsers: Set<string>;
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
  expandedUsers,
  handleRowClick,
  setSelectedUserId,
  setAddStockModalOpen,
}: LeaderboardRowProps) {
  return (
    <TableRow
      key={user._id}
      sx={{
        backgroundColor: index % 2 === 0 ? '#161B22' : '#0D1117',
        '&:hover': { backgroundColor: '#21262D' },
      }}
    >
      <TableCell
        sx={{
          width: '48px',
          backgroundColor: 'transparent !important',
        }}
      >
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => handleRowClick(user._id)}
        >
          {expandedUsers.has(user._id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography variant="subtitle1">{user.name}</Typography>
      </TableCell>
      <TableCell align="center">${calculateStartingValue(user).toFixed(2)}</TableCell>
      <TableCell align="center">
        ${calculatePortfolioValue(user, currentPrices).toFixed(2)}
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
        <Button
          startIcon={<AddIcon />}
          onClick={e => {
            e.stopPropagation();
            setSelectedUserId(user._id);
            setAddStockModalOpen(true);
          }}
          size="small"
          sx={{
            textTransform: 'none',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          Add Stock
        </Button>
      </TableCell>
    </TableRow>
  );
}
