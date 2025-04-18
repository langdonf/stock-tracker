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

export const calculateStartingValue = (): number => {
  // Starting value is initial cash (50)
  return INITIAL_CASH;
};

export const calculatePercentageChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  const startingValue = INITIAL_CASH;
  return ((portfolioValue - startingValue) / startingValue) * 100;
};

export const calculateDollarChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  const startingValue = INITIAL_CASH;
  return portfolioValue - startingValue;
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
