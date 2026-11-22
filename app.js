/* =========================================================
   Ahead — page logic
   Builds every page from the content in data.js.
   You normally only need to edit data.js; this file is for
   changing how things behave.

   Pages (the part of the address after #):
     #/today              Top priorities
     #/team               Your team
     #/team/Priya         One team member (the id from TEAM in data.js)
     #/progress           Progress (lead only)
     #/commitments        All commitments (an analyst sees only their own)
     #/profile            Profile: fake connections, imports, team access

   Demo "view as": once Alex connects Priya or Marcus on the Profile page,
   "View as" shows the app as they would see it: My day and My commitments
   only, never the team page, progress charts or anyone else's work.
   ========================================================= */

/* ---------- Icons (from the Lucide icon set) ---------- */

const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
};

/* Each part of the day has its own icon and soft color (see DESIGN.md). */
const PART_ICON = { morning: "sunrise", afternoon: "sun", evening: "moon" };

function icon(name) {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const STATUS_LABEL = { "at-risk": "At risk", "on-track": "On track", overdue: "Overdue" };
const STATUS_ORDER = { overdue: 0, "at-risk": 1, "on-track": 2 };
const SOURCE_WORD = { meeting: "Meeting", email: "Email", chat: "Chat" };
const PART_TITLE = { morning: "This morning", afternoon: "This afternoon", evening: "This evening" };

/* ---------- State ---------- */

const state = {
  page: "today",
  personId: null,
  selectedId: null,     // commitment open in the side panel
  done: new Set(TODAY_PLAN.filter((p) => p.done).map((p) => p.id)),   // plan items ticked off
  filters: { engagement: "all", owner: "all", status: "all" },
};

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const byId = (id) => COMMITMENTS.find((c) => c.id === id);
const person = (id) => TEAM.find((p) => p.id === id) || { id, fullName: id, initials: id.slice(0, 2).toUpperCase(), role: "" };
const engagement = (name) => ENGAGEMENTS.find((e) => e.name === name) || { name, program: "", dot: "northwind" };

/* No engagement dots: an unexplained colored dot is noise (see DESIGN.md). */
const dot = () => "";
const badge = (status) => `<span class="badge ${status}">${STATUS_LABEL[status]}</span>`;
/* Avatars stay neutral: person colors are kept for chart lines, where they identify a series. */
const avatar = (ownerId, size = "") => `<span class="avatar ${size}">${escapeHtml(person(ownerId).initials)}</span>`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function dueLabel(c) {
  const d = c.daysUntilDue;
  if (d < 0) return `${-d} day${d === -1 ? "" : "s"} overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d} days`;
}

const needsYou = (c) => c.status !== "on-track";
const dueThisWeek = (c) => c.daysUntilDue >= 0 && c.daysUntilDue <= 4;
const commitmentsOf = (id) => COMMITMENTS.filter((c) => c.owner === id)
  .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.daysUntilDue - b.daysUntilDue);

/* ---------- Time and the day plan ---------- */

const minutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
function clock(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}
const NOW = minutes(SETTINGS.now);
const byTime = (a, b) => minutes(a.by) - minutes(b.by);
const planFor = (commitmentId) => TODAY_PLAN.find((p) => p.commitment === commitmentId);

/* A step-in is no longer needed once the analyst marks that work done
   (in their own view). It then counts as off the plan, like a done item. */
const resolvedBy = (p) =>
  p.commitment && !state.done.has(p.id) && ownerDone(p.commitment) ? byId(p.commitment)?.owner : null;
const isOff = (p) => state.done.has(p.id) || !!resolvedBy(p);

/* The part of the day we are in now (or the nearest one outside working hours). */
function currentPart() {
  return DAY_PARTS.find((d) => minutes(d.start) <= NOW && NOW < minutes(d.end))
    || (NOW < minutes(DAY_PARTS[0].start) ? DAY_PARTS[0] : DAY_PARTS[DAY_PARTS.length - 1]);
}

/* How the current part of the day is going, in words (never color alone). */
function paceLine(part, items) {
  const open = items.filter((p) => !isOff(p));
  const late = open.filter((p) => minutes(p.by) <= NOW).length;
  const until = `Until ${clock(part.end)}`;
  if (!open.length) return `${until} · All done`;
  if (late) return `${until} · ${late} past ${late === 1 ? "its" : "their"} time`;
  return `${until} · On track`;
}

/* One plan row: title and one time. Rows about an analyst's work get a
   "Step in" tag and a "Why now" line; the lead's own tasks may carry a note.
   "quiet" rows show the title, time and an inline tag only. */
function planItem(p, quiet = false) {
  const resolved = resolvedBy(p);
  const done = state.done.has(p.id) || !!resolved;
  const c = p.commitment ? byId(p.commitment) : null;
  const late = !done && minutes(p.by) <= NOW;
  const title = c
    ? `<button class="plan-title" data-open="${c.id}">${escapeHtml(p.title)}</button>`
    : `<span class="plan-title">${escapeHtml(p.title)}</span>`;
  let second = "";
  if (!done && !quiet) {
    if (c) second = `<p class="plan-why"><span class="step-in">Step in · ${escapeHtml(c.owner)}</span>${escapeHtml(c.reason)}</p>`;
    else if (p.note) second = `<p class="plan-why meta">${escapeHtml(p.note)}</p>`;
  }
  if (resolved) second = `<p class="plan-why resolved-note">${icon("check")}No step-in needed · ${escapeHtml(resolved)} marked it done</p>`;
  const inlineTag = !done && quiet && c ? `<span class="step-in inline">Step in</span>` : "";
  return `
    <li class="plan-item ${quiet ? "quiet" : ""} ${c && !done && !quiet ? "is-step-in" : ""} ${done ? "is-done" : ""} ${resolved ? "is-resolved" : ""} ${c && state.selectedId === c.id ? "selected" : ""}">
      <input type="checkbox" class="plan-check" id="check-${p.id}" data-done="${p.id}" ${done ? "checked" : ""} ${resolved ? "disabled" : ""}
        aria-label="Mark done: ${escapeHtml(p.title)}">
      <div class="plan-body">${title}${inlineTag}${second}</div>
      <span class="plan-time ${late ? "is-late" : ""}">${late ? "Past " : ""}${clock(p.by)}</span>
    </li>`;
}

