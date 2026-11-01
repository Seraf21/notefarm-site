// Page d'accueil de notefarm.app : le mouvement de la page et les petites
// démonstrations (cartes, booster, minuteur). Si l'appareil demande moins
// d'animations, tout s'affiche directement dans son état final.
(function () {
  'use strict';
  var calme = !document.documentElement.classList.contains('anime');
  var pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var minuteurs = [];
  function plusTard(fn, ms) { var t = setTimeout(fn, ms); minuteurs.push(t); return t; }
  function borne(x) { return Math.max(0, Math.min(1, x)); }
  function adoucir(t) { return 1 - Math.pow(1 - t, 3); }

  // ——— En-tête : fond flouté dès qu'on défile ———
  var entete = document.getElementById('entete');

  // ——— Titres découpés en mots ———
  function decouper(el, classe) {
    var i = 0;
    (function parcourir(noeud) {
      Array.prototype.slice.call(noeud.childNodes).forEach(function (enfant) {
        if (enfant.nodeType === 3) {
          var morceaux = enfant.textContent.split(/(\s+)/);
          var fragment = document.createDocumentFragment();
          morceaux.forEach(function (m) {
            if (!m) return;
            if (/^\s+$/.test(m)) { fragment.appendChild(document.createTextNode(m)); return; }
            var mot = document.createElement('span');
            mot.className = classe;
            mot.style.setProperty('--i', i++);
            if (classe === 'mot') { var dedans = document.createElement('span'); dedans.textContent = m; mot.appendChild(dedans); }
            else mot.textContent = m;
            fragment.appendChild(mot);
          });
          noeud.replaceChild(fragment, enfant);
        } else if (enfant.nodeType === 1) parcourir(enfant);
      });
    })(el);
  }
  var motsClairs = [];
  var eclaire = document.querySelector('.eclaire');
  if (!calme) {
    document.querySelectorAll('.titre-anime').forEach(function (t) { decouper(t, 'mot'); });
    decouper(eclaire, 'mot-clair');
    motsClairs = eclaire.querySelectorAll('.mot-clair');
  }

  // ——— Apparitions douces ———
  if (!calme && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.remove('attente');
        e.target.classList.add('vu');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.revele, .titre-anime').forEach(function (el) {
      if (el.classList.contains('revele')) el.classList.add('attente');
      obs.observe(el);
    });
  } else {
    document.querySelectorAll('.titre-anime').forEach(function (el) { el.classList.add('vu'); });
  }

  // ——— Ouverture : le mot se cache, la carte sort du cours ———
  var trouOuverture = document.getElementById('trou-ouverture');
  if (calme) trouOuverture.classList.add('cache');
  else {
    plusTard(function () { trouOuverture.classList.add('touche'); }, 2300);
    plusTard(function () { trouOuverture.classList.add('cache'); }, 2700);
    plusTard(function () { trouOuverture.classList.remove('touche'); }, 3400);
  }
  var scene = document.getElementById('scene');
  var inclinable = document.getElementById('inclinable');
  var ouverture = document.querySelector('.ouverture');
  if (!calme && pointeurFin) {
    ouverture.addEventListener('pointermove', function (e) {
      var r = scene.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      inclinable.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      inclinable.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      var o = ouverture.getBoundingClientRect();
      ouverture.style.setProperty('--gx', ((e.clientX - o.left) / o.width * 100).toFixed(1) + '%');
      ouverture.style.setProperty('--gy', ((e.clientY - o.top) / o.height * 100).toFixed(1) + '%');
    });
    ouverture.addEventListener('pointerleave', function () {
      inclinable.style.setProperty('--ry', '0deg');
      inclinable.style.setProperty('--rx', '0deg');
    });
  }

  // ——— Récit : le téléphone suit l'étape au centre de l'écran ———
  var collant = document.getElementById('collant');
  var etapes = document.querySelectorAll('.etape');
  var titres = { 1: 'Notes', 2: 'Notes', 3: 'Réviser', 4: 'Jour J' };
  var jeu = [];
  function arreterJeu() { jeu.forEach(clearTimeout); jeu = []; }
  function etape(fn, ms) { jeu.push(setTimeout(fn, ms)); }

  function jouerEcriture() {
    var frappe = collant.querySelector('.vue-1 .frappe');
    var texte = frappe.dataset.texte;
    frappe.textContent = '';
    for (var k = 1; k <= texte.length; k++) {
      (function (n) { etape(function () { frappe.textContent = texte.slice(0, n); }, 500 + n * 42); })(k);
    }
  }
  function jouerCacher() {
    var trous = collant.querySelectorAll('.vue-2 .trou');
    var bulle = collant.querySelector('.vue-2 .bulle-carte');
    trous.forEach(function (t) { t.classList.remove('cache', 'touche'); });
    bulle.classList.remove('montre');
    trous.forEach(function (t, n) {
      etape(function () { t.classList.add('touche'); }, 700 + n * 900);
      etape(function () { t.classList.add('cache'); }, 1000 + n * 900);
      etape(function () { t.classList.remove('touche'); }, 1600 + n * 900);
    });
    etape(function () { bulle.classList.add('montre'); }, 2400);
  }
  function jouerRevision() {
    var flash = collant.querySelector('.flash');
    var boutons = collant.querySelectorAll('.notes-boutons span');
    var barre = collant.querySelector('.vue-3 .progression i');
    flash.classList.remove('vue-reponse');
    boutons.forEach(function (b) { b.classList.remove('choisi'); });
    barre.style.width = '38%';
    etape(function () { flash.classList.add('vue-reponse'); }, 1300);
    etape(function () { boutons[2].classList.add('choisi'); }, 2600);
    etape(function () { barre.style.width = '41%'; }, 3100);
  }
  function compter(el, de, a, duree, format) {
    var debut = null;
    function pas(t) {
      if (debut === null) debut = t;
      var p = borne((t - debut) / duree);
      el.textContent = format(Math.round(de + (a - de) * adoucir(p)));
      if (p < 1 && collant.dataset.etape === '4') requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }
  function jouerJourJ() {
    var jours = collant.querySelector('.compte-jours');
    var chiffre = collant.querySelector('.vue-4 .chiffre');
    var barre = collant.querySelector('.vue-4 .progression i');
    barre.style.width = '0%';
    etape(function () { barre.style.width = '84%'; }, 400);
    etape(function () {
      compter(jours, 30, 12, 1500, function (v) { return 'J-' + v; });
      compter(chiffre, 0, 84, 1500, function (v) { return v + ' %'; });
    }, 350);
  }
  var jeux = { 1: jouerEcriture, 2: jouerCacher, 3: jouerRevision, 4: jouerJourJ };
  if (calme) {
    collant.querySelector('.vue-2 .bulle-carte').classList.add('montre');
    collant.querySelector('.flash').classList.add('vue-reponse');
    collant.querySelectorAll('.notes-boutons span')[2].classList.add('choisi');
  }

  function activer(n) {
    if (collant.dataset.etape === String(n)) return;
    collant.dataset.etape = n;
    collant.querySelector('.etat-ecran').textContent = titres[n];
    etapes.forEach(function (e) { e.classList.toggle('active', e.dataset.vue === String(n)); });
    arreterJeu();
    if (!calme) jeux[n]();
  }
  if ('IntersectionObserver' in window) {
    var obsEtapes = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (e.isIntersecting) activer(Number(e.target.dataset.vue)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    etapes.forEach(function (e) { obsEtapes.observe(e); });
  }
  // L'écriture se joue une première fois quand le récit arrive à l'écran.
  if (!calme && 'IntersectionObserver' in window) {
    var obsRecit = new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting && collant.dataset.etape === '1') { arreterJeu(); jouerEcriture(); obsRecit.disconnect(); }
    }, { threshold: .5 });
    obsRecit.observe(collant);
  }
  // Sur téléphone, chaque étape reçoit son propre écran, dans son état final.
  etapes.forEach(function (etapeEl) {
    var n = etapeEl.dataset.vue;
    var bloc = document.createElement('div');
    bloc.className = 'ecran-mobile';
    bloc.setAttribute('aria-hidden', 'true');
    var tel = document.createElement('div');
    tel.className = 'telephone';
    var ecran = document.createElement('div');
    ecran.className = 'ecran';
    ecran.innerHTML = '<div class="ecran-haut"><span>10:24</span><span>' + titres[n] + '</span></div>';
    var vue = collant.querySelector('.vue-' + n).cloneNode(true);
    vue.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
    var frappe = vue.querySelector('.frappe');
    if (frappe) frappe.textContent = frappe.dataset.texte;
    var flash = vue.querySelector('.flash');
    if (flash) { flash.classList.add('vue-reponse'); vue.querySelectorAll('.notes-boutons span')[2].classList.add('choisi'); }
    ecran.appendChild(vue);
    tel.appendChild(ecran);
    bloc.appendChild(tel);
    etapeEl.appendChild(bloc);
  });

  // ——— Ce qui suit le défilement : trait du récit, mots éclairés, courbe, écran d'ordinateur ———
  var etapesBloc = document.getElementById('etapes');
  var courbeSans = document.getElementById('courbe-sans');
  var courbeAvec = document.getElementById('courbe-avec');
  var courbe = document.getElementById('courbe');
  var rappels = courbe.querySelectorAll('[data-seuil]');
  var cadrePc = document.getElementById('cadre-pc');
  var embleme = document.querySelector('.embleme-geant');

  // 0 quand le haut de l'élément touche le bas de l'écran, 1 quand il atteint la ligne « fin » (en part de l'écran).
  function avance(el, debut, fin) {
    var r = el.getBoundingClientRect(), h = window.innerHeight;
    return borne((h * debut - r.top) / (h * (debut - fin)));
  }
  var demande = false;
  function auDefilement() {
    demande = false;
    var h = window.innerHeight;
    entete.classList.toggle('defile', window.scrollY > 12);
    if (calme) return;
    embleme.style.setProperty('--defile', borne(window.scrollY / h).toFixed(3));
    var r = etapesBloc.getBoundingClientRect();
    etapesBloc.style.setProperty('--avance', borne((h / 2 - r.top) / r.height).toFixed(3));
    var pMots = avance(eclaire, .9, .35);
    var total = motsClairs.length;
    for (var i = 0; i < total; i++) {
      var o = borne(pMots * (total + 2) - i);
      motsClairs[i].style.setProperty('--o', (0.16 + 0.84 * o).toFixed(3));
    }
    var pCourbe = avance(courbe, .95, .35);
    courbeSans.style.setProperty('--reste', (1 - adoucir(borne(pCourbe * 1.15))).toFixed(4));
    courbeAvec.style.setProperty('--reste', (1 - borne(pCourbe * 1.1 - .08)).toFixed(4));
    rappels.forEach(function (el) { el.classList.toggle('eteint', pCourbe * 1.1 - .08 < Number(el.dataset.seuil)); });
    cadrePc.style.setProperty('--reste-pc', (1 - adoucir(avance(cadrePc, 1, .45))).toFixed(4));
  }
  window.addEventListener('scroll', function () { if (!demande) { demande = true; requestAnimationFrame(auDefilement); } }, { passive: true });
  window.addEventListener('resize', auDefilement);
  auDefilement();

  // ——— Cartes qui s'inclinent sous la souris ———
  function incliner(el, force, cible) {
    cible = cible || el;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cible.classList.add('survol');
      cible.style.setProperty('--ry', ((x - .5) * force).toFixed(2) + 'deg');
      cible.style.setProperty('--rx', ((.5 - y) * force).toFixed(2) + 'deg');
      cible.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      cible.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () {
      cible.classList.remove('survol');
      cible.style.setProperty('--ry', '0deg');
      cible.style.setProperty('--rx', '0deg');
    });
  }
  if (!calme && pointeurFin) document.querySelectorAll('.incline').forEach(function (el) { incliner(el, 10); });

  // ——— Carte question et réponse ———
  var retourne = document.getElementById('retourne');
  retourne.addEventListener('click', function () { retourne.classList.toggle('tourne'); });

  // ——— Texte à trous ———
  var trou = document.getElementById('trou-chimie');
  var indice = document.getElementById('indice-trou');
  trou.addEventListener('click', function () {
    var cache = trou.classList.toggle('cache');
    trou.setAttribute('aria-label', cache ? 'Révéler le mot caché' : 'Cacher de nouveau');
    indice.textContent = cache ? 'Touche le passage caché' : 'Touche de nouveau pour le cacher';
  });

  // ——— QCM ———
  var qcm = document.getElementById('qcm');
  qcm.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      var dejaCorrige = qcm.dataset.corrige === 'oui';
      qcm.querySelectorAll('button').forEach(function (x) { x.classList.remove('juste', 'faux'); x.querySelector('em').textContent = ''; });
      if (dejaCorrige) { qcm.dataset.corrige = ''; return; }
      qcm.dataset.corrige = 'oui';
      qcm.querySelectorAll('button').forEach(function (x) {
        if (x.dataset.juste === 'true') { x.classList.add('juste'); x.querySelector('em').textContent = 'Bonne réponse'; }
      });
      if (b.dataset.juste !== 'true') { b.classList.add('faux'); b.querySelector('em').textContent = 'Ton choix'; }
    });
  });

  // ——— Touches du clavier : elles s'enfoncent l'une après l'autre ———
  var touches = document.querySelectorAll('#touches kbd');
  if (!calme && 'IntersectionObserver' in window) {
    var obsTouches = new IntersectionObserver(function (entrees) {
      if (!entrees[0].isIntersecting) return;
      obsTouches.disconnect();
      [0, 3].forEach(function (n, k) {
        plusTard(function () { touches[n].classList.add('appuye'); }, 600 + k * 700);
        plusTard(function () { touches[n].classList.remove('appuye'); }, 820 + k * 700);
      });
    }, { threshold: 1 });
    obsTouches.observe(document.getElementById('touches'));
  }

  // ——— Minuteur focus : un vrai décompte tant qu'il est à l'écran ———
  var anneau = document.getElementById('anneau');
  var arc = document.getElementById('arc');
  var temps = document.getElementById('temps');
  var reste = 25 * 60, tic = null;
  function afficher() {
    var m = Math.floor(reste / 60), s = reste % 60;
    temps.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    arc.style.strokeDashoffset = String(1500 * (1 - reste / 1500));
  }
  if (!calme && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting && !tic) {
        tic = setInterval(function () { reste = reste > 0 ? reste - 1 : 25 * 60; afficher(); }, 1000);
      } else if (!entrees[0].isIntersecting && tic) { clearInterval(tic); tic = null; }
    }, { threshold: .3 }).observe(anneau);
  }

  // ——— Booster ———
  var table = document.getElementById('table-booster');
  var bouton = document.getElementById('ouvrir-booster');
  var eclats = document.getElementById('eclats');
  var annonce = document.getElementById('annonce-booster');
  var rare = document.getElementById('carte-rare');
  var solde = 120, pret = null;
  bouton.addEventListener('click', function () {
    clearTimeout(pret);
    if (table.classList.contains('ouvert')) {
      table.classList.remove('ouvert', 'pret');
      bouton.textContent = 'Ouvrir un booster';
      annonce.textContent = '';
      return;
    }
    if (solde < 40) solde = 120;
    solde -= 40;
    eclats.textContent = solde;
    table.classList.add('ouvert');
    bouton.textContent = 'Ranger les cartes';
    annonce.textContent = 'Booster ouvert : La fiche parfaite, commune ; Le réveil de 6 h, peu commune ; La carte qui germe, rare.';
    pret = setTimeout(function () { table.classList.add('pret'); }, calme ? 0 : 3600);
  });
  if (!calme && pointeurFin) incliner(rare, 22, rare);

  // ——— Bêta ———
  // Les formulaires Brevo (adresses publiques, sans clé secrète). « places »
  // ajoute à la liste 3, « attente » à la liste 4 ; chacun envoie sa double
  // confirmation puis son propre e-mail.
  var FORMULAIRES = {
    places: 'https://97ebac37.sibforms.com/serve/MUIFAH7EmgHc8stbWE_FJMBGx8XzPglrbBpQVHyb5IvfVHJMhqhFcntpQSq_eeSWgtV8b5pzMXxxAZL7L0xeQSn9ZqdpEDEIL2DPRMGlbVJhK_l3WGCHwP-vcVVwUcpsJvtMaMU2uTbPc5v9XRZc-qqvnVtouTqS9asGAyBkkGTWCp-9tqTa5OY_ezfJFoirQ8OLNznIiEkS6jK9VA==',
    attente: 'https://97ebac37.sibforms.com/serve/MUIFADRYXeiBSeH1BAGDlEs2WEIepQS6kgUD53Y1Roq6uNkyvAiSNNy619IjtrEC79yogW9kF6wpCrQMux3S2XjBJV9jbG47e7ULueVNs3A3lWz-Aj4ieL4P6KU-Btxwe8RZXFZOpEwlo5_Vl8EroCEXGkTvsd90bPtj6V9wi2hoyADHdyVzZtsPy06_UcxShkp7XgjdYc7KgAIP9Q=='
  };
  // Passer un système à true quand ses ~30 places sont prises (compte dans Brevo) :
  // ses inscrits suivants vont alors sur la liste d'attente, et le formulaire le dit.
  var COMPLET = { android: false, iphone: false };

  var formulaire = document.getElementById('formulaire');
  var message = document.getElementById('message');
  var choixSysteme = formulaire.querySelector('.choix-systeme');
  var noteSysteme = document.getElementById('note-systeme');
  formulaire.querySelectorAll('input[name="systeme"]').forEach(function (r, n) {
    r.addEventListener('change', function () {
      choixSysteme.style.setProperty('--pos', n);
      choixSysteme.style.setProperty('--choisi', 1);
      noteSysteme.textContent = COMPLET[r.value]
        ? 'Les places sont prises sur ' + (r.value === 'android' ? 'Android' : 'iPhone') + ' : tu seras sur la liste d’attente, dans l’ordre d’arrivée.'
        : '';
    });
  });
  function erreur(texte, champ) {
    message.className = 'message';
    message.textContent = texte;
    formulaire.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    if (champ) { champ.setAttribute('aria-invalid', 'true'); champ.focus(); }
  }
  formulaire.addEventListener('submit', function (e) {
    e.preventDefault();
    var prenom = document.getElementById('prenom');
    var courriel = document.getElementById('courriel');
    var systeme = formulaire.querySelector('input[name="systeme"]:checked');
    if (!prenom.value.trim()) return erreur('Indique ton prénom, pour que l’invitation te soit adressée.', prenom);
    if (!systeme) return erreur('Choisis ton téléphone : Android ou iPhone.', document.getElementById('systeme-android'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(courriel.value.trim())) return erreur('Cette adresse ne semble pas complète. Vérifie le @ et la fin, par exemple .fr ou .com.', courriel);
    if (!document.getElementById('accord').checked) return erreur('Coche la case pour accepter de recevoir les e-mails de la bêta.', document.getElementById('accord'));
    formulaire.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var enAttente = COMPLET[systeme.value];
    var adresse = enAttente ? FORMULAIRES.attente : FORMULAIRES.places;
    if (!adresse) {
      message.className = 'message info';
      message.textContent = 'Les places sont prises sur ce téléphone et la liste d’attente n’est pas encore ouverte : rien n’a été envoyé. Écris à contact@notefarm.app pour être prévenu.';
      return;
    }
    var donnees = new FormData();
    donnees.append('EMAIL', courriel.value.trim());
    donnees.append('PRENOM', prenom.value.trim());
    donnees.append('SYSTEME', systeme.value);
    donnees.append('email_address_check', ''); // piège à robots attendu par Brevo
    donnees.append('locale', 'fr');
    var envoi = formulaire.querySelector('button[type="submit"]');
    envoi.disabled = true;
    envoi.textContent = 'Envoi…';
    message.className = 'message';
    message.textContent = '';
    // Brevo ne renvoie pas de réponse lisible depuis un autre site : seule une
    // panne du réseau est détectée ici.
    fetch(adresse, { method: 'POST', body: donnees, mode: 'no-cors' }).then(function () {
      var zone = document.getElementById('zone-formulaire');
      zone.innerHTML = '<div class="merci" role="status" tabindex="-1">' +
        '<svg aria-hidden="true"><use href="#embleme"/></svg>' +
        '<h3>Presque fini, <span class="p"></span>.</h3>' +
        '<p>Je viens de t’envoyer un e-mail à <b></b>. Ouvre-le et touche « Je confirme mon adresse » pour ' +
        (enAttente ? 'rejoindre la liste d’attente.' : 'réserver ta place.') + '</p>' +
        '<p class="attenue">Rien reçu d’ici quelques minutes ? Regarde dans les indésirables.</p></div>';
      zone.querySelector('.p').textContent = prenom.value.trim();
      zone.querySelector('b').textContent = courriel.value.trim();
      zone.querySelector('.merci').focus();
    }).catch(function () {
      envoi.disabled = false;
      envoi.textContent = 'Je participe';
      erreur('L’envoi n’a pas abouti. Vérifie ta connexion et réessaie.');
    });
  });
})();
