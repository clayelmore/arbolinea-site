/* PLUed help: contents tree, breadcrumbs, On this page, previous and next, search.
   Works on DITA-OT HTML5 pages built with nav-toc=full and processed by theme/postbuild.py,
   which adds the top bar, the page shell and <meta name="ph-root">. */
(function () {
  'use strict';

  var root = (document.querySelector('meta[name="ph-root"]') || {}).content || '';
  var toc = document.querySelector('nav.toc');

  function text(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function samePage(a) {
    try { return new URL(a.getAttribute('href'), location.href).pathname === location.pathname; }
    catch (e) { return false; }
  }

  /* ---- Contents tree: twisties, open the path to the current page ---- */
  var current = null;
  if (toc) {
    toc.querySelectorAll('ul').forEach(function (ul) { if (!ul.children.length) ul.remove(); });
    toc.querySelectorAll('li').forEach(function (li) {
      var head = li.firstElementChild;
      if (!head || head.tagName === 'UL') return;
      var row = document.createElement('div');
      row.className = 'ph-row';
      li.insertBefore(row, head);
      var sub = li.querySelector(':scope > ul');
      if (sub) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ph-twisty';
        b.setAttribute('aria-label', 'Show or hide ' + text(head));
        b.addEventListener('click', function () {
          li.classList.toggle('is-open');
          b.setAttribute('aria-expanded', li.classList.contains('is-open'));
        });
        row.appendChild(b);
      } else {
        var s = document.createElement('span');
        s.className = 'ph-spacer';
        row.appendChild(s);
      }
      row.appendChild(head);
      if (head.tagName === 'SPAN' && sub) {
        head.style.cursor = 'pointer';
        head.addEventListener('click', function () { li.classList.toggle('is-open'); });
      }
    });
    toc.querySelectorAll('a').forEach(function (a) {
      if (!current && samePage(a)) current = a.closest('li');
    });
    if (current) {
      current.classList.add('active');
      var p = current;
      while (p && p !== toc) {
        if (p.tagName === 'LI') p.classList.add('is-open');
        p = p.parentElement;
      }
      var link = current.querySelector(':scope > .ph-row > a');
      if (link) link.scrollIntoView({ block: 'center' });
      window.scrollTo(0, 0);
    } else {
      toc.querySelectorAll(':scope > ul > li').forEach(function (li) { li.classList.add('is-open'); });
    }
  }

  /* ---- Breadcrumbs ---- */
  var h1 = document.querySelector('article h1');
  var crumbs = document.querySelector('.ph-crumbs');
  if (crumbs && current) {
    var trail = [];
    var li = current.parentElement && current.parentElement.closest('li');
    while (li && toc.contains(li)) {
      var head = li.querySelector(':scope > .ph-row > a, :scope > .ph-row > span');
      if (head) trail.unshift(head);
      li = li.parentElement && li.parentElement.closest('li');
    }
    trail.forEach(function (h) {
      var el = document.createElement(h.tagName === 'A' ? 'a' : 'span');
      if (h.tagName === 'A') el.href = h.getAttribute('href');
      el.textContent = text(h);
      crumbs.appendChild(el);
    });
    if (!trail.length) crumbs.remove();
  } else if (crumbs) {
    crumbs.remove();
  }

  /* ---- On this page ---- */
  var onpage = document.querySelector('.ph-onpage');
  if (onpage) {
    var heads = document.querySelectorAll('article h2.sectiontitle');
    if (heads.length < 2) {
      onpage.remove();
    } else {
      var ul = document.createElement('ul');
      heads.forEach(function (h, i) {
        var target = h.id ? h : (h.closest('section, .section, div') || h);
        if (!target.id) target.id = 'ph-sec-' + i;
        var a = document.createElement('a');
        a.href = '#' + target.id;
        a.textContent = text(h);
        var item = document.createElement('li');
        item.appendChild(a);
        ul.appendChild(item);
      });
      onpage.appendChild(ul);
    }
  }

  /* ---- Previous and next, in contents order ---- */
  var pager = document.querySelector('.ph-pager');
  if (pager && toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var at = links.findIndex(samePage);
    function add(a, cls, label) {
      if (!a) { pager.appendChild(document.createElement('span')); return; }
      var x = document.createElement('a');
      x.className = cls;
      x.href = a.getAttribute('href');
      x.innerHTML = '<small></small>';
      x.firstChild.textContent = label;
      x.appendChild(document.createTextNode(text(a)));
      pager.appendChild(x);
    }
    if (at >= 0) {
      add(links[at - 1], 'ph-prev', 'Previous');
      add(links[at + 1], 'ph-next', 'Next');
    } else {
      pager.remove();
    }
  }

  /* ---- Contents button on narrow screens ---- */
  var menu = document.querySelector('.ph-menu');
  if (menu) menu.addEventListener('click', function () {
    document.body.classList.toggle('ph-toc-open');
    menu.setAttribute('aria-expanded', document.body.classList.contains('ph-toc-open'));
  });

  /* ---- Search over the build's index (search-index.js sets window.PH_INDEX) ---- */
  var input = document.querySelector('.ph-search input');
  var list = document.querySelector('.ph-results');
  var data = window.PH_INDEX || [];
  if (input && list) {
    var active = -1;
    function score(item, words) {
      var t = item.t.toLowerCase(), b = item.b;
      var s = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (t.indexOf(w) >= 0) s += 10;
        else if (b.indexOf(w) >= 0) s += 1;
        else return 0;
      }
      return s;
    }
    function snippet(item, w) {
      var i = item.b.indexOf(w);
      if (i < 0) return item.d || '';
      var start = Math.max(0, i - 40);
      return (start ? '... ' : '') + item.b.slice(start, i + 90) + ' ...';
    }
    function render() {
      var q = input.value.toLowerCase().trim();
      list.innerHTML = '';
      active = -1;
      if (q.length < 2) { list.hidden = true; return; }
      var words = q.split(/\s+/);
      var hits = data.map(function (it) { return { it: it, s: score(it, words) }; })
        .filter(function (h) { return h.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 8);
      if (!hits.length) {
        var none = document.createElement('li');
        none.className = 'ph-none';
        none.textContent = 'No topics match.';
        list.appendChild(none);
      }
      hits.forEach(function (h) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = root + h.it.u;
        a.textContent = h.it.t;
        var small = document.createElement('small');
        small.textContent = snippet(h.it, words[0]);
        a.appendChild(small);
        li.appendChild(a);
        list.appendChild(li);
      });
      list.hidden = false;
    }
    function move(d) {
      var items = list.querySelectorAll('a');
      if (!items.length) return;
      if (active >= 0) items[active].classList.remove('is-active');
      active = (active + d + items.length) % items.length;
      items[active].classList.add('is-active');
    }
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var items = list.querySelectorAll('a');
        if (items.length) location.href = items[Math.max(active, 0)].href;
      } else if (e.key === 'Escape') { list.hidden = true; }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.ph-search')) list.hidden = true;
    });
  }
})();
