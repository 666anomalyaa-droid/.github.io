/* =====================================================================
   H-Rua!! ホームページ表示データ
   名前・プロフィール・趣味・資格・SNS・音楽などの編集場所です。
   表示内容を変更したいときは、まずこのファイルを編集してください。
   画像は assets フォルダに置き、相対パスを指定します。
   ===================================================================== */

window.SITE_CONTENT = {
  profile: {
    name: "H-Rua!!",
    nameEn: "H-RUA / PERSONAL PROFILE",
    fullName: "H-Rua!!",
    subtitle: "IT専門学校 / 水道工事総合事務職（就職予定）",
    catchcopy: "時は金なり。",
    kicker: "WELCOME TO MY WORLD",
    status: "LIVING MY OWN WAY",
    location: "TOKYO, JAPAN",
    motto: "TIME IS MONEY.",
    image: "assets/h-rua-profile.png",
    about: "H-Rua!! のオフィシャルプロフィールへようこそ。\\nITを学びながら、バイク・ゲーム・音楽など、自分の好きなことを全力で楽しんでいます。\\n「時は金なり」をモットーに、経験も時間も大切にしながら、自分らしい毎日を更新中。",
    tags: ["BIKE", "GAMING", "MUSIC", "IT", "CHALLENGE"],
    details: [
      { label: "NAME", value: "H-Rua!!" },
      { label: "BIRTHDAY", value: "12月27日" },
      { label: "BIRTHPLACE", value: "東京都" },
      { label: "EDUCATION", value: "IT専門学校" },
      { label: "CAREER", value: "水道工事総合事務職（就職予定）" },
      { label: "MOTTO", value: "時は金なり" }
    ]
  },

  // 学歴・進路。勤務先など、まだ決まっていない情報は掲載していません。
  career: [
    { date: "現在", title: "IT専門学校", description: "IT分野を学習中。" },
    { date: "就職予定", title: "水道工事 総合事務職", description: "卒業後の進路予定。" }
  ],

  // 資格・免許。取得済みと取得予定を日付とともに表示します。
  certificates: [
    { name: "MOS Excel Associate 2019", date: "2025/10/30・取得済み" },
    { name: "MOS Excel Expert 2019", date: "2025/11/27・取得済み" },
    { name: "MOS Word Associate 2019", date: "2025/12/18・取得済み" },
    { name: "MOS PowerPoint 2019", date: "2025/12/28・取得済み" },
    { name: "MOS Word Expert 2019", date: "2026/01/15・取得済み" },
    { name: "Excel VBA Basic", date: "2026/03/05・取得済み" },
    { name: "生成AI導入実務者検定", date: "2026/04/14・取得済み" },
    { name: "生成AIパスポート", date: "2026/05/15・取得済み" },
    { name: "普通自動車免許（AT限定）", date: "取得済み" },
    { name: "普通二輪免許", date: "2026年12月・取得予定" },
    { name: "大型二輪免許", date: "取得予定・時期未定" }
  ],

  // トップの「好きなこと」カード。詳細は下の hobbies に掲載します。
  skills: [
    { title: "01 / BIKE", name: "バイク", description: "憧れのバイクライフへ。免許取得と初めての愛車を準備中。" },
    { title: "02 / GAMING", name: "ゲーム", description: "FPS・対戦ゲームからサンドボックスまで幅広くプレイ。" },
    { title: "03 / MUSIC", name: "音楽", description: "Spotifyでよく聴くお気に入りTOP10を紹介。" }
  ],

  // 趣味の詳細。文章・予定はあとから自由に編集できます。
  hobbies: {
    bike: {
      title: "BIKE / ROAD TO REBEL",
      name: "バイク",
      intro: "昔からバイクはクールでかっこいい存在。いつか自分も乗ってみたいと思い続けてきた憧れを、いよいよ現実に。",
      timeline: [
        { date: "2026年12月（予定）", title: "普通二輪免許を取得", description: "バイクライフの第一歩。" },
        { date: "2027年1月（予定）", title: "Honda Rebel 250 をお迎え", description: "レッドバロンで中古車を購入予定。納車後は写真やツーリング記録を追加予定。" }
      ],
      note: "取得・納車の予定は変更になる場合があります。"
    },
    games: [
      { name: "Fortnite", detail: "チャプター1 シーズン8 元チャンピオン", status: "引退済み" },
      { name: "Apex Legends", detail: "元マスターランク", status: "引退済み" },
      { name: "Overwatch", detail: "TANK：プラチナ / DAMAGE：エメラルド / SUPPORT：プラチナ", status: "活動中" },
      { name: "VALORANT", detail: "元ダイヤモンド", status: "引退済み" },
      { name: "BodyCom", detail: "プレイ中", status: "活動中" },
      { name: "Minecraft", detail: "プレイ歴 2017年〜", status: "活動中" },
      { name: "ARK: Survival Ascended", detail: "サバイバル・クラフト", status: "定期的" },
      { name: "クラッシュ・ロワイヤル / ブロスタ", detail: "Supercellタイトル", status: "定期的" },
      { name: "Pokémon GO", detail: "位置情報ゲーム", status: "定期的" },
      { name: "NIKKE", detail: "プレイ経験あり", status: "引退済み" },
      { name: "城とドラゴン", detail: "プレイ経験あり", status: "引退済み" },
      { name: "原神", detail: "オープンワールドRPG", status: "定期的" },
      { name: "NTE: Neverness to Everness", detail: "プレイ中", status: "活動中" }
    ],
    music: [
      { rank: "01", title: "HOLLOW HUNGER", artist: "OxT" },
      { rank: "02", title: "イエスタデイ", artist: "Official髭男dism" },
      { rank: "03", title: "幾億光年", artist: "Omoinotake" },
      { rank: "04", title: "ゴーゴー幽霊船", artist: "米津玄師" },
      { rank: "05", title: "捕まえて、今夜。", artist: "新浜レオン" },
      { rank: "06", title: "REVENGE", artist: "フランシュシュ" },
      { rank: "07", title: "オーリーバル！", artist: "ポルノグラフィティ" },
      { rank: "08", title: "unravel", artist: "TK from 凛として時雨" },
      { rank: "09", title: "FIRE BIRD", artist: "Roselia" },
      { rank: "10", title: "Tot Musica", artist: "Ado" }
    ]
  },

  // SNS・外部リンク。Tinderと記載されていたURLはThreadsのURLなのでThreadsとして掲載。
  // TwitchはチャンネルURLをユーザー名から構成。Steamはフレンドコードをコピー表示。
  socialLinks: [
    { name: "YouTube", handle: "@critical-666", icon: "▶", url: "https://youtube.com/@critical-666?si=Km21pWfzf1djo12W", activity: "活動中" },
    { name: "Instagram", handle: "@rua_1227r", icon: "◎", url: "https://www.instagram.com/rua_1227r?psln=bm45NDQ0bWN3azUz", activity: "活動中" },
    { name: "X", handle: "@Lua_ez_world", icon: "𝕏", url: "https://x.com/Lua_ez_world", activity: "活動中" },
    { name: "Threads", handle: "@rua_1227r", icon: "@", url: "https://www.threads.com/@rua_1227r", activity: "不明" },
    { name: "BeReal", handle: "luan1227ez", icon: "◉", url: "https://bere.al/luan1227ez", activity: "不明" },
    { name: "Jiffcy", handle: "プロフィール", icon: "↗", url: "https://api.jiffcy.com/shares/9odq8go", activity: "不明" },
    { name: "Twitch", handle: "siruvasu_leun27", icon: "▣", url: "https://www.twitch.tv/siruvasu_leun27", activity: "定期的" },
    { name: "Steam", handle: "Friend Code: 1667048644", icon: "⌁", url: "https://s.team/p/1667048644", activity: "活動中", copy: "1667048644" },
    { name: "Gamee", handle: "GAMEE Profile", icon: "◆", url: "https://gamee.games/links/rdu94p", activity: "活動中" }
  ],

  gallery: [
    { date: "COMING SOON", title: "BIKE LIFE", description: "Rebel 250 の納車・ツーリング写真を追加予定。", image: "assets/gallery-placeholder.svg", alt: "バイクギャラリー仮画像" },
    { date: "COMING SOON", title: "GAMING HIGHLIGHTS", description: "ゲームのハイライトや思い出を追加予定。", image: "assets/gallery-placeholder.svg", alt: "ゲームギャラリー仮画像" },
    { date: "COMING SOON", title: "DAILY MOMENTS", description: "日々の出来事やお気に入りの瞬間を追加予定。", image: "assets/gallery-placeholder.svg", alt: "日常ギャラリー仮画像" }
  ]
};
