import { FormEvent, useEffect, useState } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  createConnection,
  deleteConnection,
  getConnections,
  updateConnection
} from '../../../api/Connections/connectionsApi';
import { ServiceBusConnection } from '../../../api/Connections/models/connectionTypes';

type ConnectionForm = {
  name: string;
  connectionString: string;
};

const emptyForm: ConnectionForm = { name: '', connectionString: '' };

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function obscureConnectionString(connectionString: string) {
  const endpoint = connectionString
    .split(';')
    .find((part) => part.trim().toLowerCase().startsWith('endpoint='));

  if (endpoint) {
    return `${endpoint.trim()}; ••••••••`;
  }

  return '•'.repeat(Math.min(Math.max(connectionString.length, 8), 24));
}

export default function ConnectionSettings() {
  const [connections, setConnections] = useState<ServiceBusConnection[]>([]);
  const [editingConnection, setEditingConnection] = useState<ServiceBusConnection | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<ServiceBusConnection | null>(null);
  const [form, setForm] = useState<ConnectionForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadConnections() {
    setLoading(true);
    setError(null);

    try {
      setConnections(await getConnections());
    } catch (caught) {
      setError(errorMessage(caught, 'Failed to load connection strings.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConnections();
  }, []);

  function openCreateForm() {
    setEditingConnection(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  function openEditForm(connection: ServiceBusConnection) {
    setEditingConnection(connection);
    setForm({ name: connection.name, connectionString: connection.connectionString });
    setError(null);
    setSuccess(null);
    setFormOpen(true);
  }

  async function saveConnection(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim() || !form.connectionString.trim()) {
      setError('Name and connection string are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingConnection) {
        const updated = await updateConnection(editingConnection.id, {
          name: form.name.trim(),
          connectionString: form.connectionString.trim()
        });
        setConnections((current) =>
          current.map((connection) => (connection.id === updated.id ? updated : connection))
        );
        setSuccess(`Updated ${updated.name}.`);
      } else {
        const created = await createConnection({
          name: form.name.trim(),
          connectionString: form.connectionString.trim()
        });
        setConnections((current) => [...current, created].sort((a, b) => a.id - b.id));
        setSuccess(`Added ${created.name}.`);
      }

      setFormOpen(false);
    } catch (caught) {
      setError(errorMessage(caught, 'Failed to save the connection string.'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!connectionToDelete) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteConnection(connectionToDelete.id);
      setConnections((current) =>
        current.filter((connection) => connection.id !== connectionToDelete.id)
      );
      setSuccess(`Deleted ${connectionToDelete.name}.`);
      setConnectionToDelete(null);
    } catch (caught) {
      setError(errorMessage(caught, 'Failed to delete the connection string.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Paper variant="outlined">
        <Stack
          alignItems={{ xs: 'stretch', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ borderBottom: 1, borderColor: 'divider', p: 2.5 }}
        >
          <Box>
            <Typography variant="h6">Service Bus connection strings</Typography>
            <Typography color="text.secondary" variant="body2">
              The first connection in this list is used by the Service Bus inspector.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              disabled={loading}
              onClick={() => void loadConnections()}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshOutlinedIcon />}
            >
              Refresh
            </Button>
            <Button onClick={openCreateForm} startIcon={<AddOutlinedIcon />} variant="contained">
              Add connection
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'grid', minHeight: 220, placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : connections.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="subtitle1">No connections configured</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
              Add a Service Bus connection string to start inspecting entities.
            </Typography>
            <Button onClick={openCreateForm} startIcon={<AddOutlinedIcon />} variant="outlined">
              Add connection
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Connection string</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id} hover>
                    <TableCell>
                      <Typography fontWeight={500} variant="body2">{connection.name}</Typography>
                      <Typography color="text.secondary" variant="caption">ID {connection.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography component="code" sx={{ overflowWrap: 'anywhere' }} variant="body2">
                        {obscureConnectionString(connection.connectionString)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit connection">
                        <IconButton aria-label={`Edit ${connection.name}`} onClick={() => openEditForm(connection)}>
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete connection">
                        <IconButton
                          aria-label={`Delete ${connection.name}`}
                          color="error"
                          onClick={() => setConnectionToDelete(connection)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog fullWidth maxWidth="sm" open={formOpen} onClose={() => !saving && setFormOpen(false)}>
        <Box component="form" onSubmit={saveConnection}>
          <DialogTitle>{editingConnection ? 'Edit connection' : 'Add connection'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                fullWidth
                label="Name"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                value={form.name}
              />
              <TextField
                fullWidth
                label="Service Bus connection string"
                minRows={4}
                multiline
                onChange={(event) =>
                  setForm((current) => ({ ...current, connectionString: event.target.value }))
                }
                placeholder="Endpoint=sb://...;SharedAccessKeyName=...;SharedAccessKey=..."
                required
                value={form.connectionString}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button disabled={saving} type="submit" variant="contained">
              {saving ? <CircularProgress size={20} /> : editingConnection ? 'Save changes' : 'Add connection'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(connectionToDelete)} onClose={() => !deleting && setConnectionToDelete(null)}>
        <DialogTitle>Delete connection?</DialogTitle>
        <DialogContent>
          <Typography>
            {connectionToDelete
              ? `This permanently removes ${connectionToDelete.name} from the local inspector.`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setConnectionToDelete(null)}>Cancel</Button>
          <Button color="error" disabled={deleting} onClick={() => void confirmDelete()} variant="contained">
            {deleting ? <CircularProgress color="inherit" size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
