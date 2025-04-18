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

export const calculateStartingValue = (user: User): number => {
  const stocksStartingValue = user.portfolio.reduce((total, stock) => {
    return total + stock.shares * stock.purchasePrice;
  }, 0);
  // Starting value is initial cash (50) minus what was spent on stocks
  return INITIAL_CASH;
};

export const calculatePercentageChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  const startingValue = calculateStartingValue(user);
  if (startingValue === 0) return 0;
  return ((portfolioValue - startingValue) / startingValue) * 100;
};

export const calculateDollarChange = (
  user: User,
  currentPrices: Record<string, CurrentPrice>
): number => {
  const portfolioValue = calculatePortfolioValue(user, currentPrices);
  const startingValue = calculateStartingValue(user);
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
