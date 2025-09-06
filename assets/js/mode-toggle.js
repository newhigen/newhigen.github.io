// Writing/Tech mode toggle for nav
(function () {
  function detectDefaultMode() {
    var header = document.querySelector('.site-header');
    if (!header) return 'writing';
    return header.getAttribute('data-default-mode') || 'writing';
  }

  function applyMode(mode) {
    var header = document.querySelector('.site-header');
    if (!header) return;
    header.setAttribute('data-mode', mode);
    try { document.documentElement.setAttribute('data-mode', mode); } catch (e) { }

    var btn = document.querySelector('.mode-toggle');
    if (btn) {
      btn.textContent = mode === 'tech' ? 'Tech' : 'Writing';
      btn.setAttribute('aria-pressed', mode === 'tech' ? 'true' : 'false');
      btn.setAttribute('aria-label', mode === 'tech' ? '기술 모드' : '글쓰기 모드');
      btn.title = '모드 전환: ' + (mode === 'tech' ? 'Tech' : 'Writing');
    }

    // Update home link target when mode changes
    var headerEl = document.querySelector('.site-header');
    var techHome = (headerEl && headerEl.getAttribute('data-tech-home')) || '/tech/';
    var writingHome = (headerEl && headerEl.getAttribute('data-writing-home')) || '/';
    var homeLink = document.querySelector('.home-link');
    if (homeLink) {
      homeLink.setAttribute('href', mode === 'tech' ? techHome : writingHome);
    }

    // Update control state (labels + knob)
    var labelW = document.querySelector('.mode-switch .mode-label[data-mode="writing"]');
    var labelT = document.querySelector('.mode-switch .mode-label[data-mode="tech"]');
    var isTech = mode === 'tech';
    if (labelW && labelT) {
      labelW.classList.toggle('active', !isTech);
      labelT.classList.toggle('active', isTech);
      labelW.setAttribute('aria-pressed', (!isTech).toString());
      labelT.setAttribute('aria-pressed', (isTech).toString());
    }

    // Ensure Books link hidden in Tech mode regardless of CSS
    var booksLinks = document.querySelectorAll('.books-link');
    if (booksLinks && booksLinks.length) {
      booksLinks.forEach(function (el) {
        if (isTech) {
          el.setAttribute('hidden', '');
          el.setAttribute('aria-hidden', 'true');
        } else {
          el.removeAttribute('hidden');
          el.setAttribute('aria-hidden', 'false');
          // Clean any inline style from server-side default
          if (el.style && el.style.display) el.style.display = '';
        }
      });
    }
  }

  function init() {
    var stored = null;
    try { stored = localStorage.getItem('siteMode'); } catch (e) { /* ignore */ }
    var mode = stored || detectDefaultMode();
    // Prevent initial knob animation on load/navigation
    try {
      document.documentElement.classList.add('no-animate');
    } catch (e) { }
    applyMode(mode);
    try {
      requestAnimationFrame(function () { document.documentElement.classList.remove('no-animate'); });
    } catch (e) {
      setTimeout(function () { document.documentElement.classList.remove('no-animate'); }, 50);
    }

    // Mode labels
    var modeLabels = document.querySelectorAll('.mode-switch .mode-label[data-mode]');
    if (modeLabels && modeLabels.length) {
      modeLabels.forEach(function (label) {
        label.addEventListener('click', function () {
          var targetMode = label.getAttribute('data-mode') === 'tech' ? 'tech' : 'writing';
          applyMode(targetMode);
          try { localStorage.setItem('siteMode', targetMode); } catch (e) { /* ignore */ }

          var header = document.querySelector('.site-header');
          var techHome = (header && header.getAttribute('data-tech-home')) || '/tech/';
          var writingHome = (header && header.getAttribute('data-writing-home')) || '/';
          var target = targetMode === 'tech' ? techHome : writingHome;
          if (target) window.location.href = target;
        });
      });
    }

    // Knob toggle
    var knob = document.querySelector('.mode-switch .mode-toggle-knob');
    if (knob) {
      knob.addEventListener('click', function () {
        mode = (document.querySelector('.site-header')?.getAttribute('data-mode') === 'tech') ? 'writing' : 'tech';
        applyMode(mode);
        try { localStorage.setItem('siteMode', mode); } catch (e) { /* ignore */ }

        var header = document.querySelector('.site-header');
        var techHome = (header && header.getAttribute('data-tech-home')) || '/tech/';
        var writingHome = (header && header.getAttribute('data-writing-home')) || '/';
        var target = mode === 'tech' ? techHome : writingHome;
        if (target) window.location.href = target;
      });
    }

    // Home icon should navigate to current mode's home
    var homeLink = document.querySelector('.home-link');
    if (homeLink) {
      homeLink.addEventListener('click', function (e) {
        var currentMode = document.querySelector('.site-header')?.getAttribute('data-mode') || detectDefaultMode();
        var header = document.querySelector('.site-header');
        var techHome = (header && header.getAttribute('data-tech-home')) || '/tech/';
        var writingHome = (header && header.getAttribute('data-writing-home')) || '/';
        var target = currentMode === 'tech' ? techHome : writingHome;
        if (target) {
          e.preventDefault();
          window.location.href = target;
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
