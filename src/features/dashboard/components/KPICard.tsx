import { Card, CardContent, Typography, Box } from '@mui/material';

const KPICard = ({ title, value, icon: Icon, color = 'primary' }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          {Icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: `${color}.light`,
                color: `${color}.dark`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
