import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, Divider, Drawer, Stack, Typography } from '@mui/material';
import { ServiceBusMessage } from '../../../api/ServiceBus/models/serviceBusTypes';

const DEFAULT_WIDTH = 440;
const MIN_WIDTH = 320;

type Props = {
  message: ServiceBusMessage | null;
  open: boolean;
  onClose: () => void;
};

export default function MessageDetailsDrawer({ message, open, onClose }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const resizeState = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!resizeState.current) return;

      const maxWidth = Math.max(MIN_WIDTH, Math.floor(window.innerWidth * 0.8));
      const nextWidth = resizeState.current.startWidth + resizeState.current.startX - event.clientX;
      setWidth(Math.min(Math.max(nextWidth, MIN_WIDTH), maxWidth));
    }

    function stopResizing() {
      resizeState.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
    };
  }, []);

  function startResizing(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    resizeState.current = { startX: event.clientX, startWidth: width };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          left: 'auto',
          right: 0,
          width: { xs: '100%', sm: `${width}px` }
        }
      }}
    >
      <Box
        aria-label="Resize message details panel"
        onPointerDown={startResizing}
        role="separator"
        sx={{
          '&:hover': { bgcolor: 'primary.main' },
          cursor: 'col-resize',
          display: { xs: 'none', sm: 'block' },
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          touchAction: 'none',
          width: 6,
          zIndex: 1
        }}
      />
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
