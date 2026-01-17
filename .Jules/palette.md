## 2025-02-18 - Mobile Navigation Accessibility
**Learning:** The navigation links in this app use a pattern where text is hidden on mobile (`hidden md:block`), leaving only the icon visible. Without `aria-label`, these links were effectively "unlabeled links" for screen reader users on mobile devices.
**Action:** When creating responsive navigation components that hide text labels on smaller screens, always ensure an `aria-label` or `sr-only` text is present to provide context for screen reader users.
