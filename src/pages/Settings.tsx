import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SettingItem } from '../types/api';

type Row = { key: string; value: string };

export function SettingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.get('/admin/settings');
      const items = (res.data.items as SettingItem[]) ?? [];
      setRows(items.map((i) => ({ key: i.key, value: i.value })));
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const settings: Record<string, string> = {};
      for (const r of rows) {
        const k = r.key.trim();
        if (!k) continue;
        settings[k] = r.value ?? '';
      }
      await api.put('/admin/settings', { settings });
      setSuccess('Saved');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <Typography variant="h5" fontWeight={800}>
          Settings
        </Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setRows((r) => [...r, { key: '', value: '' }])}
          >
            Add
          </Button>
          <Button variant="contained" onClick={save} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Loading…</Typography>
          </Box>
        ) : rows.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            No settings yet. Click “Add” to create one.
          </Typography>
        ) : (
          <Stack gap={2}>
            {rows.map((row, idx) => (
              <Stack key={`${row.key}-${idx}`} direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  label="Key"
                  value={row.key}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, i) => (i === idx ? { ...x, key: e.target.value } : x)),
                    )
                  }
                  fullWidth
                />
                <TextField
                  label="Value"
                  value={row.value}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)),
                    )
                  }
                  fullWidth
                />
                <IconButton
                  aria-label="Delete setting"
                  onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}
                  sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </>
  );
}

