/* =====================================================================
   H-Rua!! スロット・エントランス
   - 初回表示時にプロフィール本体をロック
   - ボタンを押すと3つのリールが回転
   - 90%で777、10%でハズレ
   - 777なら左右のVIP扉が開き、プロフィールを表示
   - ハズレなら再挑戦ボタンを表示
   ===================================================================== */
(() => {
  "use strict";

  const gate = document.getElementById("slotGate");
  const spinButton = document.getElementById("slotSpinButton");
  const passcodeInput = document.getElementById("entryPasscode");
  const unlockButton = document.getElementById("coinUnlockButton");
  const coinAccessPanel = document.getElementById("coinAccessPanel");
  const coinAccessStatus = document.getElementById("coinAccessStatus");
  const coinToken = document.getElementById("coinToken");
  const slotDisplay = document.querySelector(".slot-machine-display");
  const buttonLabel = document.getElementById("slotButtonLabel");
  const enterButton = document.getElementById("slotEnterButton");
  const status = document.getElementById("slotGateStatus");
  const reels = [
    document.getElementById("slotReel1"),
    document.getElementById("slotReel2"),
    document.getElementById("slotReel3")
  ];

  // 必要なHTMLが見つからない場合は、サイトが操作不能にならないようロック解除。
  if (!gate || !spinButton || !enterButton || reels.some((reel) => !reel)) {
    document.body.classList.remove("gate-locked");
    return;
  }

  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isSpinning = false;
  let isWinner = false;
  let coinUnlocked = false;

  // 初期入場コード。必要に応じてこの4桁を変更してください。
  // 注意：GitHub Pagesの静的JavaScriptに置くコードは、閲覧者がソースから確認できます。
  // 本格的なアクセス制限ではなく、スロット演出用の簡易ゲートです。
  const ENTRY_PASSCODE = "0000";

  const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  function showSymbol(reel, value) {
    const span = reel.querySelector("span");
    if (span) span.textContent = value;
  }

  function spinReel(reel, finalValue, stopAfter) {
    return new Promise((resolve) => {
      let timer = null;
      if (!reducedMotion) {
        reel.classList.add("is-spinning");
        timer = window.setInterval(() => {
          showSymbol(reel, symbols[Math.floor(Math.random() * symbols.length)]);
        }, 75);
      }

      window.setTimeout(() => {
        if (timer) window.clearInterval(timer);
        reel.classList.remove("is-spinning");
        showSymbol(reel, finalValue);
        reel.classList.add("has-stopped");
        resolve();
      }, reducedMotion ? 140 : stopAfter);
    });
  }

  function chooseResult() {
    // 1回ごとに90%で777。ハズレ側は必ず777以外の数字になります。
    if (Math.random() < 0.90) return ["7", "7", "7"];

    let result;
    do {
      result = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
    } while (result.every((symbol) => symbol === "7"));
    return result;
  }


  // 4桁コードが一致したらコイン投入演出を行い、スロットを解放します。
  function unlockCoin() {
    if (coinUnlocked) return;
    const entered = (passcodeInput && passcodeInput.value || "").trim();

    if (!/^\d{4}$/.test(entered)) {
      if (coinAccessStatus) coinAccessStatus.textContent = "数字4桁を入力してください。入力欄をタップして続けられます。";
      if (passcodeInput) passcodeInput.setAttribute("aria-invalid", "true");
      if (coinAccessPanel) {
        coinAccessPanel.classList.remove("is-error");
        void coinAccessPanel.offsetWidth;
        coinAccessPanel.classList.add("is-error");
      }
      return;
    }

    if (entered !== ENTRY_PASSCODE) {
      if (coinAccessStatus) coinAccessStatus.textContent = "暗号が違います。入力欄をタップして、もう一度入力してください。";
      if (passcodeInput) {
        passcodeInput.value = "";
        passcodeInput.setAttribute("aria-invalid", "true");
      }
      // モバイルではボタン押下後のプログラムフォーカスでキーボードが
      // 再表示されないブラウザがあるため、自動focusせず再タップを案内します。
      if (coinAccessPanel) {
        coinAccessPanel.classList.remove("is-error");
        void coinAccessPanel.offsetWidth;
        coinAccessPanel.classList.add("is-error");
      }
      return;
    }

    coinUnlocked = true;
    if (coinAccessPanel) coinAccessPanel.hidden = true;
    if (coinToken) {
      coinToken.hidden = false;
      coinToken.classList.add("is-inserted");
    }
    if (spinButton) {
      spinButton.hidden = false;
      spinButton.disabled = false;
    }
    if (buttonLabel) buttonLabel.textContent = "TAP TO SPIN";
    if (coinAccessStatus) coinAccessStatus.textContent = "COIN INSERTED — スロットの準備ができました。";
    status.textContent = "コインを確認！スロットを回して777を狙おう。";
  }

  async function startSpin() {
    if (isSpinning || isWinner || !coinUnlocked) return;

    isSpinning = true;
    spinButton.disabled = true;
    spinButton.classList.add("is-pressed");
    enterButton.hidden = true;
    gate.classList.remove("is-loser", "is-jackpot");
    reels.forEach((reel) => reel.classList.remove("has-stopped"));

    if (buttonLabel) buttonLabel.textContent = "SPINNING...";
    status.textContent = "リール回転中……777を狙え！";

    const result = chooseResult();
    const timings = reducedMotion ? [140, 140, 140] : [1350, 1850, 2350];

    // 3つのリールを少しずつ時間差で止めます。
    await Promise.all(reels.map((reel, index) => spinReel(reel, result[index], timings[index])));

    isSpinning = false;
    spinButton.disabled = false;
    spinButton.classList.remove("is-pressed");

    if (result.every((symbol) => symbol === "7")) {
      isWinner = true;
      gate.classList.add("is-jackpot");
      status.textContent = "JACKPOT!! 777 COMPLETE. 扉が開く！";
      spinButton.hidden = true;
      enterButton.hidden = false;
      window.dispatchEvent(new CustomEvent("hr:jackpot"));
    } else {
      gate.classList.add("is-loser");
      status.textContent = `惜しい！ ${result.join("  •  ")}  ハズレ！もう一度挑戦しよう。`;
      if (buttonLabel) buttonLabel.textContent = "TRY AGAIN";
      spinButton.setAttribute("aria-label", "もう一度スロットに挑戦");
    }
  }

  function openProfile() {
    if (!isWinner) return;
    // ユーザーが「プロフィールへ入る」を押した瞬間にBGM再生を試みます。
    if (window.HRuaBgm && typeof window.HRuaBgm.start === "function") {
      window.HRuaBgm.start();
    }
    gate.classList.add("is-opening");
    status.textContent = "WELCOME TO H-Rua!!";
    window.setTimeout(() => {
      gate.classList.add("is-gone");
      document.body.classList.remove("gate-locked");
      // ダイアログをDOM上から除去し、プロフィールへフォーカスを移します。
      window.setTimeout(() => {
        gate.remove();
        // プロフィール側の追加演出を入場完了後に開始します。
        window.dispatchEvent(new CustomEvent("hr:profile-entered"));
        const main = document.getElementById("main");
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
        }
      }, 850);
    }, 650);
  }

  if (unlockButton) unlockButton.addEventListener("click", unlockCoin);
  if (passcodeInput) {
    passcodeInput.addEventListener("input", () => {
      passcodeInput.value = passcodeInput.value.replace(/\D/g, "").slice(0, 4);
      passcodeInput.removeAttribute("aria-invalid");
      if (coinAccessPanel) coinAccessPanel.classList.remove("is-error");
      if (coinAccessStatus && !coinUnlocked) {
        coinAccessStatus.textContent = passcodeInput.value.length === 4
          ? "4桁を入力しました。「コインを獲得」を押してください。"
          : "4桁の暗号を入力してコインを獲得。";
      }
    });
    passcodeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        unlockCoin();
      }
    });
  }

  spinButton.addEventListener("click", startSpin);
  // スロット本体をタップしても回転開始。Enter / Spaceキーでも操作できます。
  if (slotDisplay) {
    slotDisplay.setAttribute("role", "button");
    slotDisplay.setAttribute("tabindex", "0");
    slotDisplay.setAttribute("aria-label", "スロットを回す");
    slotDisplay.addEventListener("click", startSpin);
    slotDisplay.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startSpin();
      }
    });
  }
  enterButton.addEventListener("click", openProfile);

  // スマホではユーザーが入力欄を直接タップしたときに
  // 数字キーボードが開くよう、自動フォーカスは行いません。
})();
