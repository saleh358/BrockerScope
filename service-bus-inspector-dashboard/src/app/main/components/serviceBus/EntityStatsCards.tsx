import { Grid, Paper, Stack, Typography } from '@mui/material';
import { ServiceBusEntity } from '../../../api/ServiceBus/models/serviceBusTypes';

type Props = {
  entities: ServiceBusEntity[];
  lastRefresh: Date | null;
};

export default function EntityStatsCards({ entities, lastRefresh }: Props) {
  const active = entities.reduce((sum, entity) => sum + entity.activeMessageCount, 0);
  const deadLetter = entities.reduce((sum, entity) => sum + entity.deadLetterMessageCount, 0);
  const scheduled = entities.reduce((sum, entity) => sum + entity.scheduledMessageCount, 0);

  const cards = [
    { label: 'Active messages', value: active.toLocaleString(), helper: `${entities.length} entities` },
    { label: 'Dead-letter', value: deadLetter.toLocaleString(), helper: 'Review failed messages', danger: deadLetter > 0 },
    { label: 'Scheduled', value: scheduled.toLocaleString(), helper: 'Queue-level count' },
    {
      label: 'Last refresh',
      value: lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never',
      helper: 'Manual refresh only'
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack spacing={0.5}>
              <Typography color="text.secondary" variant="body2">
                {card.label}
              </Typography>
              <Typography color={card.danger ? 'error.main' : 'text.primary'} variant="h5">
                {card.value}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {card.helper}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
