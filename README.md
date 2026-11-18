# Ahead — Early Signal Compass

Interview prototype: a team lead's end-of-day plan. The first screen lists what must be done today, in order (morning, afternoon, evening), with check-ins on at-risk work slotted in and an "ahead or behind" word for each part of the day. This is Phase 1 of the roadmap.

**Live site:** https://ca-scotti.github.io/early-signal-compass/

## How to make a change

No setup is needed. You can do everything on github.com.

1. Open the file you want to change (see the list below).
2. Click the pencil icon (**Edit this file**).
3. Make your change.
4. Click **Commit changes…**, write a short note on what you changed, and commit.
5. Wait about a minute, then refresh the live site.

If something breaks, open the file's **History** and revert your last commit.

## What each file does

| File | What's in it | When to edit |
|---|---|---|
| `data.js` | All the content: today's plan (`TODAY_PLAN`), the parts of the day, the commitments, the team, the engagements, names, dates and the sample time (`now`) | Most changes: wording, adding or removing a plan item or a commitment, changing a status or a time |
| `DESIGN.md` | The design rules: colors, type, spacing and what goes on screen (follows the [design.md](https://github.com/google-labs-code/design.md) format) | Read before changing the look. Update it when you change a color or rule |
| `styles.css` | Colors, sizes and spacing, following `DESIGN.md`. Colors are at the top in `:root` | Changing how the page looks |
| `index.html` | The page skeleton: headings and section labels | Renaming a section or moving one around |
| `app.js` | How the page behaves: clicks, the side panel, filters, counts | Changing interactions |

Counts and words on the page, such as "4 at risk", "Eight things left to finish by end of day", "Behind by 1" and the per-person workload, are calculated from `data.js`. You don't need to update them by hand.

**If a change doesn't show up:** browsers keep files for up to 10 minutes. To push a change to everyone right away, open `index.html` and raise the number in `?v=4` (on the `styles.css`, `data.js` and `app.js` lines) to `?v=5`, and so on.

## Previewing a change before it goes live (optional)

Download the repo (**Code → Download ZIP**) and open `index.html` in a browser. Anything committed to `main` goes live automatically.
