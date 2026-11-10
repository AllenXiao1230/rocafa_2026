(function () {
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');

  function setMobileMenu(open) {
    mobileMenu.hidden = !open;
    iconOpen.toggleAttribute('hidden', open);
    iconClose.toggleAttribute('hidden', !open);
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    mobileMenuBtn.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
  }

  mobileMenuBtn.hidden = false;
  mobileMenuBtn.addEventListener('click', function () {
    setMobileMenu(mobileMenu.hidden);
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMobileMenu(false);
      var destination = document.querySelector(link.hash);
      destination.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    document.querySelector(link.hash).tabIndex = -1;
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !event.defaultPrevented && !mobileMenu.hidden && !document.getElementById('info-modal').open) {
      setMobileMenu(false);
      mobileMenuBtn.focus();
    }
  });
  matchMedia('(max-width: 900px)').addEventListener('change', function (event) {
    if (!event.matches) setMobileMenu(false);
  });

  var ticket = document.querySelector('.tear-ticket');
  var ticketStage = document.querySelector('.ticket-stage');
  var ticketSection = document.querySelector('.ticket-section');
  var headerInner = document.querySelector('.header-inner');
  var ticketFrame = 0;
  var lastTicketProgress = -1;

  var heroScene = document.getElementById('hero');
  var countdownScene = document.querySelector('.countdown');
  var mottoScene = document.querySelector('.ball-motto');
  var heroStage = heroScene.querySelector('.scene-stage');
  var countdownStage = countdownScene.querySelector('.scene-stage');
  var mottoStage = mottoScene.querySelector('.scene-stage');
  var sceneFrame = 0;

  function limitProgress(value) {
    return Math.max(0, Math.min(1, value));
  }

  function updateScrollScenes() {
    sceneFrame = 0;
    var headerHeight = headerInner.offsetHeight;
    var heroDistance = Math.max(1, heroScene.clientHeight - heroStage.offsetHeight);
    var heroProgress = limitProgress((headerHeight - heroScene.getBoundingClientRect().top) / heroDistance);
    var copyExit = limitProgress(heroProgress / 0.36);
    var logoEnter = limitProgress((heroProgress - 0.22) / 0.27);
    var logoExit = limitProgress((heroProgress - 0.6) / 0.36);
    var countdownTop = countdownScene.getBoundingClientRect().top - headerHeight;
    var countdownEntry = limitProgress(1 - countdownTop / (countdownStage.offsetHeight * 0.65));
    var mottoTop = mottoScene.getBoundingClientRect().top - headerHeight;
    var mottoLead = mottoStage.offsetHeight * 0.23;
    var mottoDistance = Math.max(1, mottoScene.clientHeight - mottoStage.offsetHeight);
    var mottoProgress = limitProgress((mottoLead - mottoTop) / (mottoDistance + mottoLead));

    heroStage.style.setProperty('--hero-copy-opacity', 1 - copyExit);
    heroStage.style.setProperty('--hero-copy-lift', (-4.5 * copyExit) + 'rem');
    heroStage.style.setProperty('--hero-logo-opacity', (0.12 + 0.82 * logoEnter) * (1 - logoExit));
    heroStage.style.setProperty('--hero-logo-scale', 1 + 0.1 * logoEnter);
    heroStage.style.setProperty('--hero-logo-layer', copyExit === 1 ? 1 : -1);

    countdownStage.style.setProperty('--scene-entry', countdownEntry);
    mottoStage.style.setProperty('--motto-progress', mottoProgress);
  }

  function queueSceneUpdate() {
    if (!sceneFrame) sceneFrame = requestAnimationFrame(updateScrollScenes);
  }

  document.getElementById('main-content').classList.add('has-scroll-scenes');
  window.addEventListener('scroll', queueSceneUpdate, { passive: true });
  window.addEventListener('resize', queueSceneUpdate);
  window.addEventListener('pageshow', queueSceneUpdate);
  queueSceneUpdate();

  function updateTicket() {
    ticketFrame = 0;
    var travel = Math.max(1, ticketSection.clientHeight - ticketStage.offsetHeight);
    var distance = headerInner.offsetHeight - ticketSection.getBoundingClientRect().top;
    var progress = Math.max(0, Math.min(1, distance / travel));
    if (progress === lastTicketProgress) return;
    lastTicketProgress = progress;

    // First pull against the perforation, then let the stub fall away.
    var peel = Math.min(1, progress / 0.52);
    var drop = Math.max(0, (progress - 0.52) / 0.48);
    ticket.style.setProperty('--ticket-peel', peel);
    ticket.style.setProperty('--ticket-drop', drop);
  }

  function queueTicketUpdate() {
    if (!ticketFrame) ticketFrame = requestAnimationFrame(updateTicket);
  }

  if (ticket && ticketStage && ticketSection) {
    window.addEventListener('scroll', queueTicketUpdate, { passive: true });
    window.addEventListener('resize', queueTicketUpdate);
    window.addEventListener('pageshow', queueTicketUpdate);
    queueTicketUpdate();
  }

  var targetTime = new Date('2026-12-24T18:00:00+08:00').getTime();
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMinutes = document.getElementById('cd-minutes');
  var elSeconds = document.getElementById('cd-seconds');
  var elNote = document.getElementById('cd-status-note');

  var countdownTimer;

  function pad2(n) { return String(n).padStart(2, '0'); }
  function updateCountdown() {
    var diff = targetTime - Date.now();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      elNote.textContent = '晚會倒數已結束。';
      clearInterval(countdownTimer);
      return;
    }
    elDays.textContent = pad2(Math.floor(diff / 86400000));
    elHours.textContent = pad2(Math.floor((diff / 3600000) % 24));
    elMinutes.textContent = pad2(Math.floor((diff / 60000) % 60));
    elSeconds.textContent = pad2(Math.floor((diff / 1000) % 60));
  }
  updateCountdown();
  if (Date.now() < targetTime) countdownTimer = setInterval(updateCountdown, 1000);

  var calendarButton = document.getElementById('download-ics-btn');
  calendarButton.hidden = false;
  calendarButton.addEventListener('click', function () {
    var icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ROCAFA 2026//Beyond Borders Ball//ZH',
      'BEGIN:VEVENT',
      'UID:rocafa-2026-ball@rocafa.edu.tw',
      'DTSTAMP:20261109T000000Z',
      'DTSTART:20261224T100000Z',
      'DTEND:20261224T140000Z',
      'SUMMARY:2026空軍官校禮儀示範晚會《越境·寰宇》',
      'LOCATION:空軍軍官學校（高雄市岡山區介壽西路1號）',
      'DESCRIPTION:主題：《越境·寰宇》\\n時間：2026年12月24日 18:00-22:00\\n服裝規範：正裝、晚禮服或典雅洋裝（禁拖鞋/短褲）',
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ].join('\r\n');
    var blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ROCAFA_2026_Ball_1224.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });


  var scheduleList = document.querySelector('.schedule-list');
  var scheduleEntries = scheduleList.querySelectorAll('.schedule-event');
  var scheduleFrame = 0;

  function updateScheduleRail() {
    scheduleFrame = 0;
    var first = scheduleEntries[0];
    var last = scheduleEntries[scheduleEntries.length - 1];
    var length = last.offsetTop - first.offsetTop;
    var viewport = document.documentElement.clientHeight;
    var distance = viewport * 0.82 - first.getBoundingClientRect().top;
    var progress = Math.max(0, Math.min(1, distance / (length + viewport * 0.37)));

    scheduleList.style.setProperty('--schedule-rail-length', length + 'px');
    scheduleList.style.setProperty('--schedule-progress', progress);
    scheduleList.style.setProperty('--schedule-rail-opacity', Math.min(1, progress * 10));
  }

  function queueScheduleUpdate() {
    if (!scheduleFrame) scheduleFrame = requestAnimationFrame(updateScheduleRail);
  }

  window.addEventListener('scroll', queueScheduleUpdate, { passive: true });
  window.addEventListener('resize', queueScheduleUpdate);
  window.addEventListener('pageshow', queueScheduleUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(queueScheduleUpdate).observe(scheduleList);
  queueScheduleUpdate();

  var modal = document.getElementById('info-modal');
  var modalTitle = document.getElementById('modal-title');
  var modalSubtitle = document.getElementById('modal-subtitle');
  var modalBody = document.getElementById('modal-body');
  var closeModalBtn = document.getElementById('close-modal-btn');
  var modalOkBtn = document.getElementById('modal-ok-btn');
  var modalOpener;

  function connectDialog(id, subtitle, title, content) {
    var button = document.getElementById(id);
    button.hidden = false;
    button.addEventListener('click', function () {
      modalOpener = button;
      modalSubtitle.textContent = subtitle;
      modalTitle.textContent = title;
      modalBody.innerHTML = content;
      modal.showModal();
      document.body.classList.add('dialog-open');
    });
  }

  connectDialog('open-kv-modal-btn', 'ROCAFA 2026', '《越境·寰宇》主視覺', '<p>午夜深藍星河與香檳金星軌環繞共舞的身影，呼應跨越天際、相聚平安夜的晚會主題。</p>');
  connectDialog('open-transit-modal-btn', 'ROCAFA 2026', '交通方式與接駁說明', '<p><strong>大會接駁專車</strong>：填表時選擇接駁車，當日於高雄捷運紅線 R24 岡山高醫站搭車。詳細班次以官方公告為準。</p><p><strong>自行前往</strong>：導航至高雄市岡山區介壽西路 1 號（空軍軍官學校）。入場請出示法定身分證件正本。</p>');

  closeModalBtn.addEventListener('click', function () { modal.close(); });
  modalOkBtn.addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (event) {
    if (event.target === modal) modal.close();
  });
  modal.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var first = event.shiftKey ? modalOkBtn : closeModalBtn;
    var last = event.shiftKey ? closeModalBtn : modalOkBtn;
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  modal.addEventListener('close', function () {
    document.body.classList.remove('dialog-open');
    modalOpener.focus({ preventScroll: true });
  });

  if ('IntersectionObserver' in window) {
    var entranceTargets = document.querySelectorAll([
      '.tear-ticket-plane', '.ticket-star-trails',
      '.section-heading > *',
      '#info .card', '.journal-entry-body', '.journal-media', '.journal-link',
      '.schedule-entry', '.protocol-steps > .card',
      '.faq-item', '.footer-inner > *'
    ].join(','));
    var entranceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('has-entered');
        entranceObserver.unobserve(entry.target);
      });
    }, { rootMargin: '-64px 0px -8px' });

    entranceTargets.forEach(function (target) {
      entranceObserver.observe(target);
    });
  }
})();
