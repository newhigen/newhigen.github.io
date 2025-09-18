// Writing/Tech mode toggle for nav
(function () {
  function detectDefaultMode() {
    var header = document.querySelector('.site-header');
    if (!header) return 'writing';

    // URL 기반 모드 감지
    var path = window.location.pathname;
    if (path === '/' || path === '/index.html') {
      return 'writing';
    } else if (path.includes('/tech/') || path.includes('/tools/') || path.includes('/projects/')) {
      return 'tech';
    }

    return header.getAttribute('data-default-mode') || 'writing';
  }

  function applyMode(mode) {
    var header = document.querySelector('.site-header');
    if (!header) return;
    header.setAttribute('data-mode', mode);
    try { document.documentElement.setAttribute('data-mode', mode); } catch (e) { }

    // 새로운 중앙 토글 구조 업데이트 - 레이블 활성화 상태는 CSS에서 data-mode로 처리됨

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

  function goToModeHome(mode) {
    var header = document.querySelector('.site-header');
    var techHome = (header && header.getAttribute('data-tech-home')) || '/tech/';
    var writingHome = (header && header.getAttribute('data-writing-home')) || '/';
    var target = mode === 'tech' ? techHome : writingHome;
    if (target) window.location.href = target;
  }

  function init() {
    // URL 기반으로 모드 결정 (localStorage보다 우선)
    var mode = detectDefaultMode();

    // URL이 명확하지 않은 경우에만 localStorage 사용
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html' && !path.includes('/tech/') && !path.includes('/tools/') && !path.includes('/projects/')) {
      var stored = null;
      try { stored = localStorage.getItem('siteMode'); } catch (e) { /* ignore */ }
      if (stored) mode = stored;
    }
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

    // 중앙 토글 스위치 이벤트
    var toggleSwitch = document.querySelector('.center-toggle-switch');
    if (toggleSwitch) {
      toggleSwitch.addEventListener('click', function () {
        var currentMode = document.querySelector('.site-header')?.getAttribute('data-mode') || 'writing';
        var targetMode = currentMode === 'writing' ? 'tech' : 'writing';
        applyMode(targetMode);
        try { localStorage.setItem('siteMode', targetMode); } catch (e) { /* ignore */ }
        goToModeHome(targetMode);
      });

      // Touch support
      toggleSwitch.addEventListener('touchend', function (e) {
        e.preventDefault();
        var currentMode = document.querySelector('.site-header')?.getAttribute('data-mode') || 'writing';
        var targetMode = currentMode === 'writing' ? 'tech' : 'writing';
        applyMode(targetMode);
        try { localStorage.setItem('siteMode', targetMode); } catch (e) { /* ignore */ }
        goToModeHome(targetMode);
      }, { passive: false });
    }

    // 레이블 클릭 이벤트 (레이블 클릭으로도 모드 변경 가능)
    var modeLabels = document.querySelectorAll('.mode-label[data-mode]');
    if (modeLabels && modeLabels.length) {
      modeLabels.forEach(function (label) {
        label.addEventListener('click', function () {
          var targetMode = label.getAttribute('data-mode');
          applyMode(targetMode);
          try { localStorage.setItem('siteMode', targetMode); } catch (e) { /* ignore */ }
          goToModeHome(targetMode);
        });
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
