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
    category: { en: "University website", id: "Website universitas" },
    summary: {
      en: "The official international site of Universitas STEKOM. Real English and Indonesian pages, plus an admin where each department runs its own content.",
      id: "Website internasional resmi Universitas STEKOM, dengan konten berbahasa Inggris dan Indonesia yang ditulis utuh, serta panel admin agar setiap unit mengelola kontennya sendiri.",
    },
    problem: {
      en: "Two audiences that rarely overlap: partners and students abroad reading English, and people at home reading Indonesian. Several departments edit the site, so one shared admin password was never going to work.",
      id: "Situs ini melayani dua kelompok pembaca: mitra dan calon mahasiswa internasional yang membaca versi Inggris, serta pembaca domestik yang membaca versi Indonesia. Kontennya pun dikelola banyak unit, sehingga satu akun admin bersama tidak memadai.",
    },
    approach: {
      en: "Locale-aware routing so every page has a proper EN and ID version. Role-based access through NextAuth, so each department only touches its own news, agendas and partner data. News is pulled from the existing campus portal API instead of being typed in twice.",
      id: "Routing berbasis bahasa memastikan setiap halaman memiliki versi EN dan ID yang utuh. Akses berbasis peran melalui NextAuth membatasi setiap unit pada berita, agenda, dan data mitranya sendiri. Berita ditarik langsung dari API portal kampus, sehingga tidak perlu diinput dua kali.",
    },
    metrics: [
      { value: "EN / ID", label: { en: "Bilingual, i18n routing", id: "Dwibahasa dengan routing i18n" } },
      { value: "RBAC", label: { en: "Per-department admin", id: "Admin per unit" } },
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
      id: "Identity provider OpenID Connect untuk seluruh kampus: satu akun untuk semua aplikasi internal, dilengkapi SDK untuk TypeScript, Python, dan PHP.",
    },
    problem: {
      en: "Every new internal system came with its own user table and its own password reset. When someone left, their accounts were scattered across apps nobody remembered.",
      id: "Setiap sistem baru membawa tabel pengguna dan alur reset kata sandinya sendiri. Ketika seseorang keluar, akunnya masih tersebar di berbagai aplikasi yang terlupakan.",
    },
    approach: {
      en: "Authorization Code with PKCE, ID-token verification, and both RP-initiated and back-channel logout, so logging out once really ends the session everywhere. The SDKs mean another team can plug in an existing app in an afternoon.",
      id: "Authorization Code dengan PKCE, verifikasi ID token, serta logout RP-initiated dan back-channel, sehingga satu kali logout benar-benar mengakhiri sesi di semua aplikasi. Dengan SDK yang tersedia, tim lain dapat mengintegrasikan aplikasinya dalam hitungan jam.",
    },
    metrics: [
      { value: "11+", label: { en: "Apps on single sign-on", id: "Aplikasi terhubung ke SSO" } },
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
      id: "Tulang punggung operasional Toploker: iklan, rekap pendapatan, invoice, dan broadcast dalam satu sistem dengan pembaruan real-time.",
    },
    problem: {
      en: "Marketing, finance and file management each lived in a different tool. Data didn't line up, people re-typed the same numbers, and decisions waited on someone's spreadsheet.",
      id: "Marketing, keuangan, dan pengelolaan file tersebar di aplikasi yang berbeda. Data tidak sinkron, angka yang sama diinput berulang kali, dan keputusan tertunda menunggu spreadsheet.",
    },
    approach: {
      en: "A Next.js front end on a Laravel API, with WebSockets pushing changes to everyone who has the page open. Broadcasts and heavy jobs run on Redis queues so the app never stalls, and assets come straight from Google Drive.",
      id: "Front end Next.js di atas API Laravel, dengan WebSocket yang mengirim perubahan ke setiap pengguna yang sedang membuka halaman. Broadcast dan proses berat berjalan di antrean Redis agar aplikasi tetap responsif, dan file diambil langsung dari Google Drive.",
    },
    metrics: [
      { value: "20+ h", label: { en: "Manual work saved monthly", id: "Jam kerja manual dihemat per bulan" } },
      { value: "Live", label: { en: "WebSocket updates", id: "Pembaruan via WebSocket" } },
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
      id: "CRM yang mengubah ratusan ribu data prospek menjadi percakapan WhatsApp, lengkap dengan broadcast dan alur balasan otomatis.",
    },
    problem: {
      en: "Marketing had hundreds of thousands of leads and no realistic way to follow up by hand. Existing tools didn't do the WhatsApp side properly.",
      id: "Tim marketing mengelola ratusan ribu prospek, dan follow-up manual satu per satu tidak mungkin dilakukan. Tools yang ada juga belum mendukung WhatsApp dengan baik.",
    },
    approach: {
      en: "Node.js and Laravel talking to the WhatsApp HTTP API, a broadcast engine that paces itself, and reply flows that handle the common questions so people only step in when it matters.",
      id: "Node.js dan Laravel yang terhubung ke WhatsApp HTTP API, mesin broadcast yang mengatur lajunya sendiri, serta alur balasan untuk pertanyaan yang berulang, sehingga tim hanya turun tangan saat benar-benar diperlukan.",
    },
    metrics: [
      { value: "100K+", label: { en: "Leads managed", id: "Prospek dikelola" } },
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
      id: "Pipeline multi-agen yang menyusun draf naskah akademik dari sumber nyata, dan menolak sitasi yang tidak dapat ditelusuri kembali.",
    },
    problem: {
      en: "Getting a model to write text is easy. Getting citations that exist and actually support the sentence they're attached to is the hard part. General chatbots invent references without blinking.",
      id: "Membuat model menulis itu mudah. Tantangannya adalah memastikan setiap sitasi benar-benar ada dan relevan dengan kalimatnya, karena chatbot umum kerap mengarang referensi.",
    },
    approach: {
      en: "Seven stages from retrieval to formatted output, ending in an integrity gate. Sources get stable short refs so citations are parsed straight from the model's markers. Researchers can ground drafts in their own Zotero library.",
      id: "Tujuh tahap dari penelusuran sumber hingga naskah terformat, diakhiri pemeriksaan integritas. Setiap sumber diberi kode pendek yang konsisten, sehingga sitasi terbaca langsung dari penanda di teks. Peneliti juga dapat menggunakan pustaka Zotero mereka sendiri.",
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
      id: "Portal lowongan kerja malam, paruh waktu, dan freelance di Indonesia: ringan untuk ponsel kelas menengah dan tetap dapat diakses saat sinyal terputus.",
    },
    problem: {
      en: "The people looking for this work are on mid-range Android phones with patchy data. Most job boards are too heavy to load, and lose the listing you were reading the moment the signal drops.",
      id: "Pencari kerja di segmen ini umumnya memakai ponsel Android dengan kuota terbatas. Kebanyakan portal lowongan terlalu berat, dan lowongan yang sedang dibaca hilang begitu koneksi terputus.",
    },
    approach: {
      en: "A small JavaScript payload on TanStack Start, search filters kept in the URL so results survive a refresh and can be shared, and a full PWA so saved listings stay readable offline.",
      id: "Ukuran JavaScript dijaga tetap kecil dengan TanStack Start, filter pencarian disimpan di URL agar hasilnya tetap ada saat dimuat ulang dan mudah dibagikan, serta PWA penuh sehingga lowongan tersimpan dapat dibaca secara offline.",
    },
    metrics: [
      { value: "PWA", label: { en: "Installable, works offline", id: "Dapat dipasang dan berjalan offline" } },
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
      id: "Layanan media multi-tenant untuk seluruh aplikasi kampus: unggahan presigned, thumbnail dan transcode di latar belakang, URL akses bertanda tangan, serta webhook HMAC.",
    },
    problem: {
      en: "Each app had rebuilt file handling its own way. Big uploads streamed through app servers, access rules didn't match, and nobody knew how much storage anything used.",
      id: "Setiap aplikasi menangani unggahan file dengan caranya sendiri. File besar melewati server aplikasi, aturan akses tidak seragam, dan penggunaan storage tidak pernah jelas.",
    },
    approach: {
      en: "The client gets a presigned URL and uploads straight to S3, so no large file passes through the API. Processing runs on BullMQ, and short-lived signed URLs mean access can be revoked without moving anything.",
      id: "Client memperoleh presigned URL lalu mengunggah langsung ke S3, sehingga file besar tidak pernah melewati API. Pemrosesan lanjutan berjalan di BullMQ, dan URL akses berumur pendek memungkinkan akses dicabut tanpa memindahkan file.",
    },
    metrics: [
      { value: "0 bytes", label: { en: "Through the API on upload", id: "Melewati API saat unggah" } },
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
      id: "API read-only yang terstruktur dan terdokumentasi untuk data pendidikan tinggi Indonesia, sekaligus server MCP yang dapat digunakan langsung oleh agen AI.",
    },
    problem: {
      en: "PDDikti is the source of truth for campuses, programmes and lecturers, but it sits behind Cloudflare with undocumented responses. Every team ends up writing the same fragile scraper.",
      id: "PDDikti adalah sumber data resmi perguruan tinggi, program studi, dan dosen, namun berada di balik Cloudflare dengan format respons yang tidak terdokumentasi. Akibatnya, setiap tim membuat scraper serupa yang mudah rusak.",
    },
    approach: {
      en: "Each endpoint is defined once as a Zod schema, which generates both the validation and the OpenAPI docs, so they can't drift apart. The same surface is served as MCP tools.",
      id: "Setiap endpoint didefinisikan sekali sebagai skema Zod, yang sekaligus menghasilkan validasi dan dokumentasi OpenAPI, sehingga dokumentasi selalu sesuai dengan perilaku API. Endpoint yang sama juga tersedia sebagai tool MCP.",
    },
    metrics: [
      { value: "OpenAPI", label: { en: "Docs generated from schema", id: "Dokumentasi dari skema" } },
      { value: "MCP", label: { en: "Usable by AI agents", id: "Dapat digunakan agen AI" } },
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
      id: "Memantau akun Instagram per wilayah, mengambil unggahan lowongan, lalu mengklasifikasikannya dengan Gemini untuk memisahkan lowongan asli dari promosi sebelum masuk ke database.",
    },
    problem: {
      en: "A lot of Indonesian vacancies are just an Instagram post with a WhatsApp number. The same accounts mix jobs with promos and reposts, and scrapers break without telling you why.",
      id: "Banyak lowongan di Indonesia hanya berupa unggahan Instagram dengan nomor WhatsApp. Satu akun sering mencampur lowongan dengan promosi dan repost, dan scraper bisa gagal tanpa jejak yang jelas.",
    },
    approach: {
      en: "Puppeteer on a schedule, Gemini classification, Zod validation on every record, and a dashboard that streams each run's logs live, so a failed run can actually be explained.",
      id: "Puppeteer yang berjalan terjadwal, klasifikasi Gemini, validasi Zod untuk setiap data, dan dashboard yang menampilkan log setiap sesi secara langsung, sehingga penyebab kegagalan selalu terlihat.",
    },
    metrics: [
      { value: "Gemini", label: { en: "Post classification", id: "Klasifikasi unggahan" } },
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
      id: "Tulis, jadwalkan, dan terbitkan konten ke berbagai kanal dari satu dashboard, dengan media library yang dapat mengimpor langsung dari Google Drive.",
    },
    problem: {
      en: "Campus content was run through group chats and spreadsheets. Whoever had the password posted it, usually late, and nobody could say what was going out next week.",
      id: "Konten kampus dikelola lewat grup chat dan spreadsheet. Unggahan bergantung pada siapa yang memegang kata sandi, kerap terlambat, dan jadwal minggu berikutnya tidak pernah jelas.",
    },
    approach: {
      en: "Posts are written once and queued for their time slot, so nothing depends on someone being awake. Roles separate drafting from publishing, and a calendar answers the “what's next week” question.",
      id: "Konten cukup ditulis sekali lalu masuk antrean sesuai jadwal, tanpa perlu ada yang berjaga. Peran memisahkan penulis dan penerbit, dan tampilan kalender menunjukkan apa saja yang terbit minggu depan.",
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
      id: "Pembuat link-in-bio self-hosted untuk unit-unit di kampus: halaman drag-and-drop, preset tema, QR code, dan analitik yang datanya tetap di server kampus.",
    },
    problem: {
      en: "Departments and student groups were each paying for a hosted account, or sharing one. Analytics were scattered and the branding was all over the place.",
      id: "Setiap unit dan organisasi mahasiswa berlangganan akun terpisah, atau berbagi satu akun. Analitik tersebar dan identitas visual tidak seragam.",
    },
    approach: {
      en: "Laravel with Octane and Inertia, so it feels like an SPA but deploys as one app. Themed presets give every team an on-brand page without needing a designer.",
      id: "Laravel dengan Octane dan Inertia, sehingga terasa seperti SPA namun tetap di-deploy sebagai satu aplikasi. Preset tema memberi setiap unit halaman yang sesuai identitas visualnya tanpa perlu desainer.",
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
    category: { en: "HR SaaS landing", id: "Landing page HR SaaS" },
    summary: {
      en: "The recruitment product site for Toploker, aimed at HR teams, with pricing out in the open.",
      id: "Website produk rekrutmen Toploker untuk tim HR, dengan harga yang ditampilkan secara terbuka.",
    },
    problem: {
      en: "Toploker's usual audience is job seekers. TopMatch sells to hiring managers, who want to know what it does, what it costs and who uses it, fast.",
      id: "Pengunjung Toploker umumnya pencari kerja, sementara TopMatch menyasar HR dan hiring manager yang ingin cepat mengetahui layanan, harga, dan siapa saja penggunanya.",
    },
    approach: {
      en: "One page built around one decision: value, services, plans, call to action. Motion guides the eye through pricing instead of decorating it, and it's statically generated so ads land on a fast page.",
      id: "Satu halaman yang disusun untuk satu keputusan: manfaat, layanan, paket harga, lalu ajakan bertindak. Animasi mengarahkan perhatian ke perbandingan harga, dan halaman di-generate secara statis agar trafik iklan mendarat di halaman yang cepat.",
    },
    metrics: [
      { value: "Static", label: { en: "Fast for paid traffic", id: "Cepat untuk trafik iklan" } },
      { value: "Open", label: { en: "Published pricing", id: "Harga transparan" } },
    ],
  },
];
