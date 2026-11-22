/* =========================================================
   Ahead — charts
   Small hand-drawn SVG charts, no libraries. Follows the data-viz
   rules in DESIGN.md: thin marks, hairline grid, a legend for two or
   more series, selective direct labels, a hover/focus tooltip, and a
   "Show as table" view for every chart.
   ========================================================= */

const Viz = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const INK = { primary: "#1F2328", secondary: "#5B6470", muted: "#898781", grid: "#ECEDEF", axis: "#C9CDD3", surface: "#FFFFFF" };

  /* ---------- tiny DOM helpers (text always via textContent) ---------- */

  function svgEl(tag, attrs = {}, parent) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.appendChild(el);
    return el;
  }
  function text(parent, x, y, str, attrs = {}) {
    const t = svgEl("text", { x, y, "font-size": 12, fill: INK.muted, ...attrs }, parent);
    t.textContent = str;
    return t;
  }

  /* ---------- one shared tooltip ---------- */

  let tip;
  function showTip(clientX, clientY, title, rows) {
    if (!tip) { tip = document.createElement("div"); tip.className = "viz-tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip); }
    tip.replaceChildren();
    const h = document.createElement("div"); h.className = "viz-tip-title"; h.textContent = title; tip.appendChild(h);
    rows.forEach((r) => {
      const row = document.createElement("div"); row.className = "viz-tip-row";
      const key = document.createElement("span"); key.className = `viz-key ${r.shape || "line"}`; key.style.background = r.color;
      const val = document.createElement("strong"); val.textContent = r.value;
      const name = document.createElement("span"); name.className = "viz-tip-name"; name.textContent = r.name;
      row.append(key, val, name); tip.appendChild(row);
    });
    tip.hidden = false;
    const pad = 14, w = tip.offsetWidth, hgt = tip.offsetHeight;
    let x = clientX + pad, y = clientY - hgt - pad;
    if (x + w > innerWidth - 8) x = clientX - w - pad;
    if (y < 8) y = clientY + pad;
    tip.style.left = `${x}px`; tip.style.top = `${y}px`;
  }
  function hideTip() { if (tip) tip.hidden = true; }

  /* ---------- table view twin ---------- */

  function tableView(el, headers, rows) {
    const d = document.createElement("details"); d.className = "viz-table";
    const s = document.createElement("summary"); s.textContent = "Show as table"; d.appendChild(s);
    const t = document.createElement("table");
    const tr = t.createTHead().insertRow();
    headers.forEach((h) => { const th = document.createElement("th"); th.textContent = h; tr.appendChild(th); });
    const body = t.createTBody();
    rows.forEach((r) => { const row = body.insertRow(); r.forEach((c) => { row.insertCell().textContent = c; }); });
    d.appendChild(t);
    el.appendChild(d);
  }

  /* ---------- legend (always for 2+ series) ---------- */

  function legend(el, items) {
    if (items.length < 2) return;
    const lg = document.createElement("div"); lg.className = "viz-legend";
    items.forEach((it) => {
      const span = document.createElement("span");
      const key = document.createElement("i"); key.className = `viz-key ${it.shape}`; key.style.background = it.color;
      span.append(key, document.createTextNode(it.name));
      lg.appendChild(span);
    });
    el.appendChild(lg);
  }

  /* ---------- frame: sizes the plot to its box ---------- */

  function frame(el, margin) {
    el.replaceChildren();
    const plot = document.createElement("div"); plot.className = "viz-plot"; el.appendChild(plot);
    return { plot, margin };
  }
  function makeSvg(plot, margin, label) {
    const W = Math.max(200, plot.clientWidth), H = Math.max(120, plot.clientHeight);
    const svg = svgEl("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": label, tabindex: 0 }, plot);
    return { svg, W, H, x0: margin.l, x1: W - margin.r, y0: H - margin.b, y1: margin.t };
  }
  function yGrid(svg, g, ticks, scaleY, fmt) {
    ticks.forEach((v) => {
      const y = scaleY(v);
      svgEl("line", { x1: g.x0, x2: g.x1, y1: y, y2: y, stroke: v === 0 ? INK.axis : INK.grid, "stroke-width": 1 }, svg);
      text(svg, g.x0 - 8, y + 4, fmt(v), { "text-anchor": "end", style: "font-variant-numeric: tabular-nums" });
    });
  }

  /* ---------- line chart: trend over time, one or more series ---------- */

  function line(el, { labels, series, yMax = 100, ticks = [0, 50, 100], fmt = (v) => `${v}%`, label, unit = "" }) {
    const { plot } = frame(el);
    legend(el, series.map((s) => ({ name: s.name, color: s.color, shape: "line" })));
    tableView(el, ["Week", ...series.map((s) => s.name)], labels.map((l, i) => [l, ...series.map((s) => fmt(s.values[i]))]));

    const draw = () => {
      plot.replaceChildren();
      const g = makeSvg(plot, { l: 44, r: 92, t: 12, b: 26 }, label);
      const { svg } = g;
      const inset = 18;   // keeps the first and last week label clear of the edges
      const sx = (i) => g.x0 + inset + (i * (g.x1 - g.x0 - inset * 2)) / (labels.length - 1);
      const sy = (v) => g.y0 - (v / yMax) * (g.y0 - g.y1);
      yGrid(svg, g, ticks, sy, fmt);
      const every = (sx(1) - sx(0)) < 52 ? 2 : 1;
      labels.forEach((l, i) => { if ((labels.length - 1 - i) % every === 0) text(svg, sx(i), g.y0 + 18, l, { "text-anchor": "middle" }); });

      series.forEach((s) => {
        const d = s.values.map((v, i) => `${i ? "L" : "M"}${sx(i)},${sy(v)}`).join("");
        if (series.length === 1) svgEl("path", { d: `${d}L${sx(s.values.length - 1)},${g.y0}L${sx(0)},${g.y0}Z`, fill: s.color, opacity: 0.1 }, svg);
        svgEl("path", { d, fill: "none", stroke: s.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
        const last = s.values.length - 1;
        svgEl("circle", { cx: sx(last), cy: sy(s.values[last]), r: 4, fill: s.color, stroke: INK.surface, "stroke-width": 2 }, svg);
        // Direct end label: name + latest value, in text ink (never the series color)
        const t = text(svg, sx(last) + 10, sy(s.values[last]) + 4, `${s.name} ${fmt(s.values[last])}`, { fill: INK.primary, "font-weight": 500 });
        t.dataset.y = sy(s.values[last]);
      });
      // If two end labels would collide, drop them and let the legend + tooltip carry it
      const ends = [...svg.querySelectorAll("text[data-y]")].map((t) => +t.dataset.y).sort((a, b) => a - b);
      if (ends.some((y, i) => i && y - ends[i - 1] < 16)) svg.querySelectorAll("text[data-y]").forEach((t) => t.remove());

      // Crosshair + tooltip: snaps to the nearest week; arrow keys do the same
      const cross = svgEl("line", { y1: g.y1, y2: g.y0, stroke: INK.axis, "stroke-width": 1, visibility: "hidden" }, svg);
      const hit = svgEl("rect", { x: g.x0 - 12, y: 0, width: g.x1 - g.x0 + 24, height: g.H, fill: "transparent" }, svg);
      let idx = labels.length - 1;
      const show = (i, cx, cy) => {
        idx = i; cross.setAttribute("x1", sx(i)); cross.setAttribute("x2", sx(i)); cross.setAttribute("visibility", "visible");
        const box = svg.getBoundingClientRect();
        showTip(cx ?? box.left + sx(i), cy ?? box.top + g.y1 + 20, `Week of ${labels[i]}`,
          series.map((s) => ({ color: s.color, name: s.name + unit, value: fmt(s.values[i]), shape: "line" })));
      };
      hit.addEventListener("pointermove", (e) => {
        const box = svg.getBoundingClientRect();
        const i = Math.round(((e.clientX - box.left - g.x0) / (g.x1 - g.x0)) * (labels.length - 1));
        show(Math.max(0, Math.min(labels.length - 1, i)), e.clientX, e.clientY);
      });
      hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); hideTip(); });
      svg.addEventListener("focus", () => show(idx));
      svg.addEventListener("blur", () => { cross.setAttribute("visibility", "hidden"); hideTip(); });
      svg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(Math.max(0, idx - 1));
        if (e.key === "ArrowRight") show(Math.min(labels.length - 1, idx + 1));
      });
    };
    register(plot, draw);
  }

  /* ---------- columns: "done" filled over a "planned" track ---------- */

  function columns(el, { labels, track, fill, label, stacked }) {
    const { plot } = frame(el);
    const layers = stacked || [fill];
    legend(el, stacked ? stacked.map((s) => ({ name: s.name, color: s.color, shape: "rect" }))
                       : [{ name: fill.name, color: fill.color, shape: "rect" }, { name: track.name, color: track.color, shape: "rect" }]);
    tableView(el, ["Week", ...(stacked ? stacked.map((s) => s.name) : [fill.name, track.name])],
      labels.map((l, i) => [l, ...(stacked ? stacked.map((s) => s.values[i]) : [fill.values[i], track.values[i]])]));

    const totals = labels.map((_, i) => stacked ? stacked.reduce((a, s) => a + s.values[i], 0) : track.values[i]);
    const max = Math.max(...totals);
    const yMax = Math.ceil(max / 2) * 2 || 2;

    const draw = () => {
      plot.replaceChildren();
      const g = makeSvg(plot, { l: 44, r: 12, t: 22, b: 26 }, label);
      const { svg } = g;
      const band = (g.x1 - g.x0) / labels.length;
      const bw = Math.min(24, band * 0.5);
      const sy = (v) => g.y0 - (v / yMax) * (g.y0 - g.y1);
      yGrid(svg, g, [0, yMax / 2, yMax], sy, (v) => String(v));
      const R = 4;
      // A column path with a 4px rounded top and a square base
      const col = (x, yTop, yBase, color, round = true) => {
        const h = yBase - yTop; if (h <= 0) return null;
        const r = round ? Math.min(R, h, bw / 2) : 0;
        return svgEl("path", { d: `M${x},${yBase}V${yTop + r}Q${x},${yTop} ${x + r},${yTop}H${x + bw - r}Q${x + bw},${yTop} ${x + bw},${yTop + r}V${yBase}Z`, fill: color }, svg);
      };
      const every = band < 52 ? 2 : 1;
      labels.forEach((l, i) => {
        const x = g.x0 + band * i + (band - bw) / 2;
        if ((labels.length - 1 - i) % every === 0) text(svg, x + bw / 2, g.y0 + 18, l, { "text-anchor": "middle" });
        const marks = [];
        if (stacked) {
          let acc = 0;
          stacked.forEach((s, k) => {
            const v = s.values[i]; if (!v) return;
            const top = sy(acc + v), base = sy(acc) - (acc ? 2 : 0);   // 2px surface gap between segments
            const isTop = stacked.slice(k + 1).every((n) => !n.values[i]);
            marks.push(col(x, top, base, s.color, isTop));
            acc += v;
          });
        } else {
          marks.push(col(x, sy(track.values[i]), g.y0, track.color));
          marks.push(col(x, sy(fill.values[i]), g.y0, fill.color, true));
        }
        // Value at the cap, only for the latest week (selective labels)
        if (i === labels.length - 1) {
          const v = stacked ? totals[i] : `${fill.values[i]} of ${track.values[i]}`;
          text(svg, x + bw / 2, sy(totals[i]) - 6, String(v), { "text-anchor": "middle", fill: INK.primary, "font-weight": 500 });
        }
        // Per-column hit target, wider than the mark
        const hit = svgEl("rect", { x: g.x0 + band * i, y: g.y1, width: band, height: g.y0 - g.y1, fill: "transparent", tabindex: 0 }, svg);
        const rows = stacked ? stacked.map((s) => ({ color: s.color, name: s.name, value: String(s.values[i]), shape: "rect" }))
                             : [{ color: fill.color, name: fill.name, value: String(fill.values[i]), shape: "rect" },
                                { color: track.color, name: track.name, value: String(track.values[i]), shape: "rect" }];
        const on = (cx, cy) => { marks.forEach((m) => m && m.setAttribute("opacity", 0.8)); showTip(cx, cy, `Week of ${l}`, rows); };
        const off = () => { marks.forEach((m) => m && m.removeAttribute("opacity")); hideTip(); };
        hit.addEventListener("pointermove", (e) => on(e.clientX, e.clientY));
        hit.addEventListener("pointerleave", off);
        hit.addEventListener("focus", () => { const b = hit.getBoundingClientRect(); on(b.left + b.width / 2, b.top + 20); });
        hit.addEventListener("blur", off);
      });
    };
    register(plot, draw);
  }

  /* ---------- sparkline: a small static trend for a stat tile ---------- */

  function spark(values, { color = "#2a78d6", width = 96, height = 28, yMax = 100 } = {}) {
    const n = values.length;
    const sx = (i) => 2 + (i * (width - 8)) / (n - 1);
    const sy = (v) => height - 3 - (v / yMax) * (height - 6);
    const d = values.map((v, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join("");
    return `<svg class="spark" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <path d="${d}" fill="none" stroke="#B8BDC5" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${sx(n - 1)}" cy="${sy(values[n - 1])}" r="4" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
  }

  /* ---------- redraw on resize ---------- */

  const drawn = new Map();
  function register(plot, draw) { drawn.set(plot, draw); requestAnimationFrame(draw); }
  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => drawn.forEach((draw, plot) => { if (plot.isConnected) { if (plot.offsetParent) draw(); } else drawn.delete(plot); }), 120);
  });

  return { line, columns, spark, hideTip, showTip };
})();
