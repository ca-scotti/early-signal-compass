/* =========================================================
   Ahead — page logic
   Builds the page from the content in data.js.
   You normally only need to edit data.js; this file is for
   changing how things behave.
   ========================================================= */

/* ---------- Icons (from the Lucide icon set) ---------- */

const ICONS = {
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  checkCheck: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',
  fileText: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  layoutList: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  chat: '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

function icon(name, size = 24, className = "") {
  return `<svg class="lucide ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const SOURCE_ICON = { meeting: "video", email: "mail", chat: "chat" };
const STATUS_LABEL = { "at-risk": "At risk", "on-track": "On track", overdue: "Overdue" };
const STATUS_ICON = { "at-risk": "flag", "on-track": "check", overdue: "alert" };
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* ---------- State ---------- */

const state = {
  selectedId: null,          // commitment open in the side panel
  planned: new Set(),        // ids marked "follow-up planned"
  tableOpen: false,
  filters: { engagement: "all", owner: "all", status: "all" },
  activeNav: "morning",
};

/* ---------- Small helpers ---------- */

const $ = (id) => document.getElementById(id);

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const byId = (id) => COMMITMENTS.find((c) => c.id === id);
const person = (id) => TEAM.find((p) => p.id === id) || { id, initials: id.slice(0, 2).toUpperCase(), fullName: id };
const engagement = (name) => ENGAGEMENTS.find((e) => e.name === name) || { name, program: "", dot: "northwind" };

const avatar = (ownerId) => `<span class="avatar">${escapeHtml(person(ownerId).initials)}</span>`;
const engagementDot = (name) => `<span class="engagement-dot ${engagement(name).dot === "harbor" ? "harbor" : ""}"></span>`;
const statusBadge = (status) =>
  `<span class="status-badge ${status}">${icon(STATUS_ICON[status], 10)}${STATUS_LABEL[status]}</span>`;
const sourceLabel = (c, size = 12) => `${icon(SOURCE_ICON[c.sourceType] || "chat", size)}from ${escapeHtml(c.source)}`;
const dueIn = (days) => (days === 1 ? "Due tomorrow" : `Due in ${days} days`);
const titleButton = (c) =>
  `<button class="btn btn-link item-title-button" style="color:var(--foreground)" data-open="${c.id}">${escapeHtml(c.title)}</button>`;

/* ---------- Static text from SETTINGS ---------- */

function fillSettings() {
  document.querySelectorAll("[data-text]").forEach((el) => {
    el.textContent = SETTINGS[el.dataset.text] ?? "";
  });
  document.querySelectorAll("[data-icon]").forEach((el) => {
    const size = Number(el.dataset.size) || 16;
    el.outerHTML = icon(el.dataset.icon, size, el.className);
  });
}

/* ---------- Summary numbers ---------- */

function renderSummary() {
  const atRisk = COMMITMENTS.filter((c) => c.status === "at-risk").length;
  const overdue = COMMITMENTS.filter((c) => c.status === "overdue").length;
  const onTrack = COMMITMENTS.filter((c) => c.status === "on-track").length;
  const engagementCount = new Set(COMMITMENTS.map((c) => c.engagement)).size;

  $("nav-at-risk-count").textContent = atRisk;
  $("at-risk-count").textContent = atRisk;
  const word = NUMBER_WORDS[atRisk] ?? atRisk;
  $("support-sentence").textContent =
    `${word} commitment${atRisk === 1 ? "" : "s"} could use a little support.`;
  $("summary-line").innerHTML =
    `<span class="text-warning">${atRisk} at risk</span> · ` +
    `<span class="text-destructive">${overdue} overdue</span> · ` +
    `<span class="text-success">${onTrack} on track</span> across ${engagementCount} engagements`;

  const count = (type) => COMMITMENTS.filter((c) => c.sourceType === type).length;
  $("capture-sentence").textContent =
    `${COMMITMENTS.length} commitments from your team’s meetings, emails and chats.`;
  $("capture-sources").innerHTML =
    `<span>${icon("video", 12)}${count("meeting")}</span>` +
    `<span>${icon("mail", 12)}${count("email")}</span>` +
    `<span>${icon("chat", 12)}${count("chat")}</span>`;
}

/* ---------- Sidebar engagement links ---------- */

function renderEngagementNav() {
  $("engagement-nav").innerHTML = ENGAGEMENTS.map((e) =>
    `<button class="btn btn-ghost nav-item" data-nav="${escapeHtml(e.name)}">${engagementDot(e.name)}${escapeHtml(e.name)}</button>`
  ).join("");
}

function setActiveNav(key) {
  state.activeNav = key;
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === key);
  });
}

/* ---------- At-risk cards ---------- */

function followupButton(c) {
  const done = state.planned.has(c.id);
  return `<button class="btn btn-ghost followup-button" data-plan="${c.id}" ${done ? "disabled" : ""}
      aria-label="${done ? "Follow-up planned for" : "Mark follow-up planned for"} ${escapeHtml(c.title)}">
      ${done ? `${icon("check")}Follow-up planned` : `Plan follow-up${icon("arrowUpRight")}`}
    </button>`;
}

function renderRiskCards() {
  $("risk-grid").innerHTML = COMMITMENTS.filter((c) => c.status === "at-risk").map((c) => `
    <article class="risk-card ${state.selectedId === c.id ? "selected" : ""}">
      <div class="risk-top">
        <span class="engagement-tag">${engagementDot(c.engagement)}${escapeHtml(c.engagement)}</span>
        ${statusBadge(c.status)}
      </div>
      ${titleButton(c)}
      <div class="risk-owner">
        ${avatar(c.owner)}<span>${escapeHtml(c.owner)}</span>
        <span class="due-text">${dueIn(c.daysUntilDue)}</span>
      </div>
      <p class="risk-reason">${escapeHtml(c.reason || "")}</p>
      <div class="risk-notice">${icon("clock", 10)}At risk since ${escapeHtml(c.since || "")} · Due ${escapeHtml(c.due)}</div>
      <div class="risk-next">${icon("arrowRight", 12)}<span>${escapeHtml(c.nextStep || "")}</span></div>
      <div class="risk-footer">
        <span class="source-mini">${sourceLabel(c)}</span>
        ${followupButton(c)}
      </div>
    </article>`).join("");
}

/* ---------- Overdue ---------- */

function renderOverdue() {
  const overdue = COMMITMENTS.filter((c) => c.status === "overdue");
  $("overdue-section").hidden = overdue.length === 0;
  $("overdue-count").textContent = `${overdue.length} commitment${overdue.length === 1 ? "" : "s"}`;
  $("overdue-list").innerHTML = overdue.map((c) => `
    <div class="overdue-row">
      ${icon("alert", 17)}
      <div class="overdue-main">
        ${titleButton(c)}
        <div class="overdue-sub">${escapeHtml(c.owner)} · ${escapeHtml(c.engagement)} · from ${escapeHtml(c.source)}</div>
      </div>
      <span class="status-badge overdue">${Math.abs(c.daysUntilDue)} days overdue</span>
      <button class="btn btn-ghost btn-icon" aria-label="Open overdue commitment" data-open="${c.id}">${icon("chevronRight")}</button>
    </div>`).join("");
}

/* ---------- Team column ---------- */

function renderTeam() {
  $("team-list").innerHTML = TEAM.map((p) => {
    const mine = COMMITMENTS.filter((c) => c.owner === p.id);
    const dueThisWeek = mine.filter((c) => c.daysUntilDue >= 0 && c.daysUntilDue <= 4).length;
    const projects = ENGAGEMENTS.map((e) => {
      const items = mine.filter((c) => c.engagement === e.name);
      const counts = ["on-track", "at-risk", "overdue"].map((s) => {
        const n = items.filter((c) => c.status === s).length;
        const cls = s === "on-track" ? "text-success" : s === "at-risk" ? "text-warning" : "text-destructive";
        return n > 0 ? `<span class="${cls}">${n} ${STATUS_LABEL[s].toLowerCase()}</span>` : "";
      }).join("");
      return `
        <div class="team-project">
          <div class="team-project-name"><span>${escapeHtml(e.name)}</span></div>
          <div class="workload-line">
            <div class="workload-bar">${items.map((c) =>
              `<span class="workload-segment ${c.status}" title="${escapeHtml(c.title)}: ${STATUS_LABEL[c.status]}"></span>`).join("")}
            </div>
            <span class="workload-count">${items.length}</span>
          </div>
          <div class="team-status-counts">${counts}</div>
        </div>`;
    }).join("");
    const separator = p.note.startsWith("—") ? " " : ". ";
    return `
      <div class="analyst-block">
        <div class="analyst-header">
          ${avatar(p.id)}
          <div>
            <div class="analyst-name">${escapeHtml(p.fullName)}</div>
            <div class="analyst-meta">${escapeHtml(p.role)} · ${mine.length} commitments</div>
          </div>
        </div>
        ${projects}
        <div class="team-note">${icon(p.noteIcon || "clock", 12)}<span>${dueThisWeek} deliverables due this week${separator}${escapeHtml(p.note)}</span></div>
      </div>`;
  }).join("");
}

/* ---------- All commitments table ---------- */

function fillFilterOptions() {
  $("filter-engagement").innerHTML = `<option value="all">All engagements</option>` +
    ENGAGEMENTS.map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  $("filter-owner").innerHTML = `<option value="all">${TEAM.length === 2 ? "Both analysts" : "All analysts"}</option>` +
    TEAM.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.id)}</option>`).join("");
}

