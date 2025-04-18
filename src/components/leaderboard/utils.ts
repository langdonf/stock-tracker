import { User } from '@/types/portfolio';

interface CurrentPrice {
  currentPrice: number;
}

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const resetDatabase = async (): Promise<void> => {
  try {
    const response = await fetch('/api/reset', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to reset database');
    }
  } catch (err) {
    console.error('Error resetting database:', err);
    throw err;
  }
};

export const fetchStockQuotes = async (
  tickers: string[]
): Promise<Record<string, CurrentPrice>> => {
  try {
    const response = await fetch(`/api/stocks/quotes?tickers=${tickers.join(',')}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    console.error('Error fetching stock quotes:', err);
    throw err;
  }
};

export const addStock = async (
  userId: string,
  data: { ticker: string; shares: number; purchasePrice: number }
): Promise<void> => {
  try {
    const response = await fetch(`/api/users/${userId}/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add stock');
    }
  } catch (err) {
    console.error('Error adding stock:', err);
    throw err;
  }
};

export const deleteStock = async (
  userId: string,
  stockId: string,
  currentValue: number
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/users/${userId}/stocks/${stockId}?currentValue=${currentValue}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete stock');
    }
  } catch (err) {
    console.error('Error selling stock:', err);
    throw err;
  }
};
