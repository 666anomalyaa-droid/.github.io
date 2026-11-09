/* =====================================================================
   ホームページに表示する内容をまとめたファイル

   ★ 普段のプロフィール変更は、基本的にこのファイルだけでOKです。
   ★ "YOUR NAME" や "ここに入力" と書かれた場所を自分用に変更してください。
   ★ 画像は assets フォルダに入れ、ファイル名を指定します。
   ★ SNSのURLが空欄（""）の場合、そのリンクは「設定待ち」として表示します。
   ===================================================================== */

window.SITE_CONTENT = {
  // --- 名前・基本プロフィール ---
  profile: {
    name: "YOUR NAME",                 // 表示名（日本語）
    nameEn: "YOUR NAME",               // 英語表記
    fullName: "YOUR NAME",             // プロフィールカード用の名前
    subtitle: "肩書き・所属などを入力",  // 例：学生 / Web Creator
    catchcopy: "自分の活動・好きなこと・これまでの歩みをまとめた、個人プロフィールサイトです。",
    kicker: "WELCOME TO MY PAGE",
    status: "OPEN TO CONNECTION",      // 例：学生 / 活動中 / OPEN TO WORK
    location: "TOKYO, JAPAN",
    motto: "MAKE EVERY DAY COUNT.",
    image: "assets/profile-placeholder.svg", // 自分の写真に差し替え
    about: "ここに自己紹介を書きます。\n好きなこと、挑戦していること、大切にしていることなどを自由に紹介してください。\n\n文章は改行して書くこともできます。",
    tags: ["YOUR HOBBY", "YOUR INTEREST", "YOUR STYLE"],

    // 名刺・履歴書風のプロフィール欄。labelが項目名、valueが表示内容です。
    details: [
      { label: "NAME", value: "YOUR NAME" },
      { label: "BIRTHPLACE", value: "YOUR CITY" },
      { label: "OCCUPATION", value: "学生 / YOUR JOB" },
      { label: "SCHOOL", value: "YOUR SCHOOL" },
      { label: "HOBBY", value: "YOUR HOBBY" },
      { label: "EMAIL", value: "your-email@example.com" }
    ]
  },

  // --- 学歴・経歴（新しいものを上にしても、下にしてもOK。入力した順で表示） ---
  career: [
    { date: "20XX.04", title: "学校・会社名を入力", description: "学科・専攻・取り組みなどを入力" },
    { date: "20XX.03", title: "学校名・活動名を入力", description: "卒業・修了・活動内容などを入力" }
  ],

  // --- 資格・取得実績 ---
  certificates: [
    { name: "資格名を入力", date: "20XX年取得" },
    { name: "資格名を入力", date: "20XX年取得" },
    { name: "資格名を入力", date: "20XX年取得" }
  ],

  // --- スキル・好きなこと ---
  skills: [
    { title: "SKILL / 01", name: "スキル名を入力", description: "できることや経験、得意なことを説明します。" },
    { title: "SKILL / 02", name: "趣味・好きなこと", description: "好きなジャンルや、続けていることを紹介します。" },
    { title: "SKILL / 03", name: "挑戦していること", description: "現在勉強中の内容や、これから挑戦したいこと。" }
  ],

  // --- SNS・外部リンク ---
  // url に各アカウントのURLを入れてください。未設定ならリンクは無効になります。
  socialLinks: [
    { name: "Instagram", handle: "@your_account", icon: "◎", url: "" },
    { name: "X / Twitter", handle: "@your_account", icon: "𝕏", url: "" },
    { name: "YouTube", handle: "YOUR CHANNEL", icon: "▶", url: "" },
    { name: "GitHub", handle: "your_account", icon: "⌘", url: "" },
    { name: "TikTok", handle: "@your_account", icon: "♪", url: "" },
    { name: "Portfolio", handle: "MY WORKS", icon: "✦", url: "" },
    { name: "Mail", handle: "your-email@example.com", icon: "✉", url: "mailto:your-email@example.com" },
    { name: "Other Link", handle: "自由に設定", icon: "+", url: "" }
  ],

  // --- ハイライトギャラリー ---
  // image に画像のパスを入力。動画URLを使う場合は、後から動画表示機能を追加できます。
  // 画像ファイルは assets フォルダに置くと管理しやすいです。
  gallery: [
    { date: "20XX.01.01", title: "思い出・出来事 01", description: "写真の説明を入力してください。", image: "assets/gallery-placeholder.svg", alt: "ギャラリー画像の仮置き 1" },
    { date: "20XX.01.02", title: "思い出・出来事 02", description: "旅行、趣味、制作物などを紹介できます。", image: "assets/gallery-placeholder.svg", alt: "ギャラリー画像の仮置き 2" },
    { date: "20XX.01.03", title: "思い出・出来事 03", description: "画像を差し替えて自分だけのギャラリーに。", image: "assets/gallery-placeholder.svg", alt: "ギャラリー画像の仮置き 3" },
    { date: "20XX.01.04", title: "思い出・出来事 04", description: "カードはこの配列に追加するだけで増やせます。", image: "assets/gallery-placeholder.svg", alt: "ギャラリー画像の仮置き 4" }
  ]
};
