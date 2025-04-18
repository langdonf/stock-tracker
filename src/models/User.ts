import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    uppercase: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  dailyChange: {
    type: Number,
    required: true,
  },
  dailyChangePercent: {
    type: Number,
    required: true,
  },
  marketCap: {
    type: Number,
    required: true,
    min: 0,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
  },
  peRatio: {
    type: Number,
    required: true,
  },
  fiftyTwoWeekHigh: {
    type: Number,
    required: true,
    min: 0,
  },
  fiftyTwoWeekLow: {
    type: Number,
    required: true,
    min: 0,
  },
});

const portfolioStockSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    uppercase: true,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  companyName: {
    type: String,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const portfolioValueSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  value: {
    type: Number,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cashRemaining: {
      type: Number,
      required: true,
      min: 0,
      default: 50, // Starting with $50
    },
    portfolio: [portfolioStockSchema],
    historicalValues: {
      type: [portfolioValueSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to ensure historicalValues is always an array
userSchema.pre('save', function(next) {
  if (!this.historicalValues) {
    this.historicalValues = [];
  }
  next();
});

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
export default mongoose.models.User || mongoose.model('User', userSchema);
