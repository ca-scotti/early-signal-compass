/* =========================================================
   Ahead — page logic
   Builds the page from the content in data.js.
   You normally only need to edit data.js; this file is for
   changing how things behave.
   ========================================================= */

/* ---------- Icons (from the Lucide icon set) ---------- */

const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const STATUS_LABEL = { "at-risk": "At risk", "on-track": "On track", overdue: "Overdue" };
const STATUS_ORDER = { overdue: 0, "at-risk": 1, "on-track": 2 };
const SOURCE_WORD = { meeting: "Meeting", email: "Email", chat: "Chat" };
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* ---------- State ---------- */

const state = {
  selectedId: null,     // commitment open in the side panel
  done: new Set(TODAY_PLAN.filter((p) => p.done).map((p) => p.id)),   // plan items ticked off
  tableOpen: false,
  filters: { engagement: "all", owner: "all", status: "all" },
};

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const byId = (id) => COMMITMENTS.find((c) => c.id === id);
const person = (id) => TEAM.find((p) => p.id === id) || { id, fullName: id, initials: id.slice(0, 2).toUpperCase() };
const engagement = (name) => ENGAGEMENTS.find((e) => e.name === name) || { name, program: "", dot: "northwind" };

const dot = (name) => `<span class="dot ${engagement(name).dot === "harbor" ? "harbor" : ""}"></span>`;
const badge = (status) => `<span class="badge ${status}">${STATUS_LABEL[status]}</span>`;
const avatar = (ownerId, size = "") => `<span class="avatar ${size}">${escapeHtml(person(ownerId).initials)}</span>`;

function dueLabel(c) {
  const d = c.daysUntilDue;
  if (d < 0) return `${-d} day${d === -1 ? "" : "s"} overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d} days`;
}

/* ---------- Time and the day plan ---------- */

const minutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
function clock(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}
const NOW = minutes(SETTINGS.now);
const planFor = (commitmentId) => TODAY_PLAN.find((p) => p.commitment === commitmentId);
const checkIns = () => TODAY_PLAN.filter((p) => p.commitment);

/* The part of the day we are in now (or the nearest one outside working hours). */
function currentPart() {
  return DAY_PARTS.find((d) => minutes(d.start) <= NOW && NOW < minutes(d.end))
    || (NOW < minutes(DAY_PARTS[0].start) ? DAY_PARTS[0] : DAY_PARTS[DAY_PARTS.length - 1]);
}
const PART_TITLE = { morning: "This morning", afternoon: "This afternoon", evening: "This evening" };

/* How the current part of the day is going, in words (never color alone). */
function paceLine(part, items) {
  const open = items.filter((p) => !state.done.has(p.id));
  const late = open.filter((p) => minutes(p.by) <= NOW).length;
  const until = `Until ${clock(part.end)}`;
  if (!open.length) return `${until} · All done`;
  if (late) return `${until} · ${late} past ${late === 1 ? "its" : "their"} time`;
  return `${until} · On track`;
}

/* ---------- Static text ---------- */

function fillStatic() {
  document.querySelectorAll("[data-text]").forEach((el) => { el.textContent = SETTINGS[el.dataset.text] ?? ""; });
  document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon); });

  $("filter-engagement").innerHTML = `<option value="all">All engagements</option>` +
    ENGAGEMENTS.map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  $("filter-owner").innerHTML = `<option value="all">Everyone</option>` +
    TEAM.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.fullName)}</option>`).join("");
}

/* ---------- Header ---------- */

function renderHeader() {
  $("now").textContent = `Good morning, ${SETTINGS.leadName} · ${SETTINGS.today} · ${clock(SETTINGS.now)}`;
}

/* ---------- Today: the end-of-day plan ---------- */

/* One row: title and one time. Rows about an analyst's work get a "Step in"
   tag and a "Why now" line; the lead's own tasks may carry a short note.
   "quiet" rows (later today) show the title and time only. */
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
    <li class="plan-item ${c && !done ? "is-step-in" : ""} ${done ? "is-done" : ""} ${c && state.selectedId === c.id ? "selected" : ""}">
      <input type="checkbox" class="plan-check" id="check-${p.id}" data-done="${p.id}" ${done ? "checked" : ""}
        aria-label="Mark done: ${escapeHtml(p.title)}">
      <div class="plan-body">${title}${inlineTag}${second}</div>
      <span class="plan-time ${late ? "is-late" : ""}">${late ? "Past " : ""}${clock(p.by)}</span>
    </li>`;
}

