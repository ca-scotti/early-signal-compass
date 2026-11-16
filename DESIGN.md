---
version: alpha
name: Ahead
description: A calm start-of-day view that tells a team lead the few things worth acting on.
colors:
  primary: "#1F2328"
  secondary: "#5B6470"
  tertiary: "#3B5BDB"
  neutral: "#F6F7F9"
  surface: "#FFFFFF"
  border: "#E3E6EA"
  on-tertiary: "#FFFFFF"
  tertiary-soft: "#EEF2FF"
  warning: "#92400E"
  warning-soft: "#FEF3C7"
  danger: "#B42318"
  danger-soft: "#FEE4E2"
  success: "#067647"
  success-soft: "#DCFAE6"
  engagement-northwind: "#7C5CFC"
  engagement-harbor: "#0E9384"
typography:
  display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.02em
  title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: 36px
    padding: 0 14px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  nav-item-active:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
  badge-at-risk:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-overdue:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  badge-on-track:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  meta-text:
    textColor: "{colors.secondary}"
    typography: "{typography.small}"
  divider:
    backgroundColor: "{colors.border}"
  engagement-dot-northwind:
    backgroundColor: "{colors.engagement-northwind}"
    size: 8px
  engagement-dot-harbor:
    backgroundColor: "{colors.engagement-harbor}"
    size: 8px
---

## Overview

Ahead is read once, first thing in the morning, by a team lead who has a few
minutes. The interface should feel like a calm briefing, not a dashboard.
Every screen answers one question first: *what needs me today?* Everything
else is one click away, never on the first screen.

Guiding principles:

- **One focus per screen.** The "Needs attention" list is the hero. The team
  summary supports it, and the full list stays collapsed until asked for.
- **Show the reason, hide the record.** A row shows what's wrong and when it's
  due. The source, excerpt, progress and next step live in the side panel.
- **Calm by default.** Color is reserved for status. Everything else is ink on
  white.

## Colors

The palette is light, neutral and quiet, with one interaction color and three
status colors.

- **Primary (#1F2328):** ink for headings and body text.
- **Secondary (#5B6470):** slate for metadata: owners, engagements, dates.
- **Tertiary (#3B5BDB):** indigo, the only color for interaction (buttons,
  links, the active nav item). Never used for decoration.
- **Neutral (#F6F7F9):** the page background, so white cards lift off it
  without needing shadows.
- **Status colors:** warning (at risk), danger (overdue) and success (on
  track). Always pair the strong text color with its soft background, and
  always add a word ("At risk"), never color alone.
- **Engagement dots:** the only other color, kept to an 8px dot that tells
  engagements apart.

## Typography

Inter throughout, in five styles. Nothing on screen is smaller than 12px.

- **Display (28px/600):** the greeting only.
- **Title (16px/600):** section headings and commitment titles.
- **Body (14px/400):** reasons and descriptions.
- **Small (13px/400):** metadata lines.
- **Label (12px/500):** badges, buttons and counts.

Avoid uppercase labels and monospace text. Both make the page feel busier.

## Layout

- A fixed 232px sidebar and a content column that tops out at 1080px.
- Main area: a two-thirds/one-third grid. "Needs attention" sits on the left
  and "Your team" on the right. Below 960px it becomes a single column.
- An 8px spacing rhythm: 16px inside list rows, 24px inside cards, 40px between
  major sections.
- The full commitments table is collapsed by default.

## Elevation & Depth

Flat. Cards are separated from the page by the neutral background and a 1px
border, not shadows. Only the side panel gets a shadow, because it floats
over content.

## Shapes

Rounded but not soft: 14px for cards, 10px for list rows and the panel,
6px for buttons and inputs, and fully round for status badges and avatars.

## Components

- **Attention row:** title with its status badge, then one meta line
  (engagement · owner) and one line of reason. On the right: the due label
  (danger color when due within a day) and a single "Plan follow-up" button.
  The whole row opens the side panel. Overdue items come first, then the
  soonest due.
- **Team member:** avatar, name, "N commitments · N due this week", and one
  stacked status bar. No per-engagement breakdown on the first screen.
- **Side panel:** title, a short fact grid, the reason, the original quote and
  the suggested next step with the primary button.
- **Buttons:** one primary button per view at most (in the side panel). In
  lists, use the secondary button.

## Do's and Don'ts

- **Do** lead with the 4–6 items that need action, and keep counts in one place.
- **Do** keep each row to two lines of text plus a badge.
- **Don't** show the same number twice on one screen.
- **Don't** add icons that only decorate. Use an icon only when it carries
  meaning that text would make longer.
- **Don't** go below 12px text or use color without a matching word.
