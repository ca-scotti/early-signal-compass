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

Ahead is opened by a new team lead who has just been given one or two analysts
and wants her day first. The interface should feel like a calm, short list,
not a dashboard. The first screen answers one question: *what do I do right
now, and when should I step in?* Everything else is below it or one click away.

Guiding principles:

- **Pages, not a long scroll.** The app has five pages: Top priorities, Team,
  one page per team member, Progress, and All commitments. Each page fills the window
  and fits without scrolling on a laptop (1366×768 and up).
- **Right now first.** On Top priorities, the largest thing on the screen is
  the current part of the day ("This morning"), with its unfinished items in
  time order and done items at the bottom. Leftovers from an earlier part of
  the day join it.
- **A sequence, not a status board.** In interviews, a grid of warnings felt
  "too much". The day reads top to bottom, like the day.
- **Stepping in is an action, never a status flag.** Work that may slip shows
  up as a row the lead acts on ("15-min check-in with Priya"), marked with an
  indigo "Step in" tag and a "Why now" line. No "At risk" or "Overdue" badges,
  and no red, on Top priorities.
- **Show the reason, hide the record.** A row shows what to do, when, and why
  now. A commitment's due date, owner, source and progress live in the side
  panel and on the team member's page.
- **Colorful, but every color means something.** Indigo means "act here".
  Each part of the day has its own soft tint (morning sky, afternoon peach,
  evening lavender) and each team member has their own color. Status colors
  appear only in the All commitments table.
- **Progress is shown as trends, kindly.** Charts show how the lead and each
  analyst are doing over the last six weeks (on time, step-ins, flagged work
  caught early). They describe the work, not grade the person: no scores,
  rankings or red/green judgements on people.

## Colors

The palette is light, neutral and quiet, with one action color.