function renderPlan() {
  const part = currentPart();
  const byTime = (a, b) => minutes(a.by) - minutes(b.by);
  const partIndex = DAY_PARTS.indexOf(part);
  const earlierIds = DAY_PARTS.slice(0, partIndex).map((d) => d.id);

  // Right now: this part of the day, plus anything left over from earlier parts.
  // Unfinished first, in time order; done items at the bottom.
  const nowItems = TODAY_PLAN.filter((p) => p.part === part.id || (earlierIds.includes(p.part) && !state.done.has(p.id)));
  const open = nowItems.filter((p) => !state.done.has(p.id)).sort(byTime);
  const finished = nowItems.filter((p) => state.done.has(p.id)).sort(byTime);

  const laterParts = DAY_PARTS.slice(partIndex + 1);
  const later = laterParts.map((d) => {
    const items = TODAY_PLAN.filter((p) => p.part === d.id).sort(byTime);
    if (!items.length) return "";
    return `
      <div class="later-part">
        <h3 class="part-label">${d.name} <span class="meta">from ${clock(d.start)}</span></h3>
        <ul class="plan-list quiet">${items.map((p) => planItem(p, true)).join("")}</ul>
      </div>`;
  }).join("");

  $("plan").innerHTML = `
    <section class="now" aria-labelledby="now-heading">
      <h1 id="now-heading">${PART_TITLE[part.id] || part.name}</h1>
      <p class="now-pace meta">${paceLine(part, nowItems)}</p>
      <ul class="plan-list card">
        ${open.map((p) => planItem(p)).join("") || `<li class="plan-empty meta">Nothing left for ${part.name.toLowerCase()}.</li>`}
        ${finished.map((p) => planItem(p)).join("")}
      </ul>
    </section>
    ${later ? `<section class="quiet-section" aria-label="Later today"><h2 class="section-label">Later today</h2>${later}</section>` : ""}`;
}

/* ---------- Team ---------- */

function renderTeam() {
  $("team-list").innerHTML = TEAM.map((p) => {
    const dueThisWeek = COMMITMENTS.filter((c) => c.owner === p.id && c.daysUntilDue >= 0 && c.daysUntilDue <= 4).length;
    return `
      <li class="person">
        ${avatar(p.id, "small")}
        <span class="person-name">${escapeHtml(p.fullName)}</span>
        <span class="meta">${dueThisWeek} due this week · ${escapeHtml(p.note)}</span>
      </li>`;
  }).join("");
}

/* ---------- All commitments ---------- */

function renderTable() {
  const { engagement: eng, owner, status } = state.filters;
  $("all-work-panel").hidden = !state.tableOpen;
  const toggle = $("all-work-toggle");
  toggle.setAttribute("aria-expanded", state.tableOpen);
  toggle.innerHTML = `${state.tableOpen ? "Hide" : "See"} all ${COMMITMENTS.length} commitments${icon("chevronDown")}`;
  if (!state.tableOpen) return;

  $("filter-engagement").value = eng;
  $("filter-owner").value = owner;
  $("filter-status").value = status;
  $("filter-reset").hidden = eng === "all" && owner === "all" && status === "all";

  const rows = COMMITMENTS
    .filter((c) => (eng === "all" || c.engagement === eng) && (owner === "all" || c.owner === owner) && (status === "all" || c.status === status))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  $("work-table-body").innerHTML = rows.length === 0
    ? `<tr><td colspan="4" class="empty-row">No commitments match these filters.</td></tr>`
    : rows.map((c) => `
      <tr data-open="${c.id}">
        <td>
          <div class="title-cell">${escapeHtml(c.title)}${planFor(c.id) && state.done.has(planFor(c.id).id) ? `<span class="planned-mark">· Checked in today</span>` : ""}</div>
          <div class="meta">${escapeHtml(c.engagement)}</div>
        </td>
        <td class="col-owner"><span class="owner">${avatar(c.owner, "small")}${escapeHtml(c.owner)}</span></td>
        <td class="col-due">${escapeHtml(c.due)}</td>
        <td>${badge(c.status)}</td>
      </tr>`).join("");
}

