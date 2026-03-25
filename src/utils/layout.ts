/**
 * Layout Constants
 * Centralized layout dimensions and spacing values
 */

export const LAYOUT = {
  // Drawer/Sidebar dimensions
  DRAWER_WIDTH: 260,
  DRAWER_WIDTH_COLLAPSED: 64,
  
  // Header dimensions
  HEADER_HEIGHT: 64,
  HEADER_HEIGHT_MOBILE: 56,
  
  // Content constraints
  CONTENT_MAX_WIDTH: 1440,
  
  // Spacing
  CONTENT_PADDING: {
    xs: 2,
    sm: 3,
  },
  
  // Z-index layers
  Z_INDEX: {
    drawer: 1200,
    appBar: 1100,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

// Export individual constants for convenience
export const DRAWER_WIDTH = LAYOUT.DRAWER_WIDTH;
export const DRAWER_WIDTH_COLLAPSED = LAYOUT.DRAWER_WIDTH_COLLAPSED;
export const HEADER_HEIGHT = LAYOUT.HEADER_HEIGHT;
export const HEADER_HEIGHT_MOBILE = LAYOUT.HEADER_HEIGHT_MOBILE;
export const CONTENT_MAX_WIDTH = LAYOUT.CONTENT_MAX_WIDTH;

export default LAYOUT;
