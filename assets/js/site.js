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

  var ticket = document.querySelector('.tear-ticket');
  var ticketStage = document.querySelector('.ticket-stage');
  var ticketSection = document.querySelector('.ticket-section');
  var headerInner = document.querySelector('.header-inner');

  var heroScene = document.getElementById('hero');
  var countdownScene = document.querySelector('.countdown');
  var takeoffScene = document.querySelector('.takeoff-scene');
  var takeoffStage = takeoffScene.querySelector('.takeoff-stage');
  var takeoffRenderer = typeof createAjtScene === 'function' && createAjtScene(
    takeoffStage.querySelector('.takeoff-flight'),
    takeoffStage.querySelector('.takeoff-exhaust')
  );
  takeoffScene.hidden = !takeoffRenderer;
  var mottoScene = document.querySelector('.ball-motto');
  var heroStage = heroScene.querySelector('.scene-stage');
  var countdownStage = countdownScene.querySelector('.scene-stage');
  var mottoStage = mottoScene.querySelector('.scene-stage');
  var sceneFrame = 0;
  var scenesIdle = false;
  var openingRanges;
  var nativeSceneArrival = CSS.supports('animation-timeline: view()') &&
    CSS.supports('animation-timeline: scroll(root block)') &&
    CSS.supports('animation-range: entry 0% entry 100%') &&
    CSS.supports('animation-range: 0px 100px') &&
    CSS.supports('view-timeline-inset: 4rem 0px');

  function limitProgress(value) {
    return Math.max(0, Math.min(1, value));
  }

  function setSceneEntrance(stage, distance, height) {
    var approach = limitProgress(distance / height);
    stage.style.setProperty('--scene-entry', 1 - approach);
    // Counter most of the natural scroll so the entrance starts near the lower third.
    stage.style.setProperty('--scene-entry-offset', (-approach * height * 5 / 6) + 'px');
  }

  function easeScene(value) {
    var progress = limitProgress(value);
    return progress * progress * (3 - 2 * progress);
  }

  function measureOpeningRanges() {
    var header = headerInner.offsetHeight;
    var heroStart = window.scrollY + heroScene.getBoundingClientRect().top - header;
    var ticketStart = window.scrollY + ticketSection.getBoundingClientRect().top - header;
    var ticketHeight = ticketStage.offsetHeight;
    var ticketInset = parseFloat(getComputedStyle(ticketSection).paddingBlockStart);
    openingRanges = {
      heroStart: heroStart,
      heroRunway: Math.max(1, heroScene.clientHeight - heroStage.offsetHeight),
      ticketStart: ticketStart,
      ticketHeight: ticketHeight,
      ticketRunway: Math.max(1, ticketSection.clientHeight - ticketHeight - 2 * ticketInset),
    };
    if (nativeSceneArrival) {
      heroScene.style.setProperty('--opening-start', heroStart + 'px');
      heroScene.style.setProperty('--opening-runway', openingRanges.heroRunway + 'px');
      ticketSection.style.setProperty('--opening-entry', (ticketStart - ticketHeight) + 'px');
      ticketSection.style.setProperty('--opening-start', ticketStart + 'px');
      ticketSection.style.setProperty('--opening-runway', openingRanges.ticketRunway + 'px');
    }
    queueSceneUpdate();
  }

  function updateScrollScenes() {
    sceneFrame = 0;
    var headerHeight = headerInner.offsetHeight;
    var countdownTop = countdownScene.getBoundingClientRect().top - headerHeight;
    // Native animations cover everything before the countdown pins.
    var beforeCountdown = nativeSceneArrival && countdownTop > 0;
    if (beforeCountdown && scenesIdle) return;
    scenesIdle = beforeCountdown;

    var countdownHeight = countdownStage.offsetHeight;
    var countdownDistance = countdownScene.clientHeight - countdownHeight;
    var countdownExit = limitProgress((-countdownTop - countdownDistance) / (countdownHeight * 0.58));
    var mottoTop = mottoScene.getBoundingClientRect().top - headerHeight;
    var mottoHeight = mottoStage.offsetHeight;
    var mottoLead = mottoHeight * 0.23;
    var takeoffWidth, takeoffHeight, takeoffTop, takeoffProgress, takeoffOpacity;
    if (takeoffRenderer) {
      takeoffWidth = takeoffStage.clientWidth;
      takeoffHeight = takeoffStage.offsetHeight;
      takeoffTop = takeoffScene.getBoundingClientRect().top - headerHeight;
      var takeoffRunway = Math.max(1, takeoffScene.clientHeight - takeoffHeight);
      takeoffProgress = limitProgress(-takeoffTop / takeoffRunway);
      var entry = easeScene((takeoffHeight * 0.86 - takeoffTop) / (takeoffHeight * 0.58));
      var exit = easeScene((takeoffProgress - 0.78) / 0.14);
      takeoffOpacity = entry * (1 - exit);
      mottoLead = takeoffHeight * 0.45 + takeoffRunway * 0.08;
    }
    var mottoDistance = Math.max(1, mottoScene.clientHeight - mottoHeight);
    var mottoProgress = limitProgress((mottoLead - mottoTop) / (mottoDistance + mottoLead));
    var mottoExit = limitProgress((-mottoTop - mottoDistance) / (mottoHeight * 0.6));

    if (!nativeSceneArrival) {
      var scroll = Math.max(0, window.scrollY);
      var heroProgress = limitProgress((scroll - openingRanges.heroStart) / openingRanges.heroRunway);
      var copyExit = limitProgress(heroProgress / 0.36);
      var logoEnter = limitProgress((heroProgress - 0.22) / 0.27);
      var logoExit = limitProgress((heroProgress - 0.6) / 0.36);
      var logoOpacity = (0.12 + 0.82 * logoEnter) * (1 - logoExit);
      heroStage.style.setProperty('--hero-copy-opacity', 1 - copyExit);
      heroStage.style.setProperty('--hero-copy-lift', (-4.5 * copyExit) + 'rem');
      heroStage.style.setProperty('--hero-logo-opacity', logoOpacity);
      heroStage.style.setProperty('--hero-logo-scale', 1 + 0.1 * logoEnter);
      heroStage.style.setProperty('--scene-glow-opacity', Math.max(1 - copyExit, logoOpacity));
      heroStage.style.setProperty('--scene-glow-offset', (-2 * logoExit) + 'rem');

      var tearEnd = 0.8;
      var ticketTop = openingRanges.ticketStart - scroll;
      var ticketProgress = limitProgress(-ticketTop / openingRanges.ticketRunway);
      var tearProgress = limitProgress(ticketProgress / tearEnd);
      // Fade near the lower third as the ticket moves naturally with the page.
      ticketStage.style.setProperty('--scene-entry', easeScene(1 - ticketTop / (openingRanges.ticketHeight / 6)));
      ticket.style.setProperty('--ticket-peel', limitProgress(tearProgress / 0.52));
      ticket.style.setProperty('--ticket-drop', limitProgress((tearProgress - 0.52) / 0.48));
      ticketStage.style.setProperty('--ticket-exit', limitProgress((ticketProgress - tearEnd) / (1 - tearEnd)));
      setSceneEntrance(countdownStage, countdownTop, countdownHeight);
    }
    countdownStage.style.setProperty('--countdown-exit', countdownExit);
    mottoStage.style.setProperty('--motto-progress', mottoProgress);
    mottoStage.style.setProperty('--motto-exit', mottoExit);
    if (takeoffRenderer) {
      takeoffStage.style.setProperty('--takeoff-opacity', takeoffOpacity);
      if (!nativeSceneArrival) {
        takeoffStage.style.setProperty('--takeoff-offset', (-limitProgress(takeoffTop / takeoffHeight) * takeoffHeight * 0.86) + 'px');
        mottoStage.style.setProperty('--motto-approach-offset', (-limitProgress(mottoTop / mottoLead) * mottoLead * 0.72) + 'px');
      }
      takeoffRenderer.update(takeoffProgress, takeoffOpacity > 0.004, takeoffWidth, takeoffHeight);
    }
  }

  function queueSceneUpdate() {
    if (!sceneFrame) sceneFrame = requestAnimationFrame(updateScrollScenes);
  }

  main.classList.add('has-scroll-scenes');
  measureOpeningRanges();
  if ('ResizeObserver' in window) {
    var openingObserver = new ResizeObserver(measureOpeningRanges);
    [headerInner.parentElement, heroScene, heroStage, ticketSection, ticketStage].forEach(function (element) {
      openingObserver.observe(element);
    });
  } else {
    window.addEventListener('resize', measureOpeningRanges);
  }
  window.addEventListener('scroll', queueSceneUpdate, { passive: true });
  window.addEventListener('resize', queueSceneUpdate);
  window.addEventListener('pageshow', measureOpeningRanges);

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

  // Focus inside a cross-origin embed may not propagate a focus event to its card.
  var focusedJournal;
  function syncJournalFocus() {
    var active = document.activeElement;
    var card = active.matches('.journal-media') ? active.closest('.journal-entry') : null;
    if (focusedJournal === card) return;
    if (focusedJournal) focusedJournal.classList.remove('has-frame-focus');
    if (card) card.classList.add('has-frame-focus');
    focusedJournal = card;
  }
  window.addEventListener('blur', function () { requestAnimationFrame(syncJournalFocus); });
  document.addEventListener('focusin', syncJournalFocus);

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
