/* =========================================================
   Ahead — content
   Everything the page shows lives in this file.
   Edit the text between the backticks or quotes, save, and
   the live site updates in about a minute.
   ========================================================= */

const SETTINGS = {
  today: "Monday, 16 November 2026",
  /* The time the sample day is frozen at (24-hour clock). The plan
     compares each item's "by" time against it to say whether a part
     of the day is ahead or behind. */
  now: "10:40",
  firmName: "Linden Advisory",
  leadName: "Alex",
  leadFullName: "Alex Lee",
  leadInitials: "AL",
  leadRole: "Team lead · Advisory",
  footer: "Sample scenario · Commitments picked up automatically from meetings, emails and chats · Runs inside Linden Advisory’s approved environment",
};

/* The people on the team. The "id" must match the "owner"
   used in the commitments below. */
const TEAM = [
  { id: "Priya", fullName: "Priya Shah", initials: "PS", role: "Analyst",
    note: "A quick check-in could help." },
  { id: "Marcus", fullName: "Marcus Chen", initials: "MC", role: "Analyst",
    note: "Worth a priorities check-in." },
];

/* ---------- Demo only: fake account connections (Profile page) ----------
   Nothing is really connected. Clicking "Connect" waits a moment and then
   shows it as connected; "Scan" then "finds" the items in FOUND_IN_SCAN. */
const SOURCES = [
  { id: "outlook", name: "Outlook email", detail: "Finds promises with a date in emails you send and receive" },
  { id: "teams", name: "Teams meetings and chats", detail: "Finds who agreed to what in meetings and team chats" },
  { id: "calendar", name: "Outlook calendar", detail: "Fits step-ins around your meetings" },
];

/* What the fake scan "finds". Accepting one adds it to the app.
   kind: "commitment" = an analyst's work (joins All commitments, the team
         pages and that analyst's own view); "task" = the lead's own to-do
         (joins today's plan).
   stepIn: optional; a step-in that also joins today's plan. */
const FOUND_IN_SCAN = [
  {
    kind: "commitment", id: 101, title: "Updated data request list",
    owner: "Marcus", engagement: "Northwind Retail", status: "on-track",
    due: "Wed, 18 Nov", daysUntilDue: 2, source: "Mon email from the Northwind CFO", sourceType: "email",
    excerpt: "Marcus, could you send the updated data request list by Wednesday?",
    progress: "Not started yet",
  },
  {
    kind: "commitment", id: 102, title: "Steering committee pre-read",
    owner: "Priya", engagement: "Northwind Retail", status: "on-track",
    due: "Thu, 19 Nov", daysUntilDue: 3, source: "Mon Teams chat", sourceType: "chat",
    excerpt: "Priya will pull together the pre-read pack for Thursday’s steering committee.",
    progress: "Not started yet",
  },
  {
    kind: "commitment", id: 103, title: "Evidence walkthrough with Harbor IT",
    owner: "Marcus", engagement: "Harbor Health", status: "at-risk",
    due: "Tue, 17 Nov", daysUntilDue: 1, source: "Mon morning stand-up", sourceType: "meeting",
    excerpt: "Marcus to walk Harbor IT through the evidence pack by Tuesday.",
    progress: "Waiting on Harbor IT to confirm a time",
    reason: "Due tomorrow and Harbor IT hasn’t confirmed a time yet.", since: "this morning",
    nextStep: "Check with Marcus whether to ask the Harbor PM to book the time.",
    stepIn: { part: "afternoon", by: "14:30", title: "Quick check with Marcus: Harbor IT walkthrough time" },
  },
  {
    kind: "task", id: "t104", title: "Send the updated workplan to the partner",
    part: "evening", by: "17:45", source: "Mon email from the engagement partner", sourceType: "email",
    excerpt: "Alex, can you send me the updated workplan before you log off today?",
  },
];

/* The three parts of the day on the Today page (24-hour clock). */
const DAY_PARTS = [
  { id: "morning", name: "Morning", start: "08:00", end: "12:00" },
  { id: "afternoon", name: "Afternoon", start: "12:00", end: "17:00" },
  { id: "evening", name: "Evening", start: "17:00", end: "20:00" },
];

/* What the team lead has to get done by end of day, in order.
   part:        "morning", "afternoon" or "evening"
   by:          the time it should be done by (24-hour clock)
   done:        true if it is already ticked off in the sample
   commitment:  for a check-in, the id of the commitment it is about
                (its reason, due date and source come from there)
   note:        for the lead's own tasks, one line of context */
