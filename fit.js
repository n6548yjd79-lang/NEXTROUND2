(() => {
  const fitStorageKey = "nextround-fit-v1";
  const axisOrder = ["initiative", "collaboration", "challenge", "logic", "execution", "adaptability", "growth"];
  const axes = {
    initiative: {
      label: "主体性",
      color: "#61f4de",
      keywords: ["自ら", "主体", "自律", "率先", "能動", "当事者", "責任", "オーナーシップ", "自分で考"],
      strength: "指示を待つだけでなく、自分で考えて動く姿勢",
      interview: "自分で課題を見つけ、行動を起こした経験",
      gap: "企業は自分から判断して動く場面を多く求める可能性があります。"
    },
    collaboration: {
      label: "協働性",
      color: "#7ad7ff",
      keywords: ["協働", "チーム", "周囲", "巻き込", "連携", "対話", "信頼", "尊重", "共創", "仲間"],
      strength: "周囲の意見を生かしながら成果をつくる姿勢",
      interview: "立場の違う人と協力し、成果につなげた経験",
      gap: "個人で完結するより、周囲との連携が頻繁に求められる可能性があります。"
    },
    challenge: {
      label: "挑戦志向",
      color: "#ffcf5a",
      keywords: ["挑戦", "変革", "新しい", "創造", "革新", "イノベ", "未知", "前例", "開拓", "失敗を恐れ"],
      strength: "前例にとらわれず、新しい可能性を試す姿勢",
      interview: "不確実な状況でも挑戦し、学びを得た経験",
      gap: "安定した進め方より、新しい方法を試す機会が多い可能性があります。"
    },
    logic: {
      label: "論理・慎重性",
      color: "#b79cff",
      keywords: ["論理", "分析", "データ", "仮説", "本質", "課題", "計画", "品質", "正確", "考え抜"],
      strength: "情報を整理し、根拠を持って判断する姿勢",
      interview: "情報を分析し、筋道を立てて問題を解決した経験",
      gap: "直感だけでなく、根拠や検証を求められる場面が多い可能性があります。"
    },
    execution: {
      label: "実行力",
      color: "#36d399",
      keywords: ["実行", "スピード", "行動", "やり切", "成果", "達成", "推進", "迅速", "最後まで", "完遂"],
      strength: "考えるだけで終わらせず、成果までやり切る姿勢",
      interview: "目標から逆算し、最後まで実行した経験",
      gap: "検討に時間をかけるより、早い行動と結果が求められる可能性があります。"
    },
    adaptability: {
      label: "適応力",
      color: "#ff9f7a",
      keywords: ["変化", "柔軟", "適応", "多様", "状況", "臨機応変", "環境", "変化を楽し", "変化に対応"],
      strength: "状況の変化を受け止め、柔軟に動き方を変える姿勢",
      interview: "予定外の変化に対応し、立て直した経験",
      gap: "役割や優先順位が途中で変わる環境を想定しておく必要があります。"
    },
    growth: {
      label: "成長・学習",
      color: "#ff8fb3",
      keywords: ["成長", "学習", "学び", "向上", "専門", "好奇心", "自己研鑽", "吸収", "知識", "スキル"],
      strength: "新しい知識を吸収し、自分を更新し続ける姿勢",
      interview: "学びを行動に移し、以前より成長できた経験",
      gap: "継続的な学習や自己更新が強く求められる可能性があります。"
    }
  };

  const question = (axis, text, left, right, highSide = "right") => ({ axis, text, left, right, highSide });
  const baseQuestions = [
    question("initiative", "初めての仕事を任されたとき、最初の動きに近いのは？", "手順を確認してから始める", "自分で仮説を立てて着手する"),
    question("initiative", "チーム全体の課題に気づいたときは？", "担当範囲に集中する", "担当外でも改善を提案する"),
    question("initiative", "方向性が曖昧な場面では？", "明確な指示を待つ", "仮の方向性を示して確認する"),
    question("initiative", "会議で意見が出ていないときは？", "他の人の発言を待つ", "自分から最初の案を出す"),
    question("initiative", "難しい判断が必要なときは？", "責任者に判断を委ねる", "必要な情報を集めて自分の案を示す"),
    question("initiative", "改善できそうな作業を見つけたら？", "今の方法を続ける", "小さくても改善を試す"),

    question("collaboration", "意見が割れたチームでは？", "自分の案の正しさを説明する", "各意見を整理して合意点を探す"),
    question("collaboration", "自分の作業が順調な一方で、仲間が遅れていたら？", "自分の担当を優先する", "声をかけて手伝えることを探す"),
    question("collaboration", "成果を出すうえで近い考えは？", "個人の能力が最も重要", "チームの連携が最も重要"),
    question("collaboration", "相談を受けたときは？", "結論や解決策をすぐ伝える", "相手の考えを聞いて一緒に整理する"),
    question("collaboration", "自分と違う価値観の人と働くときは？", "効率を優先して距離を保つ", "違いの理由を知ろうとする"),
    question("collaboration", "チームで成功したときの捉え方は？", "自分の貢献を明確にしたい", "全員の貢献を共有したい"),

    question("challenge", "新しい仕事の進め方について近いのは？", "実績のある方法を選ぶ", "未経験の方法も試してみる"),
    question("challenge", "失敗する可能性がある提案は？", "成功確率が上がるまで待つ", "小さく試して学びを得る"),
    question("challenge", "前例がない課題に対しては？", "前例ができるまで慎重に進める", "自分たちで最初の事例をつくる"),
    question("challenge", "変化の少ない環境と多い環境なら？", "安定した環境を好む", "変化の多い環境を好む"),
    question("challenge", "新しい提案への反応は？", "リスクを先に確認する", "可能性を先に考える"),
    question("challenge", "担当を選べるなら？", "経験があり確実に成果を出せる仕事", "難しいが成長できそうな仕事"),

    question("logic", "重要な判断をするときは？", "直感と経験を重視する", "データと根拠を整理する"),
    question("logic", "提出前の確認について近いのは？", "スピードを優先して提出する", "細部まで確認してから提出する"),
    question("logic", "複雑な問題に直面したら？", "まず全体感から答えを考える", "要素に分解して原因を探る"),
    question("logic", "説明するときに重視するのは？", "相手が納得できる印象", "結論までの筋道と根拠"),
    question("logic", "計画を立てる際は？", "状況に応じてその場で決める", "事前に手順とリスクを整理する"),
    question("logic", "情報が足りない状態では？", "仮決定して前に進む", "追加情報を集めて精度を上げる"),

    question("execution", "アイデアを思いついた後は？", "十分に練ってから共有する", "早めに形にして反応を見る"),
    question("execution", "期限が厳しい仕事では？", "完成度を高めることを優先", "期限内に形にすることを優先"),
    question("execution", "長期の目標に対しては？", "状況が整ってから本格的に動く", "小さな行動をすぐ始める"),
    question("execution", "仕事が停滞したときは？", "原因が完全に分かるまで考える", "次に進める一手をまず実行する"),
    question("execution", "複数の仕事があるときは？", "一つずつ丁寧に仕上げる", "優先順位をつけてテンポよく進める"),
    question("execution", "目標達成に必要なら？", "当初の進め方を守る", "途中で方法を変えてでもやり切る"),

    question("adaptability", "急な予定変更が起きたときは？", "元の計画への影響が気になる", "新しい条件に合わせて組み直す"),
    question("adaptability", "担当業務が変わったときは？", "慣れた役割を続けたい", "新しい役割を理解して適応する"),
    question("adaptability", "予想外の質問を受けたら？", "準備した内容に戻して答える", "その場の意図を考えて答える"),
    question("adaptability", "異なる文化や考え方の環境では？", "自分のやり方を維持する", "相手に合わせて伝え方を変える"),
    question("adaptability", "計画どおりに進まないときは？", "当初の計画に戻すことを優先", "現状に合う新しい計画を作る"),
    question("adaptability", "変化が続く状況では？", "落ち着くまで様子を見る", "変化の中でできることを探す"),

    question("growth", "知らない分野に触れたときは？", "必要になってから調べる", "興味を持って自分から学ぶ"),
    question("growth", "失敗した後に近いのは？", "気持ちを切り替えて次へ進む", "原因と学びを振り返って次へ進む"),
    question("growth", "得意分野については？", "今の強みを安定して使いたい", "さらに深く学んで更新したい"),
    question("growth", "フィードバックを受けたら？", "自分なりのやり方を優先する", "試しに取り入れて変化を見る"),
    question("growth", "自由時間に仕事関連で行うなら？", "今ある知識を整理する", "新しい知識や技能を学ぶ"),
    question("growth", "難しい仕事を終えた後は？", "無事に終わったことを重視", "次に生かせる学びを言語化する")
  ];

  const companyQuestionBank = {
    initiative: [
      question("initiative", "この企業で、指示がないまま課題に気づいたら？", "担当者の判断を待つ", "自分の改善案を作って提案する"),
      question("initiative", "入社直後でも意見を求められたら？", "経験を積むまで発言を控える", "分かる範囲で自分の考えを伝える"),
      question("initiative", "責任の所在が曖昧な仕事では？", "役割が決まるまで待つ", "必要な役割を自分から引き受ける")
    ],
    collaboration: [
      question("collaboration", "この企業で部署をまたぐ課題が出たら？", "自部署の範囲で解決する", "関係者を集めて一緒に進める"),
      question("collaboration", "考え方の違う仲間と働くなら？", "成果のため自分の方法を通す", "違いを整理して共通点をつくる"),
      question("collaboration", "チーム内で情報差があるときは？", "必要な人だけで進める", "全員が動けるよう情報を共有する")
    ],
    challenge: [
      question("challenge", "この企業で前例のない企画を任されたら？", "成功例が見つかるまで待つ", "小さく試して可能性を確かめる"),
      question("challenge", "失敗の可能性がある挑戦については？", "確実性の高い案を選ぶ", "学びが大きいなら挑戦する"),
      question("challenge", "既存の方法に改善余地を感じたら？", "実績を優先して維持する", "新しい方法を提案する")
    ],
    logic: [
      question("logic", "この企業の顧客へ提案する前に重視するのは？", "印象に残るアイデア", "課題を裏付ける根拠と分析"),
      question("logic", "短時間で判断を求められたら？", "経験や直感を中心に決める", "限られた情報でも比較して決める"),
      question("logic", "複雑な問題の説明では？", "分かりやすい結論を先に示す", "原因と結論のつながりまで示す")
    ],
    execution: [
      question("execution", "この企業で新しい案が決まった後は？", "完成度を高めてから動く", "役割を決めてすぐ動き始める"),
      question("execution", "目標達成が遅れているときは？", "計画を丁寧に見直す", "優先順位を変えて実行量を増やす"),
      question("execution", "成果まで時間がかかる仕事では？", "状況に応じて目標を調整する", "小さな成果を積み上げてやり切る")
    ],
    adaptability: [
      question("adaptability", "この企業で急に方針が変わったら？", "変更理由が固まるまで待つ", "新しい条件で計画を組み直す"),
      question("adaptability", "異なる職種の人と働くときは？", "自分の専門的な進め方を保つ", "相手に合わせて伝え方を変える"),
      question("adaptability", "想定外の役割を任されたら？", "本来の担当へ戻れるよう相談する", "必要なことを学びながら対応する")
    ],
    growth: [
      question("growth", "この企業で未知の知識が必要になったら？", "詳しい人の支援を待つ", "自分で学び、すぐ仕事で試す"),
      question("growth", "厳しいフィードバックを受けたら？", "自分の考えとの違いを説明する", "改善に使える部分を試してみる"),
      question("growth", "仕事に慣れて成果が安定したら？", "今の得意分野で成果を続ける", "次の難しい課題を探す")
    ]
  };

  const emptyState = () => ({ profileAnswers: [], profileScores: null, profileCompletedAt: "", reports: [] });
  let state = loadFitState();
  let quizMode = "";
  let quizQuestions = [];
  let quizAnswers = [];
  let quizIndex = 0;
  let companyDraft = null;
  let scoreAnimationFrame = null;

  const fitDialog = document.querySelector("#fitDialog");
  const fitHomeView = document.querySelector("#fitHomeView");
  const fitQuizView = document.querySelector("#fitQuizView");
  const fitResultView = document.querySelector("#fitResultView");
  if (!fitDialog || !document.querySelector("#fitOpenBtn")) return;

  const fitProfileStatus = document.querySelector("#fitProfileStatus");
  const fitProfileBtn = document.querySelector("#fitProfileBtn");
  const fitCompanyName = document.querySelector("#fitCompanyName");
  const fitCompanyText = document.querySelector("#fitCompanyText");
  const fitCompanyStartBtn = document.querySelector("#fitCompanyStartBtn");
  const fitCompanyError = document.querySelector("#fitCompanyError");
  const fitRanking = document.querySelector("#fitRanking");
  const fitBackBtn = document.querySelector("#fitBackBtn");

  document.querySelector("#fitOpenBtn").addEventListener("click", openFitDialog);
  document.querySelector("#closeFitDialog").addEventListener("click", closeFitDialog);
  fitBackBtn.addEventListener("click", showFitHome);
  fitProfileBtn.addEventListener("click", startProfileQuiz);
  fitCompanyStartBtn.addEventListener("click", startCompanyQuiz);
  fitCompanyText.addEventListener("input", updateFitTextMeta);
  document.querySelector("#fitPrevQuestionBtn").addEventListener("click", previousFitQuestion);
  document.querySelector("#fitNextQuestionBtn").addEventListener("click", nextFitQuestion);
  document.querySelector("#fitAnswerScale").addEventListener("click", handleFitAnswer);
  document.querySelector("#fitAnotherCompanyBtn").addEventListener("click", showFitHome);
  document.querySelector("#fitResetBtn").addEventListener("click", resetFitData);

  function loadFitState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(fitStorageKey));
      return {
        ...emptyState(),
        ...parsed,
        profileAnswers: Array.isArray(parsed?.profileAnswers) ? parsed.profileAnswers.slice(0, baseQuestions.length) : [],
        reports: Array.isArray(parsed?.reports) ? parsed.reports.slice(0, 30) : []
      };
    } catch {
      return emptyState();
    }
  }

  function saveFitState() {
    localStorage.setItem(fitStorageKey, JSON.stringify(state));
  }

  function openFitDialog() {
    document.querySelector("#analyticsDialog")?.close();
    showFitHome();
    fitDialog.showModal();
  }

  function closeFitDialog() {
    if (scoreAnimationFrame) cancelAnimationFrame(scoreAnimationFrame);
    fitDialog.close();
  }

  function setFitView(name) {
    fitHomeView.hidden = name !== "home";
    fitQuizView.hidden = name !== "quiz";
    fitResultView.hidden = name !== "result";
    fitBackBtn.hidden = name === "home";
    document.querySelector("#fitDialogTitle").textContent = name === "quiz"
      ? (quizMode === "profile" ? "基本診断" : "企業別診断")
      : name === "result" ? "診断結果" : "企業フィット診断";
    fitDialog.scrollTop = 0;
  }

  function showFitHome() {
    setFitView("home");
    renderFitHome();
  }

  function renderFitHome() {
    const complete = Boolean(state.profileScores);
    const answered = state.profileAnswers.filter(value => Number.isInteger(value)).length;
    fitProfileStatus.innerHTML = complete
      ? `<div><small>基本プロフィール</small><strong>診断完了</strong><span>42問の回答を保存済み</span></div><b>READY</b>`
      : `<div><small>基本プロフィール</small><strong>${answered ? `${answered} / 42問まで回答` : "未診断"}</strong><span>${answered ? "続きから回答できます" : "最初に仕事上の傾向を診断します"}</span></div><b>${answered ? "SAVED" : "START"}</b>`;
    fitProfileBtn.textContent = complete ? "基本診断を見直す" : answered ? "基本診断の続きをする" : "基本診断を始める";
    document.querySelector("#fitCompanyReady").textContent = complete ? "診断可能" : "基本診断が必要";
    fitCompanyStartBtn.disabled = !complete;
    renderFitRanking();
    updateFitTextMeta();
  }

  function updateFitTextMeta() {
    document.querySelector("#fitTextCount").textContent = `${fitCompanyText.value.trim().length}文字`;
  }

  function startProfileQuiz() {
    quizMode = "profile";
    quizQuestions = baseQuestions;
    quizAnswers = [...state.profileAnswers];
    while (quizAnswers.length < quizQuestions.length) quizAnswers.push(null);
    const firstEmpty = quizAnswers.findIndex(value => !Number.isInteger(value));
    quizIndex = firstEmpty >= 0 ? firstEmpty : 0;
    setFitView("quiz");
    renderFitQuestion();
  }

  function startCompanyQuiz() {
    fitCompanyError.textContent = "";
    if (!state.profileScores) {
      fitCompanyError.textContent = "先に基本診断を完了してください。";
      return;
    }
    const name = fitCompanyName.value.trim();
    const sourceText = fitCompanyText.value.trim();
    if (!name) {
      fitCompanyError.textContent = "企業名を入力してください。";
      return;
    }
    if (sourceText.length < 40) {
      fitCompanyError.textContent = "求める人物像や価値観を40文字以上貼り付けてください。";
      return;
    }
    const analysis = analyzeCompanyText(sourceText);
    companyDraft = { name, sourceText, analysis };
    quizMode = "company";
    quizQuestions = buildCompanyQuestions(analysis, name);
    quizAnswers = Array(quizQuestions.length).fill(null);
    quizIndex = 0;
    setFitView("quiz");
    renderFitQuestion();
  }

  function renderFitQuestion() {
    const item = quizQuestions[quizIndex];
    const total = quizQuestions.length;
    const selected = quizAnswers[quizIndex];
    document.querySelector("#fitQuizSection").textContent = quizMode === "profile" ? "基本診断 42問" : `${companyDraft.name} 追加診断`;
    document.querySelector("#fitQuizProgressText").textContent = `${quizIndex + 1} / ${total}`;
    document.querySelector("#fitQuizProgressBar").style.width = `${((quizIndex + 1) / total) * 100}%`;
    document.querySelector("#fitQuestionAxis").textContent = axes[item.axis].label;
    document.querySelector("#fitQuestionAxis").style.setProperty("--fit-axis", axes[item.axis].color);
    document.querySelector("#fitQuestionText").textContent = item.text;
    document.querySelector("#fitQuestionLeft").textContent = item.left;
    document.querySelector("#fitQuestionRight").textContent = item.right;
    document.querySelectorAll("[data-fit-answer]").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.fitAnswer) === selected);
    });
    document.querySelector("#fitPrevQuestionBtn").disabled = quizIndex === 0;
    document.querySelector("#fitNextQuestionBtn").textContent = quizIndex === total - 1 ? "診断結果を見る" : "次へ";
  }

  function handleFitAnswer(event) {
    const button = event.target.closest("[data-fit-answer]");
    if (!button) return;
    const answeredIndex = quizIndex;
    quizAnswers[quizIndex] = Number(button.dataset.fitAnswer);
    if (quizMode === "profile") {
      state.profileAnswers = [...quizAnswers];
      saveFitState();
    }
    renderFitQuestion();
    if (quizIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        if (quizIndex === answeredIndex && Number.isInteger(quizAnswers[answeredIndex])) {
          quizIndex += 1;
          renderFitQuestion();
        }
      }, 170);
    }
  }

  function previousFitQuestion() {
    if (quizIndex <= 0) return;
    quizIndex -= 1;
    renderFitQuestion();
  }

  function nextFitQuestion() {
    if (!Number.isInteger(quizAnswers[quizIndex])) {
      pulseQuestionCard();
      return;
    }
    if (quizIndex < quizQuestions.length - 1) {
      quizIndex += 1;
      renderFitQuestion();
      return;
    }
    const firstEmpty = quizAnswers.findIndex(value => !Number.isInteger(value));
    if (firstEmpty >= 0) {
      quizIndex = firstEmpty;
      renderFitQuestion();
      pulseQuestionCard();
      return;
    }
    if (quizMode === "profile") completeProfileQuiz();
    else completeCompanyQuiz();
  }

  function pulseQuestionCard() {
    const card = document.querySelector(".fit-question-card");
    card.classList.remove("needs-answer");
    requestAnimationFrame(() => card.classList.add("needs-answer"));
  }

  function completeProfileQuiz() {
    state.profileAnswers = [...quizAnswers];
    state.profileScores = calculateAxisScores(baseQuestions, quizAnswers);
    state.profileCompletedAt = new Date().toISOString();
    saveFitState();
    showFitHome();
  }

  function completeCompanyQuiz() {
    const report = calculateCompanyReport(companyDraft, quizQuestions, quizAnswers);
    const normalizedName = report.company.toLocaleLowerCase("ja");
    state.reports = [report, ...state.reports.filter(item => item.company.toLocaleLowerCase("ja") !== normalizedName)].slice(0, 30);
    saveFitState();
    renderFitResult(report);
  }

  function calculateAxisScores(questions, answers) {
    const values = Object.fromEntries(axisOrder.map(axis => [axis, []]));
    questions.forEach((item, index) => {
      const answer = answers[index];
      if (!Number.isInteger(answer)) return;
      const score = item.highSide === "left" ? (5 - answer) * 25 : (answer - 1) * 25;
      values[item.axis].push(score);
    });
    return Object.fromEntries(axisOrder.map(axis => {
      const axisValues = values[axis];
      const average = axisValues.length ? axisValues.reduce((sum, value) => sum + value, 0) / axisValues.length : 50;
      return [axis, Math.round(average)];
    }));
  }

  function analyzeCompanyText(sourceText) {
    const normalized = sourceText.toLocaleLowerCase("ja");
    const counts = {};
    let totalHits = 0;
    axisOrder.forEach(axis => {
      const hits = axes[axis].keywords.reduce((sum, keyword) => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return sum + (normalized.match(new RegExp(escaped, "g")) || []).length;
      }, 0);
      counts[axis] = hits;
      totalHits += hits;
    });
    const rawWeights = Object.fromEntries(axisOrder.map(axis => [axis, 1 + counts[axis] * 2.4]));
    const totalWeight = Object.values(rawWeights).reduce((sum, value) => sum + value, 0);
    const weights = Object.fromEntries(axisOrder.map(axis => [axis, rawWeights[axis] / totalWeight]));
    const targets = Object.fromEntries(axisOrder.map(axis => [axis, Math.min(92, 58 + counts[axis] * 8)]));
    return { counts, weights, targets, totalHits, textLength: sourceText.length };
  }

  function buildCompanyQuestions(analysis, companyName) {
    const ranked = [...axisOrder].sort((a, b) => analysis.weights[b] - analysis.weights[a] || axisOrder.indexOf(a) - axisOrder.indexOf(b));
    const picks = [
      companyQuestionBank[ranked[0]][0],
      companyQuestionBank[ranked[0]][1],
      companyQuestionBank[ranked[1]][0],
      companyQuestionBank[ranked[2]][0],
      companyQuestionBank[ranked[1]][1]
    ];
    return picks.map(item => ({ ...item, text: item.text.replace("この企業", companyName) }));
  }

  function calculateCompanyReport(draft, questions, answers) {
    const specificScores = calculateAxisScores(questions, answers);
    const answeredAxes = new Set(questions.map(item => item.axis));
    const combinedScores = Object.fromEntries(axisOrder.map(axis => [
      axis,
      answeredAxes.has(axis)
        ? Math.round(state.profileScores[axis] * 0.72 + specificScores[axis] * 0.28)
        : state.profileScores[axis]
    ]));
    const similarities = Object.fromEntries(axisOrder.map(axis => [
      axis,
      Math.round(clamp(100 - Math.abs(combinedScores[axis] - draft.analysis.targets[axis]) * 1.12, 0, 100))
    ]));
    const weightedScore = axisOrder.reduce((sum, axis) => sum + similarities[axis] * draft.analysis.weights[axis], 0);
    const match = Math.round(clamp(weightedScore, 0, 100));
    const confidence = calculateConfidence(draft.analysis);
    const rankedSimilarity = [...axisOrder].sort((a, b) => similarities[b] - similarities[a]);
    const rankedImportance = [...axisOrder].sort((a, b) => draft.analysis.weights[b] - draft.analysis.weights[a]);
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      company: draft.name,
      sourceText: draft.sourceText,
      createdAt: new Date().toISOString(),
      match,
      confidence,
      companyAnalysis: draft.analysis,
      profileScores: combinedScores,
      similarities,
      strengths: rankedSimilarity.slice(0, 3),
      differences: [...rankedSimilarity].reverse().slice(0, 2),
      importantAxes: rankedImportance.slice(0, 3)
    };
  }

  function calculateConfidence(analysis) {
    const consistency = profileConsistency();
    const enoughText = analysis.textLength >= 160;
    const enoughHits = analysis.totalHits >= 5;
    if (enoughText && enoughHits && consistency >= 65) return { level: "高", className: "high", detail: "企業情報と回答の一貫性が十分" };
    if (analysis.textLength >= 80 && analysis.totalHits >= 2) return { level: "中", className: "medium", detail: "情報を追加すると精度が上がります" };
    return { level: "低", className: "low", detail: "企業文章が短いため参考値です" };
  }

  function profileConsistency() {
    const grouped = Object.fromEntries(axisOrder.map(axis => [axis, []]));
    baseQuestions.forEach((item, index) => {
      const answer = state.profileAnswers[index];
      if (!Number.isInteger(answer)) return;
      const score = item.highSide === "left" ? (5 - answer) * 25 : (answer - 1) * 25;
      grouped[item.axis].push(score);
    });
    const deviations = axisOrder.map(axis => standardDeviation(grouped[axis]));
    const averageDeviation = deviations.reduce((sum, value) => sum + value, 0) / deviations.length;
    return Math.round(clamp(100 - averageDeviation * 1.35, 0, 100));
  }

  function standardDeviation(values) {
    if (!values.length) return 50;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  function renderFitResult(report) {
    setFitView("result");
    document.querySelector("#fitResultCompany").textContent = report.company;
    document.querySelector("#fitConfidence").className = `fit-confidence ${report.confidence.className}`;
    document.querySelector("#fitConfidence").innerHTML = `<strong>分析精度：${report.confidence.level}</strong><span>${escapeFitHtml(report.confidence.detail)}</span>`;
    document.querySelector("#fitRadar").innerHTML = radarMarkup(report);
    document.querySelector("#fitAxisBars").innerHTML = axisOrder.map(axis => `
      <div class="fit-axis-row" style="--axis-color:${axes[axis].color};--axis-rate:${report.similarities[axis]}%;">
        <span>${axes[axis].label}</span><div><i></i></div><strong>${report.similarities[axis]}%</strong>
      </div>
    `).join("");
    document.querySelector("#fitStrengths").innerHTML = report.strengths.map(axis => insightMarkup(axis, axes[axis].strength, report.similarities[axis])).join("");
    document.querySelector("#fitDifferences").innerHTML = report.differences.map(axis => insightMarkup(axis, differenceText(report, axis), report.similarities[axis])).join("");
    document.querySelector("#fitInterviewTips").innerHTML = report.importantAxes.map(axis => insightMarkup(axis, axes[axis].interview, null)).join("");
    document.querySelector("#fitGapNotes").innerHTML = report.differences.map(axis => insightMarkup(axis, axes[axis].gap, null)).join("");
    requestAnimationFrame(() => {
      document.querySelector(".fit-radar-svg")?.classList.add("animate");
      document.querySelectorAll(".fit-axis-row").forEach(row => row.classList.add("animate"));
    });
    animateFitScore(report.match);
  }

  function differenceText(report, axis) {
    const user = report.profileScores[axis];
    const target = report.companyAnalysis.targets[axis];
    if (Math.abs(user - target) < 10) return "大きな違いはありません。ほかの項目と比べると一致度が少し低めです。";
    return user < target
      ? `企業側は${axes[axis].label}をより強く求める傾向があります。`
      : `あなたの${axes[axis].label}は、企業文章から読み取れる水準より強めです。`;
  }

  function insightMarkup(axis, text, score) {
    return `<div class="fit-insight-item" style="--insight:${axes[axis].color};"><span>${axes[axis].label}</span><p>${escapeFitHtml(text)}</p>${Number.isInteger(score) ? `<strong>${score}%</strong>` : ""}</div>`;
  }

  function radarMarkup(report) {
    const centerX = 160;
    const centerY = 132;
    const radius = 88;
    const point = (index, value) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axisOrder.length;
      const scaled = radius * value / 100;
      return `${(centerX + Math.cos(angle) * scaled).toFixed(1)},${(centerY + Math.sin(angle) * scaled).toFixed(1)}`;
    };
    const grid = [25, 50, 75, 100].map(level => `<polygon points="${axisOrder.map((axis, index) => point(index, level)).join(" ")}" />`).join("");
    const spokes = axisOrder.map((axis, index) => `<line x1="${centerX}" y1="${centerY}" x2="${point(index, 100).split(",")[0]}" y2="${point(index, 100).split(",")[1]}" />`).join("");
    const labels = axisOrder.map((axis, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axisOrder.length;
      const x = centerX + Math.cos(angle) * 113;
      const y = centerY + Math.sin(angle) * 105;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${axes[axis].label}</text>`;
    }).join("");
    const maxKeywordCount = Math.max(1, ...axisOrder.map(axis => report.companyAnalysis.counts?.[axis] || 0));
    const companyPoints = axisOrder.map((axis, index) => {
      const keywordCount = report.companyAnalysis.counts?.[axis] || 0;
      const importance = report.companyAnalysis.totalHits ? 40 + (keywordCount / maxKeywordCount) * 60 : 50;
      return point(index, importance);
    }).join(" ");
    const matchPoints = axisOrder.map((axis, index) => point(index, report.similarities[axis])).join(" ");
    return `
      <svg class="fit-radar-svg" viewBox="0 0 320 270" role="img" aria-label="企業の重視度と項目別相性を比較するレーダーチャート">
        <g class="fit-radar-grid">${grid}${spokes}</g>
        <polygon class="fit-radar-company" points="${companyPoints}" />
        <polygon class="fit-radar-user" points="${matchPoints}" />
        <g class="fit-radar-labels">${labels}</g>
      </svg>
      <div class="fit-radar-legend"><span><i class="company"></i>企業の重視度</span><span><i class="user"></i>あなたとの相性</span></div>
    `;
  }

  function animateFitScore(target) {
    const ring = document.querySelector("#fitScoreRing");
    const value = document.querySelector("#fitScoreValue");
    if (scoreAnimationFrame) cancelAnimationFrame(scoreAnimationFrame);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      value.textContent = `${target}%`;
      ring.style.background = `conic-gradient(#ffdf72 ${target * 3.6}deg, rgba(255,255,255,.09) 0deg)`;
      return;
    }
    const startedAt = Date.now();
    const duration = 1150;
    const tick = () => {
      const progress = clamp((Date.now() - startedAt) / duration, 0, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(target * eased);
      value.textContent = `${current}%`;
      ring.style.background = `conic-gradient(#ffdf72 ${current * 3.6}deg, rgba(255,255,255,.09) 0deg)`;
      if (progress < 1) scoreAnimationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  function renderFitRanking() {
    const reports = [...state.reports].sort((a, b) => b.match - a.match || new Date(b.createdAt) - new Date(a.createdAt));
    if (!reports.length) {
      fitRanking.innerHTML = `<p class="fit-ranking-empty">企業を診断すると、ここでマッチ度を比較できます。</p>`;
      return;
    }
    fitRanking.innerHTML = reports.map((report, index) => `
      <button class="fit-ranking-row" type="button" data-fit-report="${escapeFitHtml(report.id)}">
        <span class="fit-rank-number">${index + 1}</span>
        <span><strong>${escapeFitHtml(report.company)}</strong><small>分析精度 ${escapeFitHtml(report.confidence.level)}</small></span>
        <b>${report.match}%</b>
      </button>
    `).join("");
    fitRanking.querySelectorAll("[data-fit-report]").forEach(button => {
      button.addEventListener("click", () => {
        const report = state.reports.find(item => item.id === button.dataset.fitReport);
        if (report) renderFitResult(report);
      });
    });
  }

  function resetFitData() {
    if (!confirm("基本診断の回答、企業文章、診断結果をこの端末から削除します。よろしいですか？")) return;
    localStorage.removeItem(fitStorageKey);
    state = emptyState();
    fitCompanyName.value = "";
    fitCompanyText.value = "";
    renderFitHome();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeFitHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    })[char]);
  }
})();
