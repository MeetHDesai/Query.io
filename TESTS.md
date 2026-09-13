# Manual QA Test Plan for Query.io Landing Page

## Responsive Testing
Test the website on the following viewports:
- **Mobile (320px)**: 
  - Verify the navigation collapses to a hamburger menu
  - Check that hero text, buttons, and sections stack vertically
  - Confirm images scale appropriately 
  - Ensure no horizontal overflow occurs

- **Tablet (768px)**:
  - Verify the hero, features, and other sections adapt to medium screens
  - Confirm that feature cards display in a 2x2 grid
  - Check that testimonials display in 2 columns
  - Validate proper spacing between elements

- **Desktop (1440px)**:
  - Verify maximum container width is preserved with proper margins
  - Ensure proper desktop typography scaling
  - Confirm that feature cards display in a 4-column layout
  - Check that navigation and footer links display appropriately

## Design Element Verification
- **Color Verification**:
  - Primary color (#6D28D9) is used for buttons, headings, and important elements
  - Text colors match the specification (foreground, muted-foreground)
  - Background colors match the specification across sections
  - Hover states use correct color values

- **Typography**:
  - Confirm font family is correctly set to Geist Sans
  - Heading sizes match design spec (H1: 3rem, H2: 2.25rem, etc.)
  - Line heights are appropriate for readability
  - Font weights match the design (extrabold for main heading, etc.)

- **Spacing**:
  - Verify the spacing between sections matches the specified 5rem (80px)
  - Component spacing follows the 1.5rem (24px) guideline
  - Padding inside buttons and cards matches the design spec
  - Container padding changes appropriately between mobile and desktop

## Functional Testing
- **Navigation**:
  - Desktop: Click each navigation link and verify it would navigate to the correct page
  - Mobile: Open the hamburger menu, verify all links are present, and test clicking each
  - Verify the logo links back to the home page
  - Test primary CTA buttons to ensure they navigate to the correct routes

- **Mobile Menu**:
  - Test opening and closing the mobile menu
  - Verify the menu closes when a link is clicked
  - Confirm proper animation for menu open/close

## Accessibility Checks
- **Focus States**:
  - Tab through all interactive elements to ensure proper focus states
  - Verify focus rings are visible and use the correct color
  - Ensure keyboard navigation works correctly

- **Screen Reader**:
  - Test navigation with screen reader to ensure proper labeling
  - Verify that images have appropriate alt text
  - Check that decorative icons have aria-hidden="true"

## Performance
- Check for any layout shifts (CLS) when the page loads
- Verify images load efficiently (using proper size and format)
- Test page load time on slow network connections

## Known Issues or Deviations
- SVG placeholder images are used instead of actual company logos
- Links point to placeholder routes that need to be implemented
- Mobile menu animation can be improved in future iterations 