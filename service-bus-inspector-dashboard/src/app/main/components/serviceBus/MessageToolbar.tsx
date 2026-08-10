import { Box, Button, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { MessageScope } from '../../../api/ServiceBus/models/serviceBusTypes';

export type TimeFilter = 'all' | 'last-hour' | 'last-day';

type Props = {
  scope: MessageScope;
  peekCount: number;
  searchText: string;
  timeFilter: TimeFilter;
  loadedCount: number;
  loading: boolean;
  onScopeChange: (scope: MessageScope) => void;
  onPeekCountChange: (count: number) => void;
  onSearchTextChange: (value: string) => void;
  onTimeFilterChange: (value: TimeFilter) => void;
  onRefresh: () => void;
};

export default function MessageToolbar({
  scope,
  peekCount,
  searchText,
  timeFilter,
  loadedCount,
  loading,
  onScopeChange,
  onPeekCountChange,
  onSearchTextChange,
  onTimeFilterChange,
  onRefresh
}: Props) {
  return (
    <Stack spacing={1.5}>
      <Stack alignItems={{ xs: 'stretch', md: 'center' }} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={scope}
            onChange={(_, value: MessageScope | null) => value && onScopeChange(value)}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="deadletter">Dead-letter</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            select
            size="small"
            label="Peek count"
            value={peekCount}
            onChange={(event) => onPeekCountChange(Number(event.target.value))}
            sx={{ minWidth: 130 }}
          >
            {[50, 100, 500].map((count) => (
              <MenuItem key={count} value={count}>
                Peek {count}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="UTC time"
            value={timeFilter}
            onChange={(event) => onTimeFilterChange(event.target.value as TimeFilter)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All loaded</MenuItem>
            <MenuItem value="last-hour">Last hour</MenuItem>
            <MenuItem value="last-day">Last day</MenuItem>
          </TextField>
        </Stack>

        <Button loading={loading} onClick={onRefresh} startIcon={<RefreshOutlinedIcon />} variant="contained">
          Refresh messages
        </Button>
      </Stack>

      <Box>
        <TextField
          fullWidth
          label={`Search ${loadedCount} loaded messages`}
          placeholder="Message ID, correlation ID, subject, body, or custom property"
          size="small"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
        <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="caption">
          Search and time filters are local to loaded messages. Service Bus enqueued time is UTC.
        </Typography>
      </Box>
    </Stack>
  );
}
