/*
 * js/language.js
 *
 * Refined internationalization for SnapBoost
 * - Translates every visible text in the provided HTML into the correct language
 * - Preserves emojis in the DOM by wrapping them in <span class="emoji">…</span>
 * - Translation strings DO NOT contain emojis (emojis remain purely presentational in HTML)
 * - Urdu, Hindi and Indonesian removed per request
 *
 * Usage: save as js/language.js and include:
 *   <script defer src="js/language.js"></script>
 *
 * Notes:
 *  - All translation keys below map to every visible text in the original HTML.
 *  - If you later want emoji placeholders inside translated strings (like "Hello {emoji} world"),
 *    I can add placeholder injection. Current strategy: keep emojis where they are in the DOM
 *    and translate only textual content.
 */

(function () {
  if (typeof window === 'undefined') return;

  // ---------- Helpers ----------
  function primaryLang() {
    const nav = navigator.languages && navigator.languages.length ? navigator.languages[0] : (navigator.language || navigator.userLanguage || 'en');
    return String(nav).toLowerCase().split('-')[0];
  }

  // Unicode Extended_Pictographic to detect emoji/pictographs
  const EMOJI_RE = /\p{Extended_Pictographic}/u;

  // Remove emoji characters from strings — translations must not inject emoji
  function stripEmojis(s) {
    if (s == null) return s;
    return String(s).replace(/[\p{Extended_Pictographic}]/gu, '').trim();
  }

  // Minimal HTML escape
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Wrap emoji characters in text nodes into <span class="emoji">..</span>
  function wrapEmojiSpans(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const txt = node.nodeValue;
      if (!txt || !EMOJI_RE.test(txt)) return;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      const matches = [...txt.matchAll(/(\p{Extended_Pictographic})/gu)];
      if (matches.length === 0) return;

      matches.forEach(m => {
        const idx = m.index;
        const emojiChar = m[1];
        if (idx > lastIndex) frag.appendChild(document.createTextNode(txt.slice(lastIndex, idx)));
        const span = document.createElement('span');
        span.className = 'emoji';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = emojiChar;
        frag.appendChild(span);
        lastIndex = idx + emojiChar.length;
      });

      if (lastIndex < txt.length) frag.appendChild(document.createTextNode(txt.slice(lastIndex)));
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    });
  }

  // Replace textual content inside element while preserving .emoji spans and other child elements
  function setTranslatedTextPreserveEmojis(el, translatedText) {
    if (!el) return;
    const text = stripEmojis(translatedText || '');

    // Collect removable text nodes (not inside .emoji spans)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const toRemove = [];
    while (walker.nextNode()) {
      const tn = walker.currentNode;
      const parent = tn.parentElement;
      if (parent && parent.classList && parent.classList.contains('emoji')) continue; // keep emoji text nodes
      toRemove.push(tn);
    }
    toRemove.forEach(n => n.parentNode && n.parentNode.removeChild(n));

    const firstEmoji = el.querySelector('.emoji');
    const txtNode = document.createTextNode(text);
    if (firstEmoji && firstEmoji.parentNode) firstEmoji.parentNode.insertBefore(txtNode, firstEmoji);
    else if (el.firstChild) el.insertBefore(txtNode, el.firstChild);
    else el.appendChild(txtNode);
  }

  function safeSet(el, text) { if (el) setTranslatedTextPreserveEmojis(el, text); }

  // ---------- Translation dictionary (complete coverage of HTML) ----------
  // Every key below corresponds to a piece of visible text in the original HTML.
  // Do not include emojis inside these strings.
  const TRANSLATIONS = {
    // English (explicit — used when lang is 'en')
    'en': {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.achievements': 'Achievements',
      'nav.extras': 'Extras',
      'hero.title': 'Boost Your SnapScore & Followers Instantly',
      'hero.subtitle': 'Professional Snapchat growth services with guaranteed results and premium quality',
      'btn.explore': 'Explore Services',
      'btn.learn': 'Learn More',
      'about.title': 'Why Choose SnapBoost?',
      'about.p1': "Our expert team specializes in Snapchat growth strategies, AR lens development, and premium account services. With over 5 years of experience in social media marketing, we've helped thousands of clients achieve their Snapchat goals.",
      'about.p2': 'From organic follower growth to custom AR filters, we provide comprehensive solutions that deliver real, measurable results for your Snapchat presence.',
      'stat.clients': 'Happy Clients',
      'stat.success': 'Success Rate',
      'services.title': 'Our Premium Services',
      'service1.title': 'Followers & SnapScore Boost',
      'service1.desc': 'Organic growth packages with real, active followers. Boost your SnapScore naturally with our proven strategies and engagement techniques.',
      'service1.features': ['Real Followers', 'Real SnapScores', 'Safe & Secure'],
      'service2.title': 'AR Lens Creation',
      'service2.desc': 'Custom AR filters and lenses designed to engage your audience. From simple overlays to complex interactive experiences.',
      'service2.features': ['Custom Design', 'High Quality', 'Quick Delivery'],
      'service3.title': 'Premium Account Sales',
      'service3.desc': 'Verified premium Snapchat accounts with established followers and engagement. Perfect for businesses and influencers.',
      'service3.features': ['Verified Accounts', 'Instant Transfer', '24/7 Support', 'Money Back Guarantee'],
      'achievements.title': 'Our Achievements',
      'achievement.ar': 'AR Lenses Built',
      'achievement.accounts': 'Accounts Delivered',
      'achievement.refill': 'Refill Guarantee %',
      'features.title': 'What We Offer',
      'feature1.title': 'All-Range Follower & SnapScores',
      'feature1.list': [
        'SnapScores boosting up to 10M',
        'All range of premade SnapScores accounts available',
        'All range of premade Creator accounts available',
        'Trending Snapchat accounts available',
        'Custom packages available',
        'Gradual delivery for safety'
      ],
      'feature2.title': 'Custom AR & Lenses',
      'feature2.list': [
        'Face filters and effects',
        'World lenses and objects',
        'Interactive AR experiences',
        'Brand-specific filters',
        'Event and campaign lenses',
        'Lens Studio expertise'
      ],
      'extras.title': 'Learning Resources',
      'extras.learnLens': 'Learn Lens Studio',
      'extras.snapTips': 'Snapchat Tips',
      'extras.growth': 'Growth Strategies',
      'extras.arCourse': 'AR Tutorials',
      'footer.copyright': '© {year} SnapBoost. All rights reserved.'
    },

    // Spanish
    'es': {
      'nav.home': 'Inicio',
      'nav.about': 'Acerca',
      'nav.services': 'Servicios',
      'nav.achievements': 'Logros',
      'nav.extras': 'Extras',
      'hero.title': 'Aumenta tu SnapScore y tus seguidores al instante',
      'hero.subtitle': 'Servicios profesionales de crecimiento en Snapchat con resultados garantizados y calidad premium',
      'btn.explore': 'Explorar servicios',
      'btn.learn': 'Saber más',
      'about.title': '¿Por qué elegir SnapBoost?',
      'about.p1': 'Nuestro equipo experto se especializa en estrategias de crecimiento en Snapchat, desarrollo de lentes AR y servicios de cuentas premium. Con más de 5 años de experiencia en marketing en redes sociales, hemos ayudado a miles de clientes a alcanzar sus metas en Snapchat.',
      'about.p2': 'Desde crecimiento orgánico de seguidores hasta filtros AR personalizados, ofrecemos soluciones integrales que generan resultados reales y medibles para tu presencia en Snapchat.',
      'stat.clients': 'Clientes satisfechos',
      'stat.success': 'Tasa de éxito',
      'services.title': 'Nuestros servicios premium',
      'service1.title': 'Aumento de seguidores y SnapScore',
      'service1.desc': 'Paquetes de crecimiento orgánico con seguidores reales y activos. Aumenta tu SnapScore de forma natural con nuestras estrategias probadas y técnicas de engagement.',
      'service1.features': ['Seguidores reales', 'SnapScores reales', 'Seguro y protegido'],
      'service2.title': 'Creación de lentes AR',
      'service2.desc': 'Filtros y lentes AR personalizados para involucrar a tu audiencia, desde superposiciones simples hasta experiencias interactivas complejas.',
      'service2.features': ['Diseño personalizado', 'Alta calidad', 'Entrega rápida'],
      'service3.title': 'Venta de cuentas premium',
      'service3.desc': 'Cuentas premium verificadas con seguidores establecidos y engagement. Ideal para empresas e influencers.',
      'service3.features': ['Cuentas verificadas', 'Transferencia inmediata', 'Soporte 24/7', 'Garantía de devolución de dinero'],
      'achievements.title': 'Nuestros logros',
      'achievement.ar': 'Lentes AR creados',
      'achievement.accounts': 'Cuentas entregadas',
      'achievement.refill': 'Garantía de recarga %',
      'features.title': 'Lo que ofrecemos',
      'feature1.title': 'Seguidores y SnapScores (todas las gamas)',
      'feature1.list': [
        'Incrementos de SnapScore hasta 10M',
        'Cuentas premade de SnapScore en todas las gamas',
        'Cuentas Creator premade disponibles',
        'Cuentas populares disponibles',
        'Paquetes personalizados',
        'Entrega gradual por seguridad'
      ],
      'feature2.title': 'AR y lentes personalizadas',
      'feature2.list': [
        'Filtros faciales y efectos',
        'Lentes y objetos del mundo',
        'Experiencias AR interactivas',
        'Filtros para marca',
        'Lentes para eventos y campañas',
        'Experiencia con Lens Studio'
      ],
      'extras.title': 'Recursos de aprendizaje',
      'extras.learnLens': 'Aprende Lens Studio',
      'extras.snapTips': 'Consejos para Snapchat',
      'extras.growth': 'Estrategias de crecimiento',
      'extras.arCourse': 'Tutoriales de AR',
      'footer.copyright': '© {year} SnapBoost. Todos los derechos reservados.'
    },

    // French
    'fr': {
      'nav.home': 'Accueil',
      'nav.about': 'À propos',
      'nav.services': 'Services',
      'nav.achievements': 'Réalisations',
      'nav.extras': 'Extras',
      'hero.title': 'Boostez votre SnapScore et vos abonnés instantanément',
      'hero.subtitle': 'Services professionnels de croissance Snapchat avec résultats garantis et qualité premium',
      'btn.explore': 'Explorer les services',
      'btn.learn': 'En savoir plus',
      'about.title': 'Pourquoi choisir SnapBoost ?',
      'about.p1': "Notre équipe d'experts est spécialisée dans les stratégies de croissance sur Snapchat, le développement de lentilles AR et les services de comptes premium. Avec plus de 5 ans d'expérience en marketing des réseaux sociaux, nous avons aidé des milliers de clients à atteindre leurs objectifs Snapchat.",
      'about.p2': "De la croissance organique des abonnés aux filtres AR personnalisés, nous fournissons des solutions complètes qui produisent des résultats réels et mesurables pour votre présence sur Snapchat.",
      'stat.clients': 'Clients satisfaits',
      'stat.success': 'Taux de réussite',
      'services.title': 'Nos services premium',
      'service1.title': 'Boost followers & SnapScore',
      'service1.desc': 'Forfaits de croissance organique avec de vrais abonnés et engagement actif. Augmentez votre SnapScore naturellement grâce à nos stratégies éprouvées.',
      'service1.features': ['Abonnés réels', 'SnapScores réels', 'Sûr et sécurisé'],
      'service2.title': 'Création de Lenses AR',
      'service2.desc': 'Filtres et lenses AR personnalisés pour engager votre audience, des superpositions simples aux expériences interactives avancées.',
      'service2.features': ['Design personnalisé', 'Haute qualité', 'Livraison rapide'],
      'service3.title': 'Vente de comptes premium',
      'service3.desc': 'Comptes premium vérifiés avec abonnés établis et engagement. Parfait pour les entreprises et influenceurs.',
      'service3.features': ['Comptes vérifiés', 'Transfert instantané', 'Support 24/7', 'Garantie de remboursement'],
      'achievements.title': 'Nos réalisations',
      'achievement.ar': 'Lenses AR créés',
      'achievement.accounts': 'Comptes livrés',
      'achievement.refill': 'Garantie de recharge %',
      'features.title': 'Ce que nous offrons',
      'feature1.title': 'Abonnés & SnapScores (toutes gammes)',
      'feature1.list': [
        'Boosts SnapScore jusqu’à 10M',
        'Comptes SnapScore premade toutes gammes',
        'Comptes Creator premade disponibles',
        'Comptes tendance disponibles',
        'Forfaits personnalisés',
        'Livraison progressive pour la sécurité'
      ],
      'feature2.title': 'AR & Lenses personnalisés',
      'feature2.list': [
        'Filtres visage et effets',
        'World lenses et objets',
        'Expériences AR interactives',
        'Filtres pour marque',
        'Lenses pour événements et campagnes',
        'Expertise Lens Studio'
      ],
      'extras.title': 'Ressources d’apprentissage',
      'extras.learnLens': 'Apprendre Lens Studio',
      'extras.snapTips': 'Conseils Snapchat',
      'extras.growth': 'Stratégies de croissance',
      'extras.arCourse': 'Tutoriels AR',
      'footer.copyright': '© {year} SnapBoost. Tous droits réservés.'
    },

    // German
    'de': {
      'nav.home': 'Start',
      'nav.about': 'Über',
      'nav.services': 'Leistungen',
      'nav.achievements': 'Erfolge',
      'nav.extras': 'Extras',
      'hero.title': 'Steigere deinen SnapScore und deine Follower sofort',
      'hero.subtitle': 'Professionelle Snapchat-Wachstumsservices mit garantierten Ergebnissen und Premium-Qualität',
      'btn.explore': 'Services entdecken',
      'btn.learn': 'Mehr erfahren',
      'about.title': 'Warum SnapBoost?',
      'about.p1': 'Unser Expertenteam spezialisiert sich auf Snapchat-Wachstumsstrategien, AR-Lens-Entwicklung und Premium-Account-Services. Mit über 5 Jahren Erfahrung im Social-Media-Marketing haben wir Tausenden von Kunden geholfen, ihre Snapchat-Ziele zu erreichen.',
      'about.p2': 'Von organischem Follower-Wachstum bis hin zu maßgeschneiderten AR-Filtern bieten wir umfassende Lösungen, die echte, messbare Ergebnisse liefern.',
      'stat.clients': 'Zufriedene Kunden',
      'stat.success': 'Erfolgsquote',
      'services.title': 'Unsere Premium-Services',
      'service1.title': 'Follower & SnapScore Boost',
      'service1.desc': 'Organische Wachstumspakete mit echten, aktiven Followern. Steigere deinen SnapScore natürlich mit unseren erprobten Strategien und Engagement-Techniken.',
      'service1.features': ['Echte Follower', 'Echte SnapScores', 'Sicher & geschützt'],
      'service2.title': 'AR-Lens Erstellung',
      'service2.desc': 'Individuelle AR-Filter und Lenses, die dein Publikum ansprechen – von einfachen Overlays bis zu komplexen interaktiven Erfahrungen.',
      'service2.features': ['Maßgeschneidertes Design', 'Hohe Qualität', 'Schnelle Lieferung'],
      'service3.title': 'Verkauf von Premium-Accounts',
      'service3.desc': 'Verifizierte Premium-Snapchat-Accounts mit etablierten Followern und Engagement. Perfekt für Unternehmen und Influencer.',
      'service3.features': ['Verifizierte Accounts', 'Sofortige Übertragung', '24/7 Support', 'Geld-zurück-Garantie'],
      'achievements.title': 'Unsere Erfolge',
      'achievement.ar': 'Erstellte AR-Lenses',
      'achievement.accounts': 'Gelieferte Accounts',
      'achievement.refill': 'Auflade-Garantie %',
      'features.title': 'Was wir anbieten',
      'feature1.title': 'Follower & SnapScores (alle Bereiche)',
      'feature1.list': [
        'SnapScore-Boosts bis zu 10M',
        'Premade SnapScore-Accounts für alle Bereiche',
        'Premade Creator-Accounts verfügbar',
        'Trendende Accounts verfügbar',
        'Individuelle Pakete verfügbar',
        'Schrittweise Lieferung für Sicherheit'
      ],
      'feature2.title': 'Benutzerdefinierte AR & Lenses',
      'feature2.list': [
        'Gesichtsfilter und Effekte',
        'World Lenses und Objekte',
        'Interaktive AR-Erlebnisse',
        'Markenspezifische Filter',
        'Lenses für Events und Kampagnen',
        'Lens Studio Expertise'
      ],
      'extras.title': 'Lernressourcen',
      'extras.learnLens': 'Lens Studio lernen',
      'extras.snapTips': 'Snapchat Tipps',
      'extras.growth': 'Wachstumsstrategien',
      'extras.arCourse': 'AR Tutorials',
      'footer.copyright': '© {year} SnapBoost. Alle Rechte vorbehalten.'
    },

    // Portuguese
    'pt': {
      'nav.home': 'Início',
      'nav.about': 'Sobre',
      'nav.services': 'Serviços',
      'nav.achievements': 'Conquistas',
      'nav.extras': 'Extras',
      'hero.title': 'Aumente seu SnapScore e seus seguidores agora',
      'hero.subtitle': 'Serviços profissionais de crescimento no Snapchat com resultados garantidos e qualidade premium',
      'btn.explore': 'Explorar serviços',
      'btn.learn': 'Saiba mais',
      'about.title': 'Por que escolher o SnapBoost?',
      'about.p1': 'Nossa equipe especialista é focada em estratégias de crescimento no Snapchat, desenvolvimento de lentes AR e serviços de contas premium. Com mais de 5 anos em marketing digital, ajudamos milhares de clientes a alcançar seus objetivos no Snapchat.',
      'about.p2': 'Do crescimento orgânico de seguidores a filtros AR customizados, oferecemos soluções completas que trazem resultados reais e mensuráveis para sua presença no Snapchat.',
      'stat.clients': 'Clientes satisfeitos',
      'stat.success': 'Taxa de sucesso',
      'services.title': 'Nossos serviços premium',
      'service1.title': 'Impulsionamento de seguidores e SnapScore',
      'service1.desc': 'Pacotes de crescimento orgânico com seguidores reais e ativos. Aumente seu SnapScore naturalmente com nossas estratégias comprovadas.',
      'service1.features': ['Seguidores reais', 'SnapScores reais', 'Seguro e protegido'],
      'service2.title': 'Criação de lentes AR',
      'service2.desc': 'Filtros e lentes AR personalizados para envolver seu público, desde overlays simples até experiências interativas complexas.',
      'service2.features': ['Design personalizado', 'Alta qualidade', 'Entrega rápida'],
      'service3.title': 'Venda de contas premium',
      'service3.desc': 'Contas premium verificadas com seguidores estabelecidos e engajamento. Perfeito para empresas e influenciadores.',
      'service3.features': ['Contas verificadas', 'Transferência imediata', 'Suporte 24/7', 'Garantia de reembolso'],
      'achievements.title': 'Nossas conquistas',
      'achievement.ar': 'Lentes AR criadas',
      'achievement.accounts': 'Contas entregues',
      'achievement.refill': 'Garantia de recarga %',
      'features.title': 'O que oferecemos',
      'feature1.title': 'Seguidores & SnapScores (todas faixas)',
      'feature1.list': [
        'Boosts de SnapScore até 10M',
        'Contas premade de SnapScore para todas as faixas',
        'Contas Creator premade disponíveis',
        'Contas em tendência disponíveis',
        'Pacotes personalizados disponíveis',
        'Entrega gradual por segurança'
      ],
      'feature2.title': 'AR & Lentes personalizadas',
      'feature2.list': [
        'Filtros faciais e efeitos',
        'World lenses e objetos',
        'Experiências AR interativas',
        'Filtros específicos para marcas',
        'Lentes para eventos e campanhas',
        'Especialistas em Lens Studio'
      ],
      'extras.title': 'Recursos de aprendizagem',
      'extras.learnLens': 'Aprenda Lens Studio',
      'extras.snapTips': 'Dicas para Snapchat',
      'extras.growth': 'Estratégias de crescimento',
      'extras.arCourse': 'Tutoriais de AR',
      'footer.copyright': '© {year} SnapBoost. Todos os direitos reservados.'
    },

    // Arabic (RTL)
    'ar': {
      'nav.home': 'الرئيسية',
      'nav.about': 'من نحن',
      'nav.services': 'الخدمات',
      'nav.achievements': 'الإنجازات',
      'nav.extras': 'الموارد',
      'hero.title': 'زد نقاط SnapScore والمتابعين فوراً',
      'hero.subtitle': 'خدمات نمو احترافية على سناب شات مع نتائج مضمونة وجودة مميزة',
      'btn.explore': 'استعرض الخدمات',
      'btn.learn': 'المزيد',
      'about.title': 'لماذا تختار SnapBoost؟',
      'about.p1': 'فريقنا الخبير متخصص في استراتيجيات نمو سناب شات، تطوير عدسات AR، وخدمات الحسابات المميزة. لدينا أكثر من 5 سنوات خبرة في التسويق عبر وسائل التواصل ومساعدة آلاف العملاء.',
      'about.p2': 'من نمو المتابعين العضوي إلى فلاتر AR المخصصة، نقدم حلولاً متكاملة تعطي نتائج حقيقية وقابلة للقياس على سناب شات.',
      'stat.clients': 'عملاء راضون',
      'stat.success': 'نسبة النجاح',
      'services.title': 'خدماتنا المميزة',
      'service1.title': 'زيادة المتابعين و SnapScore',
      'service1.desc': 'باقات نمو عضوي مع متابعين حقيقيين ونشطين. زد نقاط SnapScore بطريقة طبيعية باستخدام استراتيجياتنا المجربة.',
      'service1.features': ['متابعون حقيقيون', 'SnapScores حقيقية', 'آمن ومحمية'],
      'service2.title': 'إنشاء عدسات AR',
      'service2.desc': 'فلاتر وعدسات AR مخصصة لتفاعل جمهورك، من تراكبات بسيطة إلى تجارب تفاعلية متقدمة.',
      'service2.features': ['تصميم مخصص', 'جودة عالية', 'تسليم سريع'],
      'service3.title': 'بيع حسابات مميزة',
      'service3.desc': 'حسابات سناب شات مميزة ومُتحققة مع متابعين ومشاركة نشطة. مثالية للشركات والمؤثرين.',
      'service3.features': ['حسابات مُتحققة', 'نقل فوري', 'دعم 24/7', 'ضمان استرداد الأموال'],
      'achievements.title': 'إنجازاتنا',
      'achievement.ar': 'عدسات AR مُنشأة',
      'achievement.accounts': 'حسابات مُسلَّمة',
      'achievement.refill': 'نسبة ضمان التعبئة',
      'features.title': 'ماذا نقدم',
      'feature1.title': 'متابعون و SnapScores (جميع النطاقات)',
      'feature1.list': [
        'زيادات SnapScore حتى 10M',
        'حسابات SnapScore جاهزة لجميع النطاقات',
        'حسابات Creator جاهزة متاحة',
        'حسابات شائعة متاحة',
        'باقات مخصصة متاحة',
        'تسليم تدريجي للحماية'
      ],
      'feature2.title': 'عدسات و AR مخصصة',
      'feature2.list': [
        'فلاتر للوجه والتأثيرات',
        'عدسات عالمية وكائنات',
        'تجارب AR تفاعلية',
        'فلاتر مخصصة للعلامات التجارية',
        'عدسات للفعاليات والحملات',
        'خبرة في Lens Studio'
      ],
      'extras.title': 'موارد التعلم',
      'extras.learnLens': 'تعلم Lens Studio',
      'extras.snapTips': 'نصائح سناب شات',
      'extras.growth': 'استراتيجيات النمو',
      'extras.arCourse': 'دورات AR',
      'footer.copyright': '© {year} SnapBoost. كل الحقوق محفوظة.'
    },

    // Chinese Simplified
    'zh': {
      'nav.home': '首页',
      'nav.about': '关于',
      'nav.services': '服务',
      'nav.achievements': '成就',
      'nav.extras': '资源',
      'hero.title': '立即提升你的 SnapScore 与粉丝',
      'hero.subtitle': '专业的 Snapchat 增长服务，保证效果与优质体验',
      'btn.explore': '查看服务',
      'btn.learn': '了解更多',
      'about.title': '为什么选择 SnapBoost？',
      'about.p1': '我们的专业团队专注于 Snapchat 增长策略、AR 滤镜开发及高级账号服务。我们在社交媒体营销方面有超过 5 年经验，帮助了数千名客户达成目标。',
      'about.p2': '从有机粉丝增长到定制 AR 滤镜，我们提供完整的解决方案，带来真实且可衡量的结果。',
      'stat.clients': '满意客户',
      'stat.success': '成功率',
      'services.title': '我们的高级服务',
      'service1.title': '粉丝与 SnapScore 提升',
      'service1.desc': '提供真实活跃粉丝的有机增长套餐。使用我们经过验证的策略自然提升你的 SnapScore。',
      'service1.features': ['真实粉丝', '真实 SnapScores', '安全可靠'],
      'service2.title': 'AR 滤镜制作',
      'service2.desc': '定制面部与世界滤镜，旨在提高受众参与度，从简单覆盖层到复杂交互体验均可。',
      'service2.features': ['自定义设计', '高质量', '快速交付'],
      'service3.title': '高级账号出售',
      'service3.desc': '带有既有粉丝与参与度的认证账号，适合企业与网红使用。',
      'service3.features': ['认证账号', '即时转移', '全天候支持', '退款保证'],
      'achievements.title': '我们的成就',
      'achievement.ar': '已创建 AR 滤镜',
      'achievement.accounts': '已交付账号',
      'achievement.refill': '补充保障 %',
      'features.title': '我们的服务内容',
      'feature1.title': '各类粉丝与 SnapScores',
      'feature1.list': [
        'SnapScore 提升高达 10M',
        '各类预制 SnapScore 账号可用',
        '预制 Creator 账号可用',
        '热门账号可用',
        '可定制套餐',
        '为安全考虑逐步交付'
      ],
      'feature2.title': '定制 AR 与 滤镜',
      'feature2.list': [
        '面部滤镜与特效',
        '世界滤镜与对象',
        '互动式 AR 体验',
        '品牌专属滤镜',
        '活动与推广滤镜',
        'Lens Studio 专业'
      ],
      'extras.title': '学习资源',
      'extras.learnLens': '学习 Lens Studio',
      'extras.snapTips': 'Snapchat 小贴士',
      'extras.growth': '增长策略',
      'extras.arCourse': 'AR 教程',
      'footer.copyright': '© {year} SnapBoost。版权所有。'
    },

    // Turkish
    'tr': {
      'nav.home': 'Ana Sayfa',
      'nav.about': 'Hakkında',
      'nav.services': 'Hizmetler',
      'nav.achievements': 'Başarılar',
      'nav.extras': 'Kaynaklar',
      'hero.title': 'SnapScore ve takipçilerini anında artır',
      'hero.subtitle': 'Garantili sonuçlarla profesyonel Snapchat büyüme hizmetleri ve premium kalite',
      'btn.explore': 'Hizmetleri Keşfet',
      'btn.learn': 'Daha fazla',
      'about.title': 'Neden SnapBoost?',
      'about.p1': 'Uzman ekibimiz Snapchat büyüme stratejileri, AR lens geliştirme ve premium hesap hizmetlerinde uzmandır. Sosyal medya pazarlaması konusunda 5 yılı aşkın deneyime sahibiz ve binlerce müşterinin hedeflerine ulaşmasına yardımcı olduk.',
      'about.p2': 'Organik takipçi artışından özel AR filtrelerine kadar, Snapchat varlığınız için gerçek ve ölçülebilir sonuçlar veren kapsamlı çözümler sunuyoruz.',
      'stat.clients': 'Memnun Müşteriler',
      'stat.success': 'Başarı Oranı',
      'services.title': 'Premium Hizmetlerimiz',
      'service1.title': 'Takipçi & SnapScore Artışı',
      'service1.desc': "Gerçek, aktif takipçilerle organik büyüme paketleri. Kanıtlanmış stratejilerimizle SnapScore'unuzu doğal olarak artırın.",
      'service1.features': ['Gerçek Takipçiler', 'Gerçek SnapScores', 'Güvenli & Emniyetli'],
      'service2.title': 'AR Lens Oluşturma',
      'service2.desc': 'Basit kaplamalardan karmaşık etkileşimli deneyimlere kadar, kitlenizi meşgul edecek özel AR filtreleri ve lensler.',
      'service2.features': ['Özel Tasarım', 'Yüksek Kalite', 'Hızlı Teslimat'],
      'service3.title': 'Premium Hesap Satışı',
      'service3.desc': 'Kurulmuş takipçilere ve etkileşime sahip doğrulanmış premium Snapchat hesapları. İşletmeler ve influencerlar için idealdir.',
      'service3.features': ['Doğrulanmış Hesaplar', 'Anında Transfer', '7/24 Destek', 'Para İade Garantisi'],
      'achievements.title': 'Başarılarımız',
      'achievement.ar': 'Oluşturulan AR Lensler',
      'achievement.accounts': 'Teslim Edilen Hesaplar',
      'achievement.refill': 'Yenileme Garantisi %',
      'features.title': 'Neler Sunuyoruz',
      'feature1.title': 'Takipçiler & SnapScores (tüm aralıklar)',
      'feature1.list': [
        "SnapScore artışları 10M'e kadar",
        'Tüm aralıklarda hazır SnapScore hesapları',
        'Hazır Creator hesapları mevcut',
        'Trend hesaplar mevcut',
        'Özel paketler mevcut',
        'Güvenlik için kademeli teslim'
      ],
      'feature2.title': 'Özel AR & Lensler',
      'feature2.list': [
        'Yüz filtreleri ve efektler',
        'World lens ve nesneler',
        'Etkileşimli AR deneyimleri',
        'Marka özel filtreler',
        'Etkinlik & kampanya lensleri',
        'Lens Studio uzmanlığı'
      ],
      'extras.title': 'Öğrenme Kaynakları',
      'extras.learnLens': 'Lens Studio öğren',
      'extras.snapTips': 'Snapchat İpuçları',
      'extras.growth': 'Büyüme Stratejileri',
      'extras.arCourse': 'AR Eğitimleri',
      'footer.copyright': '© {year} SnapBoost. Tüm hakları saklıdır.'
    },

    // Russian
    'ru': {
      'nav.home': 'Главная',
      'nav.about': 'О нас',
      'nav.services': 'Услуги',
      'nav.achievements': 'Достижения',
      'nav.extras': 'Ресурсы',
      'hero.title': 'Увеличьте SnapScore и подписчиков мгновенно',
      'hero.subtitle': 'Профессиональные услуги по росту в Snapchat с гарантированными результатами и премиум-качеством',
      'btn.explore': 'Посмотреть услуги',
      'btn.learn': 'Узнать больше',
      'about.title': 'Почему SnapBoost?',
      'about.p1': 'Наша команда экспертов специализируется на стратегиях роста в Snapchat, разработке AR-линз и премиум-услугах аккаунтов. С более чем 5-летним опытом в маркетинге социальных сетей мы помогли тысячам клиентов.',
      'about.p2': 'От органического роста подписчиков до кастомных AR-фильтров — мы предоставляем комплексные решения, которые дают реальные измеримые результаты.',
      'stat.clients': 'Довольные клиенты',
      'stat.success': 'Процент успеха',
      'services.title': 'Наши премиум-услуги',
      'service1.title': 'Рост подписчиков & SnapScore',
      'service1.desc': 'Пакеты органического роста с реальными активными подписчиками. Увеличьте свой SnapScore естественно с помощью проверенных стратегий.',
      'service1.features': ['Реальные подписчики', 'Реальные SnapScores', 'Безопасно и надежно'],
      'service2.title': 'Создание AR-линз',
      'service2.desc': 'Кастомные AR-фильтры и линзы, которые вовлекают аудиторию — от простых наложений до сложных интерактивных опытов.',
      'service2.features': ['Индивидуальный дизайн', 'Высокое качество', 'Быстрая доставка'],
      'service3.title': 'Продажа премиум-аккаунтов',
      'service3.desc': 'Проверенные аккаунты Snapchat с установленными подписчиками и вовлеченностью, идеально подходят для бизнеса и инфлюенсеров.',
      'service3.features': ['Проверенные аккаунты', 'Мгновенный перевод', 'Круглосуточная поддержка', 'Гарантия возврата денег'],
      'achievements.title': 'Наши достижения',
      'achievement.ar': 'Создано AR-линз',
      'achievement.accounts': 'Доставлено аккаунтов',
      'achievement.refill': 'Гарантия пополнения %',
      'features.title': 'Что мы предлагаем',
      'feature1.title': 'Подписчики & SnapScores (все диапазоны)',
      'feature1.list': [
        'Повышение SnapScore до 10M',
        'Готовые SnapScore аккаунты всех диапазонов',
        'Готовые Creator аккаунты доступны',
        'Популярные аккаунты в наличии',
        'Индивидуальные пакеты',
        'Постепенная доставка для безопасности'
      ],
      'feature2.title': 'Кастомные AR & линзы',
      'feature2.list': [
        'Фильтры для лица и эффекты',
        'World lenses и объекты',
        'Интерактивные AR-опыты',
        'Фильтры для брендов',
        'Линзы для мероприятий и кампаний',
        'Опыт работы с Lens Studio'
      ],
      'extras.title': 'Ресурсы для обучения',
      'extras.learnLens': 'Учиться Lens Studio',
      'extras.snapTips': 'Советы по Snapchat',
      'extras.growth': 'Стратегии роста',
      'extras.arCourse': 'AR-курсы',
      'footer.copyright': '© {year} SnapBoost. Все права защищены.'
    }
  };

  // ---------- Selectors & RTL ----------
  const RTL_LANGS = ['ar', 'ur'];

  const SELECTORS = {
    'nav.home': 'a[href="#hero"]',
    'nav.about': 'a[href="#about"]',
    'nav.services': 'a[href="#services"]',
    'nav.achievements': 'a[href="#achievements"]',
    'nav.extras': 'a[href="#extras"]',
    'hero.title': '#hero .hero-title',
    'hero.subtitle': '#hero .hero-subtitle',
    'btn.explore': '#hero .hero-buttons .btn-primary',
    'btn.learn': '#hero .hero-buttons .btn-secondary',
    'about.title': '#about .section-title',
    'about.p1': '#about .about-text:nth-of-type(1)',
    'about.p2': '#about .about-text:nth-of-type(2)',
    'services.title': '#services .section-title',
    'achievements.title': '#achievements .section-title',
    'features.title': '#features .section-title',
    'extras.title': '#extras .section-title',
    'extras.learnLens': '.extras-grid a:nth-of-type(1) .extra-text',
    'extras.snapTips': '.extras-grid a:nth-of-type(2) .extra-text',
    'extras.growth': '.extras-grid a:nth-of-type(3) .extra-text',
    'extras.arCourse': '.extras-grid a:nth-of-type(4) .extra-text'
  };

  // ---------- Sanitization ----------
  function sanitizeDict(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    const out = {};
    Object.keys(raw).forEach(k => {
      const v = raw[k];
      if (Array.isArray(v)) out[k] = v.map(item => stripEmojis(item));
      else if (typeof v === 'string') out[k] = stripEmojis(v);
      else out[k] = v;
    });
    return out;
  }

  // ---------- Apply translations ----------
  function applyTranslations(lang) {
    const raw = TRANSLATIONS[lang];
    if (!raw) return false;
    const dict = sanitizeDict(raw);

    // wrap emojis in document (best effort)
    try { wrapEmojiSpans(document.body); } catch (e) { console.warn('emoji wrap failed', e); }

    try { document.documentElement.lang = lang; document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'; } catch (e) {}

    // 1) selectors
    Object.keys(SELECTORS).forEach(key => {
      if (!(key in dict)) return;
      const sel = SELECTORS[key];
      const el = document.querySelector(sel);
      if (!el) return;
      safeSet(el, dict[key]);
    });

    // 2) Services (titles, descs and feature tags)
    const svcCards = Array.from(document.querySelectorAll('.service-card'));
    if (svcCards.length) {
      if (dict['service1.title']) safeSet(svcCards[0].querySelector('.service-title'), dict['service1.title']);
      if (dict['service1.desc']) safeSet(svcCards[0].querySelector('.service-description'), dict['service1.desc']);
      if (Array.isArray(dict['service1.features'])) {
        const tags = svcCards[0].querySelectorAll('.service-features .feature-tag');
        dict['service1.features'].forEach((txt, i) => { if (tags[i]) safeSet(tags[i], txt); });
      }

      if (svcCards[1]) {
        if (dict['service2.title']) safeSet(svcCards[1].querySelector('.service-title'), dict['service2.title']);
        if (dict['service2.desc']) safeSet(svcCards[1].querySelector('.service-description'), dict['service2.desc']);
        if (Array.isArray(dict['service2.features'])) {
          const tags = svcCards[1].querySelectorAll('.service-features .feature-tag');
          dict['service2.features'].forEach((txt, i) => { if (tags[i]) safeSet(tags[i], txt); });
        }
      }

      if (svcCards[2]) {
        if (dict['service3.title']) safeSet(svcCards[2].querySelector('.service-title'), dict['service3.title']);
        if (dict['service3.desc']) safeSet(svcCards[2].querySelector('.service-description'), dict['service3.desc']);
        if (Array.isArray(dict['service3.features'])) {
          const tags = svcCards[2].querySelectorAll('.service-features .feature-tag');
          dict['service3.features'].forEach((txt, i) => { if (tags[i]) safeSet(tags[i], txt); });
        }
      }
    }

    // 3) stat labels
    const statLabels = Array.from(document.querySelectorAll('.stat-label'));
    if (statLabels.length) {
      if (dict['stat.clients'] && statLabels[0]) safeSet(statLabels[0], dict['stat.clients']);
      if (dict['stat.success'] && statLabels[1]) safeSet(statLabels[1], dict['stat.success']);
    }

    // 4) achievements labels
    const achLabels = Array.from(document.querySelectorAll('#achievements .achievement-label'));
    if (achLabels.length) {
      if (dict['achievement.ar'] && achLabels[0]) safeSet(achLabels[0], dict['achievement.ar']);
      if (dict['achievement.accounts'] && achLabels[1]) safeSet(achLabels[1], dict['achievement.accounts']);
      if (dict['achievement.refill'] && achLabels[2]) safeSet(achLabels[2], dict['achievement.refill']);
    }

    // 5) feature panels lists
    const featurePanels = Array.from(document.querySelectorAll('#features .feature-panel'));
    if (featurePanels.length) {
      if (dict['feature1.title'] && featurePanels[0].querySelector('.feature-title')) safeSet(featurePanels[0].querySelector('.feature-title'), dict['feature1.title']);
      if (dict['feature1.list'] && Array.isArray(dict['feature1.list'])) {
        const ul = featurePanels[0].querySelector('.feature-list');
        if (ul) ul.innerHTML = dict['feature1.list'].map(item => `<li>${escapeHtml(item)}</li>`).join('');
      }
      if (featurePanels[1]) {
        if (dict['feature2.title'] && featurePanels[1].querySelector('.feature-title')) safeSet(featurePanels[1].querySelector('.feature-title'), dict['feature2.title']);
        if (dict['feature2.list'] && Array.isArray(dict['feature2.list'])) {
          const ul2 = featurePanels[1].querySelector('.feature-list');
          if (ul2) ul2.innerHTML = dict['feature2.list'].map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }
      }
    }

    // 6) extras (links)
    if (dict['extras.learnLens']) {
      const el = document.querySelector('.extras-grid a:nth-of-type(1) .extra-text'); if (el) safeSet(el, dict['extras.learnLens']);
    }
    if (dict['extras.snapTips']) {
      const el = document.querySelector('.extras-grid a:nth-of-type(2) .extra-text'); if (el) safeSet(el, dict['extras.snapTips']);
    }
    if (dict['extras.growth']) {
      const el = document.querySelector('.extras-grid a:nth-of-type(3) .extra-text'); if (el) safeSet(el, dict['extras.growth']);
    }
    if (dict['extras.arCourse']) {
      const el = document.querySelector('.extras-grid a:nth-of-type(4) .extra-text'); if (el) safeSet(el, dict['extras.arCourse']);
    }

    // 7) footer
    const footer = document.querySelector('footer .footer-text p');
    if (footer && dict['footer.copyright']) {
      const year = new Date().getFullYear(); safeSet(footer, dict['footer.copyright'].replace('{year}', year));
    }

    return true;
  }

  // ---------- initialize ----------
  const userLang = primaryLang();
  let applied = applyTranslations(userLang);
  if (!applied) {
    const full = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const major = String(full).toLowerCase().split('-')[0];
    if (major && major !== userLang) applied = applyTranslations(major);
  }

  // Public API
  window.SnapBoostI18n = {
    translate: applyTranslations,
    translations: TRANSLATIONS,
    wrapEmojis: () => wrapEmojiSpans(document.body)
  };

})();
