import { keyframes } from '@emotion/react';

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

export const slideOut = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Animation presets
export const animations = {
  fadeIn: `${fadeIn} 0.3s ease-out`,
  fadeInUp: `${fadeInUp} 0.4s ease-out`,
  fadeInDown: `${fadeInDown} 0.4s ease-out`,
  fadeInLeft: `${fadeInLeft} 0.4s ease-out`,
  fadeInRight: `${fadeInRight} 0.4s ease-out`,
  slideIn: `${slideIn} 0.3s ease-out`,
  slideOut: `${slideOut} 0.3s ease-in`,
  pulse: `${pulse} 2s infinite`,
  spin: `${spin} 1s linear infinite`,
  shimmer: `${shimmer} 2s infinite linear`,
};