function renderTable() {
  const { engagement: eng, owner, status } = state.filters;
  $("commitments-content").hidden = !state.tableOpen;
  const toggle = $("commitments-toggle");
  toggle.setAttribute("aria-expanded", state.tableOpen);
  toggle.innerHTML = icon("chevronDown", 16, state.tableOpen ? "rotate-180" : "") +
    (state.tableOpen ? "Hide commitments" : `Show all ${COMMITMENTS.length} commitments`);
  if (!state.tableOpen) return;

  $("filter-engagement").value = eng;
  $("filter-owner").value = owner;
  $("filter-status").value = status;
  $("filter-reset").hidden = eng === "all" && owner === "all" && status === "all";

  const rows = COMMITMENTS.filter((c) =>
    (eng === "all" || c.engagement === eng) &&
    (owner === "all" || c.owner === owner) &&
    (status === "all" || c.status === status));

  $("table-count").textContent = `${rows.length} of ${COMMITMENTS.length}`;
  $("work-table-body").innerHTML = rows.length === 0
    ? `<tr><td colspan="6" class="empty-row">No commitments match these filters.</td></tr>`
    : rows.map((c) => `
      <tr class="${state.selectedId === c.id ? "selected" : ""}">
        <td>${titleButton(c)}<span class="table-engagement">${escapeHtml(c.engagement)} · ${escapeHtml(engagement(c.engagement).program)}</span></td>
        <td><span class="table-owner">${avatar(c.owner)}${escapeHtml(c.owner)}</span></td>
        <td class="font-mono">${escapeHtml(c.due)}</td>
        <td>${statusBadge(c.status)}</td>
        <td><span class="table-source">${sourceLabel(c)}</span></td>
        <td>${state.planned.has(c.id) ? `<span class="text-muted" aria-label="Follow-up planned">${icon("check", 12)}</span>` : ""}</td>
      </tr>`).join("");
}

