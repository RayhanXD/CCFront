/**
 * Spacing system for consistent layout throughout the app
 * Based on an 8-point grid system
 */

// Base unit for spacing (in pixels)
const BASE_UNIT = 4;

// Spacing scale
export const spacing = {
  // Core spacing values
  none: 0,
  xxs: BASE_UNIT, // 4px
  xs: BASE_UNIT * 2, // 8px
  sm: BASE_UNIT * 3, // 12px
  md: BASE_UNIT * 4, // 16px
  lg: BASE_UNIT * 6, // 24px
  xl: BASE_UNIT * 8, // 32px
  xxl: BASE_UNIT * 12, // 48px
  xxxl: BASE_UNIT * 16, // 64px
  
  // Functional spacing aliases
  gutter: BASE_UNIT * 4, // 16px - Standard padding for containers
  cardPadding: BASE_UNIT * 4, // 16px - Standard padding inside cards
  sectionSpacing: BASE_UNIT * 6, // 24px - Spacing between major sections
  screenPadding: BASE_UNIT * 4, // 16px - Standard padding for screens
  listItemSpacing: BASE_UNIT * 3, // 12px - Spacing between list items
  inputPadding: BASE_UNIT * 3, // 12px - Padding inside form inputs
  buttonPadding: BASE_UNIT * 3, // 12px - Vertical padding for buttons
  iconSpacing: BASE_UNIT * 2, // 8px - Spacing between icons and text
  inlineElementSpacing: BASE_UNIT * 2, // 8px - Spacing between inline elements
};

// Insets for consistent padding (useful for SafeAreaView)
export const insets = {
  screen: {
    top: spacing.md,
    bottom: spacing.md,
    horizontal: spacing.md,
  },
  card: {
    top: spacing.md,
    bottom: spacing.md,
    horizontal: spacing.md,
  },
  modal: {
    top: spacing.lg,
    bottom: spacing.lg,
    horizontal: spacing.md,
  },
};

// Layout grid system
export const grid = {
  gutter: spacing.md,
  margin: spacing.md,
  column: BASE_UNIT * 8, // 32px
};

// Helper function to create responsive spacing based on screen size
export const responsiveSpacing = (
  size: keyof typeof spacing,
  factor: number = 1
): number => {
  return spacing[size] * factor;
};

// Helper function to create consistent margin styles
export const margin = {
  top: (size: keyof typeof spacing) => ({ marginTop: spacing[size] }),
  bottom: (size: keyof typeof spacing) => ({ marginBottom: spacing[size] }),
  left: (size: keyof typeof spacing) => ({ marginLeft: spacing[size] }),
  right: (size: keyof typeof spacing) => ({ marginRight: spacing[size] }),
  horizontal: (size: keyof typeof spacing) => ({ marginHorizontal: spacing[size] }),
  vertical: (size: keyof typeof spacing) => ({ marginVertical: spacing[size] }),
  all: (size: keyof typeof spacing) => ({ margin: spacing[size] }),
};

// Helper function to create consistent padding styles
export const padding = {
  top: (size: keyof typeof spacing) => ({ paddingTop: spacing[size] }),
  bottom: (size: keyof typeof spacing) => ({ paddingBottom: spacing[size] }),
  left: (size: keyof typeof spacing) => ({ paddingLeft: spacing[size] }),
  right: (size: keyof typeof spacing) => ({ paddingRight: spacing[size] }),
  horizontal: (size: keyof typeof spacing) => ({ paddingHorizontal: spacing[size] }),
  vertical: (size: keyof typeof spacing) => ({ paddingVertical: spacing[size] }),
  all: (size: keyof typeof spacing) => ({ padding: spacing[size] }),
};

export default spacing;
