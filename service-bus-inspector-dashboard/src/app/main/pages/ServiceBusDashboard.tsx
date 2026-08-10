import { useEffect, useMemo, useState } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import {
  getServiceBusEntities,
  peekQueueMessages,
  peekSubscriptionMessages
} from '../../api/ServiceBus/serviceBusApi';
import {
  MessageScope,
  ServiceBusEntity,
  ServiceBusMessage
} from '../../api/ServiceBus/models/serviceBusTypes';
import { getConnections } from '../../api/Connections/connectionsApi';
import { ServiceBusConnection } from '../../api/Connections/models/connectionTypes';
import EntityStatsCards from '../components/serviceBus/EntityStatsCards';
import EntityTree from '../components/serviceBus/EntityTree';
import MessageDetailsDrawer from '../components/serviceBus/MessageDetailsDrawer';
import MessagesTable from '../components/serviceBus/MessagesTable';
import MessageToolbar, { TimeFilter } from '../components/serviceBus/MessageToolbar';
import ConnectionSettings from '../components/settings/ConnectionSettings';

type Page = 'dashboard' | 'settings';

type Props = {
  colorMode: 'light' | 'dark';
  onToggleColorMode: () => void;
};

export default function ServiceBusDashboard({ colorMode, onToggleColorMode }: Props) {
  const [page, setPage] = useState<Page>('dashboard');
  const [connections, setConnections] = useState<ServiceBusConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [entities, setEntities] = useState<ServiceBusEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<ServiceBusEntity | null>(null);
  const [messages, setMessages] = useState<ServiceBusMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ServiceBusMessage | null>(null);
  const [scope, setScope] = useState<MessageScope>('active');
  const [peekCount, setPeekCount] = useState(100);
  const [searchText, setSearchText] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const now = Date.now();
    const minimumEnqueuedTime =
      timeFilter === 'last-hour'
        ? now - 60 * 60 * 1000
        : timeFilter === 'last-day'
          ? now - 24 * 60 * 60 * 1000
          : null;
    const timeFilteredMessages = minimumEnqueuedTime
      ? messages.filter((message) => Date.parse(message.enqueuedTime) >= minimumEnqueuedTime)
      : messages;

    if (!query) return timeFilteredMessages;

    return timeFilteredMessages.filter((message) => {
      const properties = JSON.stringify(message.applicationProperties ?? {}).toLowerCase();
      return [
        message.messageId,
        message.correlationId,
        message.subject,
        message.contentType,
        message.body,
        properties
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [messages, searchText, timeFilter]);

  useEffect(() => {
    if (page !== 'dashboard') return;

    async function loadConnections() {
      setConnectionsLoading(true);
      try {
        const loadedConnections = await getConnections();
        setConnections(loadedConnections);
        setSelectedConnectionId((current) =>
          loadedConnections.some((connection) => connection.id === current)
            ? current
            : loadedConnections[0]?.id ?? null
        );
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Failed to load connections.');
      } finally {
        setConnectionsLoading(false);
      }
    }

    void loadConnections();
  }, [page]);

  async function refreshEntities(connectionId = selectedConnectionId) {
    if (!connectionId) {
      setError('Add and select a Service Bus connection in Settings first.');
      return;
    }

    setEntitiesLoading(true);
    setError(null);
    try {
      const loadedEntities = await getServiceBusEntities(connectionId);
      setEntities(loadedEntities);
      setSelectedEntity((current) =>
        loadedEntities.length
          ? loadedEntities.find((entity) => entity.path === current?.path) ?? loadedEntities[0]
          : null
      );
      setLastRefresh(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load Service Bus entities.');
    } finally {
      setEntitiesLoading(false);
    }
  }

  async function refreshMessages() {
    if (!selectedEntity) return;

    setMessagesLoading(true);
    setError(null);
    try {
      const deadLetter = scope === 'deadletter';
      const loadedMessages =
        selectedEntity.entityType === 'queue'
          ? await peekQueueMessages(
              selectedEntity.name,
              peekCount,
              deadLetter,
              selectedConnectionId ?? undefined
            )
          : await peekSubscriptionMessages(
              selectedEntity.topicName!,
              selectedEntity.subscriptionName!,
              peekCount,
              deadLetter,
              selectedConnectionId ?? undefined
            );
      setMessages(loadedMessages);
      setSelectedMessage(loadedMessages[0] ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to peek messages.');
    } finally {
      setMessagesLoading(false);
    }
  }

  function selectEntity(entity: ServiceBusEntity) {
    setSelectedEntity(entity);
    setMessages([]);
    setSelectedMessage(null);
    setSearchText('');
    setTimeFilter('all');
  }

  function switchConnection(connectionId: number) {
    setSelectedConnectionId(connectionId);
    setEntities([]);
    setSelectedEntity(null);
    setMessages([]);
    setSelectedMessage(null);
    setError(null);
    void refreshEntities(connectionId);
  }

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
    { id: 'settings' as const, label: 'Settings', icon: <SettingsOutlinedIcon /> }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            bgcolor: colorMode === 'dark' ? '#000000' : '#172033',
            borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.16)' : undefined,
            color: '#eef3ff',
            width: 248
          }
        }}
      >
        <Box sx={{ p: 2.25 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                height: 34,
                justifyContent: 'center',
                width: 34
              }}
            >
              <InboxOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography fontWeight={500}>BrokerScope</Typography>
              <Typography color={colorMode === 'dark' ? '#a3a3a3' : '#9eabc4'} variant="caption">
                Local read-only
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <List sx={{ px: 1.25 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => setPage(item.id)}
              selected={page === item.id}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ ml: { md: '248px' } }}>
        <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar sx={{ flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', py: 1 }}>
            <Box>
              <Typography variant="h6">{page === 'dashboard' ? 'Service Bus dashboard' : 'Settings'}</Typography>
              <Typography color="text.secondary" variant="body2">
                {page === 'dashboard'
                  ? 'Local API · manual refresh · peek only'
                  : 'Manage local Service Bus connections'}
              </Typography>
            </Box>
            <Stack alignItems="center" direction="row" spacing={1.5}>
              {page === 'dashboard' && (
                <>
                <TextField
                  disabled={connectionsLoading || connections.length === 0}
                  label="Connection"
                  onChange={(event) => switchConnection(Number(event.target.value))}
                  select
                  size="small"
                  sx={{ minWidth: 240 }}
                  value={selectedConnectionId ?? ''}
                >
                  {connections.map((connection) => (
                    <MenuItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  disabled={entitiesLoading || !selectedConnectionId}
                  onClick={() => void refreshEntities()}
                  startIcon={entitiesLoading ? <CircularProgress size={16} /> : <RefreshOutlinedIcon />}
                  variant="contained"
                >
                  Refresh entities
                </Button>
                </>
              )}
              <Tooltip title={`Use ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                  onClick={onToggleColorMode}
                >
                  {colorMode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth={page === 'dashboard' ? false : 'lg'} sx={{ py: 2.5 }}>
          {page === 'settings' ? (
            <ConnectionSettings />
          ) : (
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              <EntityStatsCards entities={entities} lastRefresh={lastRefresh} />
              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }
                }}
              >
                <EntityTree entities={entities} selectedEntity={selectedEntity} onSelect={selectEntity} />
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="subtitle1">
                          {selectedEntity?.path ?? 'Select an entity'}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {selectedEntity
                            ? `${selectedEntity.entityType} · searching loaded messages only`
                            : 'Refresh entities, then choose a queue or subscription'}
                        </Typography>
                      </Box>
                      <Chip color="success" label="Read-only" size="small" />
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <MessageToolbar
                        scope={scope}
                        peekCount={peekCount}
                        searchText={searchText}
                        timeFilter={timeFilter}
                        loadedCount={messages.length}
                        loading={messagesLoading}
                        onScopeChange={(value) => {
                          setScope(value);
                          setMessages([]);
                          setSelectedMessage(null);
                        }}
                        onPeekCountChange={setPeekCount}
                        onSearchTextChange={setSearchText}
                        onTimeFilterChange={setTimeFilter}
                        onRefresh={refreshMessages}
                      />
                      <MessagesTable
                        messages={filteredMessages}
                        selectedMessage={selectedMessage}
                        onSelect={setSelectedMessage}
                      />
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            </Stack>
          )}
        </Container>
      </Box>

      <MessageDetailsDrawer
        message={selectedMessage}
        open={page === 'dashboard' && Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
      />
    </Box>
  );
}
