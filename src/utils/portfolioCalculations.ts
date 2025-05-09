import { User } from '@/types/portfolio';

interface CurrentPrice {
  currentPrice: number;
}

const INITIAL_CASH = 50;

export const calculatePortfolioValue = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const stocksValue = user.portfolio.reduce((total, stock) => {
    const currentPrice = currentPrices[stock.ticker]?.currentPrice;
    return total + stock.shares * currentPrice;
  }, 0);
  return stocksValue + user.cashRemaining;
};

export const calculatePercentageChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  return ((portfolioValue - INITIAL_CASH) / INITIAL_CASH) * 100;
};

export const calculateDollarChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  return portfolioValue - INITIAL_CASH;
};

export const findTopPerformer = (
  users: User[],
  currentPrices: Record<string, CurrentPrice>
): User | null => {
  if (users.length === 0) return null;
  return users.reduce((top, current) => {
    const topValue = calculatePortfolioValue(top, currentPrices);
    const currentValue = calculatePortfolioValue(current, currentPrices);
    return currentValue > topValue ? current : top;
  });
};

export const calculateVsTopDollar = (
  user: User,
  topPerformer: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const userValue = calculatePortfolioValue(user, currentPrices);
  const topValue = calculatePortfolioValue(topPerformer, currentPrices);
  return userValue - topValue;
};

export const calculateVsTopPercentage = (
  user: User,
  topPerformer: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const userValue = calculatePortfolioValue(user, currentPrices);
  const topValue = calculatePortfolioValue(topPerformer, currentPrices);
  if (topValue === 0) return 0;
  return ((userValue - topValue) / topValue) * 100;
};

export const updateHistoricalValues = async (
  userId: string,
  currentValue: number
): Promise<void> => {
  try {
    const response = await fetch(`/api/users/${userId}/historical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: currentValue }),
    });

    if (!response.ok) {
      throw new Error('Failed to update historical values');
    }
  } catch (error) {
    console.error('Error updating historical values:', error);
    throw error;
  }
};
