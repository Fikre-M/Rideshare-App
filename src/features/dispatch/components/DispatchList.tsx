import { List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton, Typography, Paper } from '@mui/material';
import { LocalShipping, Info, CheckCircle, Cancel } from '@mui/icons-material';

const DispatchList = () => {
  // Mock data - in a real app, this would come from an API
  const dispatches = [
    { id: 1, name: 'Delivery #1001', status: 'pending', location: 'Downtown' },
    { id: 2, name: 'Pickup #2002', status: 'in-progress', location: 'Uptown' },
    { id: 3, name: 'Delivery #1003', status: 'completed', location: 'Midtown' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in-progress':
        return <Info color="info" />;
      default:
        return <Info color="disabled" />;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Dispatches
      </Typography>
      <List>
        {dispatches.map((dispatch) => (
          <ListItem key={dispatch.id} divider>
            <ListItemAvatar>
              <Avatar>
                <LocalShipping />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={dispatch.name}
              secondary={`Location: ${dispatch.location}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small">
                {getStatusIcon(dispatch.status)}
              </IconButton>
              <IconButton edge="end" size="small">
                <Cancel color="error" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DispatchList;