function openTable() {
  state.tableOpen = true;
  state.filters = { engagement: "all", owner: "all", status: "all" };
  renderTable();
  $("all-work").scrollIntoView({ behavior: "smooth" });
}

/* ---------- Side panel ---------- */

function renderSheet() {
  const c = byId(state.selectedId);
  const sheet = $("sheet");
  sheet.hidden = $("sheet-overlay").hidden = !c;
  document.body.style.overflow = c ? "hidden" : "";
  if (!c) { sheet.innerHTML = ""; return; }

  const plan = planFor(c.id);
  const checkedIn = plan && state.done.has(plan.id);
  const program = engagement(c.engagement).program;

  sheet.innerHTML = `
    <button class="sheet-close" data-close aria-label="Close">${icon("x")}</button>
    <div class="sheet-eyebrow meta">${dot(c.engagement)}${escapeHtml(c.engagement)}${program ? ` · ${escapeHtml(program)}` : ""}</div>
    <h2 class="sheet-title" id="sheet-title">${escapeHtml(c.title)}</h2>

    <div class="facts">
      <div><div class="fact-label">Owner</div><div class="fact-value">${avatar(c.owner, "small")}${escapeHtml(person(c.owner).fullName)}</div></div>
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
  renderAll();
  $("sheet").querySelector("[data-close]")?.focus();
}

function closeSheet() {
  const id = state.selectedId;
  state.selectedId = null;
  renderAll();
  document.querySelector(`button[data-open="${id}"]`)?.focus({ preventScroll: true });
}

/* ---------- Render ---------- */

function renderAll() {
  renderHeader();
  renderPlan();
  renderTable();
  renderSheet();
}

function setActiveNav(key) {
  document.querySelectorAll("[data-nav]").forEach((b) => b.classList.toggle("active", b.dataset.nav === key));
}

/* ---------- Events ---------- */

document.addEventListener("click", (event) => {
  if (event.target.matches(".plan-check")) return;   // handled by the change listener below
  const t = event.target.closest("[data-done-toggle], [data-close], [data-open], [data-nav], #all-work-toggle, #filter-reset, #sheet-overlay");
  if (!t) return;

  if (t.dataset.doneToggle) { state.done.add(t.dataset.doneToggle); return renderAll(); }
  if (t.hasAttribute("data-close") || t.id === "sheet-overlay") return closeSheet();
  if (t.dataset.open) return openSheet(Number(t.dataset.open));
  if (t.id === "all-work-toggle") { state.tableOpen = !state.tableOpen; return renderTable(); }
  if (t.id === "filter-reset") { state.filters = { engagement: "all", owner: "all", status: "all" }; return renderTable(); }

  const nav = t.dataset.nav;
  if (!nav) return;
  setActiveNav(nav);
  if (nav === "today") window.scrollTo({ top: 0, behavior: "smooth" });
  else if (nav === "team") $("team-card").scrollIntoView({ behavior: "smooth", block: "center" });
  else openTable();
});

[["filter-engagement", "engagement"], ["filter-owner", "owner"], ["filter-status", "status"]].forEach(([id, key]) => {
  $(id).addEventListener("change", (e) => { state.filters[key] = e.target.value; renderTable(); });
});

document.addEventListener("change", (e) => {
  if (!e.target.matches(".plan-check")) return;
  const id = e.target.dataset.done;
  if (e.target.checked) state.done.add(id); else state.done.delete(id);
  renderAll();
  document.getElementById(`check-${id}`)?.focus({ preventScroll: true });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.selectedId !== null) closeSheet();
});

/* ---------- Start ---------- */

fillStatic();
renderTeam();
renderAll();
