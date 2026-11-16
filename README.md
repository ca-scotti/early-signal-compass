# Ahead — Early Signal Compass

Interview prototype: a team lead's start-of-day view of commitments that could use support.

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
| `data.js` | All the content: the commitments, the team, the engagements, names and dates | Most changes: wording, adding or removing a commitment, changing a status |
| `DESIGN.md` | The design rules: colors, type, spacing and what goes on screen (follows the [design.md](https://github.com/google-labs-code/design.md) format) | Read before changing the look. Update it when you change a color or rule |
| `styles.css` | Colors, sizes and spacing, following `DESIGN.md`. Colors are at the top in `:root` | Changing how the page looks |
| `index.html` | The page skeleton: headings and section labels | Renaming a section or moving one around |
| `app.js` | How the page behaves: clicks, the side panel, filters, counts | Changing interactions |

Counts on the page, such as "4 at risk", "Five commitments could use a check-in today" and the per-person workload, are calculated from `data.js`. You don't need to update them by hand.

## Previewing a change before it goes live (optional)

Download the repo (**Code → Download ZIP**) and open `index.html` in a browser. Anything committed to `main` goes live automatically.
