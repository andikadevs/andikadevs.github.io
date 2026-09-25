// Case studies. Facts that don't change per language sit at the top level;
// anything a visitor reads is an { en, id } pair.
// Order here is the order in the Work stack and the hero.

// First shot is the cover; the rest become the case-study gallery.
const img = (dir, cover, ...gallery) => {
  const path = (name) => `assets/projects/${dir}/${name}.webp`;
  return { cover: path(cover), gallery: gallery.map(path) };
};

export const DISCIPLINES = {
  web:        { en: "Web",        id: "Web" },
  backend:    { en: "Backend",    id: "Backend" },
  api:        { en: "API",        id: "API" },
  ai:         { en: "AI",         id: "AI" },
  automation: { en: "Automation", id: "Otomasi" },
  devops:     { en: "DevOps",     id: "DevOps" },
};

// `short` labels the project's node in the hero orbit.
export const projects = [
  {
    slug: "stekom-international",
    short: "International",
    client: "Universitas STEKOM",
    year: 2026,
    url: "https://international.stekom.ac.id",
    ...img("international", "hero", "about", "welcome"),
    disciplines: ["web", "backend"],
    stack: ["Next.js 16", "React 19", "Bun", "MySQL", "Drizzle ORM", "NextAuth", "S3"],
    title: { en: "STEKOM International", id: "STEKOM International" },
    category: { en: "University website", id: "Website kampus" },
    summary: {
      en: "The official international site of Universitas STEKOM. Real English and Indonesian pages, plus an admin where each department runs its own content.",
      id: "Website internasional resmi Universitas STEKOM. Halaman Inggris dan Indonesianya ditulis beneran, bukan hasil mesin, plus admin yang bisa dipakai tiap bagian buat ngurus kontennya sendiri.",
    },
    problem: {
      en: "Two audiences that rarely overlap: partners and students abroad reading English, and people at home reading Indonesian. Several departments edit the site, so one shared admin password was never going to work.",
      id: "Pembacanya ada dua kubu: mitra dan calon mahasiswa luar negeri yang baca versi Inggris, dan orang sini yang baca versi Indonesia. Yang ngedit juga banyak bagian, jadi satu password admin bareng jelas nggak bakal jalan.",
    },
    approach: {
      en: "Locale-aware routing so every page has a proper EN and ID version. Role-based access through NextAuth, so each department only touches its own news, agendas and partner data. News is pulled from the existing campus portal API instead of being typed in twice.",
      id: "Routing-nya sadar bahasa, jadi tiap halaman punya versi EN dan ID yang layak. Akses pakai role lewat NextAuth, jadi tiap bagian cuma bisa ngubah berita, agenda, dan data mitranya sendiri. Berita langsung ditarik dari API portal kampus, nggak perlu diketik dua kali.",
    },
    metrics: [
      { value: "EN / ID", label: { en: "Bilingual, i18n routing", id: "Dua bahasa, routing i18n" } },
      { value: "RBAC", label: { en: "Per-department admin", id: "Admin per bagian" } },
    ],
  },
  {
    slug: "stekom-passport",
    short: "Passport",
    client: "Universitas STEKOM",
    year: 2026,
    url: "https://passport.stekom.ac.id",
    ...img("passport", "dashboard", "apps"),
    disciplines: ["backend", "api", "devops"],
    stack: ["NestJS 11", "Bun", "React 19", "PostgreSQL", "Redis", "Socket.IO"],
    title: { en: "STEKOM Passport", id: "STEKOM Passport" },
    category: { en: "Identity & SSO", id: "Identitas & SSO" },
    summary: {
      en: "An OpenID Connect provider for the whole campus. One login for every internal app, with typed SDKs for TypeScript, Python and PHP.",
      id: "Identity provider OpenID Connect buat satu kampus. Satu akun buat semua aplikasi internal, lengkap dengan SDK untuk TypeScript, Python, dan PHP.",
    },
    problem: {
      en: "Every new internal system came with its own user table and its own password reset. When someone left, their accounts were scattered across apps nobody remembered.",
      id: "Tiap ada sistem baru, pasti bikin tabel user dan fitur reset password sendiri. Pas ada orang keluar, akunnya masih nyangkut di aplikasi-aplikasi yang udah pada lupa.",
    },
    approach: {
      en: "Authorization Code with PKCE, ID-token verification, and both RP-initiated and back-channel logout, so logging out once really ends the session everywhere. The SDKs mean another team can plug in an existing app in an afternoon.",
      id: "Pakai Authorization Code + PKCE, verifikasi ID token, dan logout RP-initiated maupun back-channel, jadi sekali logout ya sesinya beneran habis di semua aplikasi. Dengan SDK-nya, tim lain bisa nyambungin aplikasinya dalam satu sore.",
    },
    metrics: [
      { value: "11+", label: { en: "Apps on single sign-on", id: "Aplikasi pakai SSO" } },
      { value: "3 SDKs", label: { en: "TypeScript, Python, PHP", id: "TypeScript, Python, PHP" } },
    ],
  },
  {
    slug: "oto-management",
    short: "OTO",
    client: "Toploker.com",
    year: 2024,
    url: null,
    ...img("management", "dashboard", "automations", "broadcasts"),
    disciplines: ["backend", "web", "automation"],
    stack: ["Next.js", "Laravel 11", "MySQL", "Redis", "WebSockets", "Docker"],
    title: { en: "OTO Management", id: "OTO Management" },
    category: { en: "Internal system", id: "Sistem internal" },
    summary: {
      en: "Toploker's operational backbone: ads, revenue recaps, invoices and broadcasts in one place, updating live.",
      id: "Tulang punggung operasional Toploker: iklan, rekap pendapatan, invoice, dan broadcast jadi satu tempat, update-nya real-time.",
    },
    problem: {
      en: "Marketing, finance and file management each lived in a different tool. Data didn't line up, people re-typed the same numbers, and decisions waited on someone's spreadsheet.",
      id: "Marketing, keuangan, sama urusan file dipegang di aplikasi yang beda-beda. Datanya nggak sinkron, angka yang sama diketik berkali-kali, dan keputusan jadi nunggu spreadsheet seseorang.",
    },
    approach: {
      en: "A Next.js front end on a Laravel API, with WebSockets pushing changes to everyone who has the page open. Broadcasts and heavy jobs run on Redis queues so the app never stalls, and assets come straight from Google Drive.",
      id: "Front end Next.js di atas API Laravel, dengan WebSocket yang ngirim perubahan ke semua orang yang lagi buka halamannya. Broadcast dan kerjaan berat jalan di antrean Redis biar aplikasinya nggak ngelag, dan file langsung diambil dari Google Drive.",
    },
    metrics: [
      { value: "20+ h", label: { en: "Manual work saved monthly", id: "Kerja manual dihemat per bulan" } },
      { value: "Live", label: { en: "WebSocket updates", id: "Update via WebSocket" } },
    ],
  },
  {
    slug: "snapcrm",
    short: "SnapCRM",
    client: "Universitas STEKOM & Toploker.com",
    year: 2024,
    url: null,
    ...img("automations", "dashboard", "flows"),
    disciplines: ["automation", "backend", "api"],
    stack: ["Node.js", "Laravel", "TypeScript", "MySQL", "Docker"],
    title: { en: "SnapCRM", id: "SnapCRM" },
    category: { en: "WhatsApp automation", id: "Otomasi WhatsApp" },
    summary: {
      en: "A CRM that turns large lead lists into WhatsApp conversations, with broadcasts and auto-reply flows.",
      id: "CRM yang ngubah daftar leads segunung jadi obrolan WhatsApp, lengkap dengan broadcast dan alur auto-reply.",
    },
    problem: {
      en: "Marketing had hundreds of thousands of leads and no realistic way to follow up by hand. Existing tools didn't do the WhatsApp side properly.",
      id: "Tim marketing pegang ratusan ribu leads, dan follow up satu-satu jelas nggak mungkin. Tools yang ada juga belum bener di sisi WhatsApp-nya.",
    },
    approach: {
      en: "Node.js and Laravel talking to the WhatsApp HTTP API, a broadcast engine that paces itself, and reply flows that handle the common questions so people only step in when it matters.",
      id: "Node.js dan Laravel yang ngobrol ke WhatsApp HTTP API, mesin broadcast yang ngatur kecepatannya sendiri, dan alur balasan buat pertanyaan yang itu-itu aja. Jadi orang cuma turun tangan kalau memang perlu.",
    },
    metrics: [
      { value: "100K+", label: { en: "Leads managed", id: "Leads dikelola" } },
      { value: "100K+", label: { en: "Broadcasts delivered", id: "Broadcast terkirim" } },
    ],
  },
  {
    slug: "corpus",
    short: "Corpus",
    client: "Universitas STEKOM",
    year: 2026,
    url: null,
    ...img("corpus", "research", "archive", "hero"),
    disciplines: ["ai", "backend"],
    stack: ["NestJS 11", "Bun", "React 19", "PostgreSQL", "DeepSeek", "Zotero API", "Pandoc"],
    title: { en: "Corpus", id: "Corpus" },
    category: { en: "AI research pipeline", id: "Pipeline riset AI" },
    summary: {
      en: "A multi-agent pipeline that drafts academic manuscripts from real sources, and refuses to ship a citation it can't trace back.",
      id: "Pipeline multi-agen yang nyusun draf naskah akademik dari sumber asli, dan nggak mau ngeluarin sitasi yang nggak bisa dilacak balik.",
    },
    problem: {
      en: "Getting a model to write text is easy. Getting citations that exist and actually support the sentence they're attached to is the hard part. General chatbots invent references without blinking.",
      id: "Nyuruh model nulis itu gampang. Yang susah itu bikin sitasinya beneran ada dan memang nyambung sama kalimatnya. Chatbot biasa bisa ngarang referensi tanpa merasa bersalah.",
    },
    approach: {
      en: "Seven stages from retrieval to formatted output, ending in an integrity gate. Sources get stable short refs so citations are parsed straight from the model's markers. Researchers can ground drafts in their own Zotero library.",
      id: "Tujuh tahap dari cari sumber sampai naskah rapi, ditutup gerbang cek integritas. Tiap sumber dikasih kode pendek yang stabil, jadi sitasi bisa dibaca langsung dari penanda di teks. Peneliti juga bisa pakai library Zotero mereka sendiri.",
    },
    metrics: [
      { value: "7", label: { en: "Pipeline stages", id: "Tahap pipeline" } },
      { value: "6", label: { en: "Citation styles", id: "Gaya sitasi" } },
    ],
  },
  {
    slug: "kerja-malam",
    short: "Kerja Malam",
    client: "Kerja Malam",
    year: 2025,
    url: "https://kerjamalam.com",
    ...img("kerjamalam", "hero", "jobs", "events"),
    disciplines: ["web"],
    stack: ["React 19", "TanStack Start", "Vite", "Bun", "Tailwind CSS 4", "Zod"],
    title: { en: "Kerja Malam", id: "Kerja Malam" },
    category: { en: "Job portal · PWA", id: "Portal kerja · PWA" },
    summary: {
      en: "A job board for night-shift, part-time and freelance work in Indonesia. Light enough for a cheap phone, and it still works offline.",
      id: "Portal lowongan kerja malam, part-time, dan freelance di Indonesia. Cukup ringan buat HP kelas menengah, dan tetap bisa dibuka pas sinyal hilang.",
    },
    problem: {
      en: "The people looking for this work are on mid-range Android phones with patchy data. Most job boards are too heavy to load, and lose the listing you were reading the moment the signal drops.",
      id: "Yang nyari kerjaan begini kebanyakan pakai HP Android biasa dengan kuota seadanya. Portal lowongan kebanyakan terlalu berat, dan lowongan yang lagi dibaca langsung hilang begitu sinyal putus.",
    },
    approach: {
      en: "A small JavaScript payload on TanStack Start, search filters kept in the URL so results survive a refresh and can be shared, and a full PWA so saved listings stay readable offline.",
      id: "Ukuran JavaScript dijaga kecil di TanStack Start, filter pencarian disimpan di URL biar hasilnya nggak hilang pas di-refresh dan gampang dibagiin, plus PWA penuh jadi lowongan yang disimpan tetap bisa dibaca offline.",
    },
    metrics: [
      { value: "PWA", label: { en: "Installable, works offline", id: "Bisa di-install, jalan offline" } },
      { value: "4", label: { en: "Filters at once", id: "Filter sekaligus" } },
    ],
  },
  {
    slug: "depot",
    short: "Depot",
    client: "Universitas STEKOM",
    year: 2026,
    url: "https://depot.stekom.ac.id",
    ...img("depot", "files", "dashboard", "apps"),
    disciplines: ["backend", "api", "devops"],
    stack: ["NestJS 11", "Bun", "PostgreSQL", "Redis", "BullMQ", "S3"],
    title: { en: "Depot", id: "Depot" },
    category: { en: "Media service", id: "Layanan media" },
    summary: {
      en: "One multi-tenant media service for every campus app: presigned uploads, background thumbnails and transcodes, signed delivery, HMAC webhooks.",
      id: "Satu layanan media multi-tenant buat semua aplikasi kampus: upload presigned, thumbnail dan transcode di belakang layar, link akses bertanda tangan, dan webhook HMAC.",
    },
    problem: {
      en: "Each app had rebuilt file handling its own way. Big uploads streamed through app servers, access rules didn't match, and nobody knew how much storage anything used.",
      id: "Tiap aplikasi bikin urusan upload file sendiri-sendiri. File gede lewat server aplikasi, aturan aksesnya beda-beda, dan nggak ada yang tahu sebenarnya storage kepakai berapa.",
    },
    approach: {
      en: "The client gets a presigned URL and uploads straight to S3, so no large file passes through the API. Processing runs on BullMQ, and short-lived signed URLs mean access can be revoked without moving anything.",
      id: "Client dapat presigned URL lalu upload langsung ke S3, jadi file besar nggak pernah lewat API. Proses lanjutan jalan di BullMQ, dan link akses yang umurnya pendek bikin akses bisa dicabut tanpa mindahin file.",
    },
    metrics: [
      { value: "0 bytes", label: { en: "Through the API on upload", id: "Lewat API saat upload" } },
      { value: "3 SDKs", label: { en: "TypeScript, Python, PHP", id: "TypeScript, Python, PHP" } },
    ],
  },
  {
    slug: "pddikti-api",
    short: "PDDikti",
    client: "Open source",
    year: 2026,
    url: "https://github.com/andikadevs/pddikti",
    ...img("pddikti", "ui", "swagger", "mcp"),
    disciplines: ["api", "ai"],
    stack: ["Bun", "Hono", "TypeScript", "Zod", "OpenAPI", "MCP"],
    title: { en: "PDDikti API & MCP", id: "PDDikti API & MCP" },
    category: { en: "Open-source API", id: "API open source" },
    summary: {
      en: "A typed, documented read-only API over Indonesia's higher-education dataset, also exposed as an MCP server so AI agents can query it.",
      id: "API read-only yang rapi dan terdokumentasi untuk data pendidikan tinggi Indonesia, sekaligus server MCP biar agen AI bisa langsung pakai.",
    },
    problem: {
      en: "PDDikti is the source of truth for campuses, programmes and lecturers, but it sits behind Cloudflare with undocumented responses. Every team ends up writing the same fragile scraper.",
      id: "PDDikti itu sumber data resmi kampus, prodi, dan dosen, tapi ada di balik Cloudflare dan format respons-nya nggak didokumentasikan. Ujung-ujungnya tiap tim bikin scraper yang sama dan gampang rusak.",
    },
    approach: {
      en: "Each endpoint is defined once as a Zod schema, which generates both the validation and the OpenAPI docs, so they can't drift apart. The same surface is served as MCP tools.",
      id: "Tiap endpoint cukup ditulis sekali sebagai skema Zod, dan dari situ validasi sama dokumentasi OpenAPI-nya ikut jadi. Jadi dokumen nggak mungkin beda sama perilakunya. Endpoint yang sama juga disajikan sebagai tool MCP.",
    },
    metrics: [
      { value: "OpenAPI", label: { en: "Docs generated from schema", id: "Dokumen dari skema" } },
      { value: "MCP", label: { en: "Usable by AI agents", id: "Bisa dipakai agen AI" } },
    ],
  },
  {
    slug: "jobs-scraper",
    short: "Scraper",
    client: "Toploker.com",
    year: 2026,
    url: null,
    ...img("scraper", "scraper", "dashboard", "logs"),
    disciplines: ["automation", "ai", "backend"],
    stack: ["Bun", "React 19", "PostgreSQL", "Puppeteer", "Gemini", "WebSocket"],
    title: { en: "Jobs Scraper", id: "Jobs Scraper" },
    category: { en: "AI data pipeline", id: "Pipeline data AI" },
    summary: {
      en: "Watches Instagram accounts by region, scrapes vacancy posts, and lets Gemini sort real jobs from noise before anything hits the database.",
      id: "Mantau akun Instagram per wilayah, ambil postingan lowongan, lalu Gemini yang milah mana lowongan beneran dan mana yang cuma promo sebelum masuk database.",
    },
    problem: {
      en: "A lot of Indonesian vacancies are just an Instagram post with a WhatsApp number. The same accounts mix jobs with promos and reposts, and scrapers break without telling you why.",
      id: "Banyak lowongan di Indonesia cuma berupa postingan Instagram plus nomor WhatsApp. Akunnya sering nyampur lowongan sama promo dan repost, dan scraper bisa mati tanpa ketahuan kenapa.",
    },
    approach: {
      en: "Puppeteer on a schedule, Gemini classification, Zod validation on every record, and a dashboard that streams each run's logs live, so a failed run can actually be explained.",
      id: "Puppeteer yang jalan terjadwal, klasifikasi Gemini, validasi Zod di tiap data, dan dashboard yang nampilin log tiap sesi secara live. Jadi kalau gagal, penyebabnya kelihatan.",
    },
    metrics: [
      { value: "Gemini", label: { en: "Post classification", id: "Klasifikasi postingan" } },
      { value: "Live", label: { en: "Per-run logs", id: "Log per sesi" } },
    ],
  },
  {
    slug: "conflow",
    short: "Conflow",
    client: "Universitas STEKOM",
    year: 2026,
    url: "https://conflow.stekom.ac.id",
    ...img("conflow", "dashboard", "calendar", "contents", "upload"),
    disciplines: ["web", "backend", "automation"],
    stack: ["NestJS 11", "Bun", "React 19", "PostgreSQL", "Redis", "Google Drive API"],
    title: { en: "Conflow", id: "Conflow" },
    category: { en: "Content scheduling", id: "Penjadwalan konten" },
    summary: {
      en: "Write, schedule and publish social posts across channels from one dashboard, with a media library that imports from Google Drive.",
      id: "Tulis, jadwalkan, dan terbitkan postingan ke banyak kanal dari satu dashboard, dengan media library yang bisa impor langsung dari Google Drive.",
    },
    problem: {
      en: "Campus content was run through group chats and spreadsheets. Whoever had the password posted it, usually late, and nobody could say what was going out next week.",
      id: "Konten kampus diurus lewat grup chat dan spreadsheet. Siapa yang pegang password, dia yang posting, biasanya telat, dan nggak ada yang tahu minggu depan mau posting apa.",
    },
    approach: {
      en: "Posts are written once and queued for their time slot, so nothing depends on someone being awake. Roles separate drafting from publishing, and a calendar answers the “what's next week” question.",
      id: "Postingan cukup ditulis sekali lalu masuk antrean sesuai jadwal, jadi nggak perlu ada yang begadang. Role misahin siapa yang nulis dan siapa yang boleh publish, dan kalender langsung jawab “minggu depan ada apa aja”.",
    },
    metrics: [
      { value: "Queue", label: { en: "Scheduled publishing", id: "Publikasi terjadwal" } },
      { value: "Drive", label: { en: "Import into media library", id: "Impor ke media library" } },
    ],
  },
  {
    slug: "bio",
    short: "Bio",
    client: "Universitas STEKOM",
    year: 2026,
    url: "https://bio.stekom.ac.id",
    ...img("bio", "hero", "editor", "public", "login"),
    disciplines: ["web", "backend"],
    stack: ["Laravel", "Octane", "Inertia", "React 19", "MySQL", "Tailwind CSS 4"],
    title: { en: "Bio", id: "Bio" },
    category: { en: "Link-in-bio builder", id: "Pembuat link-in-bio" },
    summary: {
      en: "A self-hosted link-in-bio builder for campus teams: drag-and-drop pages, themes, QR codes and analytics that stay on campus servers.",
      id: "Pembuat link-in-bio self-hosted buat tim-tim di kampus: halaman drag-and-drop, tema, QR code, dan analitik yang datanya tetap di server kampus.",
    },
    problem: {
      en: "Departments and student groups were each paying for a hosted account, or sharing one. Analytics were scattered and the branding was all over the place.",
      id: "Tiap bagian dan organisasi mahasiswa langganan akun sendiri-sendiri, atau malah patungan satu akun. Analitiknya kepencar dan tampilannya nggak seragam.",
    },
    approach: {
      en: "Laravel with Octane and Inertia, so it feels like an SPA but deploys as one app. Themed presets give every team an on-brand page without needing a designer.",
      id: "Laravel dengan Octane dan Inertia, jadi rasanya kayak SPA tapi deploy-nya tetap satu aplikasi. Preset tema bikin tiap tim punya halaman yang sesuai brand tanpa harus minta tolong desainer.",
    },
    metrics: [
      { value: "Teams", label: { en: "Separate workspaces", id: "Workspace terpisah" } },
      { value: "0", label: { en: "SaaS fees", id: "Biaya langganan" } },
    ],
  },
  {
    slug: "topmatch",
    short: "TopMatch",
    client: "Toploker.com",
    year: 2025,
    url: "https://match.toploker.com",
    ...img("topmatch", "hero", "services", "pricing"),
    disciplines: ["web"],
    stack: ["Next.js 16", "React 19", "Tailwind CSS", "Framer Motion", "Lenis"],
    title: { en: "TopMatch", id: "TopMatch" },
    category: { en: "HR SaaS landing", id: "Landing HR SaaS" },
    summary: {
      en: "The recruitment product site for Toploker, aimed at HR teams, with pricing out in the open.",
      id: "Website produk rekrutmen Toploker yang ditujukan ke tim HR, dengan harga yang dipajang terang-terangan.",
    },
    problem: {
      en: "Toploker's usual audience is job seekers. TopMatch sells to hiring managers, who want to know what it does, what it costs and who uses it, fast.",
      id: "Biasanya yang datang ke Toploker itu pencari kerja. TopMatch justru jualan ke HR dan hiring manager, yang pengen cepat tahu produknya ngapain, harganya berapa, dan siapa aja yang udah pakai.",
    },
    approach: {
      en: "One page built around one decision: value, services, plans, call to action. Motion guides the eye through pricing instead of decorating it, and it's statically generated so ads land on a fast page.",
      id: "Satu halaman yang disusun buat satu keputusan: manfaat, layanan, paket, lalu ajakan. Animasi dipakai buat ngarahin mata ke bagian harga, bukan sekadar hiasan, dan halamannya di-generate statis biar trafik dari iklan mendarat di halaman yang cepat.",
    },
    metrics: [
      { value: "Static", label: { en: "Fast for paid traffic", id: "Cepat buat trafik iklan" } },
      { value: "Open", label: { en: "Published pricing", id: "Harga dipajang" } },
    ],
  },
];
