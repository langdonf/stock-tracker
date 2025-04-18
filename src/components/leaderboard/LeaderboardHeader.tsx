import { TableCell, TableHead, TableRow } from '@mui/material';

export default function LeaderboardHeader() {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: 'background.default' }}>
        <TableCell sx={{ width: '48px' }}></TableCell>
        <TableCell>User</TableCell>
        <TableCell align="center">Starting Value</TableCell>
        <TableCell align="center">Portfolio Value</TableCell>
        <TableCell align="center">Cash Remaining</TableCell>
        <TableCell align="center">$ Change</TableCell>
        <TableCell align="center">% Change</TableCell>
        <TableCell align="center">vs #1 ($)</TableCell>
        <TableCell align="center">vs #1 (%)</TableCell>
        <TableCell align="center">Performance</TableCell>
      </TableRow>
    </TableHead>
  );
}