const TODAY_PLAN = [
  { id: "p1", part: "morning", by: "09:00", done: true, commitment: 5,
    title: "Agree a new send date with Priya for the request list" },
  { id: "p2", part: "morning", by: "09:30", done: false, commitment: 3,
    title: "Ask the client for the missing sales export" },
  { id: "p3", part: "morning", by: "11:30", done: false,
    title: "Finish the Northwind steering committee storyline",
    note: "Northwind Retail · from Fri partner email" },
  { id: "p4", part: "afternoon", by: "13:00", done: false, commitment: 4,
    title: "15-min check-in with Priya: agree a review-ready outline" },
  { id: "p5", part: "afternoon", by: "14:00", done: false,
    title: "Partner check-in on Harbor Health readiness",
    note: "Harbor Health · meeting at 2 pm" },
  { id: "p6", part: "afternoon", by: "15:30", done: false, commitment: 2,
    title: "15-min check-in with Marcus: what can move this week" },
  { id: "p7", part: "afternoon", by: "16:30", done: false,
    title: "Reply to the Harbor Health CFO about the workshop date",
    note: "Harbor Health · from this morning's email" },
  { id: "p8", part: "evening", by: "17:30", done: false, commitment: 1,
    title: "Check in with Priya on the process map draft" },
  { id: "p9", part: "evening", by: "18:30", done: false,
    title: "Plan tomorrow's must-dos",
    note: "10 minutes before you log off" },
];

/* Sample history for the Progress charts: the last six full weeks, oldest
   first. Each list has one number per week, in the same order as "weeks".
   team:      per person, how many commitments were due that week and how
              many were delivered on time
   lead:      the step-ins the lead planned and did each week
   flagged:   work the app flagged as at risk that week, split into
              "caughtEarly" (delivered on time after a step-in) and
              "slipped" (delivered late anyway) */
const HISTORY = {
  weeks: ["5 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov", "9 Nov"],
  team: {
    Priya:  { due: [5, 4, 6, 5, 6, 5], onTime: [5, 4, 5, 4, 4, 3] },
    Marcus: { due: [4, 5, 4, 6, 5, 7], onTime: [3, 4, 4, 5, 4, 6] },
  },
  lead: { planned: [3, 4, 3, 5, 4, 6], done: [3, 3, 3, 4, 4, 5] },
  flagged: { caughtEarly: [1, 2, 1, 2, 2, 3], slipped: [1, 1, 0, 1, 1, 1] },
};

/* Chart colors, one per person (from the validated data-viz palette:
   blue, then orange). Add the next slot for a third person. */
const PERSON_COLOR = { Priya: "#2a78d6", Marcus: "#eb6834" };

/* Client engagements. "dot" picks the color dot ("northwind"
   or "harbor", defined in styles.css). */
const ENGAGEMENTS = [
  { name: "Northwind Retail", program: "Finance transformation", dot: "northwind" },
  { name: "Harbor Health", program: "Audit readiness", dot: "harbor" },
];

/* Every commitment.
   status:       "at-risk", "on-track" or "overdue"
   sourceType:   "meeting", "email" or "chat"
   daysUntilDue: negative means overdue (e.g. -3 = 3 days overdue)
   reason / since / nextStep are only needed for at-risk or overdue items. */
