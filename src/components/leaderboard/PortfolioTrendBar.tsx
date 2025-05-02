import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';
import { green, red } from '@mui/material/colors';

interface PortfolioTrendBarProps {
  userId: string;
}

interface HistoricalValue {
  date: string;
  value: number;
}

export default function PortfolioTrendBar({ userId }: PortfolioTrendBarProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/users/${userId}/portfolio/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        setHistoricalData(data);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [userId]);

  if (loading) {
    return <Box sx={{ width: 180, height: 60 }} />;
  }

  if (error || historicalData.length === 0) {
    return null;
  }

  // Create data points with changes relative to the first value
  const firstValue = historicalData[0].value;
  const data = historicalData.map((day, index) => ({
    x: index.toString(),
    y: day.value - firstValue,
  }));
  console.log(data);
  // Calculate range for scale
  const values = data.map(d => d.y);
  const maxChange = Math.max(...values);
  const minChange = Math.min(...values);
  const range = Math.max(Math.abs(maxChange), Math.abs(minChange)) || 1; // Ensure range is never 0

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