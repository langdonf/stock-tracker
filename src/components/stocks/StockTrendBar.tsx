import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';
import { green, red } from '@mui/material/colors';

interface StockTrendBarProps {
  ticker: string;
  purchasePrice: number;
  purchaseDate: string;
}

interface HistoricalPrice {
  date: string;
  close: number;
}

export default function StockTrendBar({ ticker, purchasePrice, purchaseDate }: StockTrendBarProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/history?ticker=${ticker}`);
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const data = await response.json();
        const purchaseIndex = data.findIndex((day: HistoricalPrice) => day.date === purchaseDate);
        const purchaseData = data.slice(purchaseIndex);
        setHistoricalData(purchaseIndex > 0 ? purchaseData : data);
      } catch (err) {
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  if (loading || historicalData.length === 0) {
    return null;
  }

  // Create data points with changes
  const data = historicalData.map((day, index) => ({
    x: index.toString(),
    y: day.close - purchasePrice,
  }));

  // Calculate range for scale
  const values = data.map(d => d.y);
  const maxChange = Math.max(...values);
  const minChange = Math.min(...values);
  const range = Math.max(Math.abs(maxChange), Math.abs(minChange));

  // Create color map for bars
  const barColors = data.map(d => (d.y >= 0 ? green[500] : red[500]));
  const xValues = data.map(d => d.x);

  return (
    <Box sx={{ width: 180, height: 60 }}>
      <BarChart
        series={[
          {
            data: data.map(d => d.y),
            id: 'changes',
          },
        ]}
        height={60}
        xAxis={[
          {
            data: xValues,
            scaleType: 'band',
            tickSize: 0,
            hideTooltip: true,
            position: 'none',
            colorMap: {
              type: 'ordinal',
              values: xValues,
              colors: barColors,
            },
          },
        ]}
        yAxis={[
          {
            min: -range,
            max: range,
            tickSize: 0,
            hideTooltip: true,
            position: 'none',
          },
        ]}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        disableAxisListener
      />
    </Box>
  );
}
