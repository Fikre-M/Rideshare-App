import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const useResponsive = () => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    setIsMobile(isXs || isSm);
    setIsTablet(isMd || isSm);
    setIsDesktop(isLg || isXl);
  }, [isXs, isSm, isMd, isLg, isXl]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isUpMd,
    isDownMd,
    isUpLg,
    isDownLg,
  };
};

export default useResponsive;
