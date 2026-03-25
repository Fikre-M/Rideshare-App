import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, color = 'primary' }) => ({
  textTransform: 'none',
  borderRadius: 8,
  fontWeight: 600,
  padding: '8px 24px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
  ...(variant === 'outlined' && {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
    },
  }),
}));

const Button = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default Button;
