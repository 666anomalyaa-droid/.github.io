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


  // --- 常時表示の日本時間時計（端末の時計をJST表記に変換） ---
  function setupJapanClock() {
    const timeNode = byId("jstClockTime");
    const periodNode = byId("jstClockPeriod");
    const dateNode = byId("jstClockDate");
    if (!timeNode || !periodNode || !dateNode) return;

    const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    });
    const hourFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      hourCycle: "h23"
    });

    const tick = () => {
      const now = new Date();
      const parts = hourFormatter.formatToParts(now);
      const hourPart = parts.find((part) => part.type === "hour");
      const hour = hourPart ? Number(hourPart.value) : 0;

      let period = "深夜の時間帯";
      if (hour >= 5 && hour < 11) period = "朝の時間帯";
      else if (hour >= 11 && hour < 15) period = "昼の時間帯";
      else if (hour >= 15 && hour < 18) period = "夕方の時間帯";
      else if (hour >= 18 && hour < 23) period = "夜の時間帯";

      timeNode.textContent = timeFormatter.format(now);
      timeNode.dateTime = now.toISOString();
      periodNode.textContent = period;
      dateNode.textContent = dateFormatter.format(now);
    };

    tick();
    window.setInterval(tick, 1000);
  }

  // --- GOGO CHANCE：暗い画像をクリックで点灯し、確定告知音を再生 ---
  function setupGogoChance() {
    const button = byId("gogoChance");
    const audio = byId("gogoChanceAudio");
    if (!button || !audio) return;

    audio.preload = "none";
    audio.volume = 0.88;

    button.addEventListener("click", () => {
      button.classList.add("is-lit");
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "ゴーゴーチャンス点灯中。もう一度クリックすると確定告知音をもう一度再生します。");

      // 毎回、クリックした瞬間に頭から鳴らす（ブラウザのユーザー操作内で実行）。
      try {
        audio.pause();
        audio.currentTime = 0;
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(() => {
            button.classList.add("sound-unavailable");
          });
        }
      } catch (error) {
        button.classList.add("sound-unavailable");
      }

      // 連打でも「ガコッ！」の点灯フラッシュを再演出する。
      button.classList.remove("is-triggered");
      void button.offsetWidth;
      button.classList.add("is-triggered");
    });
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
      const copy = makeElement("div", "skill-card-copy");
      copy.append(makeElement("span", "skill-number", item.title));
      copy.append(makeElement("h3", "", item.name));
      copy.append(makeElement("p", "", item.description));
      card.append(copy);
      if (item.image) {
        const image = makeElement("img", "skill-card-image");
        image.src = item.image;
        image.alt = item.imageAlt || `${item.name}のイメージ`;
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = () => { image.onerror = null; image.hidden = true; };
        card.append(image);
      }
      grid.append(card);
    });
  }

  // --- 5. SNS・外部リンクを表示 ---
  function renderSocialLinks(linkSettings = {}) {
    const grid = byId("socialGrid");
    grid.replaceChildren();

    (content.socialLinks || []).forEach((item) => {
      const key = item.key || item.name.toLowerCase();
      // DBに設定がないリンクは公開扱い。初回移行時も既存リンクが消えないようにします。
      const isPublic = linkSettings[key] !== false;
      const isValidLink = isPublic && typeof item.url === "string" && item.url.trim() !== "";
      const card = makeElement("article", `social-card${isValidLink ? "" : " is-disabled"}${!isPublic ? " is-locked" : ""}`);

      // 非公開の場合はhrefを作らず、押しても外部へ移動できません。
      const mainLink = makeElement(isValidLink ? "a" : "div", "social-card-main");
      if (isValidLink) {
        mainLink.href = item.url;
        mainLink.target = "_blank";
        mainLink.rel = "noopener noreferrer";
        mainLink.setAttribute("aria-label", `${item.name}を開く`);
      } else if (!isPublic) {
        mainLink.setAttribute("aria-label", `${item.name}は現在非公開です`);
        mainLink.setAttribute("aria-disabled", "true");
        mainLink.setAttribute("title", "現在非公開です");
      }

      const iconWrap = makeElement("span", `social-icon${!isPublic ? " is-lock-icon" : ""}`);
      if (!isPublic) {
        const lock = makeElement("span", "social-lock", "🔒");
        lock.setAttribute("aria-hidden", "true");
        iconWrap.append(lock);
      } else {
        const iconImage = document.createElement("img");
        iconImage.src = item.iconImage || "assets/favicon.svg";
        iconImage.alt = "";
        iconImage.loading = "lazy";
        iconImage.decoding = "async";
        iconWrap.append(iconImage);
      }

      const info = makeElement("span", "social-info");
      info.append(makeElement("span", "social-name", item.name));
      info.append(makeElement("span", "social-handle", !isPublic ? "現在非公開" : (isValidLink ? item.handle : "リンク設定待ち")));
      if (item.activity && isPublic) info.append(makeElement("span", "social-activity", item.activity));

      const indicator = makeElement("span", "social-arrow", !isPublic ? "🔒" : (isValidLink ? "↗" : "—"));
      mainLink.append(iconWrap, info, indicator);
      card.append(mainLink);

      // Steamのフレンドコード操作も公開中だけ表示します。
      if (item.copy && isPublic) {
        const actions = makeElement("div", "social-actions");
        const copy = makeElement("button", "steam-copy", "フレンドコードをコピー");
        copy.type = "button";
        copy.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(item.copy);
            copy.textContent = "コピーしました";
          } catch (_) {
            copy.textContent = `CODE: ${item.copy}`;
          }
        });
        actions.append(copy);
        card.append(actions);
      }
      grid.append(card);
    });
  }

  // 公開／非公開状態はDBで管理。DB移行前や通信エラー時は既存リンクを公開状態で表示します。
  async function loadLinkVisibility() {
    if (!isDbReady) {
      renderSocialLinks({});
      return;
    }
    const { data, error } = await db
      .from("site_link_settings")
      .select("link_key, is_public");
    if (error) {
      console.warn("リンク公開設定を読み込めませんでした。リンクは既定の公開状態で表示します。", error.message);
      renderSocialLinks({});
      return;
    }
    const settings = {};
    (data || []).forEach((row) => { settings[row.link_key] = row.is_public; });
    renderSocialLinks(settings);
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

    const gameGroups = byId("gameStatusGroups");
    if (gameGroups) {
      gameGroups.replaceChildren();
      const groupDefinitions = [
        { status: "活動中", title: "NOW PLAYING", subtitle: "活動中" },
        { status: "定期的", title: "ON ROTATION", subtitle: "定期的" },
        { status: "引退済み", title: "LEGACY RECORDS", subtitle: "引退済み" }
      ];

      let gameCardIndex = 0;
      groupDefinitions.forEach((group, groupIndex) => {
        const games = (hobbies.games || []).filter((game) => game.status === group.status);
        if (!games.length) return;

        const section = makeElement("section", `game-status-group game-group-${groupIndex + 1}`);
        const heading = makeElement("div", "game-group-heading");
        const headingMain = makeElement("div", "game-group-heading-main");
        headingMain.append(
          makeElement("span", "game-group-en", group.title),
          makeElement("h3", "game-group-jp", group.subtitle)
        );
        heading.append(headingMain, makeElement("span", "game-group-count", `${String(games.length).padStart(2, "0")} TITLES`));
        section.append(heading);

        const grid = makeElement("div", "game-grid");
        games.forEach((game, index) => {
          const tone = ((gameCardIndex++ % 13) + 1).toString();
          const card = makeElement("article", `game-card game-tone-${tone}`);
          if (game.image) {
            card.classList.add("has-game-background");
            const art = makeElement("img", "game-card-image");
            art.src = game.image;
            art.alt = "";
            art.setAttribute("aria-hidden", "true");
            art.loading = "lazy";
            art.decoding = "async";
            art.onerror = () => {
              art.remove();
              card.classList.remove("has-game-background");
            };
            card.append(art);
          }
          const top = makeElement("div", "game-card-top");
          top.append(makeElement("span", "game-index", String(index + 1).padStart(2, "0")));
          const status = makeElement("span", `game-status-pill ${game.status === "活動中" ? "is-active" : game.status === "引退済み" ? "is-retired" : "is-rotation"}`, game.status || "プレイ記録");
          top.append(status);
          card.append(top, makeElement("h4", "", game.name), makeElement("p", "", game.detail));
          grid.append(card);
        });
        section.append(grid);
        gameGroups.append(section);
      });
    }

    const musicGrid = byId("musicRanking");
    if (musicGrid) {
      musicGrid.replaceChildren();
      const tracks = hobbies.music || [];
      const pageSize = 10;
      const pages = [];
      for (let startIndex = 0; startIndex < tracks.length; startIndex += pageSize) {
        const pageTracks = tracks.slice(startIndex, startIndex + pageSize);
        const page = makeElement("section", "music-page");
        page.setAttribute("aria-label", `${startIndex + 1}位から${startIndex + pageTracks.length}位`);
        const pageGrid = makeElement("div", "music-page-grid");
        pageTracks.forEach((track) => {
          const row = makeElement(track.spotifyUrl ? "a" : "article", "music-row");
          if (track.spotifyUrl) {
            row.href = track.spotifyUrl;
            row.target = "_blank";
            row.rel = "noopener noreferrer";
            row.setAttribute("aria-label", `${track.title} - ${track.artist} をSpotifyで開く`);
          }
          row.append(makeElement("span", "music-rank", track.rank));
          const info = makeElement("div", "music-info");
          info.append(makeElement("h3", "", track.title), makeElement("p", "", track.artist));
          const cover = makeElement("img", "music-cover");
          cover.src = track.image || "assets/gallery-placeholder.svg";
          cover.alt = `${track.title} のジャケット画像`;
          cover.loading = "lazy";
          cover.decoding = "async";
          cover.onerror = () => { cover.onerror = null; cover.src = "assets/gallery-placeholder.svg"; };
          row.append(info, cover, makeElement("span", "music-equalizer", "♫"));
          pageGrid.append(row);
        });
        page.append(pageGrid);
        musicGrid.append(page);
        pages.push(page);
      }

      const viewport = byId("musicCarouselViewport");
      const prev = byId("musicPrev");
      const next = byId("musicNext");
      const label = byId("musicPageLabel");
      const dots = byId("musicPageDots");

      if (viewport && prev && next && label && dots) {
        dots.replaceChildren();
        let currentPage = 0;
        const dotButtons = pages.map((page, index) => {
          const dot = makeElement("button", "music-page-dot");
          dot.type = "button";
          dot.setAttribute("aria-label", `${index + 1}ページ目を表示`);
          dot.addEventListener("click", () => goToPage(index));
          dots.append(dot);
          return dot;
        });

        const updateControls = () => {
          const total = tracks.length;
          if (!total) {
            label.textContent = "楽曲がありません";
            prev.disabled = true;
            next.disabled = true;
            return;
          }
          const from = currentPage * pageSize + 1;
          const to = Math.min((currentPage + 1) * pageSize, total);
          label.textContent = `${String(from).padStart(2, "0")}–${String(to).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
          prev.disabled = currentPage === 0;
          next.disabled = currentPage >= pages.length - 1;
          dotButtons.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentPage);
            dot.setAttribute("aria-current", index === currentPage ? "page" : "false");
          });
        };

        function goToPage(index) {
          currentPage = Math.max(0, Math.min(index, pages.length - 1));
          viewport.scrollTo({
            left: currentPage * viewport.clientWidth,
            behavior: "smooth"
          });
          updateControls();
        }

        prev.addEventListener("click", () => goToPage(currentPage - 1));
        next.addEventListener("click", () => goToPage(currentPage + 1));

        // Native horizontal scrolling provides smooth touch swipes on phones.
        let scrollFrame = 0;
        viewport.addEventListener("scroll", () => {
          if (scrollFrame) cancelAnimationFrame(scrollFrame);
          scrollFrame = requestAnimationFrame(() => {
            const width = viewport.clientWidth || 1;
            currentPage = Math.max(0, Math.min(pages.length - 1, Math.round(viewport.scrollLeft / width)));
            updateControls();
          });
        }, { passive: true });
        window.addEventListener("resize", () => {
          viewport.scrollLeft = currentPage * viewport.clientWidth;
          updateControls();
        });
        updateControls();
      }
    }
  }

  // --- 6.8 愛用品・おすすめコレクション ---
  function renderCollection() {
    const list = byId("collectionList");
    if (!list) return;
    list.replaceChildren();

    (content.collection || []).forEach((item, index) => {
      const card = makeElement("article", `collection-card ${item.type === "owned" ? "is-owned" : "is-recommended"}`);
      const media = makeElement("div", "collection-media");
      const image = document.createElement("img");
      image.className = "collection-image";
      image.src = item.image;
      image.alt = item.imageAlt || item.title;
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      image.onerror = () => {
        image.onerror = null;
        const fallback = makeElement("div", "collection-image-fallback");
        fallback.append(
          makeElement("span", "collection-fallback-kicker", "H-Rua!! COLLECTION"),
          makeElement("strong", "", item.title),
          makeElement("span", "", "IMAGE")
        );
        image.replaceWith(fallback);
      };
      media.append(image);
      if (item.imageNote) media.append(makeElement("span", "collection-image-note", item.imageNote));

      const body = makeElement("div", "collection-body");
      const top = makeElement("div", "collection-card-top");
      top.append(
        makeElement("span", "collection-eyebrow", item.eyebrow || `COLLECTION / ${String(index + 1).padStart(2, "0")}`),
        makeElement("span", `collection-status ${item.type === "owned" ? "is-owned" : "is-recommended"}`, item.status || "COLLECTED")
      );
      body.append(top);
      body.append(makeElement("h3", "collection-title", item.title));
      body.append(makeElement("p", "collection-subtitle", item.subtitle || ""));
      body.append(makeElement("p", "collection-comment", item.comment || ""));

      if (Array.isArray(item.specs) && item.specs.length) {
        const specs = makeElement("ul", "collection-specs");
        item.specs.forEach((spec) => specs.append(makeElement("li", "", spec)));
        body.append(specs);
      }
      if (item.note) body.append(makeElement("p", "collection-note", item.note));

      if (item.amazonUrl) {
        const ctaWrap = makeElement("div", "collection-actions");
        const cta = makeElement("a", "collection-amazon-link", item.cta || "Amazonで見る");
        cta.href = item.amazonUrl;
        cta.target = "_blank";
        cta.rel = "noopener noreferrer";
        cta.setAttribute("aria-label", `${item.title}をAmazonで開く`);
        cta.append(makeElement("span", "collection-link-arrow", "↗"));
        ctaWrap.append(cta, makeElement("span", "collection-link-label", "AMAZON / PRODUCT PAGE"));
        body.append(ctaWrap);
      }
      card.append(media, body);
      list.append(card);
    });
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

  // --- 14. カーソル追従ライト・クリックリング・ページ内ナビゲーション演出 ---
  function setupInteractiveEffects() {
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const layer = document.createElement("div");
    layer.className = "interactive-fx-layer";
    layer.setAttribute("aria-hidden", "true");

    const aura = document.createElement("span");
    aura.className = "cursor-aura";
    layer.append(aura);

    const sweep = document.createElement("span");
    sweep.className = "navigation-sweep";
    layer.append(sweep);
    document.body.append(layer);

    // マウス・トラックパッド環境だけで、淡いゴールドの光を追従させます。
    const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) {
      let frame = 0;
      let pointerX = window.innerWidth / 2;
      let pointerY = window.innerHeight / 2;
      const moveAura = (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          aura.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
          aura.classList.add("is-visible");
          frame = 0;
        });
      };
      window.addEventListener("pointermove", moveAura, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => aura.classList.remove("is-visible"));
      window.addEventListener("blur", () => aura.classList.remove("is-visible"));
    }

    // ボタンやリンクを押した位置に、短いゴールドの波紋を表示します。
    document.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".slot-gate, input, textarea, select, [contenteditable='true']")) return;
      const interactive = event.target.closest("button, a, [role='button']");
      if (!interactive) return;

      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      layer.append(ripple);
      window.setTimeout(() => ripple.remove(), 760);
    }, { passive: true });

    // ページ内リンクでは、遷移先へ光のスキャンが一度だけ走ります。
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link || link.closest(".slot-gate")) return;
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId || !byId(targetId)) return;

      sweep.classList.remove("is-running");
      void sweep.offsetWidth;
      sweep.classList.add("is-running");
      window.setTimeout(() => sweep.classList.remove("is-running"), 850);
    });
  }

  // ページの初期表示。各パーツを順番に組み立てます。
  // --- BGM：スロット通過後のプロフィール閲覧中だけループ再生 ---
  function setupProfileBgm() {
    const audio = byId("profileBgm");
    const toggle = byId("bgmToggle");
    const label = byId("bgmToggleLabel");
    if (!audio || !toggle || !label) return;

    audio.loop = true;
    audio.volume = 0.28;

    const updateUi = (isPlaying) => {
      toggle.hidden = false;
      toggle.setAttribute("aria-pressed", String(isPlaying));
      toggle.classList.toggle("is-playing", isPlaying);
      label.textContent = isPlaying ? "BGM ON" : "BGM OFF";
    };

    const tryPlay = () => {
      // この関数は「プロフィールへ入る」クリックから直接呼ばれるため、
      // ブラウザのユーザー操作に伴う音声再生許可を利用します。
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(() => updateUi(true)).catch(() => updateUi(false));
      } else {
        updateUi(true);
      }
    };

    window.HRuaBgm = { start: tryPlay };
    toggle.addEventListener("click", () => {
      if (audio.paused) {
        tryPlay();
      } else {
        audio.pause();
        updateUi(false);
      }
    });
    audio.addEventListener("ended", () => {
      if (audio.loop) updateUi(true);
      else updateUi(false);
    });
    audio.addEventListener("error", () => {
      label.textContent = "BGM ERROR";
      toggle.hidden = false;
    });
  }

  setupProfileBgm();
  setupJapanClock();
  setupGogoChance();
  renderProfile();
  renderCareer();
  renderCertificates();
  renderSkills();
  renderHobbies();
  renderCollection();
  loadLinkVisibility();
  renderGallery();
  setupMobileMenu();
  setupGalleryControls();
  setupGuestForm();
  setupMotionEffects();
  setupAmbientEffects();
  setupInteractiveEffects();
  loadPublicData();
})();
