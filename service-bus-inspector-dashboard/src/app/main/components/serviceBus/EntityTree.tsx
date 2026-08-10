import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { ServiceBusEntity } from '../../../api/ServiceBus/models/serviceBusTypes';

type Props = {
  entities: ServiceBusEntity[];
  selectedEntity: ServiceBusEntity | null;
  onSelect: (entity: ServiceBusEntity) => void;
};

type TopicGroup = {
  topicName: string;
  subscriptions: ServiceBusEntity[];
};

export default function EntityTree({ entities, selectedEntity, onSelect }: Props) {
  const [queuesExpanded, setQueuesExpanded] = useState(true);
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const queues = useMemo(
    () => entities.filter((entity) => entity.entityType === 'queue'),
    [entities]
  );

  const topicGroups = useMemo<TopicGroup[]>(() => {
    const grouped = new Map<string, ServiceBusEntity[]>();

    entities
      .filter((entity) => entity.entityType === 'subscription' && entity.topicName)
      .forEach((entity) => {
        const topicName = entity.topicName!;
        grouped.set(topicName, [...(grouped.get(topicName) ?? []), entity]);
      });

    return Array.from(grouped.entries())
      .map(([topicName, subscriptions]) => ({
        topicName,
        subscriptions: subscriptions.sort((first, second) =>
          first.subscriptionName!.localeCompare(second.subscriptionName!)
        )
      }))
      .sort((first, second) => first.topicName.localeCompare(second.topicName));
  }, [entities]);

  function toggleTopic(topicName: string) {
    setExpandedTopics((current) => ({ ...current, [topicName]: !(current[topicName] ?? true) }));
  }

  function expandAll() {
    setQueuesExpanded(true);
    setTopicsExpanded(true);
    setExpandedTopics(Object.fromEntries(topicGroups.map((group) => [group.topicName, true])));
  }

  function collapseAll() {
    setQueuesExpanded(false);
    setTopicsExpanded(false);
    setExpandedTopics(Object.fromEntries(topicGroups.map((group) => [group.topicName, false])));
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        alignSelf: 'start',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: { xs: '60vh', lg: 'calc(100vh - 250px)' },
        minHeight: 280,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">Entities</Typography>
            <Typography color="text.secondary" variant="body2">
              Queues and expandable topics
            </Typography>
          </Box>
          <Stack alignItems="flex-end" spacing={1}>
            <Typography color="text.secondary" variant="caption">
              {queues.length} queues / {topicGroups.length} topics
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="text" onClick={expandAll}>
                Expand all
              </Button>
              <Button size="small" variant="text" onClick={collapseAll}>
                Collapse all
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarGutter: 'stable'
        }}
      >
      <EntitySectionTitle
        title="Queues"
        count={queues.length}
        expanded={queuesExpanded}
        onToggle={() => setQueuesExpanded((current) => !current)}
      />
      <Collapse in={queuesExpanded} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {queues.map((entity) => (
            <EntityRow
              entity={entity}
              key={entity.path}
              label={entity.name}
              selected={selectedEntity?.path === entity.path}
              onSelect={onSelect}
            />
          ))}
        </List>
      </Collapse>

      <Divider />

      <EntitySectionTitle
        title="Topics"
        count={topicGroups.length}
        expanded={topicsExpanded}
        onToggle={() => setTopicsExpanded((current) => !current)}
      />
      <Collapse in={topicsExpanded} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {topicGroups.map((group) => {
            const isExpanded = expandedTopics[group.topicName] ?? true;
            const deadLetterCount = group.subscriptions.reduce(
              (sum, entity) => sum + entity.deadLetterMessageCount,
              0
            );
            const activeCount = group.subscriptions.reduce(
              (sum, entity) => sum + entity.activeMessageCount,
              0
            );

            return (
              <Box key={group.topicName}>
                <ListItemButton onClick={() => toggleTopic(group.topicName)} sx={{ minHeight: 42 }}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <AccountTreeOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Tooltip title={group.topicName}>
                    <ListItemText
                      primary={group.topicName}
                      secondary={`${group.subscriptions.length} subscriptions`}
                      primaryTypographyProps={{ noWrap: true, fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </Tooltip>
                  <Badge
                    color={deadLetterCount > 0 ? 'error' : 'primary'}
                    badgeContent={deadLetterCount > 0 ? deadLetterCount : activeCount}
                    max={999}
                    sx={{ mr: 1.25 }}
                  />
                  <IconButton
                    aria-label={isExpanded ? 'Collapse topic' : 'Expand topic'}
                    edge="end"
                    size="small"
                  >
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </ListItemButton>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {group.subscriptions.map((entity) => (
                      <EntityRow
                        entity={entity}
                        indent
                        key={entity.path}
                        label={entity.subscriptionName ?? entity.name}
                        selected={selectedEntity?.path === entity.path}
                        onSelect={onSelect}
                      />
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Collapse>
      </Box>
    </Paper>
  );
}

function EntitySectionTitle({
  title,
  count,
  expanded,
  onToggle
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ListItemButton onClick={onToggle} sx={{ minHeight: 40, px: 2, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </ListItemIcon>
      <ListItemText
        primary={title}
        primaryTypographyProps={{ color: 'text.secondary', fontWeight: 500, variant: 'caption' }}
      />
      <Typography color="text.secondary" variant="caption">
        {count}
      </Typography>
    </ListItemButton>
  );
}

function EntityRow({
  entity,
  indent,
  label,
  selected,
  onSelect
}: {
  entity: ServiceBusEntity;
  indent?: boolean;
  label: string;
  selected: boolean;
  onSelect: (entity: ServiceBusEntity) => void;
}) {
  const count = entity.deadLetterMessageCount > 0
    ? entity.deadLetterMessageCount
    : entity.activeMessageCount;

  return (
    <ListItemButton
      selected={selected}
      onClick={() => onSelect(entity)}
      sx={{ minHeight: 42, pl: indent ? 5.5 : 2 }}
    >
      <ListItemIcon sx={{ minWidth: 34 }}>
        <InboxOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <Tooltip title={entity.path}>
        <ListItemText
          primary={label}
          secondary={entity.deadLetterMessageCount > 0 ? 'Has dead-letter messages' : entity.status}
          primaryTypographyProps={{ noWrap: true, fontSize: 13 }}
          secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
        />
      </Tooltip>
      <Badge color={entity.deadLetterMessageCount > 0 ? 'error' : 'primary'} badgeContent={count} max={999} />
    </ListItemButton>
  );
}
