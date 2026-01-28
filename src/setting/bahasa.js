// src/setting/bahasa.js
export const TRANSLATIONS = {
  id: {
    home: "Beranda",
    search_placeholder: "Cari judul, genre, atau kata kunci...",
    searching_in: "Mencari di:",
    search_hint: "Ketik untuk mencari drama di",
    trending: "PILIHAN EDITOR",
    result: "Hasil Pencarian:",
    login_title: "Akses VIP",
    login_desc: "Masuk untuk membuka ribuan episode.",
    login_btn: "Masuk Sekarang",
    cancel: "Batal",

    menu_home: "Beranda",
    menu_terms: "Syarat",
    menu_about: "Tentang",

    logout: "Keluar",
    login: "Masuk",
    random_pick: "Rekomendasi Harian",

    status_vip: "Status: VIP",
    status_free: "Status: Free",
    member: "Member",
    guest: "Guest",
  },
  en: {
    home: "Home",
    search_placeholder: "Search title, genre, or keywords...",
    searching_in: "Searching in:",
    search_hint: "Type to search dramas in",
    trending: "EDITOR'S PICK",
    result: "Search Result:",
    login_title: "VIP Access",
    login_desc: "Login to unlock thousands of episodes.",
    login_btn: "Login Now",
    cancel: "Cancel",

    menu_home: "Home",
    menu_terms: "Terms",
    menu_about: "About",

    logout: "Logout",
    login: "Login",
    random_pick: "Daily Picks",

    status_vip: "Status: VIP",
    status_free: "Status: Free",
    member: "Member",
    guest: "Guest",
  },
};

export const getT = (lang = "id") => TRANSLATIONS[lang] || TRANSLATIONS.id;