/* ---------- Page: Top priorities ---------- */

function renderToday() {
  const part = currentPart();
  const partIndex = DAY_PARTS.indexOf(part);
  const earlierIds = DAY_PARTS.slice(0, partIndex).map((d) => d.id);

  // Right now: this part of the day, plus anything left over from earlier parts.
  // Unfinished first, in time order; done items at the bottom.
  const nowItems = TODAY_PLAN.filter((p) => p.part === part.id || (earlierIds.includes(p.part) && !isOff(p)));

  $("greeting").textContent = "";
  $("now-heading").textContent = `Good morning, ${SETTINGS.leadName}`;
  const left = TODAY_PLAN.filter((p) => !isOff(p));
  const leftSteps = left.filter((p) => p.commitment).length;

  // Done today: a number and a meter
  const doneCount = TODAY_PLAN.filter(isOff).length;
  const steps = TODAY_PLAN.filter((p) => p.commitment);
  const stepsDone = steps.filter(isOff).length;
  $("day-progress").innerHTML = `
    <div class="dp-top"><span class="dp-num">${doneCount}</span><span class="meta">of ${TODAY_PLAN.length} done today</span></div>
    <div class="meter" role="img" aria-label="${doneCount} of ${TODAY_PLAN.length} done"><span style="width:${pct(doneCount, TODAY_PLAN.length)}%"></span></div>
    <div class="meta">${stepsDone} of ${steps.length} step-ins</div>`;

  renderStrip(part);
  $("now-pace").textContent = `${SETTINGS.today}, ${clock(SETTINGS.now)} · ` + (left.length
    ? `${plural(left.length, "thing")} left today, ${plural(leftSteps, "step-in")} · ${PART_TITLE[part.id] || part.name}: ${paceLine(part, nowItems).replace(/^Until [^·]+· /, "").toLowerCase()}`
    : "Everything on today's plan is done.");
  // Three colored lists, one per part of the day. In each: unfinished items
  // in time order, done ones at the bottom. The current part is highlighted.
  $("parts").innerHTML = DAY_PARTS.map((d, i) => {
    const items = TODAY_PLAN.filter((p) => p.part === d.id);
    const open = items.filter((p) => !isOff(p)).sort(byTime);
    const finished = items.filter(isOff).sort(byTime);
    const isNow = d === part;
    const status = isNow ? paceLine(d, items).replace(/^Until [^·]+· /, "")
      : i < partIndex ? (open.length ? `${open.length} left over` : "All done")
      : `Starts at ${clock(d.start)}`;
    return `
      <section class="part-card ${d.id} ${isNow ? "is-now" : ""}" aria-labelledby="part-${d.id}">
        <header class="part-head">
          ${icon(PART_ICON[d.id] || "sun")}
          <div>
            <h2 id="part-${d.id}">${d.name}${isNow ? ` <span class="now-label">Now</span>` : ""}</h2>
            <div class="meta">${clock(d.start)}–${clock(d.end)} · ${status}</div>
          </div>
          <span class="part-count">${finished.length}/${items.length}</span>
        </header>
        <ul class="plan-list scroll">
          ${open.map((p) => planItem(p)).join("") || `<li class="empty meta">Nothing left for the ${d.name.toLowerCase()}.</li>`}
          ${finished.map((p) => planItem(p)).join("")}
        </ul>
      </section>`;
  }).join("");

  $("team-tiles").innerHTML = TEAM.map((p) => {
    const steps = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === p.id && !isOff(t)).sort(byTime);
    const next = steps[0];
    const trend = HISTORY.team[p.id] ? onTimeSeries(p.id) : null;
    return `
      <a class="team-chip" href="#/team/${encodeURIComponent(p.id)}" style="--pc:${colorOf(p.id)}">
        ${avatar(p.id)}
        <div class="team-chip-text">
          <div class="person-name">${escapeHtml(p.fullName)}</div>
          <div class="meta">${steps.length ? `${plural(steps.length, "step-in")} today${next ? `, next ${clock(next.by)}` : ""}` : "No step-ins today"}</div>
        </div>
        ${trend ? `<span class="tile-trend">${Viz.spark(trend, { color: colorOf(p.id), width: 64, height: 22 })}<span class="meta">On time ${trend[trend.length - 1]}%</span></span>` : ""}
        ${icon("arrowRight")}
      </a>`;
  }).join("");
}

/* The day at a glance: 8 am to 8 pm in three tinted parts, a "now" line,
   and every to-do as a dot at its time. Step-ins are indigo, the lead's own
   tasks are white, done items carry a check. Hover a dot to see it; click a
   step-in to open it. */
