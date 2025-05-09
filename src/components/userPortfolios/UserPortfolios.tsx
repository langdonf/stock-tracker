import { User } from '@/types/portfolio';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import AddStockModal from '../stocks/AddStockModal';
import StockHeader from '../stocks/StockHeader';
import StockTrendBar from '../stocks/StockTrendBar';
import { addStock } from '../leaderboard/utils';

interface UserPortfoliosProps {
  users: User[];
  currentPrices: Record<string, { currentPrice: number }>;
  handleDeleteStock: (userId: string, stockId: string, currentValue: number) => void;
  onStockAdded: () => void;
}

export default function UserPortfolios({ users, currentPrices, handleDeleteStock, onStockAdded }: UserPortfoliosProps) {
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  return (
    <Box sx={{ m: 2, mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        User Portfolios
      </Typography>
      {users.map((user) => (
        <Box key={user._id} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {user.name}&apos;s Portfolio
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
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
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <StockHeader />
              <TableBody>
                {user.portfolio.map((stock, stockIndex) => {
                  const currentPrice = currentPrices[stock.ticker]?.currentPrice || stock.purchasePrice;
                  const startValue = stock.shares * stock.purchasePrice;
                  const currentValue = stock.shares * currentPrice;
                  const change = currentValue - startValue;
                  const changePercent = (change / startValue) * 100;
                  const isStockPositive = change >= 0;

                  return (
                    <TableRow
                      key={stock._id}
                      sx={{
                        backgroundColor: stockIndex % 2 === 0 ? '#161B22' : '#0D1117',
                        '&:hover': { backgroundColor: '#21262D' },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {stock.ticker}
                        </Typography>
                      </TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell align="center">{stock.shares.toFixed(0)}</TableCell>
                      <TableCell align="center">${stock.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell align="center">${currentPrice.toFixed(2)}</TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: isStockPositive ? '#2ECC71' : '#E74C3C',
                          fontWeight: 'medium',
                        }}
                      >
                        {changePercent >= 0 ? '+' : ''}
                        {changePercent.toFixed(2)}%
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: isStockPositive ? '#2ECC71' : '#E74C3C',
                          fontWeight: 'medium',
                        }}
                      >
                        {change >= 0 ? '+' : ''}${change.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">${currentValue.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <StockTrendBar
                          ticker={stock.ticker}
                          purchasePrice={stock.purchasePrice}
                          purchaseDate={stock.purchaseDate}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                          }}
                        >Sell Stock
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteStock(user._id, stock._id, stock.shares * currentPrice)}
                            sx={{
                              color: '#2ECC71',
                              '&:hover': {
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                              },
                              ml: 1,
                            }}
                          > 
                            <MonetizationOnIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
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
