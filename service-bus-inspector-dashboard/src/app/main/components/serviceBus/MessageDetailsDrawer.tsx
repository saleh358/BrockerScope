import { Box, Divider, Drawer, Stack, Typography } from '@mui/material';
import { ServiceBusMessage } from '../../../api/ServiceBus/models/serviceBusTypes';

type Props = {
  message: ServiceBusMessage | null;
  open: boolean;
  onClose: () => void;
};

export default function MessageDetailsDrawer({ message, open, onClose }: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6">Message details</Typography>
        <Typography color="text.secondary" variant="body2">
          Read-only peeked message
        </Typography>
      </Box>
      <Divider />

      {message && (
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Detail label="Message ID" value={message.messageId || '-'} />
          <Detail label="Correlation ID" value={message.correlationId || '-'} />
          <Detail label="Subject" value={message.subject || '-'} />
          <Detail label="Content type" value={message.contentType || '-'} />
          <Detail label="Sequence" value={String(message.sequenceNumber)} />
          <Detail label="Delivery count" value={String(message.deliveryCount)} />

          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Body
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                fontSize: 12,
                m: 0,
                overflow: 'auto',
                p: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.body || '(empty body)'}
            </Box>
          </Box>

          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Application properties
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                fontSize: 12,
                m: 0,
                overflow: 'auto',
                p: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {JSON.stringify(message.applicationProperties, null, 2)}
            </Box>
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography component="code" sx={{ display: 'block', overflowWrap: 'anywhere' }} variant="body2">
        {value}
      </Typography>
    </Box>
  );
}
