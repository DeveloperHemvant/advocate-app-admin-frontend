import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function DashboardPage() {
  const [total, setTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [allRes, pendingRes] = await Promise.all([
        api.get('/admin/advocates', { params: { page: 1, pageSize: 1 } }),
        api.get('/admin/advocates', { params: { status: 'PENDING', page: 1, pageSize: 1 } }),
      ]);
      if (cancelled) return;
      setTotal(allRes.data.total);
      setPending(pendingRes.data.total);
    }
    load().catch(() => {
      if (!cancelled) {
        setTotal(null);
        setPending(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Dashboard
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Box>
          <Card>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.7 }}>
                Total advocates
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {total ?? '—'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.7 }}>
                Pending approvals
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {pending ?? '—'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}

