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
    about: "H-Rua!! のオフィシャルプロフィールへようこそ。\nITを学びながら、バイク・ゲーム・音楽など、自分の好きなことを全力で楽しんでいます。\n「時は金なり」をモットーに、経験も時間も大切にしながら、自分らしい毎日を更新中。",
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
    { title: "01 / BIKE", name: "バイク", description: "憧れのバイクライフへ。免許取得と初めての愛車を準備中。", image: "assets/skill-icons/bike.webp", imageAlt: "バイクの写真" },
    { title: "02 / GAMING", name: "ゲーム", description: "FPS・対戦ゲームからサンドボックスまで幅広くプレイ。", image: "assets/skill-icons/game.webp", imageAlt: "ゲームのイメージ" },
    { title: "03 / MUSIC", name: "音楽", description: "Spotifyでよく聴くお気に入りTOP10を紹介。", image: "assets/skill-icons/music.webp", imageAlt: "音楽のイメージ" }
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
      { name: "Fortnite", detail: "チャプター1 シーズン8 元チャンピオン", status: "引退済み", image: "assets/game-backgrounds/fortnite.webp" },
      { name: "Apex Legends", detail: "元マスターランク", status: "引退済み", image: "assets/game-backgrounds/apex-legends.webp" },
      { name: "Overwatch", detail: "TANK：プラチナ / DAMAGE：エメラルド / SUPPORT：プラチナ", status: "活動中", image: "assets/game-backgrounds/overwatch-2.webp" },
      { name: "VALORANT", detail: "元ダイヤモンド", status: "引退済み", image: "assets/game-backgrounds/valorant.webp" },
      { name: "BodyCom", detail: "プレイ中", status: "活動中", image: "assets/game-backgrounds/bodycom.webp" },
      { name: "Minecraft", detail: "プレイ歴 2017年〜", status: "活動中", image: "assets/game-backgrounds/minecraft.webp" },
      { name: "ARK: Survival Ascended", detail: "サバイバル・クラフト", status: "定期的", image: "assets/game-backgrounds/ark-survival-ascended.webp" },
      { name: "クラッシュ・ロワイヤル / ブロスタ", detail: "Supercellタイトル", status: "定期的", image: "assets/game-backgrounds/clash-royale-brawl-stars.webp" },
      { name: "Pokémon GO", detail: "位置情報ゲーム", status: "定期的", image: "assets/game-backgrounds/pokemon-go.webp" },
      { name: "NIKKE", detail: "プレイ経験あり", status: "引退済み", image: "assets/game-backgrounds/nikke.webp" },
      { name: "城とドラゴン", detail: "プレイ経験あり", status: "引退済み", image: "assets/game-backgrounds/castle-and-dragon.webp" },
      { name: "原神", detail: "オープンワールドRPG", status: "定期的", image: "assets/game-backgrounds/genshin-impact.webp" },
      { name: "NTE: Neverness to Everness", detail: "プレイ中", status: "活動中", image: "assets/game-backgrounds/nte.webp" }
    ],
    music: [
      { rank: "01", title: "HOLLOW HUNGER", artist: "OxT", spotifyUrl: "https://open.spotify.com/track/3RNSTLShlhmMXtixgofPlX?si=YKqC_UQyQum--DBEFrM0iA&utm_source=copy-link", image: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e021279c133e92506d4ff248f04" },
      { rank: "02", title: "イエスタデイ", artist: "Official髭男dism", spotifyUrl: "https://open.spotify.com/track/3S3DDZrPOYTirleXRyHnNM?si=0QYtZLqPR_muhaenLqfgzw&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0276f402d83c2a85e5deca60e7" },
      { rank: "03", title: "幾億光年", artist: "Omoinotake", spotifyUrl: "https://open.spotify.com/track/4dmruTsdHIOjfOIeaFitXK?si=5baiTPYhR7-oRLRkKoruHA&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02041c5ffe0b8b02e029276100" },
      { rank: "04", title: "ゴーゴー幽霊船", artist: "米津玄師", spotifyUrl: "https://open.spotify.com/track/6JTUCs01Y8POQjeh5lDvlo?si=fCj7-m0aT-KKlubpJSNdoQ&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021565ef88a7b2a866e09c6f45" },
      { rank: "05", title: "捕まえて、今夜。", artist: "新浜レオン", spotifyUrl: "https://open.spotify.com/track/0Tw3GoF2O6XA7DmytMKNLL?si=4kjAC_lJRWW5F-cOTSvD8g&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e75c36f722a34406eadf2229" },
      { rank: "06", title: "REVENGE", artist: "フランシュシュ", spotifyUrl: "https://open.spotify.com/track/4icaVw9oqXpOfFxOIru8qt?si=M805_7QaTayVEvAgKpe9vQ&utm_source=copy-link", image: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e028716a6ef0fd6db7f6eafc356" },
      { rank: "07", title: "オー！リバル", artist: "ポルノグラフィティ", spotifyUrl: "https://open.spotify.com/track/5SfJVMleHrH9tDxhXHrobX?si=jY21YXYATe6yej6iSUWR-w&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e027eaecb831242fe3723919e3d" },
      { rank: "08", title: "unravel", artist: "TK from 凛として時雨", spotifyUrl: "https://open.spotify.com/track/1rN9QoVxw5U7TJkyaUR8C1?si=AWgdPstyRUa6fS-o4nUsKA&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02b11c3ab5cb818192b7a61fdd" },
      { rank: "09", title: "FIRE BIRD", artist: "Roselia", spotifyUrl: "https://open.spotify.com/track/0qMpU4VmLf6aMNc7CUErzV?si=vwfLUg2rTYC3A6iQfM9OqQ&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e027e1fa5801c053621370ea2c6" },
      { rank: "10", title: "Tot Musica", artist: "Ado", spotifyUrl: "https://open.spotify.com/track/5hL1l3xsH0ZyKl8yUI6woj?si=HpBfoLi7TDmXKvAPPxH-pA&utm_source=copy-link", image: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02c37dcac99df04be050879c60" }
    ]
  },

  // SNS・外部リンク。Tinderと記載されていたURLはThreadsのURLなのでThreadsとして掲載。
  // アイコン画像は assets/icons/ 内に同じ256px透過PNGで統一しています。
  socialLinks: [
    { key: "youtube", name: "YouTube", handle: "@critical-666", iconImage: "assets/icons/youtube.png", url: "https://youtube.com/@critical-666?si=Km21pWfzf1djo12W", activity: "活動中" },
    { key: "instagram", name: "Instagram", handle: "@rua_1227r", iconImage: "assets/icons/instagram.png", url: "https://www.instagram.com/rua_1227r?psln=bm45NDQ0bWN3azUz", activity: "活動中" },
    { key: "x", name: "X", handle: "@Lua_ez_world", iconImage: "assets/icons/x.png", url: "https://x.com/Lua_ez_world", activity: "活動中" },
    { key: "threads", name: "Threads", handle: "@rua_1227r", iconImage: "assets/icons/threads.png", url: "https://www.threads.com/@rua_1227r", activity: "不明" },
    { key: "bereal", name: "BeReal", handle: "luan1227ez", iconImage: "assets/icons/bereal.png", url: "https://bere.al/luan1227ez", activity: "不明" },
    { key: "jiffcy", name: "Jiffcy", handle: "プロフィール", iconImage: "assets/icons/jiffcy.png", url: "https://api.jiffcy.com/shares/9odq8go", activity: "不明" },
    { key: "twitch", name: "Twitch", handle: "siruvasu_leun27", iconImage: "assets/icons/twitch.png", url: "https://www.twitch.tv/siruvasu_leun27", activity: "定期的" },
    { key: "steam", name: "Steam", handle: "Friend Code: 1667048644", iconImage: "assets/icons/steam.png", url: "https://s.team/p/1667048644", activity: "活動中", copy: "1667048644" },
    { key: "gamee", name: "Gamee", handle: "GAMEE Profile", iconImage: "assets/icons/gamee.png", url: "https://gamee.games/links/rdu94p", activity: "活動中" }
  ],

  gallery: [
    { date: "COMING SOON", title: "BIKE LIFE", description: "Rebel 250 の納車・ツーリング写真を追加予定。", image: "assets/gallery-placeholder.svg", alt: "バイクギャラリー仮画像" },
    { date: "COMING SOON", title: "GAMING HIGHLIGHTS", description: "ゲームのハイライトや思い出を追加予定。", image: "assets/gallery-placeholder.svg", alt: "ゲームギャラリー仮画像" },
    { date: "COMING SOON", title: "DAILY MOMENTS", description: "日々の出来事やお気に入りの瞬間を追加予定。", image: "assets/gallery-placeholder.svg", alt: "日常ギャラリー仮画像" }
  ]
};
