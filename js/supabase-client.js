/* =====================================================================
   Supabase接続の共通処理
   config.js のURLと公開用キーが入力されている場合だけDBへ接続します。
   未設定でもプロフィールサイト自体は表示できるようにしています。
   ===================================================================== */

(() => {
  const config = window.SITE_CONFIG || {};
  const url = config.supabaseUrl || "";
  const key = config.supabaseAnonKey || "";

  // 仮文字列のままなら「まだ接続設定されていない」と判断する
  const isConfigured =
    url.startsWith("https://") &&
    !url.includes("YOUR_") &&
    key.length > 20 &&
    !key.includes("YOUR_");

  window.SUPABASE_READY = false;
  window.supabaseClient = null;

  if (!isConfigured) {
    console.info("Supabase未設定：プロフィール表示のみ利用できます。");
    return;
  }

  // CDNからSupabaseライブラリが読み込めているか確認
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabaseライブラリを読み込めませんでした。ネット接続を確認してください。");
    return;
  }

  // サイトからデータベースへ接続するクライアントを作成
  window.supabaseClient = window.supabase.createClient(url, key);
  window.SUPABASE_READY = true;
})();
