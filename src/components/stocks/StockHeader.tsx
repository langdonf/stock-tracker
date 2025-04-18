import { TableCell, TableHead, TableRow } from '@mui/material';

export default function StockHeader() {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: 'background.paper' }}>
        <TableCell>Ticker</TableCell>
        <TableCell>Company</TableCell>
        <TableCell align="center">Shares</TableCell>
        <TableCell align="center">Purchase Price</TableCell>
        <TableCell align="center">Current Price</TableCell>
        <TableCell align="center">% Δ</TableCell>
        <TableCell align="center">$ Δ</TableCell>
        <TableCell align="center">Current Value</TableCell>
        <TableCell align="center">Trend</TableCell>
        <TableCell align="center">Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
