(function () {
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');
  var registerLink = document.querySelector('.header-register-button');
  var main = document.getElementById('main-content');

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
  document.querySelectorAll('.mobile-nav-link, .header-register-button').forEach(function (link) {
    link.addEventListener('click', function () {
      setMobileMenu(false);
      var destination = document.querySelector(link.hash);
      destination.focus({ preventScroll: true });
    });
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    document.querySelector(link.hash).tabIndex = -1;
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !event.defaultPrevented && !mobileMenu.hidden && !document.getElementById('info-modal').open) {
      setMobileMenu(false);
      mobileMenuBtn.focus();
    }
  });
  matchMedia('(max-width: 900px)').addEventListener('change', function (event) {
    if (event.matches) return;
    if (mobileMenu.contains(document.activeElement) || document.activeElement === mobileMenuBtn) {
      registerLink.focus({ preventScroll: true });
    }
    setMobileMenu(false);
  });

  var opening = document.getElementById('hero');
  var openingStage = opening.querySelector('.opening-stage');
  var headerInner = document.querySelector('.header-inner');
  var heroStage = opening.querySelector('.hero-stage');
  var invitationCaption = opening.querySelector('.invitation-caption');
  var ticketTab = opening.querySelector('.tear-ticket-tab');
  var ticketArrival = opening.querySelector('.ticket-stage .scene-arrival');
  var countdownArrival = opening.querySelector('.countdown-stage .scene-arrival');
  var takeoffScene = opening.querySelector('.takeoff-scene');
  var takeoffCaption = takeoffScene.querySelector('.takeoff-caption');
  var mottoScene = opening.querySelector('.ball-motto');
  var mottoStage = mottoScene.querySelector('.motto-stage');
  var takeoffRenderer = typeof createAjtScene === 'function' && createAjtScene(
    takeoffScene.querySelector('.takeoff-flight'),
    takeoffScene.querySelector('.takeoff-exhaust')
  );
  takeoffScene.hidden = !takeoffRenderer;

  // Distances are expressed as fractions of one stable stage height.
  var titlePhase = { layer: opening.querySelector('.hero-copy'), enter: 0, hold: 0.14, exit: 0.24 };
  var logoPhase = { layer: opening.querySelector('.hero-orbit'), enter: 0.58, hold: 0.22, exit: 0.58 };
  var ticketPhase = { layer: opening.querySelector('.ticket-section'), enter: 0.22, hold: 0.78, exit: 0.24 };
  var countdownPhase = { layer: opening.querySelector('.countdown'), enter: 0.24, hold: 0.40, exit: 0.24 };
  var takeoffPhase = { layer: takeoffScene, enter: 0.25, hold: 1.17, exit: 0.25 };
  var mottoPhase = { layer: mottoScene, enter: 0.25, hold: 0.64, exit: 0.22 };
  var openingPhases = [titlePhase, logoPhase, ticketPhase, countdownPhase];
  if (takeoffRenderer) openingPhases.push(takeoffPhase);
  openingPhases.push(mottoPhase);

  var sceneFrame = 0;
  var openingStart = 0;
  var openingWidth = 0;
  var openingHeight = 0;
  var lastPosition;

  function limitProgress(value) {
    return Math.max(0, Math.min(1, value));
  }

  function easeScene(value) {
    var progress = limitProgress(value);
    return progress * progress * (3 - 2 * progress);
  }

  function measureOpening() {
    openingStart = window.scrollY + opening.getBoundingClientRect().top - headerInner.offsetHeight;
    openingWidth = openingStage.clientWidth;
    openingHeight = openingStage.clientHeight;
    var distance = Math.max(280, Math.min(820, openingHeight));
    var position = 0;
    openingPhases.forEach(function (phase) {
      phase.start = position;
      phase.enterEnd = position + phase.enter * distance;
      phase.exitStart = phase.enterEnd + phase.hold * distance;
      phase.end = phase.exitStart + phase.exit * distance;
      position = phase.end;
    });
    opening.style.setProperty('--opening-length', Math.ceil(openingHeight + position) + 'px');
    lastPosition = undefined;
    queueSceneUpdate();
  }

  function departure(phase, position) {
    return easeScene((position - phase.exitStart) / (phase.end - phase.exitStart));
  }

  function arrival(phase, position) {
    return easeScene((position - phase.start) / (phase.enterEnd - phase.start));
  }

  function updateTicketTear(position) {
    // Peel from the top with the bottom anchored, then let the stub fall.
    var holdDistance = ticketPhase.exitStart - ticketPhase.enterEnd;
    var tearStart = ticketPhase.enterEnd + holdDistance * 0.15;
    var tearEnd = ticketPhase.exitStart - holdDistance * 0.15;
    var tear = limitProgress((position - tearStart) / (tearEnd - tearStart));
    var peel = easeScene(tear / 0.52);
    var drop = easeScene((tear - 0.52) / 0.48);
    ticketTab.style.transform = 'translate3d(' + drop * 80 + '%, ' + drop * 44 + '%, 0) rotate(' + (peel * 9 + drop * 15) + 'deg)';
    ticketTab.style.opacity = 1 - drop;
  }

  function updateScrollScenes() {
    sceneFrame = 0;
    var position = Math.max(0, Math.min(mottoPhase.end, window.scrollY - openingStart));
    if (position === lastPosition) return;
    lastPosition = position;

    // Each scene reaches zero at the same scroll position where the next one begins.
    openingPhases.forEach(function (phase) {
      var opacity = position < phase.enterEnd ? arrival(phase, position) : 1 - departure(phase, position);
      if (phase.opacity === opacity) return;
      phase.opacity = opacity;
      phase.layer.style.opacity = opacity;
    });

    var titleExit = departure(titlePhase, position);
    titlePhase.layer.style.transform = 'translate3d(0, ' + (-48 * titleExit) + 'px, 0) scale(' + (1 - 0.10 * titleExit) + ')';
    // Keep the stage fixed and move only the ticket and countdown artwork.
    var entranceOffset = Math.min(openingHeight / 6, 104);
    var ticketOffset = entranceOffset * (1 - arrival(ticketPhase, position)) - 42 * departure(ticketPhase, position);
    var countdownIn = arrival(countdownPhase, position);
    var countdownOffset = entranceOffset * (1 - countdownIn) - 42 * departure(countdownPhase, position);
    ticketArrival.style.transform = 'translate3d(0, ' + ticketOffset + 'px, 0)';
    countdownArrival.style.transform = 'translate3d(0, ' + countdownOffset + 'px, 0) scale(' + (0.90 + 0.10 * countdownIn) + ')';
    updateTicketTear(position);

    var glow = titlePhase.opacity + logoPhase.opacity;
    heroStage.style.setProperty('--scene-glow-opacity', glow);
    var invitation = easeScene((arrival(logoPhase, position) - 0.72) / 0.28) * logoPhase.opacity;
    invitationCaption.style.setProperty('--caption-opacity', invitation);
    var mottoReveal = mottoPhase.enterEnd + (mottoPhase.exitStart - mottoPhase.enterEnd) * 0.58;
    mottoStage.style.setProperty('--motto-progress', limitProgress((position - mottoPhase.start) / (mottoReveal - mottoPhase.start)));
    if (takeoffRenderer) {
      var flightStart = takeoffPhase.enterEnd + (takeoffPhase.exitStart - takeoffPhase.enterEnd) * 0.10;
      var flight = limitProgress((position - flightStart) / (takeoffPhase.end - flightStart));
      takeoffCaption.style.setProperty('--caption-opacity', easeScene((flight - 0.65) / 0.17));
      takeoffRenderer.update(flight, takeoffPhase.opacity > 0, openingWidth, openingHeight);
    }
  }

  function queueSceneUpdate() {
    if (!sceneFrame) sceneFrame = requestAnimationFrame(updateScrollScenes);
  }

  main.classList.add('has-scroll-scenes');
  measureOpening();
  if ('ResizeObserver' in window) {
    var openingObserver = new ResizeObserver(measureOpening);
    openingObserver.observe(openingStage);
    openingObserver.observe(headerInner.parentElement);
  } else {
    window.addEventListener('resize', measureOpening);
  }
  window.addEventListener('scroll', queueSceneUpdate, { passive: true });
  window.addEventListener('pageshow', measureOpening);

  var targetTime = new Date('2026-12-24T18:00:00+08:00').getTime();
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMinutes = document.getElementById('cd-minutes');
  var elSeconds = document.getElementById('cd-seconds');
  var elNote = document.getElementById('cd-status-note');

  var countdownTimer;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function setCountdownValue(element, value) {
    var text = pad2(value);
    if (element.textContent !== text) element.textContent = text;
  }

  function updateCountdown() {
    var diff = targetTime - Date.now();
    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      elNote.textContent = '啟航倒數已結束。';
      clearInterval(countdownTimer);
      return;
    }
    setCountdownValue(elDays, Math.floor(diff / 86400000));
    setCountdownValue(elHours, Math.floor((diff / 3600000) % 24));
    setCountdownValue(elMinutes, Math.floor((diff / 60000) % 60));
    setCountdownValue(elSeconds, Math.floor((diff / 1000) % 60));
  }
  updateCountdown();
  document.getElementById('countdown-values').hidden = false;
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
  var scheduleIdle = false;

  function updateScheduleRail() {
    scheduleFrame = 0;
    var first = scheduleEntries[0];
    var viewport = document.documentElement.clientHeight;
    var distance = viewport * 0.74 - first.getBoundingClientRect().top;
    if (distance < 0 && scheduleIdle) return;
    scheduleIdle = distance < 0;

    var start = first.offsetTop;
    var offsets = Array.from(scheduleEntries, function (entry) { return entry.offsetTop - start; });
    var length = offsets[offsets.length - 1];
    var progress = limitProgress(distance / Math.max(1, length));

    scheduleList.style.setProperty('--schedule-rail-length', length + 'px');
    scheduleList.style.setProperty('--schedule-progress', progress);
    scheduleList.style.setProperty('--schedule-rail-opacity', Math.min(1, progress * 10));
    scheduleEntries.forEach(function (entry, index) {
      entry.classList.toggle('is-lit', distance >= offsets[index]);
    });
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

  var journalList = document.getElementById('journal-list');
  var journalControls = document.querySelector('.journal-controls');
  var journalButtons = journalControls.querySelectorAll('button');

  function updateJournalControls() {
    var maxScroll = journalList.scrollWidth - journalList.clientWidth;
    journalControls.hidden = maxScroll <= 1;
    journalButtons[0].setAttribute('aria-disabled', String(journalList.scrollLeft <= 1));
    journalButtons[1].setAttribute('aria-disabled', String(journalList.scrollLeft >= maxScroll - 1));
  }

  journalButtons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      if (button.getAttribute('aria-disabled') === 'true') return;
      var cards = journalList.children;
      var step = cards[1].offsetLeft - cards[0].offsetLeft;
      journalList.scrollBy({ left: index === 0 ? -step : step, behavior: 'smooth' });
    });
  });
  journalList.addEventListener('scroll', updateJournalControls, { passive: true });
  window.addEventListener('resize', updateJournalControls);
  updateJournalControls();

  if ('IntersectionObserver' in window) {
    var entranceTargets = document.querySelectorAll([
      '.ticket-star-trails',
      '.section-heading > *',
      '#info .card', '.journal-entry',
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
