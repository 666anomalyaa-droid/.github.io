/* =====================================================================
   メインページの動作
   - site-data.js の内容をHTMLへ表示
   - スマホメニューの開閉
   - ギャラリーの横スクロール
   - Supabaseからお知らせ・公開済みコメントを取得
   - 訪問者コメントの投稿
   ===================================================================== */

(() => {
  "use strict";

  const content = window.SITE_CONTENT;
  const db = window.supabaseClient;
  const isDbReady = window.SUPABASE_READY === true && db;

  // --- 小さな共通関数 ---
  // getElementByIdを短く書くための関数
  const byId = (id) => document.getElementById(id);

  // HTMLとして解釈させず、文字として安全に表示する要素を作る
  // コメント欄の入力などにHTMLタグが含まれていても、コードとして実行されません。
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }

  // --- 1. サイトの基本プロフィールを画面へ反映 ---
  function renderProfile() {
    const p = content.profile;
    byId("brandName").textContent = p.name;
    byId("heroName").textContent = p.name;
    byId("heroNameEn").textContent = p.nameEn;
    byId("heroCatchcopy").textContent = p.catchcopy;
    byId("heroKicker").textContent = p.kicker;
    byId("heroStatus").textContent = p.status;
    byId("heroLocation").textContent = p.location;
    byId("portraitName").textContent = p.name;
    byId("profileImage").src = p.image;
    byId("profileImage").alt = `${p.name}のプロフィール写真`;
    byId("aboutMessage").textContent = p.about;
    byId("profileFullName").textContent = p.fullName;
    byId("profileSubtitle").textContent = p.subtitle;
    byId("profileLocation").textContent = p.location;
    byId("profileMotto").textContent = p.motto;
    byId("footerBrandName").textContent = p.name;
    byId("footerName").textContent = p.name;
    byId("currentYear").textContent = new Date().getFullYear();

    // キーワードタグを並べる
    const tags = byId("aboutTags");
    tags.replaceChildren();
    (p.tags || []).forEach((tag) => tags.append(makeElement("span", "about-tag", tag)));

    // プロフィールカードの詳細項目を並べる
    const details = byId("profileDetails");
    details.replaceChildren();
    (p.details || []).forEach((item) => {
      const wrapper = makeElement("div", "detail-item");
      const label = makeElement("dt", "", item.label);
      const value = makeElement("dd", "", item.value);
      wrapper.append(label, value);
      details.append(wrapper);
    });
  }

  // --- 2. 学歴・経歴を表示 ---
  function renderCareer() {
    const list = byId("careerTimeline");
    list.replaceChildren();
    (content.career || []).forEach((item) => {
      const row = makeElement("div", "timeline-item");
      const date = makeElement("span", "timeline-date", item.date);
      const text = makeElement("div", "timeline-text");
      text.append(makeElement("p", "timeline-title", item.title));
      text.append(makeElement("p", "timeline-description", item.description));
      row.append(date, text);
      list.append(row);
    });
  }

  // --- 3. 資格一覧を表示 ---
  function renderCertificates() {
    const list = byId("certificateList");
    list.replaceChildren();
    (content.certificates || []).forEach((item) => {
      const row = makeElement("li", "");
      row.append(makeElement("span", "certificate-name", item.name));
      row.append(makeElement("span", "certificate-date", item.date));
      list.append(row);
    });
  }

  // --- 4. スキルカードを表示 ---
  function renderSkills() {
    const grid = byId("skillsGrid");
    grid.replaceChildren();
    (content.skills || []).forEach((item) => {
      const card = makeElement("article", "skill-card");
      card.append(makeElement("span", "skill-number", item.title));
      card.append(makeElement("h3", "", item.name));
      card.append(makeElement("p", "", item.description));
      grid.append(card);
    });
  }

  // --- 5. SNS・外部リンクを表示 ---
  function renderSocialLinks() {
    const grid = byId("socialGrid");
    grid.replaceChildren();
    (content.socialLinks || []).forEach((item) => {
      const isValidLink = typeof item.url === "string" && item.url.trim() !== "";
      const card = makeElement(item.copy ? "div" : (isValidLink ? "a" : "div"), `social-card${isValidLink ? "" : " is-disabled"}`);
      if (isValidLink) {
        card.href = item.url;
        // 外部リンクは新しいタブで開き、開いた先から元サイトを操作できないようにする
        if (!item.url.startsWith("mailto:")) {
          card.target = "_blank";
          card.rel = "noopener noreferrer";
        }
      }
      const icon = makeElement("span", "social-icon", item.icon || "↗");
      const info = makeElement("span", "social-info");
      info.append(makeElement("span", "social-name", item.name));
      info.append(makeElement("span", "social-handle", isValidLink ? item.handle : "リンク設定待ち"));
      if (item.activity) info.append(makeElement("span", "social-activity", item.activity));
      card.append(icon, info);
      card.append(makeElement("span", "social-arrow", isValidLink ? "↗" : "—"));
      if (item.copy) {
        const profileLink = makeElement("a", "steam-profile-link", "Steamを開く ↗");
        profileLink.href = item.url;
        profileLink.target = "_blank";
        profileLink.rel = "noopener noreferrer";
        card.append(profileLink);
        const copy = makeElement("button", "steam-copy", "CODEをコピー");
        copy.type = "button";
        copy.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            await navigator.clipboard.writeText(item.copy);
            copy.textContent = "コピー済み";
          } catch (_) {
            copy.textContent = item.copy;
          }
        });
        card.append(copy);
      }
      grid.append(card);
    });
  }

  // --- 6. ギャラリーカードを表示 ---
  function renderGallery() {
    const track = byId("galleryTrack");
    track.replaceChildren();
    (content.gallery || []).forEach((item) => {
      const card = makeElement("article", "gallery-card");
      const imageWrap = makeElement("div", "gallery-image-wrap");
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt || item.title || "ギャラリー画像";
      image.loading = "lazy";
      imageWrap.append(image);

      const body = makeElement("div", "gallery-card-content");
      body.append(makeElement("span", "gallery-date", item.date));
      body.append(makeElement("h3", "", item.title));
      body.append(makeElement("p", "", item.description));
      card.append(imageWrap, body);
      track.append(card);
    });
  }

  // --- 6.5 趣味の詳細（バイク・ゲーム・音楽）を表示 ---
  function renderHobbies() {
    const hobbies = content.hobbies || {};
    const bike = hobbies.bike || {};
    const intro = byId("bikeIntro");
    if (intro) intro.textContent = bike.intro || "";
    const note = byId("bikeNote");
    if (note) note.textContent = bike.note || "";
    const timeline = byId("bikeTimeline");
    if (timeline) {
      timeline.replaceChildren();
      (bike.timeline || []).forEach((item) => {
        const card = makeElement("article", "bike-milestone");
        card.append(makeElement("span", "milestone-date", item.date));
        card.append(makeElement("h3", "", item.title));
        card.append(makeElement("p", "", item.description));
        timeline.append(card);
      });
    }

    const gameGrid = byId("gameGrid");
    if (gameGrid) {
      gameGrid.replaceChildren();
      (hobbies.games || []).forEach((game, index) => {
        const card = makeElement("article", "game-card");
        const top = makeElement("div", "game-card-top");
        top.append(makeElement("span", "game-index", String(index + 1).padStart(2, "0")));
        const status = makeElement("span", "game-status", game.status);
        status.classList.add(game.status === "活動中" ? "is-active" : game.status === "引退済み" ? "is-retired" : "is-regular");
        top.append(status);
        card.append(top, makeElement("h3", "", game.name), makeElement("p", "", game.detail));
        gameGrid.append(card);
      });
    }

    const musicGrid = byId("musicRanking");
    if (musicGrid) {
      musicGrid.replaceChildren();
      (hobbies.music || []).forEach((track) => {
        const row = makeElement("article", "music-row");
        row.append(makeElement("span", "music-rank", track.rank));
        const info = makeElement("div", "music-info");
        info.append(makeElement("h3", "", track.title), makeElement("p", "", track.artist));
        row.append(info, makeElement("span", "music-equalizer", "♫"));
        musicGrid.append(row);
      });
    }
  }

  // --- 7. お知らせを表示 ---
  function renderNews(items) {
    const list = byId("newsList");
    list.replaceChildren();

    if (!items || items.length === 0) {
      list.append(makeElement("p", "empty-message", "現在、公開中のお知らせはありません。"));
      return;
    }

    items.forEach((item) => {
      const row = makeElement("article", "news-item");
      const date = makeElement("time", "news-date");
      date.textContent = formatDate(item.created_at);
      const main = makeElement("div", "news-main");
      main.append(makeElement("h3", "news-title", item.title));
      main.append(makeElement("p", "news-body", item.content));
      row.append(date, main, makeElement("span", "news-label", "UPDATE"));
      list.append(row);
    });
  }

  // --- 8. 公開済みコメントを表示 ---
  function renderGuestMessages(items) {
    const list = byId("messageList");
    const count = byId("messageCount");
    list.replaceChildren();
    count.textContent = `${items.length} messages`;

    if (items.length === 0) {
      list.append(makeElement("p", "empty-message", "まだメッセージはありません。最初の投稿をお待ちしています。"));
      return;
    }

    items.forEach((item) => {
      const card = makeElement("article", "guest-message");
      const top = makeElement("div", "guest-message-top");
      top.append(makeElement("span", "guest-message-name", item.display_name));
      top.append(makeElement("time", "guest-message-date", formatDate(item.created_at)));
      card.append(top);
      card.append(makeElement("p", "guest-message-content", item.content));
      list.append(card);
    });
  }

  // DBの日付を日本語表示にする。日付が不正な場合は空欄にする。
  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }

  // --- 9. DBから最新のお知らせ・コメントを読み込む ---
  async function loadPublicData() {
    if (!isDbReady) {
      renderNews([]);
      renderGuestMessages([]);
      byId("guestFormNote").textContent = "コメント機能を有効にするには、READMEのSupabase設定が必要です。設定後、投稿は管理者の確認を経て公開されます。";
      return;
    }

    // お知らせ：公開設定のものだけ取得
    const newsResult = await db
      .from("announcements")
      .select("id, title, content, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (newsResult.error) {
      console.error("お知らせの読み込みに失敗しました:", newsResult.error.message);
      renderNews([]);
    } else {
      renderNews(newsResult.data || []);
    }

    // コメント：承認済みのものだけ取得
    const commentsResult = await db
      .from("visitor_comments")
      .select("id, display_name, content, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(30);

    if (commentsResult.error) {
      console.error("コメントの読み込みに失敗しました:", commentsResult.error.message);
      renderGuestMessages([]);
    } else {
      renderGuestMessages(commentsResult.data || []);
    }
  }

  // --- 10. 訪問者コメントの投稿 ---
  function setupGuestForm() {
    const form = byId("guestForm");
    const status = byId("guestFormStatus");
    const submit = byId("guestSubmit");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");

      // 自動入力ボット対策：通常の訪問者はこの入力欄に触れない
      if (byId("guestWebsite").value.trim() !== "") return;

      if (!isDbReady) {
        status.textContent = "コメント機能はまだ準備中です。管理者にSupabaseの設定を依頼してください。";
        status.classList.add("is-error");
        return;
      }

      const displayName = byId("guestName").value.trim();
      const message = byId("guestContent").value.trim();

      if (!displayName || !message) {
        status.textContent = "お名前とメッセージを入力してください。";
        status.classList.add("is-error");
        return;
      }
      if (displayName.length > 30 || message.length > 500) {
        status.textContent = "お名前は30文字以内、メッセージは500文字以内にしてください。";
        status.classList.add("is-error");
        return;
      }

      submit.disabled = true;
      submit.textContent = "送信中...";

      // status は送らない。DB側の初期値によって必ず pending（承認待ち）になる。
      const { error } = await db.from("visitor_comments").insert({
        display_name: displayName,
        content: message
      });

      submit.disabled = false;
      submit.innerHTML = 'メッセージを送信する <span aria-hidden="true">→</span>';

      if (error) {
        console.error("コメント投稿に失敗しました:", error.message);
        status.textContent = "送信できませんでした。時間をおいて再度お試しください。";
        status.classList.add("is-error");
        return;
      }

      form.reset();
      status.textContent = "送信しました！管理者の確認後に公開されます。ありがとうございます。";
    });
  }

  // --- 11. スマホメニューの開閉 ---
  function setupMobileMenu() {
    const toggle = byId("menuToggle");
    const nav = byId("siteNav");
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    // メニュー内のリンクを押したらメニューを閉じる
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  // --- 12. ギャラリー左右ボタン ---
  function setupGalleryControls() {
    const track = byId("galleryTrack");
    byId("galleryPrev").addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.8, behavior: "smooth" });
    });
    byId("galleryNext").addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
    });
  }

  // --- 13. スクロール連動の表示アニメーション ---
  function setupMotionEffects() {
    // 動きを少なくするOS設定、または古いブラウザでは演出を無効にします。
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target); // 一度表示した要素は再監視しません。
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    // 表示させたい要素にクラスを付け、少しずつ時間差で登場させます。
    function observeElements(root) {
      const selector = ".section-heading, .about-grid, .profile-card, .resume-panel, .skill-card, .social-card, .news-item, .gallery-card, .guest-form, .guest-message, .closing-inner";
      const elements = [];
      if (root.matches && root.matches(selector)) elements.push(root);
      if (root.querySelectorAll) elements.push(...root.querySelectorAll(selector));

      elements.forEach((element, index) => {
        if (element.dataset.motionReady === "true") return;
        element.dataset.motionReady = "true";
        element.classList.add("motion-reveal");
        element.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 65}ms`);
        observer.observe(element);
      });
    }

    observeElements(document);

    // お知らせ・コメントは通信後に追加されるため、追加分にも演出を設定します。
    [byId("newsList"), byId("messageList")].forEach((list) => {
      if (!list) return;
      const mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) observeElements(node);
        }));
      });
      mutationObserver.observe(list, { childList: true });
    });
  }


  // --- 13.5 ゴールドダストと弾丸風ライト演出 ---
  function setupAmbientEffects() {
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const layer = document.createElement("div");
    layer.className = "ambient-fx";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);

    // 金色の粒子。画面幅に応じて数を抑え、スマホでも軽く動作させます。
    const particleCount = window.innerWidth < 700 ? 12 : 24;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("i");
      particle.className = "gold-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 18}s`;
      particle.style.animationDuration = `${12 + Math.random() * 14}s`;
      particle.style.setProperty("--drift", `${Math.round(Math.random() * 100 - 50)}px`);
      layer.append(particle);
    }

    // 時折、光の弾道と一瞬の亀裂フラッシュを発生させます。
    let stopped = false;
    const fire = () => {
      if (stopped || document.hidden) {
        window.setTimeout(fire, 5000);
        return;
      }
      const streak = document.createElement("span");
      streak.className = "light-streak";
      streak.style.top = `${12 + Math.random() * 72}%`;
      layer.append(streak);
      window.setTimeout(() => {
        streak.remove();
        const crack = document.createElement("span");
        crack.className = "impact-crack";
        crack.style.left = `${18 + Math.random() * 64}%`;
        crack.style.top = `${18 + Math.random() * 64}%`;
        layer.append(crack);
        window.setTimeout(() => crack.remove(), 900);
      }, 460);
      window.setTimeout(fire, 9000 + Math.random() * 12000);
    };
    window.setTimeout(fire, 3500);
    window.addEventListener("pagehide", () => { stopped = true; }, { once: true });
  }

  // ページの初期表示。各パーツを順番に組み立てます。
  renderProfile();
  renderCareer();
  renderCertificates();
  renderSkills();
  renderHobbies();
  renderSocialLinks();
  renderGallery();
  setupMobileMenu();
  setupGalleryControls();
  setupGuestForm();
  setupMotionEffects();
  setupAmbientEffects();
  loadPublicData();
})();