function renderStrip(nowPart) {
  const start = minutes(DAY_PARTS[0].start), end = minutes(DAY_PARTS[DAY_PARTS.length - 1].end);
  const pos = (m) => Math.max(0, Math.min(100, ((m - start) / (end - start)) * 100));
  const segs = DAY_PARTS.map((d) => `
    <div class="strip-seg ${d.id} ${d === nowPart ? "is-now" : ""}" style="left:${pos(minutes(d.start))}%;width:${pos(minutes(d.end)) - pos(minutes(d.start))}%">
      <span class="strip-label">${icon(PART_ICON[d.id] || "sun")}${d.name}</span>
    </div>`).join("");
  const ticks = [];
  for (let m = start; m <= end; m += 120) ticks.push(`<span class="strip-tick" style="left:${pos(m)}%">${clock(`${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`)}</span>`);
  const dots = TODAY_PLAN.map((p) => {
    const done = isOff(p);
    const c = p.commitment ? byId(p.commitment) : null;
    return `<button class="strip-dot ${c ? "step" : "own"} ${done ? "done" : ""} ${resolvedBy(p) ? "resolved" : ""}" style="left:${pos(minutes(p.by))}%"
      data-dot="${p.id}" ${c ? `data-open="${c.id}"` : ""} aria-label="${escapeHtml(p.title)}, by ${clock(p.by)}${done ? ", done" : ""}">${done ? icon("check") : ""}</button>`;
  }).join("");
  const strip = $("day-strip");
  strip.innerHTML = `
    <div class="strip-track">${segs}
      <div class="strip-now" style="left:${pos(NOW)}%"><span>Now · ${clock(SETTINGS.now)}</span></div>
      ${dots}
    </div>
    <div class="strip-ticks">${ticks.join("")}</div>
    <div class="strip-key" aria-hidden="true">
      <span><i class="k-step"></i>Step in</span><span><i class="k-own"></i>Your task</span>
      <span><i class="k-done"></i>Done</span>${TODAY_PLAN.some((p) => resolvedBy(p)) ? `<span><i class="k-resolved"></i>Not needed</span>` : ""}<span><i class="k-now"></i>Now</span>
    </div>`;

  strip.querySelectorAll(".strip-dot").forEach((b) => {
    const p = TODAY_PLAN.find((t) => t.id === b.dataset.dot);
    const c = p.commitment ? byId(p.commitment) : null;
    const tip = () => {
      const r = b.getBoundingClientRect();
      Viz.showTip(r.left + r.width / 2, r.top, `${clock(p.by)} · ${resolvedBy(p) ? `Not needed: ${resolvedBy(p)} marked it done` : state.done.has(p.id) ? "Done" : c ? "Step in" : "Your task"}`,
        [{ color: c ? "#3B5BDB" : "#B8BDC5", name: p.title, value: "", shape: "rect" }]);
    };
    b.addEventListener("pointerenter", tip);
    b.addEventListener("focus", tip);
    b.addEventListener("pointerleave", Viz.hideTip);
    b.addEventListener("blur", Viz.hideTip);
  });
}

/* ---------- Page: Team ---------- */

function renderTeam() {
  $("team-sub").textContent = `${plural(TEAM.length, "person")} · ${plural(COMMITMENTS.length, "commitment")} across ${plural(ENGAGEMENTS.length, "engagement")}`
    .replace("persons", "people");

  $("team-grid").innerHTML = TEAM.map((p) => {
    const mine = commitmentsOf(p.id);
    const steps = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === p.id && !isOff(t)).sort(byTime);
    const attention = mine.filter(needsYou);
    return `
      <a class="card member-card" href="#/team/${encodeURIComponent(p.id)}">
        <div class="member-top">
          ${avatar(p.id, "large")}
          <div>
            <div class="member-name">${escapeHtml(p.fullName)}</div>
            <div class="meta">${escapeHtml(p.role)} · ${[...new Set(mine.map((c) => c.engagement))].map(escapeHtml).join(", ")}</div>
          </div>
        </div>
        <div class="member-facts">
          <div><span class="fact-num">${mine.length}</span><span class="meta">commitments</span></div>
          <div><span class="fact-num">${mine.filter(dueThisWeek).length}</span><span class="meta">due this week</span></div>
          <div><span class="fact-num">${attention.length}</span><span class="meta">need you</span></div>
        </div>
        ${HISTORY.team[p.id] ? (() => {
          const s = onTimeSeries(p.id), last = s.length - 1;
          return `<div class="member-trend">
            <div><div class="kpi-label">On time, last week</div><div class="trend-value">${s[last]}%</div></div>
            ${Viz.spark(s, { color: colorOf(p.id) })}
            <div class="trend-note">${delta(s[last], s[last - 1])}<div class="meta">${s[0]}% six weeks ago</div></div>
          </div>`;
        })() : ""}
        <p class="member-note">${escapeHtml(p.note)}</p>
        <div class="member-section">
          <h3 class="part-label">Step in today</h3>
          ${steps.length ? `<ul class="mini-list">${steps.map((t) =>
            `<li><span>${escapeHtml(t.title)}</span><span class="meta">${clock(t.by)}</span></li>`).join("")}</ul>`
            : `<p class="meta">Nothing to step in on today.</p>`}
          <h3 class="part-label">Needs you this week</h3>
          ${attention.length ? `<ul class="mini-list">${attention.map((c) =>
            `<li><span>${escapeHtml(c.title)}</span><span class="meta">${STATUS_LABEL[c.status]} · ${escapeHtml(c.due)}</span></li>`).join("")}</ul>`
            : `<p class="meta">Everything is on track.</p>`}
        </div>
        <span class="member-open">Open details ${icon("arrowRight")}</span>
      </a>`;
  }).join("");
}

/* ---------- History helpers (sample data in data.js) ---------- */

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const onTimeSeries = (id) => {
  const h = HISTORY.team[id];
  return h ? h.onTime.map((v, i) => pct(v, h.due[i])) : [];
};
const teamOnTime = (i) => {
  const ids = Object.keys(HISTORY.team);
  return pct(ids.reduce((a, id) => a + HISTORY.team[id].onTime[i], 0), ids.reduce((a, id) => a + HISTORY.team[id].due[i], 0));
};
const colorOf = (id) => PERSON_COLOR[id] || "#2a78d6";

/* A change in words, colored only when it is good or bad news.
   Always an arrow and words too, never color alone. */
function delta(now, before, unit = " pts") {
  const d = now - before;
  if (!d) return `<span class="delta">No change vs week before</span>`;
  const up = d > 0;
  return `<span class="delta ${up ? "good" : "bad"}">${up ? "▲" : "▼"} ${Math.abs(d)}${unit} vs week before</span>`;
}

/* ---------- Page: Progress ---------- */

