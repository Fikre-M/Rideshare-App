/**
 * RTCCollaboration - Real-time collaboration component using WebRTC
 * Placeholder component - implement as needed
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

interface RTCCollaborationProps {
  roomId?: string;
  userId?: string;
}

const RTCCollaboration: React.FC<RTCCollaborationProps> = ({ roomId, userId }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        RTC Collaboration - Room: {roomId ?? 'N/A'} | User: {userId ?? 'N/A'}
      </Typography>
    </Box>
  );
};

export default RTCCollaboration;
