export interface PortfolioStock {
  _id: string;
  ticker: string;
  shares: number;
  companyName: string;
  purchasePrice: number;
  purchaseDate: string;
}

export interface Stock {
  _id: string;
  ticker: string;
  companyName: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  marketCap: number;
  volume: number;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface User {
  _id: string;
  name: string;
  cashRemaining: number;
  portfolio: PortfolioStock[];
}
