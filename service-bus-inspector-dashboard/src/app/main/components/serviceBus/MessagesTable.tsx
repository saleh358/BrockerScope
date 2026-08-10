import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { ServiceBusMessage } from '../../../api/ServiceBus/models/serviceBusTypes';

type Props = {
  messages: ServiceBusMessage[];
  selectedMessage: ServiceBusMessage | null;
  onSelect: (message: ServiceBusMessage) => void;
};

export default function MessagesTable({ messages, selectedMessage, onSelect }: Props) {
  if (messages.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1">No loaded messages match the current search.</Typography>
        <Typography color="text.secondary" variant="body2">
          Refresh messages or change the search text.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        maxHeight: { xs: '55vh', lg: 'calc(100vh - 430px)' },
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable'
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Message ID</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Correlation</TableCell>
            <TableCell>Enqueued</TableCell>
            <TableCell align="right">Delivery</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((message) => {
            const selected = selectedMessage?.sequenceNumber === message.sequenceNumber;

            return (
              <TableRow
                hover
                key={message.sequenceNumber}
                selected={selected}
                onClick={() => onSelect(message)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography component="code" variant="caption">
                    {message.messageId || '(empty)'}
                  </Typography>
                </TableCell>
                <TableCell>{message.subject || '-'}</TableCell>
                <TableCell>
                  <Typography component="code" variant="caption">
                    {message.correlationId || '-'}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(message.enqueuedTime).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Chip label={message.deliveryCount} size="small" color={message.deliveryCount > 1 ? 'warning' : 'default'} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