function renderProgress() {
  const W = HISTORY.weeks, last = W.length - 1;

  // You: today's plan (live: follows the ticks on Top priorities)
  const doneToday = TODAY_PLAN.filter(isOff).length;
  const stepsToday = TODAY_PLAN.filter((p) => p.commitment);
  const stepsDone = stepsToday.filter(isOff).length;
  const L = HISTORY.lead;
  const leadRate = L.done.map((d, i) => pct(d, L.planned[i]));
  const F = HISTORY.flagged;
  const caught = F.caughtEarly.reduce((a, b) => a + b, 0), slipped = F.slipped.reduce((a, b) => a + b, 0);
  const caughtRate = F.caughtEarly.map((c, i) => pct(c, c + F.slipped[i]));
  const teamRate = W.map((_, i) => teamOnTime(i));
  const teamDueLast = Object.values(HISTORY.team).reduce((a, h) => a + h.due[last], 0);
  const teamOnLast = Object.values(HISTORY.team).reduce((a, h) => a + h.onTime[last], 0);

  const meter = (a, b) => `<div class="meter" role="img" aria-label="${a} of ${b}"><span style="width:${pct(a, b)}%"></span></div>`;
  $("kpis").innerHTML = `
    <div class="kpi">
      <div class="kpi-label">You · Today’s plan</div>
      <div class="kpi-value">${doneToday} <span class="kpi-of">of ${TODAY_PLAN.length} done</span></div>
      ${meter(doneToday, TODAY_PLAN.length)}
      <div class="meta">${stepsDone} of ${stepsToday.length} step-ins done</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">You · Step-ins last week</div>
      <div class="kpi-row-inner"><div class="kpi-value">${L.done[last]} <span class="kpi-of">of ${L.planned[last]}</span></div>${Viz.spark(leadRate, { color: "#3B5BDB" })}</div>
      ${delta(leadRate[last], leadRate[last - 1])}
    </div>
    <div class="kpi">
      <div class="kpi-label">Team · On time last week</div>
      <div class="kpi-row-inner"><div class="kpi-value">${teamRate[last]}%</div>${Viz.spark(teamRate, { color: "#3B5BDB" })}</div>
      <div class="meta">${teamOnLast} of ${teamDueLast} commitments · ${delta(teamRate[last], teamRate[last - 1])}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Team · Flagged work caught early</div>
      <div class="kpi-row-inner"><div class="kpi-value">${caught} <span class="kpi-of">of ${caught + slipped}</span></div>${Viz.spark(caughtRate, { color: "#3B5BDB" })}</div>
      <div class="meta">Over six weeks · ${slipped} slipped anyway</div>
    </div>`;

  Viz.line($("chart-ontime"), {
    labels: W, label: "On-time delivery by person, last six weeks",
    series: TEAM.filter((p) => HISTORY.team[p.id]).map((p) => ({ name: p.id, color: colorOf(p.id), values: onTimeSeries(p.id) })),
  });
  Viz.columns($("chart-stepins"), {
    labels: W, label: "Step-ins done out of planned, last six weeks",
    fill: { name: "Done", color: "#3B5BDB", values: L.done },
    track: { name: "Planned", color: "#D6DDF8", values: L.planned },
  });
  Viz.columns($("chart-flagged"), {
    labels: W, label: "Flagged work caught early or slipped, last six weeks",
    stacked: [
      { name: "Caught early", color: "#3B5BDB", values: F.caughtEarly },
      { name: "Slipped", color: "#C9C4B9", values: F.slipped },
    ],
  });
}

/* ---------- Page: one team member ---------- */

function renderPerson() {
  const p = TEAM.find((t) => t.id === state.personId);
  if (!p) { location.hash = "#/team"; return; }
  const mine = commitmentsOf(p.id);
  const engagements = [...new Set(mine.map((c) => c.engagement))];
  const steps = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === p.id).sort(byTime);

  document.title = `Ahead — ${p.fullName}`;
  $("person-avatar").textContent = p.initials;
  $("person-heading").textContent = p.fullName;
  $("person-sub").textContent =
    `${p.role} · ${plural(mine.length, "commitment")} · ${mine.filter(dueThisWeek).length} due this week · ${p.note}`;

  $("person-stepins").innerHTML = steps.length
    ? steps.map((t) => planItem(t)).join("")
    : `<li class="empty meta">Nothing to step in on today.</li>`;

  $("person-commitments").innerHTML = mine.map((c) => `
    <li class="commit-row ${state.selectedId === c.id ? "selected" : ""}">
      <div>
        <button class="plan-title" data-open="${c.id}">${escapeHtml(c.title)}</button>
        <div class="meta">${dot(c.engagement)} ${escapeHtml(c.engagement)} · ${escapeHtml(c.progress)}${ownerDone(c.id) ? ` · <strong>Marked done by ${escapeHtml(c.owner)}</strong>` : ""}${c.found ? ` <span class="new-label">New</span>` : ""}</div>
      </div>
      <div class="commit-side">
        <span class="${needsYou(c) ? "status-strong" : "meta"}">${STATUS_LABEL[c.status]}</span>
        <span class="meta">${escapeHtml(c.due)}</span>
      </div>
    </li>`).join("");

  const series = onTimeSeries(p.id);
  if (series.length) {
    const h = HISTORY.team[p.id], last = series.length - 1;
    $("person-chart-sub").innerHTML =
      `Last week ${series[last]}% (${h.onTime[last]} of ${h.due[last]}) · ${delta(series[last], series[last - 1])}`;
    Viz.line($("person-chart"), {
      labels: HISTORY.weeks, label: `${p.fullName}: on-time delivery, last six weeks`,
      series: [{ name: p.id, color: colorOf(p.id), values: series }],
    });
  } else {
    $("person-chart-sub").textContent = "";
    $("person-chart").innerHTML = `<p class="meta">No history yet for ${escapeHtml(p.fullName)}.</p>`;
  }
}

/* ---------- Page: All commitments ---------- */

function renderTable() {
  const { engagement: eng, owner, status } = state.filters;
  $("filter-engagement").value = eng;
  $("filter-owner").value = owner;
  $("filter-status").value = status;
  $("filter-reset").hidden = eng === "all" && owner === "all" && status === "all";

  // An analyst only ever sees their own commitments
  const me = viewer();
  const pool = me === "lead" ? COMMITMENTS : COMMITMENTS.filter((c) => c.owner === me);
  const rows = pool
    .filter((c) => (eng === "all" || c.engagement === eng) && (me !== "lead" || owner === "all" || c.owner === owner) && (status === "all" || c.status === status))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const marks = (c) =>
    (planFor(c.id) && state.done.has(planFor(c.id).id) && me === "lead" ? `<span class="planned-mark">· Stepped in today</span>` : "") +
    (ownerDone(c.id) ? `<span class="planned-mark">· Marked done${me === "lead" ? ` by ${escapeHtml(c.owner)}` : ""}</span>` : "") +
    (c.found ? `<span class="new-label">New</span>` : "");
  $("table-count").textContent = `${rows.length} of ${pool.length}`;
  $("work-table-body").innerHTML = rows.length === 0
    ? `<tr><td colspan="5" class="empty-row">No commitments match these filters.</td></tr>`
    : rows.map((c) => `
      <tr data-open="${c.id}">
        <td class="title-cell">${escapeHtml(c.title)}${marks(c)}</td>
        <td class="col-eng"><span class="eng-cell">${dot(c.engagement)}${escapeHtml(c.engagement)}</span></td>
        <td class="col-owner"><a class="owner" href="#/team/${encodeURIComponent(c.owner)}">${avatar(c.owner, "small")}${escapeHtml(c.owner)}</a></td>
        <td class="col-due">${escapeHtml(c.due)}</td>
        <td class="col-status">${badge(c.status)}</td>
      </tr>`).join("");
}

