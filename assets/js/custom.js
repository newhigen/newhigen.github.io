document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.replace(/index\.html$/, "");
  if (path === "/" || path === "") return;

  const mainContent = document.querySelector(".main-content");
  const mainWrap = document.querySelector(".main-content-wrap");
  if (!mainContent || !mainWrap) return;
  if (mainWrap.querySelector(".page-toc")) return;

  const headings = Array.from(
    mainContent.querySelectorAll("h1, h2, h3")
  ).filter(
    (h) =>
      h.id &&
      h.textContent.trim().length > 0 &&
      !h.closest(".page-header-centered")
  );
  const hasHeadings = headings.length > 0;

  const toc = document.createElement("nav");
  toc.className = "page-toc";
  toc.setAttribute("aria-label", "Page table of contents");

  const tocTitle = document.createElement("div");
  tocTitle.className = "page-toc__title";
  tocTitle.textContent = "목차";
  toc.appendChild(tocTitle);

  if (hasHeadings) {
    const list = document.createElement("ul");
    list.className = "page-toc__list";

    headings.forEach((h) => {
      const li = document.createElement("li");
      li.className = `page-toc__item lvl-${h.tagName.toLowerCase()}`;
      li.dataset.targetId = h.id;

      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent.trim();

      li.appendChild(a);
      list.appendChild(li);
    });

    toc.appendChild(list);

    const itemsById = new Map();
    list.querySelectorAll(".page-toc__item").forEach((li) => {
      itemsById.set(li.dataset.targetId, li);
    });

    const setActive = (id) => {
      itemsById.forEach((li) => li.classList.remove("is-active"));
      const active = itemsById.get(id);
      if (active) active.classList.add("is-active");
    };

    const updateActive = () => {
      const offset = window.scrollY + 120;
      let currentId = headings[0].id;
      for (const h of headings) {
        const top = h.getBoundingClientRect().top + window.scrollY;
        if (top <= offset) currentId = h.id;
        else break;
      }
      setActive(currentId);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();
  } else {
    toc.classList.add("page-toc--empty");
    const empty = document.createElement("div");
    empty.className = "page-toc__empty";
    empty.textContent = "목차 없음";
    toc.appendChild(empty);
  }

  const layout = document.createElement("div");
  layout.className = "content-with-toc";
  mainWrap.insertBefore(layout, mainContent);
  layout.appendChild(mainContent);
  layout.appendChild(toc);
});

// Relative date 변환
document.addEventListener("DOMContentLoaded", () => {
  const metaInfos = document.querySelectorAll(".home-with-meta .meta-info");

  metaInfos.forEach((element) => {
    const dateStr = element.textContent.trim();
    // YYYY-MM-DD 형식의 날짜만 처리
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let relativeDate;
      if (diffDays === 0) {
        relativeDate = "오늘";
      } else if (diffDays === 1) {
        relativeDate = "1일 전";
      } else if (diffDays < 7) {
        relativeDate = `${diffDays}일 전`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        relativeDate = `${weeks}주 전`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        relativeDate = `${months}개월 전`;
      } else {
        const years = Math.floor(diffDays / 365);
        relativeDate = `${years}년 전`;
      }

      element.textContent = relativeDate;
    }
  });
});
