/**
 * animations.js
 * GSAP + ScrollTrigger: Animasi Judul Muncul Per Kata (Word-by-Word Animation)
 * 
 * Memecah teks judul (h1, h2, h3) menjadi kata per kata secara rekursif
 * (mempertahankan warna dan styling tag di dalamnya) lalu menganimasikannya
 * secara berurutan (stagger) saat discroll ke layar menggunakan ScrollTrigger.
 */

// Pastikan GSAP dan ScrollTrigger sudah dimuat
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Fungsi untuk memecah teks di dalam elemen menjadi kata-kata dalam <span>
 * Mempertahankan elemen HTML bersarang (seperti <span class="text-pink-600">)
 */
function splitWordsIntoSpans(element) {
  if (element.dataset.splitDone === 'true') {
    return element.querySelectorAll('.gsap-word');
  }

  element.dataset.splitDone = 'true';

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) {
        return document.createTextNode(text);
      }

      const fragment = document.createDocumentFragment();
      // Pisahkan berdasarkan spasi namun tetap tangkap whitespace
      const tokens = text.split(/(\s+)/);

      tokens.forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
        } else if (token) {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'gsap-word inline-block will-change-transform';
          wordSpan.textContent = token;
          fragment.appendChild(wordSpan);
        }
      });

      return fragment;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Salin elemen (tag dan atributnya seperti class text-pink-600)
      const clone = node.cloneNode(false);
      node.childNodes.forEach(child => {
        clone.appendChild(processNode(child));
      });
      return clone;
    }
    return node.cloneNode(true);
  }

  const fragment = document.createDocumentFragment();
  Array.from(element.childNodes).forEach(child => {
    fragment.appendChild(processNode(child));
  });

  element.innerHTML = '';
  element.appendChild(fragment);

  return element.querySelectorAll('.gsap-word');
}

/**
 * Fungsi utama untuk menginisialisasi animasi pada semua judul di section yang aktif
 */
function initHeadingAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP atau ScrollTrigger belum dimuat.');
    return;
  }

  // Bersihkan trigger lama agar tidak menumpuk saat ganti kategori
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());

  // Ambil semua judul h1, h2, dan h3 di dalam section yang sedang TIDAK tersembunyi
  const visibleHeadings = document.querySelectorAll(
    'section:not(.hidden) h1, section:not(.hidden) h2, section:not(.hidden) h3'
  );

  visibleHeadings.forEach(heading => {
    // Lewati judul kecil atau navigasi jika ada
    if (heading.classList.contains('no-gsap')) return;

    const words = splitWordsIntoSpans(heading);
    if (!words || words.length === 0) return;

    // Reset posisi dan opasitas kata ke status awal
    gsap.set(words, {
      opacity: 0,
      y: 22,
      rotateZ: 1.5
    });

    // Cek apakah elemen sudah langsung terlihat di layar saat ini (misal hero h1 di paling atas)
    const rect = heading.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (isAlreadyInView) {
      // Langsung animasikan jika sudah di viewport
      gsap.to(words, {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
        overwrite: 'auto'
      });
    } else {
      // Jalankan animasi saat discroll masuk layar (ScrollTrigger)
      ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(words, {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            duration: 0.55,
            stagger: 0.05,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    }
  });

  // Segarkan kalkulasi ScrollTrigger setelah render DOM
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
}

// Inisialisasi saat DOM sudah siap
document.addEventListener('DOMContentLoaded', () => {
  // Berikan sedikit jeda agar font dan CSS sudah teraplikasikan dengan sempurna
  setTimeout(() => {
    initHeadingAnimations();
  }, 150);
});

// Jadikan fungsi global agar bisa dipanggil saat ganti kategori
window.initHeadingAnimations = initHeadingAnimations;