/* ---------- Side panel ---------- */

function renderSheet() {
  const c = byId(state.selectedId);
  const sheet = $("sheet");
  sheet.hidden = $("sheet-overlay").hidden = !c;
  if (!c) { sheet.innerHTML = ""; return; }

  const plan = planFor(c.id);
  const checkedIn = plan && state.done.has(plan.id);
  const notNeeded = plan && resolvedBy(plan);
  const program = engagement(c.engagement).program;

  // An analyst sees their own commitment and its source, never the lead's
  // "why now" notes or plan.
  if (!isLead()) {
    const done = ownerDone(c.id);
    sheet.innerHTML = `
      <button class="sheet-close" data-close aria-label="Close">${icon("x")}</button>
      <div class="sheet-eyebrow meta">${escapeHtml(c.engagement)}${program ? ` · ${escapeHtml(program)}` : ""}</div>
      <h2 class="sheet-title" id="sheet-title">${escapeHtml(c.title)}</h2>
      <div class="facts">
        <div><div class="fact-label">Due</div><div class="fact-value">${escapeHtml(c.due)}</div><div class="meta">${dueLabel(c)}</div></div>
        <div><div class="fact-label">Latest progress</div><div class="fact-value">${escapeHtml(c.progress || "")}</div></div>
      </div>
      <div class="sheet-section">
        <h3>Where this came from</h3>
        <blockquote class="quote">“${escapeHtml(c.excerpt)}”</blockquote>
        <div class="quote-source meta">${SOURCE_WORD[c.sourceType] || "Note"} · ${escapeHtml(c.source)}</div>
      </div>
      <div class="sheet-section">
        <button class="btn btn-primary" data-todo-toggle="${c.id}">${done ? "Mark not done" : `${icon("check")}Mark done`}</button>
        ${done ? `<p class="confirmation">Marked done. ${escapeHtml(SETTINGS.leadName)} sees it in All commitments.</p>` : ""}
      </div>`;
    return;
  }

  sheet.innerHTML = `
    <button class="sheet-close" data-close aria-label="Close">${icon("x")}</button>
    <div class="sheet-eyebrow meta">${dot(c.engagement)}${escapeHtml(c.engagement)}${program ? ` · ${escapeHtml(program)}` : ""}</div>
    <h2 class="sheet-title" id="sheet-title">${escapeHtml(c.title)}</h2>

    <div class="facts">
      <div><div class="fact-label">Owner</div><a class="fact-value owner" href="#/team/${encodeURIComponent(c.owner)}">${avatar(c.owner, "small")}${escapeHtml(person(c.owner).fullName)}</a></div>
      <div><div class="fact-label">Due</div><div class="fact-value">${escapeHtml(c.due)}</div><div class="meta">${dueLabel(c)}</div></div>
      <div><div class="fact-label">Status</div><div class="fact-value">${STATUS_LABEL[c.status]}</div></div>
      <div><div class="fact-label">Latest progress</div><div class="fact-value">${escapeHtml(c.progress)}</div></div>
    </div>

    ${c.reason ? `
    <div class="sheet-section">
      <h3>Why now</h3>
      <div class="callout">${escapeHtml(c.reason)}${c.since ? ` <span class="meta">Flagged ${escapeHtml(c.since)}.</span>` : ""}</div>
    </div>` : ""}

    <div class="sheet-section">
      <h3>Where this came from</h3>
      <blockquote class="quote">“${escapeHtml(c.excerpt)}”</blockquote>
      <div class="quote-source meta">${SOURCE_WORD[c.sourceType] || "Note"} · ${escapeHtml(c.source)}</div>
    </div>

    ${c.nextStep ? `
    <div class="sheet-section">
      <h3>${plan ? `On your plan for ${DAY_PARTS.find((d) => d.id === plan.part).name.toLowerCase()}, by ${clock(plan.by)}` : "Suggested next step"}</h3>
      <p class="next-step">${escapeHtml(plan ? plan.title : c.nextStep)}</p>
      ${notNeeded ? `<p class="resolved-callout">${icon("check")}${escapeHtml(notNeeded)} marked this done, so this step-in is no longer needed.</p>` : ""}
      ${plan && !notNeeded ? `<button class="btn btn-primary" data-done-toggle="${plan.id}" ${checkedIn ? "disabled" : ""}>
        ${checkedIn ? `${icon("check")}Done` : "Mark done"}
      </button>
      ${checkedIn ? `<p class="confirmation">Done for today. The status stays “${STATUS_LABEL[c.status].toLowerCase()}” until the work moves.</p>` : ""}` : ""}
    </div>` : ""}`;
}

function openSheet(id) {
  state.selectedId = id;
  render();
  $("sheet").querySelector("[data-close]")?.focus();
}

function closeSheet() {
  const id = state.selectedId;
  state.selectedId = null;
  render();
  document.querySelector(`button[data-open="${id}"]`)?.focus({ preventScroll: true });
}

/* =========================================================
   Demo: fake connections, imports and "view as"
   Nothing is really connected. What you click is saved in this
   browser (localStorage) so it survives a refresh; "Reset demo"
   on the Profile page clears it.
   ========================================================= */

