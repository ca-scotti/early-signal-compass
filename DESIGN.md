---
version: alpha
name: Ahead
description: A calm start-of-day view that tells a team lead the few things worth acting on.
colors:
  primary: "#1D1C1A"
  secondary: "#5F5B53"
  tertiary: "#3B5BDB"
  neutral: "#F6F5F1"
  surface: "#FFFFFF"
  border: "#E6E3DC"
  on-tertiary: "#FFFFFF"
  tertiary-soft: "#ECEFFC"
  warning: "#92400E"
  warning-soft: "#FEF3C7"
  danger: "#B42318"
  danger-soft: "#FEE4E2"
  success: "#067647"
  success-soft: "#DCFAE6"
  muted: "#8A857B"
  morning: "#FBF7EE"
  afternoon: "#F5ECDB"
  evening: "#ECE3D3"
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.02em
  title:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: IBM Plex Sans
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
- **The whole day, the current part highlighted.** Top priorities shows
  the day as three colored lists (morning, afternoon, evening). The part we
  are in now carries a "Now" tag and a soft colored ring; inside each list,
  unfinished items come first in time order and done ones go to the bottom.
- **A sequence, not a status board.** In interviews, a grid of warnings felt
  "too much". The day reads top to bottom, like the day.
- **Stepping in is an action, never a status flag.** Work that may slip shows
  up as a row the lead acts on ("15-min check-in with Priya"), marked with an
  indigo "Step in" tag and a "Why now" line. No "At risk" or "Overdue" badges,
  and no red, on Top priorities.
- **Show the reason, hide the record.** A row shows what to do, when, and why
  now. A commitment's due date, owner, source and progress live in the side
  panel and on the team member's page.