function openTable(engagementName = "all") {
  state.tableOpen = true;
  state.filters = { engagement: engagementName, owner: "all", status: "all" };
  setActiveNav(engagementName === "all" ? "work" : engagementName);
  renderTable();
  $("all-work").scrollIntoView({ behavior: "smooth" });
}

/* ---------- Detail side panel ---------- */

function renderSheet() {
  const c = byId(state.selectedId);
  const sheet = $("detail-sheet");
  sheet.hidden = $("sheet-overlay").hidden = !c;
  document.body.style.overflow = c ? "hidden" : "";
  if (!c) { sheet.innerHTML = ""; return; }

  const planned = state.planned.has(c.id);
  const warning = c.reason ? `
    <div class="detail-label">${c.status === "at-risk" ? "Why this could slip" : "What needs attention"}</div>
    <div class="detail-warning ${c.status}">
      <p>${escapeHtml(c.reason)}</p>
      ${c.since ? `<p class="since">${dueIn(c.daysUntilDue)} — at risk since ${escapeHtml(c.since)}</p>` : ""}
    </div>` : "";
  const nextStep = c.nextStep ? `
    <div class="detail-label">A supportive next step</div>
    <p class="detail-next">${escapeHtml(c.nextStep)}</p>
    <button class="btn btn-primary" data-plan="${c.id}" ${planned ? "disabled" : ""}>
      ${planned ? `${icon("check")}Follow-up planned` : `${icon("checkCheck")}Mark follow-up planned`}
    </button>
    ${planned ? `<p class="planned-confirmation">${icon("check", 13)}Planned for today · Status remains ${STATUS_LABEL[c.status].toLowerCase()}</p>` : ""}` : "";

  sheet.innerHTML = `
    <button class="btn-ghost sheet-close" data-close>${icon("x")}<span class="sr-only">Close</span></button>
    <div>
      <div class="engagement-tag sheet-tag">${engagementDot(c.engagement)}${escapeHtml(c.engagement)}</div>
      <h2 class="sheet-title" id="sheet-title">${escapeHtml(c.title)}</h2>
      <p class="sheet-subtitle">${escapeHtml(engagement(c.engagement).program)}</p>
    </div>
    <div class="detail-facts">
      <div><div class="detail-fact-label">Owner</div><span class="table-owner">${avatar(c.owner)}${escapeHtml(c.owner)}</span></div>
      <div>
        <div class="detail-fact-label">Due date</div>
        <span class="font-mono">${escapeHtml(c.due)}</span>
        ${c.daysUntilDue > 0 ? `<span class="days-left">Due in ${c.daysUntilDue} ${c.daysUntilDue === 1 ? "day" : "days"}</span>` : ""}
      </div>
      <div><div class="detail-fact-label">Status</div>${statusBadge(c.status)}</div>
      <div><div class="detail-fact-label">Latest work status</div>${escapeHtml(c.progress || "")}</div>
    </div>
    ${warning}
    <div class="detail-label">Captured automatically</div>
    <div class="table-source" style="margin-bottom:12px">${sourceLabel(c, 15)}</div>
    <blockquote class="source-excerpt">“${escapeHtml(c.excerpt)}”</blockquote>
    ${nextStep}`;
}