const DEMO_KEY = "ahead-demo-v1";
const demo = (() => {
  const blank = { connected: {}, scanned: {}, accepted: [], dismissed: [], invited: {}, viewAs: "lead", ownerDone: [] };
  try { return { ...blank, ...JSON.parse(localStorage.getItem(DEMO_KEY) || "{}") }; } catch { return blank; }
})();
function saveDemo() {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(demo)); } catch { /* storage blocked: the demo still works until reload */ }
}
const busy = { connecting: new Set(), scanning: false };

/* Who is looking: "lead" (Alex) or a team member's id, if Alex has connected them. */
const viewer = () =>
  demo.viewAs !== "lead" && demo.invited[demo.viewAs] && TEAM.some((p) => p.id === demo.viewAs) ? demo.viewAs : "lead";
const isLead = () => viewer() === "lead";
const firstName = (id) => (id === "lead" ? SETTINGS.leadName : person(id).fullName.split(" ")[0]);
const foundById = (id) => FOUND_IN_SCAN.find((f) => String(f.id) === String(id));
const ownerDone = (id) => demo.ownerDone.includes(id);

/* Add an accepted item to the app's data, once. */
function applyFound(f) {
  if (f.kind === "task") {
    if (!TODAY_PLAN.some((p) => p.id === f.id))
      TODAY_PLAN.push({ id: f.id, part: f.part, by: f.by, done: false, title: f.title, note: `Found in ${f.source}`, found: true });
    return;
  }
  if (!byId(f.id)) {
    const { kind, stepIn, ...c } = f;
    COMMITMENTS.push({ ...c, found: true });
    if (stepIn && !TODAY_PLAN.some((p) => p.id === `s${f.id}`))
      TODAY_PLAN.push({ id: `s${f.id}`, part: stepIn.part, by: stepIn.by, done: false, commitment: f.id, title: stepIn.title });
  }
}
demo.accepted.forEach((id) => { const f = foundById(id); if (f) applyFound(f); });

/* ---------- Page: Profile (connections, imports, team access) ---------- */

function foundRow(f, me) {
  const id = String(f.id);
  const accepted = demo.accepted.includes(id), dismissed = demo.dismissed.includes(id);
  const who = f.kind === "task" ? (me === "lead" ? "Your task" : "Task") : (f.owner === me ? "For you" : `For ${f.owner}`);
  const when = f.kind === "task" ? `Today by ${clock(f.by)}` : `${f.engagement} · due ${f.due}`;
  const extra = f.stepIn && me === "lead" ? `<p class="found-step">Adds a step-in to your plan: ${escapeHtml(f.stepIn.title)} · ${clock(f.stepIn.by)}</p>` : "";
  return `
    <li class="found-row ${accepted ? "is-accepted" : ""} ${dismissed ? "is-dismissed" : ""}">
      <div class="found-main">
        <div class="found-who meta">${escapeHtml(who)} · ${SOURCE_WORD[f.sourceType] || "Note"}</div>
        <div class="found-title">${escapeHtml(f.title)}</div>
        <div class="meta">${escapeHtml(when)}</div>
        <blockquote class="found-quote">“${escapeHtml(f.excerpt)}”<span class="meta"> · ${escapeHtml(f.source)}</span></blockquote>
        ${extra}
      </div>
      <div class="found-actions">
        ${accepted ? `<span class="connected">${icon("check")}Added</span>`
          : dismissed ? `<span class="meta">Dismissed</span>`
          : `<button class="btn btn-primary btn-sm" data-accept="${id}">${me === "lead" ? "Add" : "Confirm"}</button>
             <button class="btn-text" data-dismiss="${id}">Dismiss</button>`}
      </div>
    </li>`;
}

function renderProfile() {
  const me = viewer(), lead = me === "lead", p = lead ? null : person(me);
  document.title = "Ahead — Profile";
  $("profile-avatar").textContent = lead ? SETTINGS.leadInitials : p.initials;
  $("profile-heading").textContent = lead ? SETTINGS.leadFullName : p.fullName;
  $("profile-sub").textContent = lead
    ? `${SETTINGS.leadRole} · ${SETTINGS.firmName}`
    : `${p.role} · ${SETTINGS.firmName} · Connected by ${SETTINGS.leadFullName}`;

  // Sources
  const conn = demo.connected[me] || {};
  $("source-list").innerHTML = SOURCES.map((s) => {
    const on = conn[s.id], wait = busy.connecting.has(s.id);
    return `
      <li class="source-row">
        <div><div class="source-name">${escapeHtml(s.name)}</div><div class="meta">${escapeHtml(s.detail)}</div></div>
        ${on ? `<span class="connected">${icon("check")}Connected</span>`
          : `<button class="btn btn-secondary btn-sm" data-connect="${s.id}" ${wait ? "disabled" : ""}>${wait ? "Connecting…" : "Connect"}</button>`}
      </li>`;
  }).join("");

  // What the scan found (an analyst only sees items about their own work)
  const anyOn = Object.values(conn).some(Boolean);
  const items = FOUND_IN_SCAN.filter((f) => lead || (f.kind === "commitment" && f.owner === me));
  const pending = items.filter((f) => !demo.accepted.includes(String(f.id)) && !demo.dismissed.includes(String(f.id)));
  $("found-actions").innerHTML = demo.scanned[me] && pending.length
    ? `<button class="btn-text" data-accept-all>${lead ? "Add all" : "Confirm all"} (${pending.length})</button>` : "";
  $("found-list").innerHTML =
    !anyOn ? `<div class="found-empty"><p>Connect a source to see what Ahead picks up.</p><p class="meta">It looks for promises with a date: “Priya will send it by Friday.”</p></div>`
    : busy.scanning ? `<div class="found-empty"><p>Reading the last 7 days of email, meetings and chats…</p><div class="scan-bar"><span></span></div></div>`
    : !demo.scanned[me] ? `<div class="found-empty"><p>Ready to look for commitments.</p><button class="btn btn-primary" data-scan>Scan now</button></div>`
    : `<p class="meta found-summary">Found ${plural(items.length, "commitment")} in the last 7 days. ${lead ? "Nothing is added until you say so." : "Confirm the ones that are right; Alex sees what you confirm."}</p>
       <ul class="found-items">${items.map((f) => foundRow(f, me)).join("")}</ul>`;

  // Team access (lead) or "what you can see" (analyst)
  $("access-title").textContent = lead ? "Team access" : "What you can see";
  $("access-body").innerHTML = lead ? `
      <p class="meta">Give each analyst their own view. They see only their own commitments, projects and check-ins with you. Never the team page, the progress charts or anyone else’s work.</p>
      <ul class="access-list">${TEAM.map((t) => `
        <li class="access-row">
          ${avatar(t.id)}
          <div class="access-text"><div class="person-name">${escapeHtml(t.fullName)}</div>
            <div class="meta">${demo.invited[t.id] ? "Connected · sees only their own work" : "Not connected yet"}</div></div>
          ${demo.invited[t.id]
            ? `<button class="btn btn-secondary btn-sm" data-view-as="${t.id}">View as ${escapeHtml(firstName(t.id))}</button>`
            : `<button class="btn btn-primary btn-sm" data-invite="${t.id}">Connect</button>`}
        </li>`).join("")}</ul>`
    : `
      <ul class="can-see">
        <li>${icon("check")}Your own commitments and projects</li>
        <li>${icon("check")}When ${escapeHtml(SETTINGS.leadName)} plans to check in with you</li>
        <li class="cannot">${icon("x")}Other people’s work, the team page or progress charts</li>
      </ul>
      <button class="btn btn-secondary btn-sm" data-back-to-lead>Back to ${escapeHtml(SETTINGS.leadName)}’s view</button>`;
}

