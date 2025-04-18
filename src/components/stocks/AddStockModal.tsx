import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDebounce } from '@/hooks/useDebounce';

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    ticker: string;
    shares: number;
    purchasePrice: number;
    purchaseDate: string;
  }) => void;
  userId: string;
  currentCash: number;
}

interface StockData {
  ticker: string;
  companyName: string;
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  dailyChange: number;
  dailyChangePercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export default function AddStockModal({
  open,
  onClose,
  onSubmit,
  userId,
  currentCash,
}: AddStockModalProps) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedTicker = useDebounce(ticker, 500);

  // Calculate total cost and remaining cash
  const { totalCost, remainingCash, isOverBudget } = useMemo(() => {
    const cost = parseFloat(shares) * parseFloat(purchasePrice) || 0;
    const remaining = currentCash - cost;
    return {
      totalCost: cost,
      remainingCash: remaining,
      isOverBudget: remaining < 0,
    };
  }, [shares, purchasePrice, currentCash]);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!debouncedTicker) {
        setStockData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/stocks/quote?ticker=${encodeURIComponent(debouncedTicker)}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setStockData(data);
        setPurchasePrice(data.currentPrice.toString());
      } catch (err) {
        setError('Failed to fetch stock data. Please check the ticker symbol.');
        setStockData(null);
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [debouncedTicker]);

  const handleSubmit = async () => {
    if (!stockData || !userId || !purchaseDate) {
      setError('Invalid stock data, user ID, or purchase date');
      return;
    }

    try {
      await onSubmit({
        ticker: stockData.ticker,
        shares: parseFloat(shares),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate: purchaseDate.toISOString().split('T')[0],
      });
      setError(null);
      setTicker('');
      setShares('');
      setPurchasePrice('');
      setPurchaseDate(new Date());
      setStockData(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to add stock');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Stock</DialogTitle>
      <DialogContent sx={{ mb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}

          {stockData && !loading && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                {stockData.companyName} ({stockData.ticker})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h6">${stockData.currentPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Change
                  </Typography>
                  <Typography
                    variant="h6"
                    color={stockData.dailyChange >= 0 ? 'success.main' : 'error.main'}
                  >
                    {stockData.dailyChange >= 0 ? '+' : ''}
                    {stockData.dailyChange.toFixed(2)} ({stockData.dailyChangePercent.toFixed(2)}%)
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Range
                  </Typography>
                  <Typography variant="body1">
                    ${stockData.dailyLow.toFixed(2)} - ${stockData.dailyHigh.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 'calc(50% - 8px)' }}>
                  <Typography variant="body2" color="text.secondary">
                    52 Week Range
                  </Typography>
                  <Typography variant="body1">
                    ${stockData.fiftyTwoWeekLow.toFixed(2)} - $
                    {stockData.fiftyTwoWeekHigh.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Ticker Symbol"
            fullWidth
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            error={!!error}
            helperText={error}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Number of Shares"
            type="number"
            fullWidth
            value={shares}
            onChange={e => setShares(e.target.value)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            margin="dense"
            label="Purchase Price"
            type="number"
            fullWidth
            value={purchasePrice}
            onChange={e => setPurchasePrice(e.target.value)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Purchase Date"
              value={purchaseDate}
              onChange={(newValue: Date | null) => setPurchaseDate(newValue)}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          pb: 2,
          pt: 1,
        }}
      >
        <Box sx={{ borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Cost: ${totalCost.toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            color={isOverBudget ? 'error.main' : 'success.main'}
            sx={{ fontWeight: 'medium' }}
          >
            Remaining Cash: ${remainingCash.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!stockData || !shares || !purchasePrice || isOverBudget}
          >
            Add Stock
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
