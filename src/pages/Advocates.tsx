import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Advocate, ProfileStatus } from '../types/api';

function StatusChip({ status }: { status: ProfileStatus }) {
  const color =
    status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning';
  return <Chip size="small" label={status} color={color as any} />;
}

export function AdvocatesPage() {
  const [items, setItems] = useState<Advocate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<ProfileStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ...(status ? { status } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [page, pageSize, status, search],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/advocates', { params });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to load advocates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.pageSize, (params as any).status, (params as any).search]);

  async function setStatusFor(id: string, next: ProfileStatus) {
    setError(null);
    try {
      await api.patch(`/admin/advocates/${id}/status`, { status: next });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to update status');
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <Typography variant="h5" fontWeight={800}>
          Advocates
        </Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as any);
            }}
            sx={{ width: 220 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="APPROVED">APPROVED</MenuItem>
            <MenuItem value="REJECTED">REJECTED</MenuItem>
          </TextField>
          <TextField
            label="Search (name/email/phone/city)"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            fullWidth
          />
        </Stack>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Loading…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" sx={{ py: 2, opacity: 0.8 }}>
                    No advocates found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.fullName}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.phone ?? '—'}</TableCell>
                  <TableCell>
                    {[a.city, a.state].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={a.profileStatus} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={a.profileStatus === 'APPROVED'}
                        onClick={() => setStatusFor(a.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={a.profileStatus === 'REJECTED'}
                        onClick={() => setStatusFor(a.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPage(0);
            setPageSize(parseInt(e.target.value, 10));
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </TableContainer>
    </>
  );
}