/* ---------- Page: an analyst's own day (only their work) ---------- */

function renderMy() {
  const me = viewer(), p = person(me);
  const mine = COMMITMENTS.filter((c) => c.owner === me).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  const open = mine.filter((c) => !ownerDone(c.id)), finished = mine.filter((c) => ownerDone(c.id));
  document.title = `Ahead — My day`;
  $("my-heading").textContent = `Good morning, ${firstName(me)}`;
  $("my-sub").textContent = `${SETTINGS.today}, ${clock(SETTINGS.now)} · ${plural(open.length, "to-do")} open · ${open.filter(dueThisWeek).length} due this week`;

  const todo = (c) => {
    const done = ownerDone(c.id);
    return `
      <li class="commit-row todo-row ${done ? "is-done" : ""} ${state.selectedId === c.id ? "selected" : ""}">
        <input type="checkbox" class="plan-check todo-check" data-todo="${c.id}" ${done ? "checked" : ""} aria-label="Mark done: ${escapeHtml(c.title)}">
        <div class="todo-body">
          <button class="plan-title" data-open="${c.id}">${escapeHtml(c.title)}</button>
          <div class="meta">${escapeHtml(c.engagement)} · ${escapeHtml(c.progress || "")}${c.found ? ` · <span class="new-label">New</span> from ${escapeHtml(c.source)}` : ""}</div>
        </div>
        <div class="commit-side">
          <span class="${!done && c.daysUntilDue <= 1 ? "status-strong" : "meta"}">${done ? "Done" : dueLabel(c)}</span>
          <span class="meta">${escapeHtml(c.due)}</span>
        </div>
      </li>`;
  };
  $("my-todos").innerHTML = (open.map(todo).join("") || `<li class="empty meta">Nothing open. Nice.</li>`) + finished.map(todo).join("");

  // When the lead plans to check in (no reasons: those are the lead's notes)
  const checks = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === me).sort(byTime);
  const lead = SETTINGS.leadName;
  $("my-checkins-title").textContent = `Check-ins with ${lead} today`;
  $("my-checkins").innerHTML = checks.length ? checks.map((t) => {
    const title = t.title.includes(`with ${me}`) ? t.title.replace(`with ${me}`, `with ${lead}`) : `${lead}: ${t.title}`;
    const notNeeded = !!resolvedBy(t);
    return `<li class="${isOff(t) ? "is-done" : ""}"><span>${escapeHtml(title)}${notNeeded ? `<span class="meta resolved-mini"> · not needed, you marked it done</span>` : ""}</span><span class="meta">${clock(t.by)}</span></li>`;
  }).join("") : `<li><span class="meta">No check-ins planned today.</span></li>`;

  // Their projects
  const projects = [...new Set(mine.map((c) => c.engagement))];
  $("my-projects").innerHTML = projects.map((name) => {
    const items = open.filter((c) => c.engagement === name).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    return `
      <div class="project-row">
        <div class="eng-name">${escapeHtml(name)}</div>
        <div class="meta">${escapeHtml(engagement(name).program)}</div>
        <p class="eng-line">${plural(items.length, "open to-do")}${items[0] ? ` · next due ${escapeHtml(items[0].due)}` : ""}</p>
      </div>`;
  }).join("");
}

/* ---------- Pages and navigation ---------- */

const PAGE_TITLE = { today: "Top priorities", team: "Team", progress: "Progress", commitments: "All commitments", profile: "Profile" };
const LEAD_ONLY = ["team", "progress"];

function readRoute() {
  const [page, id] = location.hash.replace(/^#\/?/, "").split("/");
  state.page = Object.keys(PAGE_TITLE).includes(page) ? page : "today";
  if (!isLead() && LEAD_ONLY.includes(state.page)) { state.page = "today"; history.replaceState(null, "", "#/today"); }
  state.personId = state.page === "team" && id ? decodeURIComponent(id) : null;
}

function render() {
  Viz.hideTip();
  const me = viewer(), lead = me === "lead";
  let pageId = state.personId ? "person" : state.page;
  if (!lead && pageId === "today") pageId = "my";

  document.body.classList.toggle("as-analyst", !lead);
  document.querySelectorAll(".page").forEach((el) => { el.hidden = el.id !== `page-${pageId}`; });
  document.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== (lead ? "lead" : "analyst"); });
  document.querySelectorAll(".nav-item[data-page]").forEach((a) =>
    a.classList.toggle("active", a.dataset.page === state.page && !state.personId));
  document.querySelectorAll(".nav-person").forEach((a) =>
    a.classList.toggle("active", a.dataset.person === state.personId));

  // Who is signed in (sidebar), and the "viewing as" banner
  $("me-initials").textContent = lead ? SETTINGS.leadInitials : person(me).initials;
  $("me-name").textContent = lead ? SETTINGS.leadFullName : person(me).fullName;
  $("me-role").textContent = lead ? SETTINGS.leadRole : person(me).role;
  $("user-profile").classList.toggle("active", state.page === "profile");
  $("view-as").hidden = lead;
  if (!lead) $("view-as").innerHTML = `Demo: you’re seeing ${escapeHtml(firstName(me))}’s view. <button class="btn-text" data-back-to-lead>Back to ${escapeHtml(SETTINGS.leadName)}</button>`;

  if (pageId === "today") renderToday();
  if (pageId === "my") renderMy();
  if (pageId === "team") renderTeam();
  if (pageId === "person") renderPerson();
  if (pageId === "progress") renderProgress();
  if (pageId === "commitments") renderTable();
  if (pageId === "profile") renderProfile();
  if (!["person", "my", "profile"].includes(pageId)) document.title = `Ahead — ${lead ? PAGE_TITLE[pageId] : "My commitments"}`;
  renderSheet();
}