function openSheet(id) {
  state.selectedId = id;
  renderAll();
  $("detail-sheet").querySelector("[data-close]")?.focus();
}

function closeSheet() {
  state.selectedId = null;
  renderAll();
}

/* ---------- Render everything ---------- */

function renderAll() {
  renderRiskCards();
  renderOverdue();
  renderTable();
  renderSheet();
}

/* ---------- Clicks and keys ---------- */

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-open], [data-plan], [data-close], [data-nav], #commitments-toggle, #filter-reset, #sheet-overlay");
  if (!target) return;

  if (target.dataset.open) return openSheet(Number(target.dataset.open));
  if (target.dataset.plan) { state.planned.add(Number(target.dataset.plan)); return renderAll(); }
  if (target.hasAttribute("data-close") || target.id === "sheet-overlay") return closeSheet();

  if (target.id === "commitments-toggle") { state.tableOpen = !state.tableOpen; return renderTable(); }
  if (target.id === "filter-reset") { state.filters = { engagement: "all", owner: "all", status: "all" }; return renderTable(); }

  const nav = target.dataset.nav;
  if (nav === "morning") { setActiveNav("morning"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else if (nav === "work") openTable();
  else if (nav === "team") { setActiveNav("team"); $("team-column").scrollIntoView({ behavior: "smooth", block: "center" }); }
  else if (nav) openTable(nav);
});

[["filter-engagement", "engagement"], ["filter-owner", "owner"], ["filter-status", "status"]].forEach(([id, key]) => {
  $(id).addEventListener("change", (event) => { state.filters[key] = event.target.value; renderTable(); });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.selectedId !== null) closeSheet();
});

/* ---------- Start ---------- */

fillSettings();
renderEngagementNav();
renderSummary();
renderTeam();
fillFilterOptions();
renderAll();
