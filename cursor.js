function initCustomCursor() {
  const pageName = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const disableOnGamePages = pageName === "game.html" || pageName === "play.html" || document.body.classList.contains("play-page");
  if (disableOnGamePages) {
    document.body.classList.remove("custom-cursor-enabled", "cursor-active", "cursor-click");
    const existingCursor = document.querySelector(".custom-cursor");
    if (existingCursor) existingCursor.remove();
    return;
  }

  const supportsFinePointer = window.matchMedia("(pointer:fine)").matches;
  if (!supportsFinePointer) return;

  let cursorEl = document.querySelector(".custom-cursor");
  if (!cursorEl) {
    cursorEl = document.createElement("div");
    cursorEl.className = "custom-cursor mode-pointer";
    document.body.appendChild(cursorEl);
  }

  const clickableSelector = [
    "a",
    "button",
    "[role='button']",
    "summary",
    "label",
    "select",
    ".game-card",
    ".top-game-card",
    ".search-result-card",
    ".nav-link",
    ".category-folder",
    ".camera-icon",
    ".sidebar-toggle",
    ".player-control",
    ".player-handle",
    ".back-home-btn"
  ].join(",");

  const typingSelector = [
    "textarea",
    "[contenteditable='true']",
    "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']):not([type='range'])"
  ].join(",");

  const setMode = (mode) => {
    cursorEl.classList.remove("mode-pointer", "mode-hand", "mode-type");
    cursorEl.classList.add(`mode-${mode}`);
  };

  const resolveMode = (target) => {
    if (!(target instanceof Element)) return "pointer";
    if (target.closest(typingSelector)) return "type";
    if (target.closest(clickableSelector)) return "hand";
    return "pointer";
  };

  const showCursor = () => {
    document.body.classList.add("cursor-active");
  };

  const hideCursor = () => {
    document.body.classList.remove("cursor-active");
    document.body.classList.remove("cursor-click");
  };

  const onMove = (event) => {
    cursorEl.style.left = `${event.clientX}px`;
    cursorEl.style.top = `${event.clientY}px`;
    setMode(resolveMode(event.target));
    showCursor();
  };

  document.body.classList.add("custom-cursor-enabled");
  document.addEventListener("mousemove", onMove);
  document.documentElement.addEventListener("mouseenter", showCursor);
  document.documentElement.addEventListener("mouseleave", hideCursor);
  document.addEventListener("mousedown", () => document.body.classList.add("cursor-click"));
  document.addEventListener("mouseup", () => document.body.classList.remove("cursor-click"));
  document.addEventListener("focusin", (event) => {
    setMode(resolveMode(event.target));
    showCursor();
  });
}

initCustomCursor();
