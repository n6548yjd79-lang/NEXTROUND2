(() => {
  "use strict";

  const dialogTitle = document.querySelector("#importDialog .settings-head h2");
  const memoPanel = document.querySelector("#memoImportPanel");
  const notionPanel = document.querySelector("#notionImportPanel");
  const fileInput = document.querySelector("#notionCsvFile");
  const chooseButton = document.querySelector("#chooseNotionCsvBtn");
  const aiButton = document.querySelector("#notionAiMapBtn");
  const fileSummary = document.querySelector("#notionFileSummary");
  const status = document.querySelector("#importStatus");
  const preview = document.querySelector("#importPreview");
  const confirmButton = document.querySelector("#confirmImportBtn");
  const modeButtons = [...document.querySelectorAll("[data-import-mode]")];
  const apiBase = String(window.NEXTROUND_NOTIFICATION_API || "").trim().replace(/\/+$/, "");
  if (!memoPanel || !notionPanel || !fileInput || !chooseButton || !aiButton) return;

  const maximumFileBytes = 2 * 1024 * 1024;
  const maximumRows = 500;
  const maximumColumns = 80;
  const allowedFields = new Set([
    "ignore", "company", "type", "internSeason", "industry", "role", "stage",
    "deadline", "nextDate", "nextPlan", "memo", "portalUrl", "selectionProcess"
  ]);
  let csvState = null;
  let busy = false;

  function setStatus(message) {
    status.textContent = message;
  }

  function clearPreview() {
    importCandidates = [];
    preview.innerHTML = "";
    confirmButton.hidden = true;
    confirmButton.textContent = "候補をまとめて追加";
  }

  function activateMode(mode, clear = false) {
    const notion = mode === "notion";
    memoPanel.hidden = notion;
    notionPanel.hidden = !notion;
    if (dialogTitle) dialogTitle.textContent = notion ? "Notionから移行" : "メモからまとめて追加";
    modeButtons.forEach(button => {
      const active = button.dataset.importMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (clear) {
      clearPreview();
      setStatus("");
    }
    if (!notion) setTimeout(() => document.querySelector("#importText")?.focus(), 0);
  }

  function reset(mode = "memo") {
    csvState = null;
    fileInput.value = "";
    fileSummary.hidden = true;
    fileSummary.replaceChildren();
    aiButton.disabled = true;
    aiButton.textContent = "AIで列を判定";
    activateMode(mode, false);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    const source = String(text || "").replace(/^\uFEFF/, "");
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (quoted) {
        if (character === '"') {
          if (source[index + 1] === '"') {
            field += '"';
            index += 1;
          } else {
            quoted = false;
          }
        } else {
          field += character;
        }
        continue;
      }
      if (character === '"' && field === "") {
        quoted = true;
      } else if (character === ",") {
        row.push(field);
        field = "";
      } else if (character === "\n" || character === "\r") {
        if (character === "\r" && source[index + 1] === "\n") index += 1;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += character;
      }
      if (field.length > 20000) throw new Error("1つの項目が長すぎます。Notion側で内容を分けてください。");
    }
    if (quoted) throw new Error("CSVの引用符が閉じられていません。Notionからもう一度書き出してください。");
    row.push(field);
    rows.push(row);
    return rows
      .map(values => values.slice(0, maximumColumns).map(value => String(value || "").trim()))
      .filter(values => values.some(Boolean));
  }

  function normalizedHeader(value) {
    return String(value || "").normalize("NFKC").toLowerCase().replace(/[\s_\-・/／()（）【】\[\]]/g, "");
  }

  function isSensitiveHeader(value) {
    const key = normalizedHeader(value);
    return /(password|passwd|passcode|パスワード|ログインid|ログイン情報|userid|ユーザーid|メールアドレス|email|電話|住所|es本文|回答本文|履歴書|エントリーシート|志望動機|自己pr|ガクチカ)/i.test(key)
      || /^(es|回答|回答内容|pw|pass)$/.test(key);
  }

  function localFieldForHeader(header, index) {
    const key = normalizedHeader(header);
    if (!key || isSensitiveHeader(header)) return "ignore";
    const rules = [
      ["company", /^(会社名|企業名|会社|企業|応募先|name|title|名前)$/],
      ["internSeason", /(インターン時期|インターン季節|シーズン|season|開催時期|実施時期)/],
      ["type", /(選考種別|応募種別|種類|区分|type|カテゴリ)/],
      ["industry", /(業界|industry|分野)/],
      ["role", /(職種|コース|職種コース|ポジション|role|position)/],
      ["stage", /(選考状況|現在地|進捗|ステータス|status|フェーズ|段階)/],
      ["deadline", /(締切|〆切|期限|応募期限|提出期限|deadline)/],
      ["nextDate", /(次の予定日|面接日|次回日程|予定日|次回予定日|nextdate)/],
      ["nextPlan", /(次の予定内容|次回内容|予定内容|nextplan|次の予定)/],
      ["selectionProcess", /(選考フロー|選考過程|選考内容|プロセス|flow|process)/],
      ["portalUrl", /(マイページurl|ログインurl|mypageurl|portalurl|url|リンク)/],
      ["memo", /(メモ|備考|ノート|note|memo|コメント)/]
    ];
    const matched = rules.find(([, pattern]) => pattern.test(key));
    if (matched) return matched[0];
    return index === 0 ? "company" : "ignore";
  }

  function flexibleDate(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const direct = text.match(/(20\d{2})[\/.\-年](\d{1,2})[\/.\-月](\d{1,2})/);
    if (direct) return toDateInput(Number(direct[1]), Number(direct[2]), Number(direct[3]), false);
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return guessDeadline(text);
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  function normalizedType(value, fallback) {
    const text = `${value || ""} ${fallback || ""}`;
    if (/本選考|本選|早期選考/.test(text)) return "本選考";
    if (/説明会/.test(text)) return "説明会";
    if (/OB[\/・]?OG|OB訪問|OG訪問/i.test(text)) return "OB/OG訪問";
    return "インターン";
  }

  function normalizedIndustry(value, fallback) {
    const direct = normalizeIndustry(value);
    return direct !== "未設定" ? direct : guessIndustry(`${value || ""} ${fallback || ""}`);
  }

  function mappedValue(row, mapping, field) {
    const index = mapping.findIndex(value => value === field);
    return index >= 0 ? String(row[index] || "").trim() : "";
  }

  function inferInterviewCount(text, type) {
    if (!/(面接|面談)/.test(text)) return "0";
    if (/(三次|3次|最終)/.test(text)) return "3";
    if (/(二次|2次)/.test(text)) return "2";
    return type === "本選考" && /(一次|1次)/.test(text) ? "3" : "1";
  }

  function buildCandidate(row, mapping, headers) {
    const fullText = row.slice(0, maximumColumns).join(" ").slice(0, 20000);
    const processText = mappedValue(row, mapping, "selectionProcess");
    const type = normalizedType(mappedValue(row, mapping, "type"), fullText);
    const stageText = mappedValue(row, mapping, "stage") || processText || fullText;
    const stage = guessStage(stageText);
    const documentFlowMode = guessDocumentFlowMode(`${processText} ${fullText}`);
    const flow = inferImportFlow(`${processText} ${fullText}`, stage);
    const mappedIndices = new Set(mapping.map((field, index) => field !== "ignore" ? index : -1).filter(index => index >= 0));
    const extra = row.flatMap((value, index) => {
      if (!value || mappedIndices.has(index) || isSensitiveHeader(headers[index])) return [];
      return [`${headers[index]}: ${String(value).slice(0, 500)}`];
    }).slice(0, 12);
    const memo = [mappedValue(row, mapping, "memo"), extra.length ? `Notion移行\n${extra.join("\n")}` : ""]
      .filter(Boolean).join("\n\n").slice(0, 20000);
    return {
      company: mappedValue(row, mapping, "company").slice(0, 160),
      type,
      internSeason: type === "インターン" ? guessInternSeason(`${mappedValue(row, mapping, "internSeason")} ${fullText}`) : "未設定",
      industry: normalizedIndustry(mappedValue(row, mapping, "industry"), fullText),
      role: mappedValue(row, mapping, "role").slice(0, 160),
      stage,
      deadline: flexibleDate(mappedValue(row, mapping, "deadline")),
      nextDate: flexibleDate(mappedValue(row, mapping, "nextDate")),
      nextPlan: mappedValue(row, mapping, "nextPlan").slice(0, 160),
      portalUrl: normalizePortalUrl(mappedValue(row, mapping, "portalUrl")),
      memo,
      flow,
      interviewCount: inferInterviewCount(`${processText} ${fullText}`, type),
      documentFlowMode,
      selectionTags: documentFlowMode === "combined" && flow.es && flow.webTest ? [combinedDocumentTag] : []
    };
  }

  function renderCandidates(sourceLabel) {
    if (!csvState) return;
    importCandidates = csvState.rows.map(row => buildCandidate(row, csvState.mapping, csvState.headers));
    renderImportPreview();
    const unresolved = importCandidates.filter(candidate => !candidate.company).length;
    const suffix = unresolved ? ` 会社名を判定できなかった${unresolved}件は入力してください。` : "";
    setStatus(`${sourceLabel}で${importCandidates.length}件を候補にしました。内容を確認してから追加してください。${suffix}`);
  }

  function renderFileSummary(file, headers, rows, mapping) {
    const recognized = mapping.filter(field => field !== "ignore").length;
    fileSummary.hidden = false;
    fileSummary.replaceChildren();
    const name = document.createElement("strong");
    name.textContent = file.name;
    const detail = document.createElement("span");
    detail.textContent = `${rows.length}件 / ${headers.length}列 / ${recognized}列を自動判定`;
    fileSummary.append(name, detail);
  }

  async function loadFile(file) {
    clearPreview();
    if (!file) return;
    if (file.size > maximumFileBytes) throw new Error("CSVが大きすぎます。2MB以内のファイルを選んでください。");
    const table = parseCsv(await file.text());
    if (table.length < 2) throw new Error("会社データを読み取れませんでした。NotionのデータベースをCSVで書き出してください。");
    if (table.length - 1 > maximumRows) throw new Error(`一度に移行できるのは${maximumRows}件までです。CSVを分けてください。`);
    const headers = table[0].map((header, index) => header || `列${index + 1}`);
    if (headers.length > maximumColumns) throw new Error(`列が多すぎます。${maximumColumns}列以内にしてください。`);
    const width = headers.length;
    const rows = table.slice(1).map(row => Array.from({ length: width }, (_, index) => row[index] || ""));
    const mapping = headers.map(localFieldForHeader);
    csvState = { headers, rows, mapping, fileName: file.name };
    renderFileSummary(file, headers, rows, mapping);
    aiButton.disabled = false;
    renderCandidates("端末内の自動判定");
  }

  function columnsForAi() {
    return csvState.headers.map((header, index) => ({
      index,
      header: String(header).slice(0, 80),
      examples: isSensitiveHeader(header) ? [] : [...new Set(csvState.rows.map(row => String(row[index] || "").slice(0, 100)).filter(Boolean))].slice(0, 3)
    }));
  }

  async function aiRequest() {
    if (busy || !csvState) return;
    if (!apiBase || typeof cloudUser === "undefined" || !cloudUser) {
      setStatus("AI判定を使うには先にログインしてください。端末内の自動判定はそのまま利用できます。");
      return;
    }
    busy = true;
    aiButton.disabled = true;
    aiButton.textContent = "AI判定中...";
    setStatus("列名をAIで確認しています。CSVファイルは保存しません。");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(`${apiBase}/v1/ai/import-map`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await cloudUser.getIdToken()}`
        },
        body: JSON.stringify({ columns: columnsForAi() }),
        signal: controller.signal
      });
      const payload = await readLimitedResponseJson(response, 300_000).catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `AI判定に失敗しました（${response.status}）。`);
      const nextMapping = [...csvState.mapping];
      (Array.isArray(payload.mapping) ? payload.mapping : []).forEach(item => {
        const index = Number(item?.index);
        const field = String(item?.field || "ignore");
        if (Number.isInteger(index) && index >= 0 && index < nextMapping.length && allowedFields.has(field)) {
          nextMapping[index] = field;
        }
      });
      csvState.mapping = nextMapping;
      renderCandidates("AI判定");
      window.dispatchEvent(new CustomEvent("nextround:ai-usage-changed", { detail: payload.usage || null }));
    } catch (error) {
      setStatus(error?.name === "AbortError" ? "AI判定に時間がかかっています。端末内の自動判定で続けられます。" : (error?.message || "AI判定に失敗しました。"));
    } finally {
      clearTimeout(timeout);
      busy = false;
      aiButton.disabled = !csvState;
      aiButton.textContent = "AIで列を判定";
    }
  }

  modeButtons.forEach(button => button.addEventListener("click", () => activateMode(button.dataset.importMode, true)));
  chooseButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    try {
      await loadFile(fileInput.files?.[0]);
    } catch (error) {
      csvState = null;
      aiButton.disabled = true;
      fileSummary.hidden = true;
      setStatus(error?.message || "CSVを読み込めませんでした。");
    } finally {
      fileInput.value = "";
    }
  });
  aiButton.addEventListener("click", aiRequest);

  window.NEXTROUND_NOTION_IMPORT = { reset, parseCsv };
})();
