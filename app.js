/* =========================================================
   Ahead — page logic
   Builds every page from the content in data.js.
   You normally only need to edit data.js; this file is for
   changing how things behave.

   Pages (the part of the address after #):
     #/today              Top priorities
     #/team               Your team
     #/team/Priya         One team member (the id from TEAM in data.js)
     #/commitments        All commitments
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
};

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

const dot = (name) => `<span class="dot ${engagement(name).dot === "harbor" ? "harbor" : ""}"></span>`;
const badge = (status) => `<span class="badge ${status}">${STATUS_LABEL[status]}</span>`;
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

/* The part of the day we are in now (or the nearest one outside working hours). */
function currentPart() {
  return DAY_PARTS.find((d) => minutes(d.start) <= NOW && NOW < minutes(d.end))
    || (NOW < minutes(DAY_PARTS[0].start) ? DAY_PARTS[0] : DAY_PARTS[DAY_PARTS.length - 1]);
}

/* How the current part of the day is going, in words (never color alone). */
function paceLine(part, items) {
  const open = items.filter((p) => !state.done.has(p.id));
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
  const done = state.done.has(p.id);
  const c = p.commitment ? byId(p.commitment) : null;
  const late = !done && minutes(p.by) <= NOW;
  const title = c
    ? `<button class="plan-title" data-open="${c.id}">${escapeHtml(p.title)}</button>`
    : `<span class="plan-title">${escapeHtml(p.title)}</span>`;
  let second = "";
  if (!done && !quiet) {
    if (c) second = `<p class="plan-why"><span class="step-in">Step in</span>Why now: ${escapeHtml(c.reason)}</p>`;
    else if (p.note) second = `<p class="plan-why meta">${escapeHtml(p.note)}</p>`;
  }
  const inlineTag = !done && quiet && c ? `<span class="step-in inline">Step in</span>` : "";
  return `
    <li class="plan-item ${quiet ? "quiet" : ""} ${c && !done && !quiet ? "is-step-in" : ""} ${done ? "is-done" : ""} ${c && state.selectedId === c.id ? "selected" : ""}">
      <input type="checkbox" class="plan-check" id="check-${p.id}" data-done="${p.id}" ${done ? "checked" : ""}
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
  const nowItems = TODAY_PLAN.filter((p) => p.part === part.id || (earlierIds.includes(p.part) && !state.done.has(p.id)));
  const open = nowItems.filter((p) => !state.done.has(p.id)).sort(byTime);
  const finished = nowItems.filter((p) => state.done.has(p.id)).sort(byTime);

  $("greeting").textContent = `Good morning, ${SETTINGS.leadName} · ${SETTINGS.today} · ${clock(SETTINGS.now)}`;
  $("now-heading").textContent = PART_TITLE[part.id] || part.name;
  $("now-pace").textContent = paceLine(part, nowItems);
  $("now-list").innerHTML =
    (open.map((p) => planItem(p)).join("") || `<li class="empty meta">Nothing left for ${part.name.toLowerCase()}.</li>`) +
    finished.map((p) => planItem(p)).join("");

  const later = DAY_PARTS.slice(partIndex + 1).map((d) => {
    const items = TODAY_PLAN.filter((p) => p.part === d.id).sort(byTime);
    if (!items.length) return "";
    return `
      <h3 class="part-label">${d.name} <span class="meta">from ${clock(d.start)}</span></h3>
      <ul class="plan-list">${items.map((p) => planItem(p, true)).join("")}</ul>`;
  }).join("");
  $("later-list").innerHTML = later || `<p class="empty meta">Nothing else today.</p>`;

  $("team-tiles").innerHTML = TEAM.map((p) => {
    const steps = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === p.id && !state.done.has(t.id)).sort(byTime);
    const next = steps[0];
    return `
      <a class="team-tile" href="#/team/${encodeURIComponent(p.id)}">
        <div class="member-top">${avatar(p.id)}<div>
          <div class="person-name">${escapeHtml(p.fullName)}</div>
          <div class="meta">${steps.length ? plural(steps.length, "step-in") + " today" : "No step-ins today"} · ${COMMITMENTS.filter((c) => c.owner === p.id && dueThisWeek(c)).length} due this week</div>
        </div></div>
        <p class="tile-next">${next ? `Next: ${escapeHtml(next.title)} <span class="meta">· ${clock(next.by)}</span>` : escapeHtml(p.note)}</p>
        <span class="member-open">Open details ${icon("arrowRight")}</span>
      </a>`;
  }).join("");
}

/* ---------- Page: Team ---------- */

function renderTeam() {
  $("team-sub").textContent = `${plural(TEAM.length, "person")} · ${plural(COMMITMENTS.length, "commitment")} across ${plural(ENGAGEMENTS.length, "engagement")}`
    .replace("persons", "people");

  $("team-grid").innerHTML = TEAM.map((p) => {
    const mine = commitmentsOf(p.id);
    const steps = TODAY_PLAN.filter((t) => t.commitment && byId(t.commitment)?.owner === p.id && !state.done.has(t.id)).sort(byTime);
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
  const doneToday = TODAY_PLAN.filter((p) => state.done.has(p.id)).length;
  const stepsToday = TODAY_PLAN.filter((p) => p.commitment);
  const stepsDone = stepsToday.filter((p) => state.done.has(p.id)).length;
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
      <div class="kpi-row-inner"><div class="kpi-value">${L.done[last]} <span class="kpi-of">of ${L.planned[last]}</span></div>${Viz.spark(leadRate)}</div>
      ${delta(leadRate[last], leadRate[last - 1])}
    </div>
    <div class="kpi">
      <div class="kpi-label">Team · On time last week</div>
      <div class="kpi-row-inner"><div class="kpi-value">${teamRate[last]}%</div>${Viz.spark(teamRate)}</div>
      <div class="meta">${teamOnLast} of ${teamDueLast} commitments · ${delta(teamRate[last], teamRate[last - 1])}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Team · Flagged work caught early</div>
      <div class="kpi-row-inner"><div class="kpi-value">${caught} <span class="kpi-of">of ${caught + slipped}</span></div>${Viz.spark(caughtRate)}</div>
      <div class="meta">Over six weeks · ${slipped} slipped anyway</div>
    </div>`;

  Viz.line($("chart-ontime"), {
    labels: W, label: "On-time delivery by person, last six weeks",
    series: TEAM.filter((p) => HISTORY.team[p.id]).map((p) => ({ name: p.id, color: colorOf(p.id), values: onTimeSeries(p.id) })),
  });
  Viz.columns($("chart-stepins"), {
    labels: W, label: "Step-ins done out of planned, last six weeks",
    fill: { name: "Done", color: "#2a78d6", values: L.done },
    track: { name: "Planned", color: "#cde2fb", values: L.planned },
  });
  Viz.columns($("chart-flagged"), {
    labels: W, label: "Flagged work caught early or slipped, last six weeks",
    stacked: [
      { name: "Caught early", color: "#2a78d6", values: F.caughtEarly },
      { name: "Slipped", color: "#B8BDC5", values: F.slipped },
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
        <div class="meta">${dot(c.engagement)} ${escapeHtml(c.engagement)} · ${escapeHtml(c.progress)}</div>
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

  const rows = COMMITMENTS
    .filter((c) => (eng === "all" || c.engagement === eng) && (owner === "all" || c.owner === owner) && (status === "all" || c.status === status))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  $("table-count").textContent = `${rows.length} of ${COMMITMENTS.length}`;
  $("work-table-body").innerHTML = rows.length === 0
    ? `<tr><td colspan="5" class="empty-row">No commitments match these filters.</td></tr>`
    : rows.map((c) => `
      <tr data-open="${c.id}">
        <td class="title-cell">${escapeHtml(c.title)}${planFor(c.id) && state.done.has(planFor(c.id).id) ? `<span class="planned-mark">· Stepped in today</span>` : ""}</td>
        <td class="col-eng"><span class="eng-cell">${dot(c.engagement)}${escapeHtml(c.engagement)}</span></td>
        <td class="col-owner"><a class="owner" href="#/team/${encodeURIComponent(c.owner)}">${avatar(c.owner, "small")}${escapeHtml(c.owner)}</a></td>
        <td class="col-due">${escapeHtml(c.due)}</td>
        <td>${badge(c.status)}</td>
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
  const program = engagement(c.engagement).program;

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
      ${plan ? `<button class="btn btn-primary" data-done-toggle="${plan.id}" ${checkedIn ? "disabled" : ""}>
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

/* ---------- Pages and navigation ---------- */

const PAGE_TITLE = { today: "Top priorities", team: "Team", progress: "Progress", commitments: "All commitments" };

function readRoute() {
  const [page, id] = location.hash.replace(/^#\/?/, "").split("/");
  state.page = Object.keys(PAGE_TITLE).includes(page) ? page : "today";
  state.personId = state.page === "team" && id ? decodeURIComponent(id) : null;
}

function render() {
  Viz.hideTip();
  const pageId = state.personId ? "person" : state.page;
  document.querySelectorAll(".page").forEach((el) => { el.hidden = el.id !== `page-${pageId}`; });
  document.querySelectorAll(".nav-item[data-page]").forEach((a) =>
    a.classList.toggle("active", a.dataset.page === state.page && !state.personId));
  document.querySelectorAll(".nav-person").forEach((a) =>
    a.classList.toggle("active", a.dataset.person === state.personId));

  if (pageId === "today") renderToday();
  if (pageId === "team") renderTeam();
  if (pageId === "person") renderPerson();
  if (pageId === "progress") renderProgress();
  if (pageId === "commitments") renderTable();
  if (pageId !== "person") document.title = `Ahead — ${PAGE_TITLE[pageId]}`;
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
  if (!e.target.matches(".plan-check")) return;
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
