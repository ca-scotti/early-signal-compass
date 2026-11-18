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

/* How a part of the day is going: behind = not done and past its time,
   ahead = done before its time. Always a word, never color alone. */
function pace(part) {
  const items = TODAY_PLAN.filter((p) => p.part === part.id);
  const isDone = (p) => state.done.has(p.id);
  if (minutes(part.start) > NOW && !items.some(isDone)) return { word: `Starts at ${clock(part.start)}`, tone: "" };
  if (items.length && items.every(isDone)) return { word: "Done", tone: "on-track" };
  const behind = items.filter((p) => !isDone(p) && minutes(p.by) <= NOW).length;
  const ahead = items.filter((p) => isDone(p) && minutes(p.by) > NOW).length;
  if (behind) return { word: `Behind by ${behind}`, tone: "at-risk" };
  if (ahead) return { word: `Ahead by ${ahead}`, tone: "on-track" };
  return { word: "On track", tone: "on-track" };
}

/* ---------- Static text ---------- */

function fillStatic() {
  document.querySelectorAll("[data-text]").forEach((el) => { el.textContent = SETTINGS[el.dataset.text] ?? ""; });
  document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon); });

  $("engagement-nav").innerHTML = ENGAGEMENTS.map((e) =>
    `<button class="nav-item" data-nav="${escapeHtml(e.name)}">${dot(e.name)}${escapeHtml(e.name)}</button>`).join("");

  $("filter-engagement").innerHTML = `<option value="all">All engagements</option>` +
    ENGAGEMENTS.map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  $("filter-owner").innerHTML = `<option value="all">Everyone</option>` +
    TEAM.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.fullName)}</option>`).join("");
}

/* ---------- Header ---------- */

function renderHeader() {
  const count = (s) => COMMITMENTS.filter((c) => c.status === s).length;
  const left = TODAY_PLAN.filter((p) => !state.done.has(p.id));
  const leftCheckIns = left.filter((p) => p.commitment).length;
  const word = NUMBER_WORDS[left.length] ?? left.length;
  $("now").textContent = `${SETTINGS.today} · ${clock(SETTINGS.now)}`;
  $("lead-sentence").textContent = left.length === 0
    ? "Everything on today's plan is done."
    : `${word} thing${left.length === 1 ? "" : "s"} left to finish by end of day` +
      (leftCheckIns ? `, including ${(NUMBER_WORDS[leftCheckIns] ?? String(leftCheckIns)).toLowerCase()} check-in${leftCheckIns === 1 ? "" : "s"}.` : ".");
  $("stats").innerHTML =
    `<span class="badge overdue">${count("overdue")} overdue</span>` +
    `<span class="badge at-risk">${count("at-risk")} at risk</span>` +
    `<span class="badge on-track">${count("on-track")} on track</span>`;
}

/* ---------- Today: the end-of-day plan ---------- */

function planItem(p) {
  const done = state.done.has(p.id);
  const c = p.commitment ? byId(p.commitment) : null;
  const late = !done && minutes(p.by) <= NOW;
  const title = c
    ? `<button class="plan-title" data-open="${c.id}">${escapeHtml(p.title)}</button>`
    : `<span class="plan-title">${escapeHtml(p.title)}</span>`;
  const meta = c
    ? `${dot(c.engagement)}${escapeHtml(c.title)} · ${escapeHtml(person(c.owner).fullName)} · <span class="${c.daysUntilDue <= 1 ? "urgent" : ""}">${dueLabel(c)}</span>`
    : escapeHtml(p.note || "");
  return `
    <li class="plan-item ${done ? "is-done" : ""} ${c && state.selectedId === c.id ? "selected" : ""}">
      <input type="checkbox" class="plan-check" id="check-${p.id}" data-done="${p.id}" ${done ? "checked" : ""}
        aria-label="Mark done: ${escapeHtml(p.title)}">
      <div class="plan-body">
        <div class="row-title-line">${title}${c && !done ? badge(c.status) : ""}</div>
        <div class="row-meta meta">${meta}</div>
        ${c && !done ? `<p class="row-reason">${escapeHtml(c.reason)}</p>` : ""}
      </div>
      <span class="plan-time ${late ? "urgent" : ""}">${late ? "Was due " : "By "}${clock(p.by)}</span>
    </li>`;
}

function renderPlan() {
  $("plan").innerHTML = DAY_PARTS.map((part) => {
    const items = TODAY_PLAN.filter((p) => p.part === part.id).sort((a, b) => minutes(a.by) - minutes(b.by));
    const status = pace(part);
    const isNow = minutes(part.start) <= NOW && NOW < minutes(part.end);
    return `
      <section class="day-part ${isNow ? "is-now" : ""}" aria-labelledby="part-${part.id}">
        <div class="day-part-head">
          <h3 id="part-${part.id}">${part.name}<span class="meta"> · ${clock(part.start)}–${clock(part.end)}${isNow ? " · now" : ""}</span></h3>
          <span class="${status.tone ? `badge ${status.tone}` : "meta"}">${status.word}</span>
        </div>
        <ul class="plan-list">${items.map(planItem).join("")}</ul>
      </section>`;
  }).join("");
}

/* ---------- Team ---------- */

function renderTeam() {
  $("team-list").innerHTML = TEAM.map((p) => {
    const mine = COMMITMENTS.filter((c) => c.owner === p.id)
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    const dueThisWeek = mine.filter((c) => c.daysUntilDue >= 0 && c.daysUntilDue <= 4).length;
    return `
      <div class="person">
        <div class="person-head">
          ${avatar(p.id)}
          <div>
            <div class="person-name">${escapeHtml(p.fullName)}</div>
            <div class="meta">${mine.length} commitments · ${dueThisWeek} due this week</div>
          </div>
        </div>
        <div class="status-bar" role="img" aria-label="${mine.map((c) => STATUS_LABEL[c.status]).join(", ")}">
          ${mine.map((c) => `<span class="${c.status}" title="${escapeHtml(c.title)} · ${STATUS_LABEL[c.status]}"></span>`).join("")}
        </div>
        <p class="person-note">${escapeHtml(p.note)}</p>
      </div>`;
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

function openTable(engagementName = "all") {
  state.tableOpen = true;
  state.filters = { engagement: engagementName, owner: "all", status: "all" };
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
      <div><div class="fact-label">Status</div>${badge(c.status)}</div>
      <div><div class="fact-label">Latest progress</div><div class="fact-value">${escapeHtml(c.progress)}</div></div>
    </div>

    ${c.reason ? `
    <div class="sheet-section">
      <h3>${c.status === "overdue" ? "What needs attention" : "Why this could slip"}</h3>
      <div class="callout ${c.status}">${escapeHtml(c.reason)}${c.since ? ` <span style="opacity:.8">At risk since ${escapeHtml(c.since)}.</span>` : ""}</div>
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
        ${checkedIn ? `${icon("check")}Check-in done` : "Mark check-in done"}
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
  else openTable(nav === "work" ? "all" : nav);
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
