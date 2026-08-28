(() => {
  "use strict";

  const form = document.querySelector("#aiReviewForm");
  const resultSection = document.querySelector("#aiResult");
  const emptyState = document.querySelector("#aiEmptyState");
  const submitButton = document.querySelector("#aiReviewSubmit");
  const formStatus = document.querySelector("#aiFormStatus");
  const quota = document.querySelector("#aiQuota");
  const companyInput = document.querySelector("#aiCompany");
  const questionInput = document.querySelector("#aiQuestion");
  const essayInput = document.querySelector("#aiEssay");
  const limitInput = document.querySelector("#aiCharacterLimit");
  const apiBase = String(window.NEXTROUND_NOTIFICATION_API || "").trim().replace(/\/+$/, "");
  if (!form || !resultSection || !apiBase) return;

  let busy = false;
  let lastResult = null;
  let lastQuotaState = null;
  let progressTimers = [];

  function signedInUser() {
    return typeof cloudUser !== "undefined" ? cloudUser : null;
  }

  function characterCount(value) {
    return [...String(value || "")].length;
  }

  function updateCounts() {
    document.querySelector("#aiQuestionCount").textContent = String(characterCount(questionInput.value));
    const essayLength = characterCount(essayInput.value);
    document.querySelector("#aiEssayCount").textContent = String(essayLength);
    const limit = Number(limitInput.value || 0);
    essayInput.dataset.overLimit = limit > 0 && essayLength > limit ? "true" : "false";
  }

  function updateCompanyOptions() {
    const datalist = document.querySelector("#aiCompanyOptions");
    if (!datalist || typeof entries === "undefined" || !Array.isArray(entries)) return;
    const companies = [...new Set(entries.map(entry => String(entry.company || "").trim()).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, "ja"));
    datalist.replaceChildren(...companies.map(company => {
      const option = document.createElement("option");
      option.value = company;
      return option;
    }));
  }

  async function apiRequest(path, options = {}) {
    const user = signedInUser();
    if (!user) throw new Error("AI添削の利用にはログインが必要です。");
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body) headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 180_000);
    try {
      const response = await fetch(`${apiBase}${path}`, { ...options, headers, signal: controller.signal });
      const payload = await readLimitedResponseJson(response, 1_500_000).catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `AI添削を処理できませんでした（${response.status}）。`);
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  function renderQuotaState(state) {
    lastQuotaState = state;
    const label = quota.querySelector("b");
    if (!signedInUser()) {
      quota.dataset.state = "locked";
      label.textContent = "ログインが必要";
      submitButton.disabled = true;
      return;
    }
    const remaining = Number(state?.remaining);
    if (!Number.isFinite(remaining)) {
      quota.dataset.state = "unknown";
      label.textContent = "利用回数を確認できません";
      submitButton.disabled = busy;
      return;
    }
    quota.dataset.state = remaining > 0 && state.available !== false ? "ready" : "limit";
    label.textContent = remaining > 0 && state.available !== false ? `本日あと${remaining}回` : "本日の上限です";
    submitButton.disabled = busy || remaining <= 0 || state.available === false;
  }

  async function loadStatus() {
    if (!signedInUser()) {
      renderQuotaState(null);
      return;
    }
    try {
      renderQuotaState(await apiRequest("/v1/ai/status", { timeout: 12_000 }));
      if (formStatus.textContent === "AI添削の利用にはログインが必要です。") formStatus.textContent = "";
    } catch (error) {
      renderQuotaState({ remaining: NaN });
      formStatus.textContent = error?.message || "AI機能の状態を確認できませんでした。";
    }
  }

  function setBusy(value) {
    busy = value;
    form.classList.toggle("is-busy", value);
    form.querySelector(".ai-submit-label").hidden = value;
    form.querySelector(".ai-submit-loading").hidden = !value;
    if (value) submitButton.disabled = true;
    else renderQuotaState(lastQuotaState);
    [companyInput, questionInput, essayInput, limitInput].forEach(input => { input.disabled = value; });
  }

  function startProgressMessages() {
    progressTimers.forEach(clearTimeout);
    progressTimers = [
      setTimeout(() => {
        formStatus.textContent = "企業の公開情報を確認しました。ESを5項目で採点しています。";
      }, 25_000),
      setTimeout(() => {
        formStatus.textContent = "具体的な改善案と文章例を作成しています。あと少しです。";
      }, 75_000)
    ];
  }

  function stopProgressMessages() {
    progressTimers.forEach(clearTimeout);
    progressTimers = [];
  }

  function appendList(container, items) {
    container.replaceChildren(...items.map(item => {
      const row = document.createElement("li");
      row.textContent = item;
      return row;
    }));
  }

  function criterionElement(item, index) {
    const article = document.createElement("article");
    article.className = "ai-criterion";
    article.style.setProperty("--delay", `${index * 90}ms`);

    const header = document.createElement("header");
    const heading = document.createElement("h3");
    heading.textContent = item.label;
    const score = document.createElement("strong");
    score.textContent = `${item.score} / 20`;
    header.append(heading, score);

    const track = document.createElement("div");
    track.className = "ai-criterion-track";
    const bar = document.createElement("i");
    bar.style.setProperty("--criterion-score", String(Math.max(0, Math.min(20, Number(item.score) || 0))));
    track.append(bar);

    const details = document.createElement("div");
    details.className = "ai-criterion-details";
    [
      ["良かった点", item.reason],
      ["不足している要素", item.missing],
      ["具体的な改善案", item.improvement]
    ].forEach(([label, value]) => {
      const block = document.createElement("section");
      const title = document.createElement("b");
      const paragraph = document.createElement("p");
      title.textContent = label;
      paragraph.textContent = value || "明確な記載はありません。";
      block.append(title, paragraph);
      details.append(block);
    });
    article.append(header, track, details);
    return article;
  }

  function researchLabel(status) {
    if (status === "fresh") return ["調査完了", "企業の公開情報を今回取得して評価しました。", "ready"];
    if (status === "cached") return ["調査済み情報を使用", "30日以内に確認した企業情報を再利用しました。", "ready"];
    if (status === "limit_reached") return ["企業調査の上限", "企業情報を推測せず、設問とES本文を中心に評価しました。", "warning"];
    if (status === "not_found") return ["公式情報を特定できませんでした", "企業情報を推測せず、設問とES本文を中心に評価しました。", "warning"];
    if (status === "not_configured") return ["企業調査は準備中です", "現在は設問とES本文を中心に評価しています。", "warning"];
    return ["企業調査を完了できませんでした", "企業情報を推測せず、設問とES本文を中心に評価しました。", "warning"];
  }

  function renderSources(sources) {
    const section = document.querySelector("#aiSourcesSection");
    const container = document.querySelector("#aiSources");
    const safeSources = (Array.isArray(sources) ? sources : []).map(source => {
      try {
        const url = new URL(String(source?.url || ""));
        if (url.protocol !== "https:") return null;
        return { ...source, url: url.href };
      } catch {
        return null;
      }
    }).filter(Boolean);
    section.hidden = safeSources.length === 0;
    container.replaceChildren(...safeSources.map(source => {
      const anchor = document.createElement("a");
      anchor.href = source.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      const title = document.createElement("strong");
      title.textContent = source.title || "参考ページ";
      const host = document.createElement("span");
      try { host.textContent = new URL(source.url).hostname; } catch { host.textContent = "外部サイト"; }
      anchor.append(title, host);
      return anchor;
    }));
  }

  function renderResult(payload) {
    lastResult = payload;
    const result = payload.result || {};
    document.querySelector("#aiResultCompany").textContent = `${payload.company} / ES評価`;
    document.querySelector("#aiResultSummary").textContent = result.summary || "評価結果を確認してください。";
    document.querySelector("#aiTotalScore").textContent = String(result.totalScore ?? 0);
    const ring = document.querySelector("#aiScoreRing");
    ring.style.setProperty("--score", String(Math.max(0, Math.min(100, Number(result.totalScore) || 0))));

    const [researchTitle, researchDetail, researchTone] = researchLabel(payload.research?.status);
    const researchState = document.querySelector("#aiResearchState");
    researchState.dataset.state = researchTone;
    researchState.replaceChildren();
    const researchHeading = document.createElement("strong");
    researchHeading.textContent = researchTitle;
    const researchText = document.createElement("p");
    researchText.textContent = result.researchSummary || researchDetail;
    researchState.append(researchHeading, researchText);

    const criteria = Array.isArray(result.criteria) ? result.criteria : [];
    document.querySelector("#aiCriteria").replaceChildren(...criteria.map(criterionElement));
    const deductions = Array.isArray(result.deductions) ? result.deductions.filter(Boolean) : [];
    document.querySelector("#aiDeductionsSection").hidden = deductions.length === 0;
    appendList(document.querySelector("#aiDeductions"), deductions);
    appendList(document.querySelector("#aiImprovementPoints"), Array.isArray(result.improvementPoints) ? result.improvementPoints : []);

    document.querySelector("#aiRevisedEssay").textContent = result.revisedEssay || "改善例を生成できませんでした。";
    const limitLabel = payload.characterLimit ? ` / 上限 ${payload.characterLimit}文字` : "";
    document.querySelector("#aiRevisedMeta").textContent = `原文 ${payload.originalCharacterCount}文字 → 改善例 ${result.revisedCharacterCount}文字${limitLabel}`;
    document.querySelector("#aiResultCaution").textContent = result.caution || "AIによる参考評価です。応募前にご自身で内容を確認してください。";
    renderSources(payload.research?.sources);

    emptyState.hidden = true;
    resultSection.hidden = false;
    requestAnimationFrame(() => resultSection.classList.add("is-visible"));
    renderQuotaState(payload.usage);
    setTimeout(() => resultSection.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  async function submitReview(event) {
    event.preventDefault();
    if (busy) return;
    if (!signedInUser()) {
      formStatus.textContent = "AI添削の利用にはログインが必要です。";
      renderQuotaState(null);
      return;
    }
    const essayLength = characterCount(essayInput.value.trim());
    const characterLimit = limitInput.value ? Number(limitInput.value) : null;
    if (essayLength < 30) {
      formStatus.textContent = "ES本文を30文字以上で入力してください。";
      essayInput.focus();
      return;
    }
    if (characterLimit && essayLength > characterLimit) {
      formStatus.textContent = `現在${essayLength}文字です。文字数上限を超えていますが、そのまま添削します。`;
    } else {
      formStatus.textContent = "企業情報を確認し、ESを分析しています。画面を閉じずにお待ちください。";
    }
    setBusy(true);
    startProgressMessages();
    resultSection.hidden = true;
    resultSection.classList.remove("is-visible");
    emptyState.hidden = false;
    try {
      const payload = await apiRequest("/v1/ai/review", {
        method: "POST",
        body: JSON.stringify({
          company: companyInput.value.trim(),
          question: questionInput.value.trim(),
          characterLimit,
          essay: essayInput.value.trim()
        })
      });
      formStatus.textContent = "添削が完了しました。";
      renderResult(payload);
    } catch (error) {
      formStatus.textContent = error?.name === "AbortError"
        ? "3分以内に処理を完了できませんでした。通信環境を確認して、もう一度お試しください。"
        : (error?.message || "AI添削を完了できませんでした。");
      await loadStatus();
    } finally {
      stopProgressMessages();
      setBusy(false);
    }
  }

  async function copyResult() {
    const text = lastResult?.result?.revisedEssay;
    if (!text) return;
    const button = document.querySelector("#aiCopyResult");
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "コピーしました";
    } catch {
      button.textContent = "コピーできませんでした";
    }
    setTimeout(() => { button.textContent = "改善例をコピー"; }, 1800);
  }

  function newReview() {
    lastResult = null;
    resultSection.classList.remove("is-visible");
    resultSection.hidden = true;
    emptyState.hidden = false;
    formStatus.textContent = "";
    questionInput.value = "";
    essayInput.value = "";
    limitInput.value = "";
    updateCounts();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => questionInput.focus(), 250);
  }

  function activate() {
    updateCompanyOptions();
    updateCounts();
    loadStatus();
  }

  form.addEventListener("submit", submitReview);
  questionInput.addEventListener("input", updateCounts);
  essayInput.addEventListener("input", updateCounts);
  limitInput.addEventListener("input", updateCounts);
  document.querySelector("#aiCopyResult").addEventListener("click", copyResult);
  document.querySelector("#aiNewReview").addEventListener("click", newReview);
  window.addEventListener("nextround:auth-changed", activate);
  window.addEventListener("nextround:data-changed", updateCompanyOptions);
  window.addEventListener("nextround:ai-usage-changed", event => {
    if (event.detail) renderQuotaState(event.detail);
    else loadStatus();
  });
  window.nextroundAi = { activate, refreshStatus: loadStatus };
  updateCounts();
})();
