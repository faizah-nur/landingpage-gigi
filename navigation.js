/**
 * navigation.js
 * Sistem Navigasi Kategori / Single Page Section Filter
 * 
 * Mengatur tampilan konten halaman index.html berdasarkan kategori yang dipilih.
 * Konten kategori terpilih akan ditampilkan, dan kategori lainnya akan disembunyikan (hide)
 * tanpa perlu membuat banyak file HTML baru atau reload halaman.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ambil semua elemen section yang memiliki atribut data-category
  const sections = document.querySelectorAll('[data-category]');
  // Ambil semua link navigasi yang memiliki atribut data-nav-category
  const navLinks = document.querySelectorAll('[data-nav-category]');

  /**
   * Fungsi untuk menampilkan section sesuai kategori yang dipilih
   * dan menyembunyikan (hide) section lainnya.
   * 
   * @param {string} category - Nama kategori (misal: 'beranda', 'menu-1', 'menu-2', 'semua', dll)
   */
  function showCategory(category) {
    if (!category) category = 'beranda';

    let hasMatch = false;

    // 1. Tampilkan section yang sesuai dan sembunyikan yang lain
    sections.forEach(section => {
      const sectionCatAttr = section.getAttribute('data-category') || '';
      const sectionCategories = sectionCatAttr.split(/\s+/);
      
      // Jika mode 'semua' atau kategori section cocok dengan kategori yang dipilih
      if (category === 'semua' || sectionCategories.includes(category)) {
        section.classList.remove('hidden');
        hasMatch = true;
      } else {
        section.classList.add('hidden');
      }
    });

    // Fallback ke beranda jika kategori yang dicari tidak ditemukan
    if (!hasMatch && category !== 'semua') {
      return showCategory('beranda');
    }

    // 2. Perbarui status tombol aktif pada menu navigasi (Desktop & Mobile)
    navLinks.forEach(link => {
      const linkCat = link.getAttribute('data-nav-category');
      const isMobile = link.hasAttribute('data-is-mobile');

      if (linkCat === category) {
        // Tampilan saat aktif
        if (isMobile) {
          link.classList.add('bg-pink-100', 'text-pink-700', 'font-bold');
          link.classList.remove('text-gray-700', 'hover:bg-pink-50');
        } else {
          link.classList.add('text-pink-600', 'font-bold', 'bg-pink-50', 'px-3', 'py-1.5', 'rounded-full');
          link.classList.remove('text-gray-600');
        }
      } else {
        // Tampilan saat tidak aktif
        if (isMobile) {
          link.classList.remove('bg-pink-100', 'text-pink-700', 'font-bold');
          link.classList.add('text-gray-700', 'hover:bg-pink-50');
        } else {
          link.classList.remove('text-pink-600', 'font-bold', 'bg-pink-50', 'px-3', 'py-1.5', 'rounded-full');
          link.classList.add('text-gray-600');
        }
      }
    });

    // 3. Gulir ke bagian paling atas secara halus
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // 4. Perbarui URL hash di address bar browser tanpa reload
    if (window.location.hash !== `#${category}`) {
      history.pushState(null, '', `#${category}`);
    }

    // 5. Inisialisasi ulang animasi judul GSAP ScrollTrigger untuk section yang baru ditampilkan
    if (window.initHeadingAnimations) {
      setTimeout(() => {
        window.initHeadingAnimations();
      }, 50);
    }
  }

  // Event listener untuk setiap link navigasi (navbar desktop & mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCategory = link.getAttribute('data-nav-category');
      showCategory(targetCategory);
    });
  });

  // Event listener untuk tombol CTA atau anchor link internal lainnya (seperti tombol di Hero)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.hasAttribute('data-nav-category')) return; // Lewati jika sudah ditangani di atas

    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const categoryName = href.replace('#', '');
      const targetSection = document.querySelector(`[data-category="${categoryName}"]`);

      // Jika target anchor adalah salah satu kategori yang ada, tampilkan kategori tersebut
      if (targetSection) {
        e.preventDefault();
        showCategory(categoryName);
      }
    });
  });

  // Dukung tombol Back / Forward di browser agar pengunjung bisa kembali ke kategori sebelumnya
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'beranda';
    showCategory(hash);
  });

  // Isi tahun otomatis jika ada elemen #year-mobile atau #current-year
  const yearElements = document.querySelectorAll('#year-mobile, #current-year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });

  // Tampilkan kategori awal sesuai URL hash saat pertama kali dibuka, default ke 'beranda'
  const initialCategory = window.location.hash.replace('#', '') || 'beranda';
  showCategory(initialCategory);

  // Buat fungsi showCategory bisa diakses dari global jika diperlukan
  window.showCategory = showCategory;
});