- **Primary (#1F2328):** ink for headings and body text, and for a late time
  ("Past 9:30 am" in bold ink, not red).
- **Secondary (#5B6470):** slate for metadata, notes and "Why now" text.
- **Tertiary (#3B5BDB):** indigo, the only color for action: buttons, links,
  the active nav item, the "Step in" tag and the edge of a step-in row.
- **Neutral (#F6F7F9):** the page and sidebar background, so the one white
  card lifts off it without shadows.
- **Status colors:** warning, danger and success appear only as badges in the
  full commitments table, always with a word.
- **Engagement dots:** an 8px dot that tells engagements apart, used only in
  the side panel.

### Day and people colors

- **Parts of the day:** morning `#E7F5FF` with `#1C7ED6` icons (sunrise),
  afternoon `#FFF4E6` with `#E8590C` icons (sun), evening `#F3F0FF` with
  `#7048E8` icons (moon). Used for the day timeline, the part chip next to
  "This morning" and the "Later today" labels. They tell the parts apart;
  they never mean good or bad.
- **People:** each team member's avatar is a soft tint of their chart color
  (Priya blue, Marcus orange) with darker initials, everywhere they appear:
  step-in tags, team tiles (with a 3px top edge in their color), the table and
  the side panel. The lead's own avatar stays grey.

### Chart colors

Charts follow the data-viz palette, checked with its colorblind-safety
validator (all pairs pass on the white card surface):

- **One color per person, fixed:** Priya blue `#2a78d6`, Marcus orange
  `#eb6834`. A third person takes the next slot (aqua `#1baf7a`). Colors follow
  the person on every chart, never their rank.
- **One series = blue `#2a78d6`.** A "planned" track behind it is a lighter
  step of the same blue (`#cde2fb`); "slipped" is a neutral grey (`#B8BDC5`).
- **Change words:** "▲ 2 pts vs week before" in success green, "▼" in danger red,
  always with the arrow and words.
- Chart text is always ink (primary, secondary or muted), never the series color.

## Typography

Inter throughout, in five styles. Nothing on screen is smaller than 12px.

- **Display (28px/600):** the current part of the day ("This morning"), and
  nothing else.
- **Title (16px/600):** section headings ("Later today", "Your team this week").
  Plan titles are 15px/600 for now and 14px/500 for later.
- **Body (14px/400):** "Why now" lines, times and notes.
- **Small (13px/400):** metadata and the greeting line.
- **Label (12px/500):** the "Step in" tag, buttons and table headers.

Avoid uppercase labels and monospace text. Both make the page feel busier.

## Layout

- A 232px sidebar, the same grey as the page: Top priorities, Team (with one
  link per team member under it), All commitments, and the lead's profile.
- The app fills the window. Each page is a header (28px title and one line)
  and cards that stretch to the bottom of the window.
- **Top priorities:** a header with "This morning" on the left and a "done
  today" meter on the right; the day timeline across the full width; then
  two columns (3:2). Left: "Right now" and "Your team
  today" (one tile per person, linking to their page). Right: "Later today".
- **Team:** one card per person, side by side, each linking to their page.
- **Team member:** two columns (3:2). Left: "Step in today" and "By
  engagement". Right: all of their commitments.
- **Progress:** four headline tiles (you: today's plan, step-ins last week;
  team: on time last week, flagged work caught early), then three charts in a
  row: on time by person (lines), your step-ins (done over planned), and
  flagged work (caught early vs slipped).
- **All commitments:** filters and a one-line-per-row table.
- If content is longer than the window, it scrolls inside its card, never the
  page. Below 960px wide or 600px tall, cards stack and the page scrolls.
- An 8px spacing rhythm: 24px between cards and inside them.

## Elevation & Depth

Flat. Cards are separated from the grey page by a 1px border. Clickable cards
(team member cards and tiles) get an indigo border on hover. Only the side
panel gets a shadow, because it floats over content.

## Shapes

Rounded but not soft: 14px for cards, 10px for the panel and selected rows,
6px for buttons and inputs, and fully round for tags and avatars. A step-in
row in the card has a 3px indigo edge on the left.

## Components

- **Day timeline:** 8 am to 8 pm in three tinted parts with their icon and
  name, a dark "now" line, and each to-do as a 16px dot at its time: indigo
  for a step-in, white with a grey ring for the lead's own task, grey with a
  check when done. Hover or focus shows the item; clicking a step-in opens it.
- **Done today:** the count (28px), "of N done today", a blue meter on a light
  blue track, and "N of N step-ins".
- **Now heading:** "This morning" (or afternoon, evening) in display type, then
  one line: "Until 12 pm · 1 past its time", "On track" or "All done".
- **Plan row:** a checkbox, the title, and one time on the right ("1 pm"). A
  late time reads "Past 9:30 am" in bold ink. At most one more line: for a
  step-in row, the "Step in" tag and "Why now: …"; for the lead's own task, a
  short note. Done rows are struck through and lose the second line. A step-in
  title opens the side panel.
- **Later row:** the same row, quieter (14px/500): title, time, and the
  "Step in" tag inline after the title.
- **Team tile (Top priorities):** avatar, name, "N step-ins today · N due this
  week", the next step-in with its time, and "Open details".
- **Team member card (Team):** large avatar, name, role and engagements; three
  numbers in words (commitments, due this week, need you); a one-line note;
  "Step in today" and "Needs you this week" lists; "Open details".
- **Team member page:** back link, name, one summary line; "Step in today"
  rows (same as plan rows); one small box per engagement with counts; and the
  full commitments list with status in words and due date.
- **Headline tile:** a label ("You · Step-ins last week"), the number (28px),
  an optional sparkline (grey line, the latest point in the accent) and one
  line of change or context.
- **Line chart:** 2px lines, 8px end dots with a white ring, the name and
  latest value written at the end of each line, hairline grid at 0/50/100%,
  a legend under the chart for two or more people.
- **Column chart:** columns at most 24px wide with 4px rounded tops, a 2px
  white gap between stacked parts, the latest value on top of the last column
  only.
- **Every chart:** a hover and keyboard tooltip (arrow keys step through
  weeks), and a "Show as table" link under it with every value.
- **Side panel:** engagement, title, a fact grid (owner links to their page,
  due, status in words, progress), a neutral "Why now" box, the original quote
  with its source, and where it sits on today's plan, with the one primary
  button "Mark done".
- **Buttons:** one primary button per view at most (in the side panel).

## Do's and Don'ts

- **Do** lead with what's left right now, in time order.
- **Do** give each topic its own page, and fit each page in the window.
- **Do** keep each row to a title, one time and at most one more line.
- **Don't** show status badges, red or traffic-light colors on the day plan.
- **Don't** show the same number twice on one screen, or two dates on one row.
- **Don't** add icons that only decorate.
- **Don't** go below 12px text or use color without a matching word.
