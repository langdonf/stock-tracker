import { User } from '@/types/portfolio';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import StockHeader from './StockHeader';
import StockTrendBar from './StockTrendBar';

// Color constants
const POSITIVE_COLOR = '#2ECC71';
const NEGATIVE_COLOR = '#E74C3C';

interface CurrentPrice {
  currentPrice: number;
}

interface StockRowProps {
  user: User;
  currentPrices: Record<string, CurrentPrice>;
  expandedUsers: Set<string>;
  handleDeleteStock: (userId: string, stockId: string, currentValue: number) => void;
}

export default function StockRow({
  user,
  currentPrices,
  expandedUsers,
  handleDeleteStock,
}: StockRowProps) {
  return (
    <TableRow>
      <TableCell style={{ padding: 0, margin: 0 }} colSpan={10}>
        <Collapse in={expandedUsers.has(user._id)} timeout="auto" unmountOnExit>
          <Box
            sx={{
              marginBottom: 2,
              marginTop: 2,
              backgroundColor: 'background.default',
              boxShadow: 1,
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <StockHeader />
              <TableBody>
                {user.portfolio.map((stock, stockIndex) => {
                  const currentPrice =
                    currentPrices[stock.ticker]?.currentPrice || stock.purchasePrice;
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
                          color: isStockPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
                          fontWeight: 'medium',
                        }}
                      >
                        {change >= 0 ? '+' : ''}
                        {changePercent.toFixed(2)}%
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: isStockPositive ? POSITIVE_COLOR : NEGATIVE_COLOR,
                          fontWeight: 'medium',
                        }}
                      >
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(2)}
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
                        >
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteStock(user._id, stock._id, stock.shares * currentPrice);
                            }}
                            sx={{
                              color: POSITIVE_COLOR,
                              '&:hover': {
                                backgroundColor: `${POSITIVE_COLOR}20`,
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
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}
