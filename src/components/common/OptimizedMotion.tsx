// Optimized Framer Motion with LazyMotion for smaller bundle size
import { LazyMotion, domAnimation, m } from 'framer-motion';

/**
 * Optimized motion wrapper using LazyMotion with domAnimation features
 * This reduces bundle size by ~30KB compared to full framer-motion import
 * 
 * Usage:
 * import { OptimizedMotion } from './OptimizedMotion';
 * <OptimizedMotion.div animate={{ x: 100 }} />
 */

// Create motion components using the optimized 'm' component
export const OptimizedMotion = {
  div: m.div,
  span: m.span,
  p: m.p,
  button: m.button,
  section: m.section,
  article: m.article,
  aside: m.aside,
  header: m.header,
  footer: m.footer,
  nav: m.nav,
  ul: m.ul,
  li: m.li,
  a: m.a,
  img: m.img,
  svg: m.svg,
  path: m.path,
};

/**
 * Wrapper component that provides LazyMotion context
 * Wrap your app or feature with this to enable optimized motion
 */
export const MotionProvider = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);

/**
 * Common animation variants for reuse
 */
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
};

/**
 * Common transition presets
 */
export const transitionPresets = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.15, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
};

export default OptimizedMotion;
