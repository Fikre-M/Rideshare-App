import { Card as MuiCard, CardContent, CardHeader, CardActions, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  transition: 'box-shadow 0.3s ease-in-out',
}));

const Card = ({ title, subheader, children, actions, ...props }) => {
  return (
    <StyledCard {...props}>
      {title && (
        <>
          <CardHeader 
            title={title} 
            subheader={subheader}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <Divider />
        </>
      )}
      <CardContent>{children}</CardContent>
      {actions && (
        <>
          <Divider />
          <CardActions sx={{ p: 2 }}>{actions}</CardActions>
        </>
      )}
    </StyledCard>
  );
};

export default Card;
