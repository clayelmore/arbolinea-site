/* The 60714 page: a zoomable tree of every five-digit start, and a histogram of step counts.
   Plain SVG and vanilla JavaScript, no libraries. Data comes from tree-data.json, written by
   build_tree_data.py. Without JavaScript the page keeps the static tree.svg picture. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var TARGET = "60714";
  var treeHost = document.getElementById("tree-view");
  var stepsHost = document.getElementById("steps-chart");
  if (!treeHost && !stepsHost) return;
  if (!window.fetch || !document.createElementNS) return;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function fmt(n) { return n.toLocaleString("en-US"); }
  function plural(n, one, many) { return fmt(n) + " " + (n === 1 ? one : many); }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  fetch("tree-data.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      if (treeHost) buildTree(data);
      if (stepsHost) buildSteps(data);
    })
    .catch(function () { /* keep the static picture */ });

  /* ===================================================================== */
  /* Tree                                                                   */
  /* ===================================================================== */
  function buildTree(data) {
    var W = 1000, C = 500, R = 455, DM = data.maxDepth;
    var MIN_S = 1, MAX_S = 80, LABEL_PX = 40, MAX_LABELS = 350;
    var nodes = data.nodes, byKey = {}, root = null;
    var i, n;

    // Polar position, children and leaf counts (the angle each node was given).
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      byKey[n.d] = n;
      n.kids = [];
      var dx = n.x - C, dy = n.y - C;
      n.r = Math.sqrt(dx * dx + dy * dy);
      n.a = Math.atan2(dy, dx);
      if (n.a < -Math.PI / 2) n.a += 2 * Math.PI;
      if (n.parent === null) root = n;
    }
    root.a = Math.PI / 2; root.r = 0;
    for (i = 0; i < nodes.length; i++) if (nodes[i].parent) byKey[nodes[i].parent].kids.push(nodes[i]);
    // nodes come deepest first, so leaves are summed before their parents
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      n.leaves = n.kids.length ? n.kids.reduce(function (a, k) { return a + k.leaves; }, 0) : 1;
    }
    function ringR(d) { return d <= 0 ? 0 : R * Math.pow(Math.min(d, DM) / DM, 0.8); }
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var arc = 2 * Math.PI * n.leaves / root.leaves * n.r;
      var gap = Math.min(n.r - ringR(n.depth - 1), n.depth < DM ? ringR(n.depth + 1) - n.r : Infinity);
      n.room = Math.min(arc, gap);   // free space around the dot, in drawing units
    }

    function color(d) {
      var t = d / DM;
      return "rgb(255," + Math.round(255 - 30 * t) + "," + Math.round(255 - 170 * t) + ")";
    }
    // Same curve as tree.py: turn toward the parent's direction while moving inward.
    function linkPath(s) {
      var p = byKey[s.parent], r1 = s.r, r2 = p.r, a1 = s.a, a2 = p.a;
      var m = Math.max(2, Math.floor(Math.abs(a1 - a2) * r1 / 12) + 2), pts = [];
      for (var j = 0; j <= m; j++) {
        var t = j / m, e = t * t * (3 - 2 * t), rr = r1 + (r2 - r1) * Math.pow(t, 2.2), aa = a1 + (a2 - a1) * e;
        pts.push((C + rr * Math.cos(aa)).toFixed(1) + " " + (C + rr * Math.sin(aa)).toFixed(1));
      }
      return "M" + pts.join("L");
    }

    /* ---------- DOM ---------- */
    var bar = h("div", { "class": "tree-toolbar" });
    var zin = h("button", { type: "button", "class": "tree-btn", "aria-label": "Zoom in" }, "+");
    var zout = h("button", { type: "button", "class": "tree-btn", "aria-label": "Zoom out" }, "−");
    var zreset = h("button", { type: "button", "class": "tree-btn tree-btn-wide" }, "Reset");
    var form = h("form", { "class": "tree-search", role: "search" });
    var flabel = h("label", { "for": "tree-find" }, "Find a number");
    var finput = h("input", { id: "tree-find", type: "text", inputmode: "numeric", autocomplete: "off",
      maxlength: "5", placeholder: "58196", pattern: "[0-9]{1,5}", enterkeyhint: "search" });
    var fgo = h("button", { type: "submit", "class": "tree-btn tree-btn-wide" }, "Find");
    form.appendChild(flabel); form.appendChild(finput); form.appendChild(fgo);
    bar.appendChild(zin); bar.appendChild(zout); bar.appendChild(zreset); bar.appendChild(form);

    var frame = h("div", { "class": "tree-frame" });
    var svg = el("svg", { viewBox: "0 0 1000 1000", "class": "tree-svg", tabindex: "0", role: "img",
      "aria-label": "Zoomable tree of every five-digit start flowing into 60714 at the center. Use the plus and minus keys to zoom and the arrow keys to move." }, frame);
    el("rect", { width: W, height: W, fill: "#000" }, svg);
    var world = el("g", null, svg);
    var gLinks = el("g", { "class": "tree-links" }, world);
    var gDots = el("g", { "class": "tree-dots" }, world);
    var gHl = el("g", { "class": "tree-hl" }, world);
    var core = el("circle", { cx: C, cy: C, r: 80.5, fill: "#000", stroke: "#5fd68a", "stroke-width": 4, "vector-effect": "non-scaling-stroke" }, world);
    var coreText = el("text", { x: C, y: C + 15.6, "text-anchor": "middle", "class": "tree-core-text" }, world);
    coreText.textContent = TARGET;
    var gLabels = el("g", { "class": "tree-labels", "aria-hidden": "true" }, svg);

    var panel = h("div", { "class": "tree-panel", "aria-live": "polite" });
    var idleText = "Hover over or tap a dot to see its numbers.";
    panel.textContent = idleText;

    var linkEls = [];
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n !== root) {
        n.w = 0.5 + 5.5 * Math.sqrt(n.through / root.through);
        n.link = el("path", { d: linkPath(n), stroke: color(n.depth), "vector-effect": "non-scaling-stroke" }, gLinks);
        linkEls.push(n);
      }
      el("circle", { cx: n.x, cy: n.y, r: 1.6, fill: color(n.depth) }, gDots);
    }

    treeHost.textContent = "";
    treeHost.appendChild(bar);
    treeHost.appendChild(frame);
    treeHost.appendChild(panel);
    treeHost.classList.add("is-live");
    var howto = document.querySelector(".tree-howto");
    if (howto) howto.hidden = false;

    /* ---------- view state ---------- */
    var s = 1, tx = 0, ty = 0, pxPerUnit = 0.72, dirty = false, anim = null;
    var hoverNode = null, selNode = null, selNumber = null;

    function measure() {
      var w = svg.getBoundingClientRect().width || 720;
      pxPerUnit = w / W;
      var k = Math.max(pxPerUnit, 0.45);
      for (var j = 0; j < linkEls.length; j++) linkEls[j].link.setAttribute("stroke-width", (linkEls[j].w * k).toFixed(2));
      schedule();
    }
    function clampView() {
      s = Math.min(MAX_S, Math.max(MIN_S, s));
      tx = Math.min(0, Math.max(W - W * s, tx));
      ty = Math.min(0, Math.max(W - W * s, ty));
    }
    function schedule() { if (!dirty) { dirty = true; requestAnimationFrame(render); } }

    var labelPool = [];
    function labelAt(idx) {
      var t = labelPool[idx];
      if (!t) { t = el("text", { "text-anchor": "middle" }, gLabels); labelPool[idx] = t; }
      return t;
    }
    var pathSet = {};

    function render() {
      dirty = false;
      if (anim) stepAnim();
      world.setAttribute("transform", "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ") scale(" + s.toFixed(4) + ")");
      var unit = 1 / pxPerUnit;                    // drawing units per screen pixel at s = 1
      var dotPx = Math.min(4, 1.3 * Math.sqrt(s));
      gDots.style.setProperty("--dr", (dotPx * unit / s).toFixed(4) + "px");
      gHl.style.setProperty("--dr", (dotPx * 1.9 * unit / s).toFixed(4) + "px");
      // 60714's circle keeps its on-screen size once zoomed, so the inner rings come out from under it.
      var coreScale = 1 / s;
      core.setAttribute("r", (80.5 * coreScale).toFixed(3));
      coreText.setAttribute("font-size", (46 * coreScale).toFixed(3));
      coreText.setAttribute("y", (C + 15.6 * coreScale).toFixed(3));

      // Labels: only nodes inside the view with enough room around them at this zoom.
      var fs = 11 * unit, cand = [], j, nd, sx, sy, roomPx;
      for (j = 0; j < nodes.length; j++) {
        nd = nodes[j];
        if (nd === root) continue;
        sx = nd.x * s + tx; sy = nd.y * s + ty;
        if (sx < -30 || sx > W + 30 || sy < -20 || sy > W + 20) continue;
        roomPx = nd.room * s * pxPerUnit;
        if (roomPx >= LABEL_PX || (pathSet[nd.d] && roomPx >= 14) || nd === selNode || nd === hoverNode) cand.push([nd, sx, sy, roomPx]);
      }
      if (cand.length > MAX_LABELS) {
        cand.sort(function (a, b) { return (pathSet[b[0].d] ? 1e9 : b[3]) - (pathSet[a[0].d] ? 1e9 : a[3]); });
        cand.length = MAX_LABELS;
      }
      gLabels.setAttribute("font-size", fs.toFixed(2));
      for (j = 0; j < cand.length; j++) {
        var t = labelAt(j);
        t.setAttribute("x", cand[j][1].toFixed(1));
        t.setAttribute("y", (cand[j][2] - (dotPx + 3) * unit).toFixed(1));
        t.setAttribute("class", pathSet[cand[j][0].d] ? "on-path" : "");
        t.textContent = cand[j][0].d;
        t.style.display = "";
      }
      for (; j < labelPool.length; j++) labelPool[j].style.display = "none";
      if (anim) schedule();
    }

    /* ---------- zoom and pan ---------- */
    function toUnits(clientX, clientY) {
      var b = svg.getBoundingClientRect();
      return [(clientX - b.left) / b.width * W, (clientY - b.top) / b.height * W];
    }
    function zoomAt(factor, ux, uy) {
      var ns = Math.min(MAX_S, Math.max(MIN_S, s * factor));
      tx = ux - (ux - tx) * (ns / s);
      ty = uy - (uy - ty) * (ns / s);
      s = ns; clampView(); schedule();
    }
    function animateTo(ns, cx, cy) {            // cx, cy: drawing point to put at the middle
      ns = Math.min(MAX_S, Math.max(MIN_S, ns));
      var target = { s: ns, cx: cx, cy: cy };
      if (reduceMotion) { s = ns; tx = C - cx * ns; ty = C - cy * ns; clampView(); anim = null; schedule(); return; }
      anim = { t0: performance.now(), from: { s: s, cx: (C - tx) / s, cy: (C - ty) / s }, to: target };
      schedule();
    }
    function stepAnim() {
      var k = Math.min(1, (performance.now() - anim.t0) / 450), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var a = anim.from, b = anim.to;
      s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e);
      var cx = a.cx + (b.cx - a.cx) * e, cy = a.cy + (b.cy - a.cy) * e;
      tx = C - cx * s; ty = C - cy * s; clampView();
      if (k >= 1) anim = null;
    }
    function viewCenter() { return [(C - tx) / s, (C - ty) / s]; }
    zin.addEventListener("click", function () { var c = viewCenter(); animateTo(s * 2, c[0], c[1]); });
    zout.addEventListener("click", function () { var c = viewCenter(); animateTo(s / 2, c[0], c[1]); });
    zreset.addEventListener("click", function () { animateTo(1, C, C); clearSelection(); });

    svg.addEventListener("wheel", function (e) {
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (s <= MIN_S + 1e-6 && dy > 0) return;    // fully zoomed out: let the page scroll on
      e.preventDefault();
      anim = null;
      var u = toUnits(e.clientX, e.clientY);
      zoomAt(Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015)), u[0], u[1]);
    }, { passive: false });

    svg.addEventListener("keydown", function (e) {
      var c = viewCenter(), step = 60 / s, used = true;
      if (e.key === "+" || e.key === "=") animateTo(s * 2, c[0], c[1]);
      else if (e.key === "-" || e.key === "_") animateTo(s / 2, c[0], c[1]);
      else if (e.key === "0") animateTo(1, C, C);
      else if (e.key === "ArrowLeft") animateTo(s, c[0] - step, c[1]);
      else if (e.key === "ArrowRight") animateTo(s, c[0] + step, c[1]);
      else if (e.key === "ArrowUp") animateTo(s, c[0], c[1] - step);
      else if (e.key === "ArrowDown") animateTo(s, c[0], c[1] + step);
      else used = false;
      if (used) e.preventDefault();
    });

    /* Mouse and pen: drag pans, hover shows a node, click selects. */
    var drag = null;
    svg.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      anim = null;
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, moved: false };
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      svg.classList.add("is-dragging");
    });
    svg.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      if (drag) {
        var b = svg.getBoundingClientRect(), k = W / b.width;
        var mx = e.clientX - drag.x, my = e.clientY - drag.y;
        if (Math.abs(mx) + Math.abs(my) > 4) drag.moved = true;
        tx = drag.tx + mx * k; ty = drag.ty + my * k; clampView(); schedule();
        return;
      }
      var nd = pick(e.clientX, e.clientY, 10);
      if (nd !== hoverNode) { hoverNode = nd; show(); }
    });
    function endDrag(e) {
      if (!drag) return;
      var wasClick = !drag.moved;
      drag = null;
      svg.classList.remove("is-dragging");
      if (wasClick && e.type === "pointerup") select(pick(e.clientX, e.clientY, 10), null);
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      if (hoverNode) { hoverNode = null; show(); }
    });

    /* Touch: two fingers pinch, one finger pans once zoomed in. Fully zoomed out, one finger
       is left to the page so a vertical swipe still scrolls past the picture. */
    var touch = null;
    function tdist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
    function startTouch(e) {
      var ts = e.touches;
      anim = null;
      if (ts.length >= 2) {
        e.preventDefault();
        var m = toUnits((ts[0].clientX + ts[1].clientX) / 2, (ts[0].clientY + ts[1].clientY) / 2);
        touch = { mode: "pinch", d0: tdist(ts[0], ts[1]) || 1, s0: s, wx: (m[0] - tx) / s, wy: (m[1] - ty) / s };
      } else if (ts.length === 1) {
        var zoomed = s > MIN_S + 1e-3;
        if (zoomed) e.preventDefault();
        touch = { mode: zoomed ? "pan" : "tap", x: ts[0].clientX, y: ts[0].clientY, tx: tx, ty: ty, t: Date.now(), moved: false };
      }
    }
    svg.addEventListener("touchstart", startTouch, { passive: false });
    svg.addEventListener("touchmove", function (e) {
      if (!touch) return;
      var ts = e.touches;
      if (touch.mode === "pinch" && ts.length >= 2) {
        e.preventDefault();
        var m = toUnits((ts[0].clientX + ts[1].clientX) / 2, (ts[0].clientY + ts[1].clientY) / 2);
        s = Math.min(MAX_S, Math.max(MIN_S, touch.s0 * tdist(ts[0], ts[1]) / touch.d0));
        tx = m[0] - touch.wx * s; ty = m[1] - touch.wy * s; clampView(); schedule();
      } else if (ts.length === 1) {
        var mx = ts[0].clientX - touch.x, my = ts[0].clientY - touch.y;
        if (Math.abs(mx) + Math.abs(my) > 8) touch.moved = true;
        if (touch.mode === "pan") {
          e.preventDefault();
          var k = W / svg.getBoundingClientRect().width;
          tx = touch.tx + mx * k; ty = touch.ty + my * k; clampView(); schedule();
        }
      }
    }, { passive: false });
    svg.addEventListener("touchend", function (e) {
      if (!touch) return;
      if (touch.mode === "pinch") {
        if (e.touches.length === 1) startTouch(e); else if (!e.touches.length) touch = null;
        return;
      }
      var ch = e.changedTouches[0];
      if (!touch.moved && Date.now() - touch.t < 600 && ch) {
        e.preventDefault();                        // no extra mouse events after a tap
        select(pick(ch.clientX, ch.clientY, 22), null);
      }
      touch = null;
    }, { passive: false });
    svg.addEventListener("touchcancel", function () { touch = null; });

    function pick(clientX, clientY, radiusPx) {
      var u = toUnits(clientX, clientY), wx = (u[0] - tx) / s, wy = (u[1] - ty) / s;
      if (Math.hypot(wx - C, wy - C) * s * pxPerUnit <= 80.5 * pxPerUnit) return root;
      var best = null, bd = Infinity, lim = radiusPx / (pxPerUnit * s);
      for (var j = 0; j < nodes.length; j++) {
        var dx = nodes[j].x - wx, dy = nodes[j].y - wy, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = nodes[j]; }
      }
      return Math.sqrt(bd) <= lim ? best : null;
    }

    /* ---------- selection, path and panel ---------- */
    function select(nd, number) {
      selNode = nd; selNumber = nd ? number : null;
      show();
    }
    function clearSelection() { selNode = null; selNumber = null; hoverNode = null; show(); }

    function show() {
      var nd = hoverNode || selNode, number = hoverNode && hoverNode !== selNode ? null : selNumber;
      while (gHl.firstChild) gHl.removeChild(gHl.firstChild);
      pathSet = {};
      gLinks.classList.toggle("is-dim", !!nd);
      if (!nd) { panel.textContent = idleText; schedule(); return; }
      for (var p = nd; p; p = p.parent ? byKey[p.parent] : null) {
        pathSet[p.d] = true;
        if (p.parent) el("path", { d: p.link.getAttribute("d"), "vector-effect": "non-scaling-stroke" }, gHl);
      }
      for (p = nd; p && p !== root; p = byKey[p.parent]) el("circle", { cx: p.x, cy: p.y, r: 2.5 }, gHl);
      fillPanel(nd, number);
      schedule();
    }

    function fillPanel(nd, number) {
      panel.textContent = "";
      var isRoot = nd === root, example = number || (isRoot ? TARGET : nd.d);
      var steps = number === TARGET ? 0 : (isRoot ? (number ? 1 : 0) : nd.steps);
      var head = h("p", { "class": "tree-panel-head" });
      head.appendChild(h("span", { "class": "tree-panel-key" }, "Digits"));
      head.appendChild(h("span", { "class": "tree-panel-digits" }, nd.d.split("").join(" ")));
      panel.appendChild(head);
      var ul = h("ul");
      ul.appendChild(h("li", null, number ? "Your number: " + number : "For example " + example));
      ul.appendChild(h("li", null, "Becomes " + nd.next + " after one step"));
      if (isRoot && !number) {
        ul.appendChild(h("li", null, "60714 is already there. Its other 119 arrangements reach 60714 in 1 step"));
      } else {
        ul.appendChild(h("li", null, steps === 0 ? "This is 60714 itself, so it takes 0 steps" : "Reaches 60714 in " + plural(steps, "step", "steps")));
      }
      ul.appendChild(h("li", null, "Stands for " + plural(nd.strings, "five-digit number", "five-digit numbers")));
      panel.appendChild(ul);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = finput.value.replace(/\s/g, "");
      if (!/^[0-9]{1,5}$/.test(raw)) {
        hoverNode = null; selNode = null; show();
        panel.textContent = "Type a number with up to five digits, like 58196.";
        return;
      }
      var num = ("00000" + raw).slice(-5);
      var key = num.split("").sort().reverse().join("");
      hoverNode = null;
      if (key[0] === key[4]) {
        selNode = null; show();
        panel.textContent = num + " is one repeated digit. It goes to 0 after one step and stays there, so it never reaches 60714.";
        return;
      }
      var nd = byKey[key];
      select(nd, num);
      // Close enough to read the label, but not so close that the rest of the path is lost.
      var need = nd === root ? 3 : Math.min(16, Math.max(4, (LABEL_PX * 1.2) / (nd.room * pxPerUnit)));
      animateTo(need, nd.x, nd.y);
    });

    window.__tree60714 = { state: function () { return { s: s, tx: tx, ty: ty, transform: world.getAttribute("transform"), links: gLinks.childNodes.length, path: Object.keys(pathSet) }; } };

    if (window.ResizeObserver) new ResizeObserver(measure).observe(svg);
    else window.addEventListener("resize", measure);
    measure();
  }

  /* ===================================================================== */
  /* Histogram: how many steps does it take?                                */
  /* ===================================================================== */
  function buildSteps(data) {
    var counts = data.stepCounts, total = counts.reduce(function (a, b) { return a + b; }, 0);
    var maxStep = counts.length - 1;

    // Median of all starts, from the counts.
    function nth(k) { var c = 0; for (var j = 0; j < counts.length; j++) { c += counts[j]; if (c >= k) return j; } return maxStep; }
    var lo = nth(Math.floor((total + 1) / 2)), hi = nth(Math.ceil((total + 1) / 2));
    var summary = document.getElementById("steps-summary");
    if (summary) {
      summary.textContent = (lo === hi
        ? "The median is " + plural(lo, "step", "steps") + ": half of the " + fmt(total) + " starting numbers reach 60714 in " + fmt(lo) + " steps or fewer"
        : "The median falls between " + fmt(lo) + " and " + plural(hi, "step", "steps")) +
        ", and the slowest take " + plural(maxStep, "step", "steps") + ".";
    }

    var readout = h("p", { "class": "steps-readout", "aria-live": "polite" }, "Point at or tap a bar to read its count.");
    var box = h("div", { "class": "steps-box" });
    stepsHost.textContent = "";
    stepsHost.appendChild(readout);
    stepsHost.appendChild(box);

    // Table fallback.
    var det = document.getElementById("steps-table");
    if (det) {
      var tbl = h("table");
      var thead = h("thead"), trh = h("tr");
      trh.appendChild(h("th", { scope: "col" }, "Steps")); trh.appendChild(h("th", { scope: "col" }, "Starting numbers"));
      thead.appendChild(trh); tbl.appendChild(thead);
      var tb = h("tbody");
      counts.forEach(function (c, k) {
        var tr = h("tr"); tr.appendChild(h("td", null, String(k))); tr.appendChild(h("td", null, fmt(c))); tb.appendChild(tr);
      });
      var trt = h("tr", { "class": "steps-total" }); trt.appendChild(h("td", null, "Total")); trt.appendChild(h("td", null, fmt(total)));
      tb.appendChild(trt); tbl.appendChild(tb);
      det.appendChild(tbl);
      det.hidden = false;
    }

    function niceStep(max) {
      var raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
      return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
    }
    var active = -1, bars = [];
    function setActive(k) {
      if (active >= 0 && bars[active]) bars[active].classList.remove("is-on");
      active = k;
      if (k < 0) { readout.textContent = "Point at or tap a bar to read its count."; return; }
      bars[k].classList.add("is-on");
      readout.textContent = plural(k, "step", "steps") + ": " + plural(counts[k], "starting number", "starting numbers");
    }

    function draw() {
      var Wd = Math.max(280, Math.round(box.getBoundingClientRect().width || 640));
      var Hd = Math.round(Math.min(340, Math.max(220, Wd * 0.5)));
      var ml = 70, mr = 8, mt = 12, mb = 46;
      var pw = Wd - ml - mr, ph = Hd - mt - mb;
      var ymaxData = Math.max.apply(null, counts), st = niceStep(ymaxData), ymax = Math.ceil(ymaxData / st) * st;
      box.textContent = "";
      bars = [];
      var svg = el("svg", { viewBox: "0 0 " + Wd + " " + Hd, width: Wd, height: Hd, "class": "steps-svg", role: "img",
        "aria-label": "Bar chart of how many of the " + fmt(total) + " starting numbers need each number of steps, from 0 to " + maxStep + ". The table below has every count." });
      box.appendChild(svg);
      var y = function (v) { return mt + ph - v / ymax * ph; };
      for (var v = 0; v <= ymax + 1e-9; v += st) {
        el("line", { x1: ml, x2: ml + pw, y1: y(v), y2: y(v), "class": v === 0 ? "steps-axis" : "steps-grid" }, svg);
        var tl = el("text", { x: ml - 8, y: y(v) + 4, "text-anchor": "end", "class": "steps-tick" }, svg);
        tl.textContent = fmt(v);
      }
      var bw = pw / counts.length;
      counts.forEach(function (c, k) {
        var x = ml + k * bw, bh = c ? Math.max(1, c / ymax * ph) : 0;
        var g = el("g", { "class": "steps-bar" }, svg);
        var r = el("rect", { x: (x + bw * 0.12).toFixed(2), y: (mt + ph - bh).toFixed(2), width: (bw * 0.76).toFixed(2), height: bh.toFixed(2) }, g);
        var hit = el("rect", { x: x.toFixed(2), y: mt, width: bw.toFixed(2), height: ph, "class": "steps-hit" }, g);
        var title = el("title", null, g);
        title.textContent = plural(k, "step", "steps") + ": " + plural(c, "starting number", "starting numbers");
        bars.push(r);
        hit.addEventListener("pointerenter", function () { setActive(k); });
        hit.addEventListener("pointerdown", function () { setActive(k); });
        if (k % 5 === 0) {
          var xl = el("text", { x: (x + bw / 2).toFixed(2), y: mt + ph + 18, "text-anchor": "middle", "class": "steps-tick" }, svg);
          xl.textContent = String(k);
        }
      });
      svg.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") setActive(-1); });
      var xt = el("text", { x: ml + pw / 2, y: Hd - 6, "text-anchor": "middle", "class": "steps-title" }, svg);
      xt.textContent = "steps";
      var yt = el("text", { x: 0, y: 0, "text-anchor": "middle", "class": "steps-title",
        transform: "translate(13 " + (mt + ph / 2) + ") rotate(-90)" }, svg);
      yt.textContent = "starting numbers";
      if (active >= 0) { var k0 = active; active = -1; setActive(k0); }
    }
    var lastW = 0;
    function maybeDraw() {
      var w = Math.round(box.getBoundingClientRect().width);
      if (w && w !== lastW) { lastW = w; draw(); }
    }
    if (window.ResizeObserver) new ResizeObserver(maybeDraw).observe(box);
    else window.addEventListener("resize", maybeDraw);
    draw();
  }
})();
