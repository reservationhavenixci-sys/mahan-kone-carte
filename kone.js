/* ===================================================================
   MAHAN KONÉ — CARTE DE VISITE NUMÉRIQUE
   JavaScript vanilla — sans dépendance
   =================================================================== */

(() => {
  'use strict';

  /* ---------- Données de contact (source unique de vérité) ---------- */
  // NOTE : pas d'adresse e-mail pour l'instant — le Gmail sera intégré
  // plus tard. Tant qu'elle n'est pas définie ici, aucune ligne EMAIL
  // n'est ajoutée au contact enregistré (vCard) et rien n'est cliquable.
  const CONTACT = {
    firstName: 'Mahan',
    lastName: 'Koné',
    fullName: 'Mahan Koné',
    org: 'CTBAT.CI',
    title: 'Géomètre Topographe — Directeur Général',
    phone: '+2250504986127',
    email: '', // à renseigner plus tard
    address: 'Bouaké, zone industrielle extension, Côte d\'Ivoire'
  };

  /* ================= TOAST DE NOTIFICATION ================= */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* ================= COPIER LES COORDONNÉES ================= */
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const textEl = btn.previousElementSibling;
      const value = textEl?.dataset?.copy || textEl?.textContent?.trim();
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        showToast('Copié dans le presse-papiers');
      } catch (err) {
        // Repli si l'API Clipboard est indisponible
        const tempInput = document.createElement('textarea');
        tempInput.value = value;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Copié dans le presse-papiers');
      }
    });
  });

  /* ================= ENREGISTRER LE CONTACT (VCF) ================= */
  function buildVCard() {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
      `FN:${CONTACT.fullName}`,
      `ORG:${CONTACT.org}`,
      `TITLE:${CONTACT.title}`,
      `TEL;TYPE=CELL:${CONTACT.phone}`
    ];

    // L'e-mail n'est ajouté que s'il a été renseigné
    if (CONTACT.email) {
      lines.push(`EMAIL;TYPE=INTERNET:${CONTACT.email}`);
    }

    lines.push(`ADR;TYPE=WORK:;;${CONTACT.address};;;;`);
    lines.push('END:VCARD');

    return lines.join('\r\n');
  }

  function downloadVCard() {
    const vcardContent = buildVCard();
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${CONTACT.fullName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Contact enregistré');
  }

  document.querySelectorAll('[data-action="save-contact"]').forEach((btn) => {
    btn.addEventListener('click', downloadVCard);
  });

  /* ================= PARTAGER LA CARTE ================= */
  const shareBtn = document.getElementById('btnShare');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: `${CONTACT.fullName} — ${CONTACT.org}`,
        text: `Contactez ${CONTACT.fullName}, ${CONTACT.title}.`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // Partage annulé par l'utilisateur : rien à faire
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Lien copié — prêt à partager');
        } catch (err) {
          showToast('Impossible de partager sur cet appareil');
        }
      }
    });
  }

  /* ================= QR CODE DYNAMIQUE ================= */
  const qrImage = document.getElementById('qrImage');
  if (qrImage) {
    const pageUrl = encodeURIComponent(window.location.href);
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&color=0B0A0A&data=${pageUrl}`;
  }

  /* ================= ANIMATION AU DÉFILEMENT (avec léger décalage) ================= */
  const revealTargets = document.querySelectorAll('.section');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Array.from(revealTargets).indexOf(entry.target) % 3 * 60;
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    // Repli pour navigateurs anciens : tout afficher directement
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ================= INITIALES DE REPLI — DÉSACTIVÉES ================= */
  // Sur demande, aucune initiale n'est affichée si la photo ne charge pas :
  // le médaillon reste un cercle de couleur uni.

  /* ================= EFFET "WOUAOU" — MÉDAILLON MULTICOLORE ================= */
  // Le médaillon de profil oscille en douceur à travers des tons de bleu
  // foncé, en écho à l'identité noir encre + bleu nuit.
  const heroAvatar = document.getElementById('heroAvatar');
  if (heroAvatar) {
    const avatarPalette = [
      '#16324F', // bleu moyen foncé
      '#1E3F63',
      '#2C577F', // bleu de l'en-tête
      '#3E71A0', // bleu accent
      '#5D8FBD', // bleu plus clair
      '#3E71A0',
      '#16324F'
    ];
    let colorIndex = 0;
    setInterval(() => {
      colorIndex = (colorIndex + 1) % avatarPalette.length;
      heroAvatar.style.setProperty('--avatar-color', avatarPalette[colorIndex]);
    }, 1000);
  }

  /* ================= MICRO-INTERACTION AU CLIC ================= */
  document.querySelectorAll('.action-btn, .dock__btn').forEach((el) => {
    el.addEventListener('click', () => {
      el.style.transform = 'scale(0.94)';
      setTimeout(() => { el.style.transform = ''; }, 140);
    });
  });

})();