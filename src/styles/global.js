import { createGlobalStyle } from 'styled-components';
import { alpha } from '@mui/material/styles';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    font-family: ${(props) => props.theme.typography.fontFamily};
    background-color: ${(props) => props.theme.palette.background.default};
    color: ${(props) => props.theme.palette.text.primary};
    line-height: 1.5;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.palette.grey[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.palette.grey[400]};
    border-radius: 4px;
    
    &:hover {
      background: ${(props) => props.theme.palette.grey[500]};
    }
  }

  /* Selection Styling */
  ::selection {
    background: ${(props) => alpha(props.theme.palette.primary.main, 0.2)};
  }

  /* Remove default button styles */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
    margin: 0;
    outline: none;
  }

  /* Remove default list styles */
  ul, ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* Link styles */
  a {
    color: ${(props) => props.theme.palette.primary.main};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  }

  /* Form elements */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
  }
`;
