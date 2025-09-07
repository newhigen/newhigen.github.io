/* Lightweight horizontal overflow debugger
 * Usage: append ?overflowDebug=1 to URL or set localStorage.overflowDebug = "1"
 * Highlights elements that expand page width or overflow viewport.
 */
(function () {
  function shouldEnable() {
    var p = new URLSearchParams(location.search);
    if (p.get('overflowDebug') === '1' || p.has('overflowDebug')) return true;
    try { return localStorage.getItem('overflowDebug') === '1'; } catch (_) { return false; }
  }

  function scan() {
    var docEl = document.documentElement;
    var docW = docEl.clientWidth;
    var pageW = docEl.scrollWidth;
    var offenders = [];

    // Clear previous marks
    document.querySelectorAll('[data-overflow-debug]').forEach(function (el) {
      el.style.outline = '';
      el.removeAttribute('data-overflow-debug');
      el.removeAttribute('data-overflow-excess');
    });

    // Only scan if page actually overflows
    var overflows = pageW > docW + 1;

    // Walk all elements and flag those that push beyond viewport width
    var all = document.body.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      // Skip non-visible or script/style-like elements
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.position === 'fixed') continue; // fixed doesn't affect layout width
      var rect = el.getBoundingClientRect();
      var pushes = rect.left < -1 || rect.right > docW + 1;
      var sw = el.scrollWidth - el.clientWidth;
      var isWide = sw > 1 && (cs.overflowX === 'visible' || cs.overflowX === 'auto');

      if (pushes || (overflows && isWide)) {
        var excess = Math.max(0, Math.round(Math.max(rect.right - docW, 0)));
        el.style.outline = '2px solid rgba(255,0,0,.7)';
        el.setAttribute('data-overflow-debug', 'true');
        el.setAttribute('data-overflow-excess', String(excess || sw));
        offenders.push({ el: el, excess: excess || sw, rect: rect });
      }
    }

    offenders.sort(function (a, b) { return (b.excess || 0) - (a.excess || 0); });

    // Log a concise report
    if (offenders.length) {
      console.group('[overflow-debug] offenders:', offenders.length, 'pageW=', pageW, 'docW=', docW);
      offenders.slice(0, 20).forEach(function (o, idx) {
        console.log('#' + (idx + 1), o.el.tagName + (o.el.className ? '.' + String(o.el.className).replace(/\s+/g, '.') : ''), 'excess=', o.excess, o.rect);
      });
      console.groupEnd();
    } else {
      console.info('[overflow-debug] no offenders. pageW=', pageW, 'docW=', docW);
    }
    return offenders;
  }

  function mountUI() {
    var btn = document.createElement('button');
    btn.textContent = 'Overflow Scan';
    btn.style.position = 'fixed';
    btn.style.zIndex = '2147483647';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.padding = '6px 10px';
    btn.style.background = 'rgba(0,0,0,.7)';
    btn.style.color = '#fff';
    btn.style.border = '1px solid rgba(255,255,255,.4)';
    btn.style.borderRadius = '6px';
    btn.style.font = '12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    btn.style.cursor = 'pointer';
    btn.title = 'Click to rescan. Shift+Click to toggle persistent mode.';
    btn.addEventListener('click', function (e) {
      if (e.shiftKey) {
        try {
          var on = localStorage.getItem('overflowDebug') === '1';
          localStorage.setItem('overflowDebug', on ? '0' : '1');
          btn.textContent = on ? 'Overflow Scan' : 'Overflow: ON';
        } catch (_) { /* ignore */ }
      }
      scan();
    });
    document.body.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!shouldEnable()) return; // inert unless explicitly enabled
    mountUI();
    scan();
    window.addEventListener('resize', function () { scan(); });
  });
})();

