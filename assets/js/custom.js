document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;

  const headings = Array.from(
    mainContent.querySelectorAll("h1, h2, h3")
  ).filter(
    (h) => h.id && h.textContent.trim().length > 0
  );
  if (headings.length < 1) return;

  const toc = document.createElement("nav");
  toc.className = "floating-toc floating-toc--collapsed";
  toc.setAttribute("aria-label", "Floating table of contents");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "floating-toc__toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "목차 열기/닫기");
  toggle.innerHTML = '<span class="floating-toc__icon" aria-hidden="true"></span>';
  toc.appendChild(toggle);

  const list = document.createElement("ul");
  list.className = "floating-toc__list";

  headings.forEach((h) => {
    const li = document.createElement("li");
    li.className = `floating-toc__item lvl-${h.tagName.toLowerCase()}`;
    li.dataset.targetId = h.id;

    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();

    li.appendChild(a);
    list.appendChild(li);
  });

  list.style.display = "none";
  toc.appendChild(list);

  const itemsById = new Map();
  list.querySelectorAll(".floating-toc__item").forEach((li) => {
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

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextState = !expanded;
    toggle.setAttribute("aria-expanded", String(nextState));
    list.style.display = nextState ? "block" : "none";
    toc.classList.toggle("floating-toc--open", nextState);
    toc.classList.toggle("floating-toc--collapsed", !nextState);
  });

  const container =
    document.querySelector(".main-content-wrap") || document.body;
  container.appendChild(toc);
});
