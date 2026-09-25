// Who I am, where I've worked, what I use. Same { en, id } convention as projects.js.

export const profile = {
  name: "Andika Dwi Saputra",
  shortName: "Andika",
  email: "andikadwisaputra.dev@gmail.com",
  location: "Semarang, ID",
  timeZone: "Asia/Jakarta",
  cv: "assets/docs/cv-andika-dwi-saputra.pdf",
  socials: [
    { label: "GitHub",    handle: "@andikadevs",          url: "https://github.com/andikadevs" },
    { label: "LinkedIn",  handle: "in/andikadwisaputra",  url: "https://www.linkedin.com/in/andikadwisaputra" },
    { label: "Medium",    handle: "@andikads",            url: "https://medium.com/@andikads" },
    { label: "Instagram", handle: "@andikads__",          url: "https://instagram.com/andikads__" },
  ],
};

export const clients = [
  { name: "Universitas STEKOM", logo: "assets/logos/stekom.webp", width: 238, height: 88 },
  { name: "Toploker.com", logo: "assets/logos/toploker.webp", width: 405, height: 88 },
  { name: "Akastra Toyota", logo: "assets/logos/akastra.webp", width: 252, height: 61 },
  { name: "Kerja Malam", logo: "assets/logos/kerjamalam.webp", width: 587, height: 88 },
  { name: "Digitek", logo: "assets/logos/digitek.webp", width: 88, height: 88 },
];

export const experience = [
  {
    period: { en: "2024 — now", id: "2024 — sekarang" },
    role: { en: "Fullstack Developer & Analyst", id: "Fullstack Developer & Analyst" },
    org: "Toploker.com",
    body: {
      en: "I build the systems Toploker runs on: OTO Management, SnapCRM, the jobs scraper, TopMatch and the CV catalog. Most of my week is spent finding the manual step nobody likes and making it go away.",
      id: "Saya bangun sistem-sistem yang dipakai Toploker sehari-hari: OTO Management, SnapCRM, jobs scraper, TopMatch, dan katalog CV. Kerjaan saya kebanyakan nyari langkah manual yang bikin repot, terus bikin itu hilang.",
    },
    tags: ["Next.js", "Laravel", "Node.js", "Redis"],
  },
  {
    period: { en: "2024 — now", id: "2024 — sekarang" },
    role: { en: "Software Engineer, International Office", id: "Software Engineer, Kantor Internasional" },
    org: "Universitas STEKOM",
    body: {
      en: "Developer on the international team. I built the international site and the campus platform around it: Passport for single sign-on, Depot for media, Conflow, Bio and Corpus.",
      id: "Developer di tim internasional. Saya yang bangun website internasional dan platform kampus di sekitarnya: Passport buat SSO, Depot buat media, Conflow, Bio, dan Corpus.",
    },
    tags: ["NestJS", "Bun", "React", "PostgreSQL"],
  },
  {
    period: { en: "2024 — now", id: "2024 — sekarang" },
    role: { en: "Founder", id: "Founder" },
    org: "Manggala Cloud",
    body: {
      en: "A small web and app studio in Semarang, running six services: the studio site, digital wedding invitations, birthday pages, an invitation editor with checkout, an affiliate portal, and the admin that runs it all.",
      id: "Studio web dan aplikasi kecil di Semarang dengan enam layanan: website studio, undangan pernikahan digital, halaman ucapan ulang tahun, editor undangan plus checkout, portal afiliasi, dan admin yang ngatur semuanya.",
    },
    tags: ["Next.js", "TanStack Start", "PostgreSQL", "TypeScript"],
  },
  {
    period: { en: "2023 — 2024", id: "2023 — 2024" },
    role: { en: "Junior Software Engineer (Intern)", id: "Junior Software Engineer (Magang)" },
    org: "Akastra Toyota",
    body: {
      en: "Where I learned to ship. Company sites, an OAuth2 SSO server, vehicle tracking, e-parking, a staging export panel and the MRS Genius APIs.",
      id: "Tempat saya belajar beneran ngirim software ke pengguna. Website perusahaan, server SSO OAuth2, tracking kendaraan, e-parking, panel ekspor data, dan API MRS Genius.",
    },
    tags: ["Laravel", "jQuery", "MySQL", "SQL Server"],
  },
];

export const education = [
  {
    period: "2024 — now",
    school: "Universitas STEKOM",
    degree: { en: "B.Eng. Computer Engineering · full scholarship", id: "S1 Teknik Komputer · beasiswa penuh" },
  },
  {
    period: "2020 — 2024",
    school: "SMKN 1 Punggelan",
    degree: { en: "SIJA — Network & Application Systems", id: "SIJA — Sistem Informatika, Jaringan & Aplikasi" },
  },
];

export const highlights = [
  { tone: "sky",   value: "2×",    label: { en: "Competition", id: "Lomba" },
    title: { en: "LKS regency winner", id: "Juara LKS kabupaten" },
    body: { en: "Web Technology 2024 and IT Software Solution 2023.", id: "Web Technology 2024 dan IT Software Solution 2023." } },
  { tone: "brand", value: "800",   label: { en: "English", id: "Bahasa Inggris" },
    title: { en: "TOEIC score", id: "Skor TOEIC" },
    body: { en: "Advanced level. I work day to day with the international office.", id: "Level advanced. Sehari-hari kerja bareng kantor internasional." } },
  { tone: "white", value: "100%",  label: { en: "University", id: "Kuliah" },
    title: { en: "Full scholarship", id: "Beasiswa penuh" },
    body: { en: "Computer Engineering at Universitas STEKOM, while working full-time.", id: "Teknik Komputer di Universitas STEKOM, sambil kerja full-time." } },
  { tone: "sky",   value: "11+",   label: { en: "Identity", id: "Identitas" },
    title: { en: "Apps on one login", id: "Aplikasi, satu login" },
    body: { en: "Campus apps signing in through the SSO I built, STEKOM Passport.", id: "Aplikasi kampus yang login lewat SSO buatan saya, STEKOM Passport." } },
  { tone: "brand", value: "100K+", label: { en: "Automation", id: "Otomasi" },
    title: { en: "Leads handled", id: "Leads dikelola" },
    body: { en: "Managed and messaged over WhatsApp by SnapCRM.", id: "Dikelola dan dihubungi lewat WhatsApp oleh SnapCRM." } },
  { tone: "white", value: "20+ h", label: { en: "Operations", id: "Operasional" },
    title: { en: "Saved every month", id: "Dihemat tiap bulan" },
    body: { en: "Manual work OTO Management took off Toploker's plate.", id: "Kerja manual yang diambil alih OTO Management di Toploker." } },
  { tone: "sky",   value: "6",     label: { en: "Studio", id: "Studio" },
    title: { en: "Services, one studio", id: "Layanan, satu studio" },
    body: { en: "Manggala Cloud: site, invitations, birthdays, editor, affiliates, admin.", id: "Manggala Cloud: situs, undangan, ucapan, editor, afiliasi, admin." } },
  { tone: "brand", value: "3",     label: { en: "Developer tools", id: "Alat developer" },
    title: { en: "Typed SDKs", id: "SDK bertipe" },
    body: { en: "TypeScript, Python and PHP clients for Passport and Depot.", id: "Klien TypeScript, Python, dan PHP untuk Passport dan Depot." } },
];