- **Warm, but with a strict color budget.** Ink, one indigo accent ("act
  here"), and warm paper neutrals. The parts of the day are shades of one sand
  color. Status colors appear only in the All commitments table.
- **Progress is shown as trends, kindly.** Charts show how the lead and each
  analyst are doing over the last six weeks (on time, step-ins, flagged work
  caught early). They describe the work, not grade the person: no scores,
  rankings or red/green judgements on people.

## Colors

A strict color budget: **one dominant (ink), one accent (indigo), one neutral
family (warm paper)**. Every other color on screen is a shade of these, or
identifies a line in a chart. See "Not vibe-coded" under Do's and Don'ts.

- **Ink (#1D1C1A):** headings and body text, the "now" line, a late time
  ("Past 9:30 am" in bold ink, never red).
- **Warm slate (#5F5B53) and muted (#8A857B):** metadata, notes, axis labels.
- **Indigo (#3B5BDB), the only accent:** it means "step in / act here".
  Step-in tags and timeline dots, the "Now" label, buttons, links, the active
  nav item, the progress meter, and step-ins in the Progress charts.
- **Warm paper (#F6F5F1) and white:** the page is paper; the few panels are
  white with a 1px hairline (#E6E3DC).
- **Parts of the day:** three shades of one warm sand, light to deep, like
  daylight moving: morning #FBF7EE, afternoon #F5ECDB, evening #ECE3D3. Used
  for the timeline segments and the list headers. They tell the parts apart;
  they never mean good or bad.
- **Status colors** (warning, danger, success) appear only as labeled badges in
  the All commitments table, and as "▲ / ▼ … vs week before" change words.
- **No decorative color:** no engagement dots, no colored side or top edges,
  no colored avatars.

### Chart colors

Charts follow the data-viz palette, checked with its colorblind-safety
validator (all pairs pass on the white surface):

- **People:** Priya blue `#2a78d6`, Marcus orange `#eb6834` (next: aqua
  `#1baf7a`), only on the "On time" lines and sparklines, where a color must
  identify a person. Colors follow the person, never their rank.
- **Step-ins and flagged work:** the accent indigo `#3B5BDB`, with a light
  indigo track (`#D6DDF8`) for "planned" and warm grey (`#C9C4B9`) for
  "slipped".
- Chart text is always ink, slate or muted, never the series color. Grid and
  axes are warm hairlines.

## Typography

Two typefaces, chosen on purpose rather than the AI-tool default:

- **Source Serif 4** (500/600) for headings: the greeting, page titles, part
  names, card titles, people's names. An editorial voice suits a strategy
  consultant's briefing.
- **IBM Plex Sans** (400/500/600) for everything else: rows, metadata,
  buttons, and **all numbers** (figures stay in the sans).

Sizes: display 28px, titles 16–18px, body 14px, small 13px, labels 12px.
Nothing is smaller than 11px (timeline hours) and nothing else under 12px.
No all-caps labels, no monospace.

## Layout

- A 232px sidebar, the same grey as the page: Top priorities, Team (with one
  link per team member under it), All commitments, and the lead's profile.
- The app fills the window. Each page is a header (28px title and one line)
  and cards that stretch to the bottom of the window.
- **Top priorities:** a header ("Your day" with the current part's icon, one
  summary line, and a "done today" meter on the right); the day timeline
  across the full width; then three colored lists side by side, **Morning,
  Afternoon, Evening**; then one slim row with a chip per team member.
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

Flat. Grouping comes from whitespace, hairlines and type, not boxes:

- Top priorities has **one** white panel (the three lists, split by vertical
  hairlines). The timeline and the team line sit directly on the page.
- Progress has one panel for the headline figures and one for the charts.
- Cards are kept only for things you can act on as a whole: a team member's
  card (opens their page) and the side panel.
- No glows, no colored rings. Only the side panel and tooltips cast a shadow,
  because they float over content.

## Shapes

Rounded but not soft: 14px for cards, 10px for the panel and selected rows,
6px for buttons and inputs, and fully round for tags and avatars. A step-in
row in the card has a 3px indigo edge on the left.

## Components

- **Day timeline:** sits on the page (no box). 8 am to 8 pm in three sand
  shades with a small icon and name, an ink "now" line, and each to-do as a
  14px dot at its time: indigo for a step-in, white with a grey ring for the
  lead's own task, grey with a check when done. A key under it explains every
  dot. Hover or focus shows the item; clicking a step-in opens it.
- **Done today:** the count (28px), "of N done today", a blue meter on a light
  blue track, and "N of N step-ins".
- **Part-of-day lists:** one white panel split into three columns by
  hairlines. Each column has a sand-tinted header (icon, serif name, an indigo
  "Now" label if current, time range and status, done count like "1/3"), then
  its plan rows. In parts that aren't current, titles are 500 weight and the
  reason is cut to one line. No colored edges.
- **Plan row:** a checkbox, the title, and one time on the right ("1 pm"). A
  late time reads "Past 9:30 am" in bold ink. At most one more line: for a
  step-in row, the "Step in" tag and "Why now: …"; for the lead's own task, a
  short note. Done rows are struck through and lose the second line. A step-in
  title opens the side panel.

- **Team line (Top priorities):** no boxes: for each person, a neutral
  avatar, serif name, "N step-ins today, next 1 pm", their on-time sparkline
  and value, and an arrow to their page.
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

### Not vibe-coded

From "7 Signs a UI Has Been Vibe Coded" (The Fountain Institute), and how
this app answers each:

1. **Competing colors** → one dominant, one accent, one neutral family.
2. **Decorative glow** → none; emphasis comes from type and the "Now" label.
3. **Emojis as icons** → one consistent line-icon set (Lucide), 16px.
4. **Trendy gradients** → none; flat fills only.
5. **Cards for everything** → one panel per page section; hairlines and
   whitespace do the grouping.
6. **Multicolored side tabs** → none.
7. **Dots that mean nothing** → every dot is data with a key (the timeline),
   or it is removed (engagement dots).
8. **The default AI font** → Source Serif 4 + IBM Plex Sans.

### General


- **Do** lead with what's left right now, in time order.
- **Do** give each topic its own page, and fit each page in the window.
- **Do** keep each row to a title, one time and at most one more line.
- **Don't** show status badges, red or traffic-light colors on the day plan.
- **Don't** show the same number twice on one screen, or two dates on one row.
- **Don't** add icons that only decorate.
- **Don't** go below 12px text or use color without a matching word.
