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


  var scheduleFilters = document.querySelector('.schedule-filters');
  var scheduleButtons = scheduleFilters.querySelectorAll('.sched-tab');
  var scheduleEntries = document.querySelectorAll('.sched-card');
  scheduleFilters.hidden = false;
  scheduleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.dataset.schedFilter;
      scheduleButtons.forEach(function (option) {
        var selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      scheduleEntries.forEach(function (entry) {
        entry.hidden = filter !== 'all' && entry.dataset.schedCat !== filter;
      });
    });
  });

  var prepChecks = Array.from(document.querySelectorAll('.prep-check'));
  var progressBadge = document.getElementById('checklist-progress');
  var checklistKey = 'rocafa-2026-preparation-v1';

  function updateChecklist() {
    var count = prepChecks.filter(function (item) { return item.checked; }).length;
    progressBadge.textContent = count === prepChecks.length
      ? '行前準備完成，可前往填表'
      : '已準備 ' + count + ' / ' + prepChecks.length + ' 項';
  }

  try {
    var savedChecks = sessionStorage.getItem(checklistKey);
    if (savedChecks && /^[01]{4}$/.test(savedChecks)) {
      prepChecks.forEach(function (item, index) { item.checked = savedChecks[index] === '1'; });
    }
  } catch {
    // The checklist still works when browser storage is unavailable.
  }
  updateChecklist();
  progressBadge.hidden = false;
  prepChecks.forEach(function (item) {
    item.addEventListener('change', function () {
      updateChecklist();
      try {
        sessionStorage.setItem(checklistKey, prepChecks.map(function (check) {
          return check.checked ? '1' : '0';
        }).join(''));
      } catch {
        // Keep the current state on the page.
      }
    });
  });

  var guestNameInput = document.getElementById('guest-name-input');
  var dmTemplateText = document.getElementById('dm-template-text');
  var copyButton = document.getElementById('copy-dm-btn');
  var copyStatus = document.getElementById('copy-toast');
  var defaultMessage = dmTemplateText.value;
  var copying = false;
  guestNameInput.hidden = false;
  guestNameInput.labels[0].hidden = false;
  copyButton.hidden = false;
  guestNameInput.addEventListener('input', function () {
    var name = guestNameInput.value.trim();
    dmTemplateText.value = name
      ? defaultMessage.replace('您好！', function () { return '您好！我是' + name + '。'; })
      : defaultMessage;
    copyStatus.textContent = '';
  });
  copyButton.addEventListener('click', async function () {
    if (copying) return;
    copying = true;
    var message = dmTemplateText.value;
    copyStatus.textContent = '';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        dmTemplateText.select();
        if (!document.execCommand('copy')) throw new Error('Copy failed');
        copyButton.focus({ preventScroll: true });
      }
      copyStatus.textContent = message === dmTemplateText.value
        ? '已複製，可到 Instagram 貼上訊息。'
        : '範本已更新，請再複製一次。';
    } catch {
      copyStatus.textContent = '無法自動複製，請選取上方範本並手動複製。';
    } finally {
      copying = false;
    }
  });

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
})();
