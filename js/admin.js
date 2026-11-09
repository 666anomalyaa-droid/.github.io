/* =====================================================================
   管理者ページの動作
   - 管理者のメールアドレス・パスワードでログイン
   - お知らせの新規投稿・編集・公開・削除
   - 訪問者コメントの承認・削除
   ※ 実際の権限はSupabaseのRLSポリシーとsite_adminsテーブルで守ります。
   ===================================================================== */

(() => {
  "use strict";

  const db = window.supabaseClient;
  const byId = (id) => document.getElementById(id);
  const loginArea = byId("adminLogin");
  const dashboard = byId("adminDashboard");

  // HTMLとして解釈せず文字列として表示するための共通関数
  function makeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }

  function setStatus(id, message, isError = false) {
    const el = byId(id);
    el.textContent = message;
    el.classList.toggle("is-error", isError);
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(date);
  }

  // DBの未設定・読み込みエラーを明確に表示する
  if (!db) {
    loginArea.querySelector("p").textContent = "Supabaseがまだ設定されていません。README.mdの手順に沿って js/config.js とデータベースを設定してください。";
    byId("loginButton").disabled = true;
    return;
  }

  // --- ログイン画面と管理画面の切り替え ---
  function showDashboard(user) {
    loginArea.hidden = true;
    dashboard.hidden = false;
    byId("adminUserLabel").textContent = `ログイン中：${user.email || "管理者"}`;
    loadLinkSettings();
    loadAnnouncements();
    loadComments();
  }

  function showLogin() {
    dashboard.hidden = true;
    loginArea.hidden = false;
  }

  // --- ログイン処理 ---
  byId("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = byId("adminEmail").value.trim();
    const password = byId("adminPassword").value;
    const button = byId("loginButton");
    button.disabled = true;
    setStatus("loginStatus", "ログイン中...");

    const { data, error } = await db.auth.signInWithPassword({ email, password });
    button.disabled = false;

    if (error) {
      setStatus("loginStatus", "ログインできませんでした。アカウント情報と管理者登録を確認してください。", true);
      console.error("ログインエラー:", error.message);
      return;
    }

    // ログインできても、DBの管理者登録がないとデータ操作はRLSで拒否されます。
    showDashboard(data.user);
  });

  // --- ログアウト処理 ---
  byId("logoutButton").addEventListener("click", async () => {
    await db.auth.signOut();
    showLogin();
    byId("adminPassword").value = "";
    setStatus("loginStatus", "ログアウトしました。");
  });

  // --- 現在のログイン状態を確認 ---
  async function checkSession() {
    const { data, error } = await db.auth.getSession();
    if (!error && data.session) {
      showDashboard(data.session.user);
    } else {
      showLogin();
    }
  }


  // --- 外部リンクの公開／非公開管理 ---
  // 初期行は sql/link-settings-migration.sql で作成します。
  // 非公開にするとプロフィール側のリンクを無効化し、鍵マークを表示します。
  async function loadLinkSettings() {
    const list = byId("adminLinkSettings");
    if (!list) return;
    list.replaceChildren(makeElement("p", "empty-message", "読み込み中..."));

    const links = (window.SITE_CONTENT && window.SITE_CONTENT.socialLinks) || [];
    const { data, error } = await db
      .from("site_link_settings")
      .select("link_key, is_public");

    list.replaceChildren();
    if (error) {
      list.append(makeElement(
        "p",
        "empty-message is-error",
        "リンク設定を取得できません。Supabase SQL Editorで sql/link-settings-migration.sql を実行してください。"
      ));
      setStatus("linkSettingsStatus", "リンク設定テーブルが未作成、または管理者権限がありません。", true);
      console.error("リンク設定取得エラー:", error.message);
      return;
    }

    const settings = {};
    (data || []).forEach((row) => { settings[row.link_key] = row.is_public; });

    if (!links.length) {
      list.append(makeElement("p", "empty-message", "リンクデータがありません。js/site-data.js を確認してください。"));
      return;
    }

    links.forEach((item) => {
      const key = item.key;
      const isPublic = settings[key] !== false;
      const row = makeElement("article", "admin-link-record");
      const info = makeElement("div", "admin-link-info");
      info.append(makeElement("strong", "", item.name));
      info.append(makeElement("small", "", item.handle || ""));
      info.append(makeElement("span", `admin-link-state ${isPublic ? "is-public" : "is-private"}`, isPublic ? "公開中" : "非公開"));

      const toggle = makeElement("button", `small-button ${isPublic ? "danger" : ""}`, isPublic ? "非公開にする" : "公開する");
      toggle.type = "button";
      toggle.disabled = false;
      toggle.addEventListener("click", () => updateLinkVisibility(key, !isPublic, item.name, toggle));
      row.append(info, toggle);
      list.append(row);
    });
    setStatus("linkSettingsStatus", "リンク公開設定を読み込みました。");
  }

  async function updateLinkVisibility(key, isPublic, displayName, button) {
    button.disabled = true;
    setStatus("linkSettingsStatus", `${displayName} の設定を更新中...`);
    const { error } = await db
      .from("site_link_settings")
      .upsert({
        link_key: key,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      }, { onConflict: "link_key" });

    button.disabled = false;
    if (error) {
      setStatus("linkSettingsStatus", "更新できませんでした。SQL設定と管理者権限を確認してください。", true);
      console.error("リンク公開設定更新エラー:", error.message);
      return;
    }
    setStatus("linkSettingsStatus", `${displayName} を${isPublic ? "公開" : "非公開"}にしました。`);
    loadLinkSettings();
  }

  // --- お知らせ一覧を取得 ---
  async function loadAnnouncements() {
    const list = byId("adminAnnouncementList");
    list.replaceChildren(makeElement("p", "empty-message", "読み込み中..."));

    const { data, error } = await db
      .from("announcements")
      .select("id, title, content, is_published, created_at")
      .order("created_at", { ascending: false });

    list.replaceChildren();
    if (error) {
      list.append(makeElement("p", "empty-message", "取得できませんでした。管理者登録とSQL設定を確認してください。"));
      console.error("お知らせ取得エラー:", error.message);
      return;
    }
    if (!data || data.length === 0) {
      list.append(makeElement("p", "empty-message", "まだお知らせはありません。上のフォームから投稿できます。"));
      return;
    }

    data.forEach((item) => {
      const record = makeElement("article", "admin-record");
      const info = makeElement("div", "admin-record-info");
      info.append(makeElement("h4", "", item.title));
      info.append(makeElement("p", "", item.content));
      info.append(makeElement("small", "", `${formatDate(item.created_at)} / ${item.is_published ? "公開中" : "非公開"}`));

      const actions = makeElement("div", "admin-record-actions");
      const edit = makeElement("button", "small-button", "編集");
      edit.type = "button";
      edit.addEventListener("click", () => startEditAnnouncement(item));
      const toggle = makeElement("button", "small-button", item.is_published ? "非公開にする" : "公開する");
      toggle.type = "button";
      toggle.addEventListener("click", () => toggleAnnouncement(item));
      const remove = makeElement("button", "small-button danger", "削除");
      remove.type = "button";
      remove.addEventListener("click", () => deleteAnnouncement(item.id));
      actions.append(edit, toggle, remove);
      record.append(info, actions);
      list.append(record);
    });
  }

  // --- お知らせ投稿・更新 ---
  byId("announcementForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = byId("announcementId").value;
    const title = byId("announcementTitle").value.trim();
    const content = byId("announcementContent").value.trim();
    const isPublished = byId("announcementPublished").checked;
    const button = byId("announcementSaveButton");

    if (!title || !content) {
      setStatus("announcementStatus", "タイトルと本文を入力してください。", true);
      return;
    }

    button.disabled = true;
    setStatus("announcementStatus", "保存中...");

    let result;
    if (id) {
      result = await db.from("announcements").update({
        title, content, is_published: isPublished, updated_at: new Date().toISOString()
      }).eq("id", id);
    } else {
      result = await db.from("announcements").insert({
        title, content, is_published: isPublished
      });
    }

    button.disabled = false;
    if (result.error) {
      console.error("お知らせ保存エラー:", result.error.message);
      setStatus("announcementStatus", "保存できませんでした。管理者権限とSQLを確認してください。", true);
      return;
    }

    byId("announcementForm").reset();
    byId("announcementId").value = "";
    byId("announcementSaveButton").textContent = "投稿する";
    byId("announcementCancelEdit").hidden = true;
    byId("announcementPublished").checked = true;
    setStatus("announcementStatus", id ? "お知らせを更新しました。" : "お知らせを投稿しました。");
    loadAnnouncements();
  });

  // 編集ボタンを押したとき、選んだお知らせをフォームへ戻す
  function startEditAnnouncement(item) {
    byId("announcementId").value = item.id;
    byId("announcementTitle").value = item.title;
    byId("announcementContent").value = item.content;
    byId("announcementPublished").checked = item.is_published;
    byId("announcementSaveButton").textContent = "変更を保存する";
    byId("announcementCancelEdit").hidden = false;
    setStatus("announcementStatus", "編集モード：内容を変更して保存してください。");
    byId("announcementForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // 編集をやめて新規投稿フォームへ戻す
  byId("announcementCancelEdit").addEventListener("click", () => {
    byId("announcementForm").reset();
    byId("announcementId").value = "";
    byId("announcementSaveButton").textContent = "投稿する";
    byId("announcementCancelEdit").hidden = true;
    byId("announcementPublished").checked = true;
    setStatus("announcementStatus", "編集をキャンセルしました。");
  });

  // 公開／非公開を切り替える
  async function toggleAnnouncement(item) {
    const { error } = await db.from("announcements")
      .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) {
      setStatus("announcementStatus", "公開状態を変更できませんでした。", true);
      console.error(error.message);
    }
    loadAnnouncements();
  }

  // お知らせを削除する
  async function deleteAnnouncement(id) {
    if (!window.confirm("このお知らせを削除しますか？この操作は取り消せません。")) return;
    const { error } = await db.from("announcements").delete().eq("id", id);
    if (error) {
      setStatus("announcementStatus", "削除できませんでした。", true);
      console.error(error.message);
      return;
    }
    setStatus("announcementStatus", "お知らせを削除しました。");
    loadAnnouncements();
  }

  // --- 訪問者コメント一覧を取得 ---
  async function loadComments() {
    const list = byId("adminCommentList");
    list.replaceChildren(makeElement("p", "empty-message", "読み込み中..."));

    const { data, error } = await db
      .from("visitor_comments")
      .select("id, display_name, content, status, created_at")
      .order("created_at", { ascending: false });

    list.replaceChildren();
    if (error) {
      list.append(makeElement("p", "empty-message", "取得できませんでした。管理者登録とSQL設定を確認してください。"));
      console.error("コメント取得エラー:", error.message);
      return;
    }
    if (!data || data.length === 0) {
      list.append(makeElement("p", "empty-message", "まだコメントはありません。"));
      return;
    }

    data.forEach((item) => {
      const record = makeElement("article", "admin-record");
      const info = makeElement("div", "admin-record-info");
      info.append(makeElement("h4", "", `${item.display_name}（${item.status === "approved" ? "公開中" : "承認待ち"}）`));
      info.append(makeElement("p", "", item.content));
      info.append(makeElement("small", "", formatDate(item.created_at)));

      const actions = makeElement("div", "admin-record-actions");
      if (item.status !== "approved") {
        const approve = makeElement("button", "small-button", "承認する");
        approve.type = "button";
        approve.addEventListener("click", () => approveComment(item.id));
        actions.append(approve);
      }
      const remove = makeElement("button", "small-button danger", "削除");
      remove.type = "button";
      remove.addEventListener("click", () => deleteComment(item.id));
      actions.append(remove);
      record.append(info, actions);
      list.append(record);
    });
  }

  // 承認したコメントだけがトップページに表示される
  async function approveComment(id) {
    const { error } = await db.from("visitor_comments")
      .update({ status: "approved" })
      .eq("id", id);
    if (error) {
      console.error("コメント承認エラー:", error.message);
      window.alert("承認できませんでした。管理者権限を確認してください。");
      return;
    }
    loadComments();
  }

  // 不適切なコメントやスパムを削除する
  async function deleteComment(id) {
    if (!window.confirm("このコメントを削除しますか？この操作は取り消せません。")) return;
    const { error } = await db.from("visitor_comments").delete().eq("id", id);
    if (error) {
      console.error("コメント削除エラー:", error.message);
      window.alert("削除できませんでした。管理者権限を確認してください。");
      return;
    }
    loadComments();
  }

  // 各一覧の再読み込みボタン
  byId("refreshLinkSettings").addEventListener("click", loadLinkSettings);
  byId("refreshAnnouncements").addEventListener("click", loadAnnouncements);
  byId("refreshComments").addEventListener("click", loadComments);

  // ブラウザ更新時にログイン情報が残っていれば管理画面を再表示
  checkSession();
})();