const COMMITMENTS = [
  {
    id: 1,
    title: "Finance process mapping",
    owner: "Priya",
    engagement: "Northwind Retail",
    status: "at-risk",
    due: "Tue, 24 Nov",
    daysUntilDue: 8,
    source: "Thu team check-in",
    sourceType: "meeting",
    excerpt: "Priya to complete the current-state finance process map and share a draft by Tuesday, 24 November.",
    progress: "Draft in progress",
    reason: "No progress update in 3 days, with the draft due in 8 days.",
    since: "today",
    nextStep: "Check in with Priya about the draft and any blockers.",
  },
  {
    id: 2,
    title: "Controls evidence pack",
    owner: "Marcus",
    engagement: "Harbor Health",
    status: "at-risk",
    due: "Thu, 19 Nov",
    daysUntilDue: 3,
    source: "Fri resourcing chat",
    sourceType: "chat",
    excerpt: "Marcus will assemble the controls evidence pack for Thursday, alongside the Northwind reconciliation work.",
    progress: "Evidence being collected",
    reason: "Marcus has 5 deliverables across both engagements this week; two are due Thursday.",
    since: "Friday",
    nextStep: "Check with Marcus which work can be reprioritized.",
  },
  {
    id: 3,
    title: "Revenue reconciliation",
    owner: "Marcus",
    engagement: "Northwind Retail",
    status: "at-risk",
    due: "Tue, 17 Nov",
    daysUntilDue: 1,
    source: "Fri client email",
    sourceType: "email",
    excerpt: "Please reconcile October revenue by Tuesday. The client will send the missing sales export on Friday.",
    progress: "Waiting on client data",
    reason: "The client’s sales export was expected Friday and hasn’t arrived.",
    since: "this morning",
    nextStep: "Ask the client for the missing sales export today.",
  },
  {
    id: 4,
    title: "Audit readiness assessment",
    owner: "Priya",
    engagement: "Harbor Health",
    status: "at-risk",
    due: "Wed, 18 Nov",
    daysUntilDue: 2,
    source: "Thu planning call",
    sourceType: "meeting",
    excerpt: "Priya to prepare the assessment draft for Wednesday. Manager review is booked for Tuesday at 2 pm.",
    progress: "Initial findings drafted",
    reason: "The manager review is tomorrow, one day before Priya’s draft is due.",
    since: "yesterday",
    nextStep: "Agree an earlier review-ready outline with Priya.",
  },
  {
    id: 5,
    title: "Request list for missing evidence",
    owner: "Priya",
    engagement: "Harbor Health",
    status: "overdue",
    due: "Fri, 13 Nov",
    daysUntilDue: -3,
    source: "Tue client call",
    sourceType: "meeting",
    excerpt: "Priya will send the consolidated missing-evidence request list by Friday.",
    progress: "Awaiting final checks",
    reason: "The request list was due Friday and hasn’t been marked complete.",
    nextStep: "Check with Priya and agree a new send date.",
  },
  {
    id: 6,
    title: "Stakeholder interview summary",
    owner: "Priya",
    engagement: "Northwind Retail",
    status: "on-track",
    due: "Tue, 17 Nov",
    daysUntilDue: 1,
    source: "Fri team chat",
    sourceType: "chat",
    excerpt: "Priya to consolidate stakeholder interview notes for Tuesday.",
    progress: "Summary ready for review",
  },
  {
    id: 7,
    title: "Month-end close baseline",
    owner: "Marcus",
    engagement: "Northwind Retail",
    status: "on-track",
    due: "Wed, 18 Nov",
    daysUntilDue: 2,
    source: "Thu client call",
    sourceType: "meeting",
    excerpt: "Marcus will document the month-end close baseline by Wednesday.",
    progress: "Analysis in progress",
  },
  {
    id: 8,
    title: "Control owner matrix",
    owner: "Marcus",
    engagement: "Harbor Health",
    status: "on-track",
    due: "Fri, 20 Nov",
    daysUntilDue: 4,
    source: "Fri manager email",
    sourceType: "email",
    excerpt: "Please have the control owner matrix ready for Friday, Marcus.",
    progress: "Owners confirmed",
  },
  {
    id: 9,
    title: "Transformation workshop agenda",
    owner: "Priya",
    engagement: "Northwind Retail",
    status: "on-track",
    due: "Thu, 19 Nov",
    daysUntilDue: 3,
    source: "Fri planning chat",
    sourceType: "chat",
    excerpt: "Priya to circulate the workshop agenda on Thursday.",
    progress: "Agenda drafted",
  },
  {
    id: 10,
    title: "Sample testing tracker",
    owner: "Marcus",
    engagement: "Harbor Health",
    status: "on-track",
    due: "Fri, 20 Nov",
    daysUntilDue: 4,
    source: "Thu audit check-in",
    sourceType: "meeting",
    excerpt: "Marcus will update the sample testing tracker by Friday.",
    progress: "Testing underway",
  },
  {
    id: 11,
    title: "Finance systems inventory",
    owner: "Priya",
    engagement: "Northwind Retail",
    status: "on-track",
    due: "Mon, 23 Nov",
    daysUntilDue: 7,
    source: "Fri client email",
    sourceType: "email",
    excerpt: "Priya will compile the finance systems inventory for next Monday.",
    progress: "Inputs collected",
  },
  {
    id: 12,
    title: "Readiness workshop notes",
    owner: "Priya",
    engagement: "Harbor Health",
    status: "on-track",
    due: "Tue, 24 Nov",
    daysUntilDue: 8,
    source: "Fri workshop",
    sourceType: "meeting",
    excerpt: "Priya to consolidate the readiness workshop notes by Tuesday next week.",
    progress: "Notes being consolidated",
  },
];