function fillStatic() {
  document.querySelectorAll("[data-text]").forEach((el) => { el.textContent = SETTINGS[el.dataset.text] ?? ""; });
  document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon); });

  $("nav-people").innerHTML = TEAM.map((p) =>
    `<a class="nav-person" href="#/team/${encodeURIComponent(p.id)}" data-person="${escapeHtml(p.id)}">${avatar(p.id, "tiny")}${escapeHtml(p.fullName)}</a>`).join("");

  $("filter-engagement").innerHTML = `<option value="all">All engagements</option>` +
    ENGAGEMENTS.map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  $("filter-owner").innerHTML = `<option value="all">Everyone</option>` +
    TEAM.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.fullName)}</option>`).join("");
}

/* ---------- Events ---------- */

/* Demo clicks: connect, scan, add/dismiss, connect a teammate, view as */
document.addEventListener("click", (event) => {
  const t = event.target.closest("[data-connect], [data-scan], [data-accept], [data-dismiss], [data-accept-all], [data-invite], [data-view-as], [data-back-to-lead], [data-todo-toggle], #demo-reset");
  if (!t) return;
  const me = viewer();
  if (t.dataset.connect) {
    const id = t.dataset.connect;
    busy.connecting.add(id); render();
    setTimeout(() => {
      busy.connecting.delete(id);
      demo.connected[me] = { ...(demo.connected[me] || {}), [id]: true };
      saveDemo(); render();
    }, 900);
  } else if (t.hasAttribute("data-scan")) {
    busy.scanning = true; render();
    setTimeout(() => { busy.scanning = false; demo.scanned[me] = true; saveDemo(); render(); }, 1600);
  } else if (t.dataset.accept || t.hasAttribute("data-accept-all")) {
    const ids = t.dataset.accept ? [t.dataset.accept]
      : FOUND_IN_SCAN.filter((f) => me === "lead" || (f.kind === "commitment" && f.owner === me)).map((f) => String(f.id))
          .filter((id) => !demo.accepted.includes(id) && !demo.dismissed.includes(id));
    ids.forEach((id) => { demo.accepted.push(id); applyFound(foundById(id)); });
    saveDemo(); render();
  } else if (t.dataset.dismiss) {
    demo.dismissed.push(t.dataset.dismiss); saveDemo(); render();
  } else if (t.dataset.invite) {
    demo.invited[t.dataset.invite] = true; saveDemo(); render();
  } else if (t.dataset.viewAs) {
    demo.viewAs = t.dataset.viewAs; state.selectedId = null; saveDemo();
    location.hash = "#/today"; readRoute(); render();
  } else if (t.hasAttribute("data-back-to-lead")) {
    demo.viewAs = "lead"; state.selectedId = null; saveDemo();
    location.hash = "#/profile"; readRoute(); render();
  } else if (t.dataset.todoToggle) {
    toggleOwnerDone(Number(t.dataset.todoToggle)); render();
  } else if (t.id === "demo-reset") {
    try { localStorage.removeItem(DEMO_KEY); } catch { /* ignore */ }
    location.hash = "#/today"; location.reload();
  }
});

function toggleOwnerDone(id) {
  demo.ownerDone = ownerDone(id) ? demo.ownerDone.filter((x) => x !== id) : [...demo.ownerDone, id];
  saveDemo();
}

document.addEventListener("change", (e) => {
  if (!e.target.matches(".todo-check")) return;
  toggleOwnerDone(Number(e.target.dataset.todo)); render();
});

document.addEventListener("click", (event) => {
  if (event.target.matches(".plan-check")) return;   // handled by the change listener below
  // A link to a person's page (in the table or the side panel) just navigates.
  if (event.target.closest("a.owner")) { state.selectedId = null; return; }
  const t = event.target.closest("[data-done-toggle], [data-close], [data-open], #filter-reset, #sheet-overlay");
  if (!t) return;

  if (t.dataset.doneToggle) { state.done.add(t.dataset.doneToggle); return render(); }
  if (t.hasAttribute("data-close") || t.id === "sheet-overlay") return closeSheet();
  if (t.dataset.open) { event.preventDefault(); return openSheet(Number(t.dataset.open)); }
  if (t.id === "filter-reset") { state.filters = { engagement: "all", owner: "all", status: "all" }; return renderTable(); }
});

[["filter-engagement", "engagement"], ["filter-owner", "owner"], ["filter-status", "status"]].forEach(([id, key]) => {
  $(id).addEventListener("change", (e) => { state.filters[key] = e.target.value; renderTable(); });
});

document.addEventListener("change", (e) => {
  if (!e.target.matches(".plan-check") || e.target.matches(".todo-check")) return;
  const id = e.target.dataset.done;
  if (e.target.checked) state.done.add(id); else state.done.delete(id);
  render();
  document.getElementById(`check-${id}`)?.focus({ preventScroll: true });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.selectedId !== null) closeSheet();
});

window.addEventListener("hashchange", () => { readRoute(); render(); });

/* ---------- Start ---------- */

fillStatic();
readRoute();
render();
