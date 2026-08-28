(() => {
  "use strict";

  const previewEnabled = window.NEXTROUND_NOTIFICATION_PRIVATE_PREVIEW === true
    || localStorage.getItem("nextround-notification-test-access-v1") === "1";
  if (!previewEnabled) return;

  const dialog = document.querySelector("#inboxDialog");
  const composerDialog = document.querySelector("#announcementComposerDialog");
  const list = document.querySelector("#inboxList");
  const status = document.querySelector("#inboxStatus");
  const clearBtn = document.querySelector("#clearReadInboxBtn");
  const composeBtn = document.querySelector("#openAnnouncementComposerBtn");
  const form = document.querySelector("#announcementForm");
  const bodyInput = document.querySelector("#announcementBody");
  const bodyCount = document.querySelector("#announcementBodyCount");
  const announcementStatus = document.querySelector("#announcementStatus");
  const sendBtn = document.querySelector("#sendAnnouncementBtn");
  const apiBase = String(window.NEXTROUND_NOTIFICATION_API || "").trim().replace(/\/+$/, "");
  if (!dialog || !composerDialog || !list || !apiBase) return;

  let items = [];
  let activeFilter = "all";
  let loading = false;
  let admin = false;
  let lastLoadedAt = 0;

  function signedInUser() {
    return typeof cloudUser !== "undefined" ? cloudUser : null;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function apiRequest(path, options = {}) {
    const user = signedInUser();
    if (!user) throw new Error("お知らせの確認にはログインが必要です。");
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body) headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(`${apiBase}${path}`, { ...options, headers, signal: controller.signal });
      const payload = await readLimitedResponseJson(response, 500_000).catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `お知らせを処理できませんでした（${response.status}）。`);
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  function formatTimestamp(value) {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    const sameDay = date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
    const time = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(date);
    if (sameDay) return `今日 ${time}`;
    return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function levelLabel(item) {
    if (item.type === "reminder") return "REMINDER";
    if (item.level === "important") return "IMPORTANT";
    if (item.level === "info") return "INFO";
    return "UPDATE";
  }

  function updateBadges() {
    const unreadCount = items.filter(item => !item.read).length;
    document.querySelectorAll("[data-inbox-count]").forEach(badge => {
      badge.hidden = unreadCount === 0;
      badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
    });
  }

  function render() {
    const visible = activeFilter === "all" ? items : items.filter(item => item.type === activeFilter);
    clearBtn.disabled = !items.some(item => item.read);
    composeBtn.hidden = !admin;
    updateBadges();
    if (!visible.length) {
      list.innerHTML = `
        <div class="inbox-empty">
          <span>NO MESSAGES</span>
          <strong>${items.length ? "この種類のお知らせはありません" : "新しいお知らせはありません"}</strong>
          <p>締切・予定の通知履歴や、NEXTROUNDからの案内がここに表示されます。</p>
        </div>
      `;
      return;
    }
    list.innerHTML = visible.map(item => `
      <button class="inbox-item ${item.read ? "is-read" : "is-unread"} level-${escapeHtml(item.level)}" type="button" data-inbox-key="${escapeHtml(item.key)}">
        <span class="inbox-item-rail" aria-hidden="true"></span>
        <span class="inbox-item-meta"><b>${levelLabel(item)}</b><time>${escapeHtml(formatTimestamp(item.timestamp))}</time>${item.read ? "" : '<i aria-label="未読"></i>'}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="inbox-item-body">${escapeHtml(item.body)}</span>
        <small>${item.read ? "既読" : "タップして既読にする"}</small>
      </button>
    `).join("");
    list.querySelectorAll("[data-inbox-key]").forEach(button => {
      button.addEventListener("click", () => markRead(button.dataset.inboxKey));
    });
  }

  async function loadInbox({ silent = false } = {}) {
    if (loading || !signedInUser()) {
      if (!signedInUser()) {
        status.textContent = "お知らせの確認にはログインが必要です。";
        items = [];
        render();
      }
      return;
    }
    loading = true;
    if (!silent) status.textContent = "お知らせを読み込んでいます...";
    try {
      const payload = await apiRequest("/v1/inbox");
      items = Array.isArray(payload.items) ? payload.items : [];
      admin = payload.isAdmin === true;
      lastLoadedAt = Date.now();
      status.textContent = items.length
        ? `未読 ${items.filter(item => !item.read).length}件 / 過去30日間`
        : "";
      render();
    } catch (error) {
      status.textContent = error?.name === "AbortError"
        ? "通信に時間がかかっています。もう一度お試しください。"
        : (error?.message || "お知らせを読み込めませんでした。");
    } finally {
      loading = false;
    }
  }

  async function markRead(key) {
    const item = items.find(candidate => candidate.key === key);
    if (!item || item.read) return;
    item.read = true;
    render();
    try {
      await apiRequest("/v1/inbox/read", {
        method: "POST",
        body: JSON.stringify({ itemKeys: [key] })
      });
      status.textContent = `未読 ${items.filter(candidate => !candidate.read).length}件 / 過去30日間`;
    } catch (error) {
      item.read = false;
      render();
      status.textContent = error?.message || "既読状態を保存できませんでした。";
    }
  }

  async function clearReadItems() {
    if (!items.some(item => item.read)) return;
    if (!window.confirm("既読のお知らせを一覧から削除します。よろしいですか？")) return;
    clearBtn.disabled = true;
    try {
      await apiRequest("/v1/inbox/read", { method: "DELETE" });
      items = items.filter(item => !item.read);
      status.textContent = "既読のお知らせを削除しました。";
      render();
    } catch (error) {
      status.textContent = error?.message || "既読のお知らせを削除できませんでした。";
      render();
    }
  }

  function openInbox() {
    if (!dialog.open) dialog.showModal();
    if (!lastLoadedAt || Date.now() - lastLoadedAt > 30_000) loadInbox();
    else render();
  }

  function openComposer() {
    if (!admin) return;
    announcementStatus.textContent = "";
    if (!composerDialog.open) composerDialog.showModal();
    setTimeout(() => document.querySelector("#announcementTitle")?.focus(), 120);
  }

  async function sendAnnouncement(event) {
    event.preventDefault();
    if (!admin || sendBtn.disabled) return;
    const title = document.querySelector("#announcementTitle").value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) {
      announcementStatus.textContent = "タイトルと本文を入力してください。";
      return;
    }
    sendBtn.disabled = true;
    announcementStatus.textContent = "お知らせを送信しています...";
    try {
      const appUrl = new URL(".", window.location.href);
      appUrl.searchParams.set("open", "inbox");
      await apiRequest("/v1/admin/announcements", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          level: document.querySelector("#announcementLevel").value,
          sendPush: document.querySelector("#announcementSendPush").checked,
          appUrl: appUrl.href
        })
      });
      announcementStatus.textContent = "お知らせを送信しました。";
      form.reset();
      bodyCount.textContent = "0";
      await loadInbox({ silent: true });
      setTimeout(() => composerDialog.open && composerDialog.close(), 500);
    } catch (error) {
      announcementStatus.textContent = error?.message || "お知らせを送信できませんでした。";
    } finally {
      sendBtn.disabled = false;
    }
  }

  document.querySelector("#homeInboxBtn")?.addEventListener("click", openInbox);
  document.querySelector("#closeInboxDialog")?.addEventListener("click", () => dialog.close());
  document.querySelector("#closeAnnouncementComposer")?.addEventListener("click", () => composerDialog.close());
  composeBtn.addEventListener("click", openComposer);
  clearBtn.addEventListener("click", clearReadItems);
  form.addEventListener("submit", sendAnnouncement);
  bodyInput.addEventListener("input", () => { bodyCount.textContent = String(bodyInput.value.length); });
  document.querySelectorAll("[data-inbox-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.inboxFilter;
      document.querySelectorAll("[data-inbox-filter]").forEach(candidate => candidate.classList.toggle("active", candidate === button));
      render();
    });
  });
  window.addEventListener("nextround:auth-changed", event => {
    if (event.detail?.signedIn) {
      loadInbox({ silent: true });
      if (new URLSearchParams(location.search).get("open") === "inbox") setTimeout(openInbox, 250);
    } else {
      items = [];
      admin = false;
      lastLoadedAt = 0;
      updateBadges();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && signedInUser() && Date.now() - lastLoadedAt > 5 * 60 * 1000) {
      loadInbox({ silent: true });
    }
  });

  window.nextroundInbox = { open: openInbox, refresh: loadInbox };
  render();
})();
