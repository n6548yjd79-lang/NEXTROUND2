"use strict";

if (window.self !== window.top) {
  document.documentElement.style.display = "none";
  throw new Error("NEXTROUND cannot run inside a frame.");
}

try {
  localStorage.removeItem("nextround-theme-v1");
  document.documentElement.dataset.theme = "dark";
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = "#080b0f";
} catch {
  document.documentElement.dataset.theme = "dark";
}
