/* ==========================================================================
   个人网站占位模板 · 交互动效脚本
   还原参考站点的动态体验：加载屏、滚动节奏、入场动画、
   照片倾斜、终端坠落、纸撕裂视差、荧光笔填充、星星点亮、书页翻转、
   智能导航、进度条 checkpoint、明暗主题、乱码打字机
   ========================================================================== */

(function () {
  'use strict';

  // 刷新后始终回到页面顶部
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. 加载屏
  ------------------------------------------------------------------ */
  window.addEventListener('load', function () {
    var loader = document.querySelector('.loader-overlay');
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 1200);
  });

  /* ------------------------------------------------------------------
     2. 主题切换（明 / 暗）
  ------------------------------------------------------------------ */
  var themeToggle = document.getElementById('theme-toggle');
  var body = document.body;
  var themeIcon = themeToggle.querySelector('i');

  var currentTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle.addEventListener('click', function () {
    var theme = body.getAttribute('data-theme');
    var newTheme = theme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  /* ------------------------------------------------------------------
     3. 导航：平滑滚动 + 智能隐藏 + 当前分区高亮
  ------------------------------------------------------------------ */
  var navbar = document.getElementById('navbar');
  var lastScroll = 0;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 为分区留出粘性导航的高度
  document.querySelectorAll('section[id]').forEach(function (s) {
    s.style.scrollMarginTop = '90px';
  });

  /* ------------------------------------------------------------------
     4. 顶部进度条 + 分节圆点
  ------------------------------------------------------------------ */
  var progressFill = document.getElementById('progress-fill');
  var checkpoints = document.querySelectorAll('.checkpoint');
  var sectionsForSpy = ['hero', 'about', 'hobbies', 'skills', 'projects', 'education', 'contact'];

  checkpoints.forEach(function (cp) {
    cp.addEventListener('click', function () {
      var target = document.getElementById(cp.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function updateProgressBar() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(1, window.scrollY / docHeight) : 0;
    progressFill.style.width = (progress * 100) + '%';
  }

  function updateCheckpoints() {
    var currentId = sectionsForSpy[0];
    sectionsForSpy.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      // offsetTop 受最近 positioned 祖先影响，这里换算成文档坐标
      var top = el.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY + window.innerHeight * 0.35 >= top) {
        currentId = id;
      }
    });
    checkpoints.forEach(function (cp) {
      cp.classList.toggle('active', cp.getAttribute('data-target') === currentId);
    });
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  /* ------------------------------------------------------------------
     5. Hero：照片倾斜 + 终端图标坠落（首次滚动触发，悬停照片复位）
  ------------------------------------------------------------------ */
  var photoTilted = false;
  var heroPhoto = document.getElementById('hero-photo');
  var terminalFallen = false;
  var decoTerminal = document.getElementById('deco-terminal');
  var heroContent = document.querySelector('.hero-content');

  function calculateFallDistance() {
    if (!decoTerminal || !heroContent) return;
    var heroRect = heroContent.getBoundingClientRect();
    var termRect = decoTerminal.getBoundingClientRect();
    var fall = Math.max(0, heroRect.bottom - termRect.bottom - 50);
    decoTerminal.style.setProperty('--fall-distance', fall + 'px');
  }
  calculateFallDistance();
  window.addEventListener('resize', calculateFallDistance);

  heroPhoto.addEventListener('mouseenter', function () {
    heroPhoto.classList.remove('tilted');
  });
  heroPhoto.addEventListener('mouseleave', function () {
    if (photoTilted) heroPhoto.classList.add('tilted');
  });

  /* ------------------------------------------------------------------
     6. 纸撕裂视差：缝隙收拢 + 胶带贴纸飞入
  ------------------------------------------------------------------ */
  var pageGap = document.getElementById('page-gap');
  var paperTearBottom = document.getElementById('paper-tear-bottom');
  var tapeSticker = document.getElementById('tear-tape-sticker');

  var TEAR_INITIAL_GAP = 300;
  var TEAR_SCROLL_START = 100;
  var TEAR_SCROLL_RANGE = 200;
  var STICKER_DELAY = 30;
  var STICKER_START = TEAR_SCROLL_START + TEAR_SCROLL_RANGE + STICKER_DELAY;
  var STICKER_RANGE = 60;

  function updateGapParallax() {
    if (!pageGap || !paperTearBottom) return;
    if (window.innerWidth <= 768) return; // 移动端跳过
    if (prefersReducedMotion) {
      pageGap.style.height = '0px';
      return;
    }

    var scrollY = window.scrollY;
    var grayPath = paperTearBottom.querySelector('path[fill="#d0d0d0"]');

    function setSticker(tx, ty, rx, op) {
      if (!tapeSticker) return;
      tapeSticker.style.transform =
        'rotate(-8deg) translateY(' + ty + 'px) translateZ(' + tx + 'px) rotateX(' + rx + 'deg)';
      tapeSticker.style.opacity = op;
    }

    function placeStickerXY() {
      if (!tapeSticker || !paperTearBottom) return;
      var rect = paperTearBottom.getBoundingClientRect();
      tapeSticker.style.left = (rect.left + rect.width * 0.55) + 'px';
      tapeSticker.style.top = (rect.top + 6) + 'px';
    }

    if (scrollY <= TEAR_SCROLL_START) {
      pageGap.style.setProperty('height', TEAR_INITIAL_GAP + 'px', 'important');
      paperTearBottom.style.setProperty('margin-top', '0px', 'important');
      if (grayPath) grayPath.style.opacity = '1';
      setSticker(30, -40, 35, 0);
    } else if (scrollY <= TEAR_SCROLL_START + TEAR_SCROLL_RANGE) {
      var p = (scrollY - TEAR_SCROLL_START) / TEAR_SCROLL_RANGE;
      var h = TEAR_INITIAL_GAP - (TEAR_INITIAL_GAP + 30) * p;
      if (h >= 0) {
        pageGap.style.setProperty('height', h + 'px', 'important');
        paperTearBottom.style.setProperty('margin-top', '0px', 'important');
        if (grayPath) grayPath.style.opacity = '1';
      } else {
        pageGap.style.setProperty('height', '0px', 'important');
        paperTearBottom.style.setProperty('margin-top', h + 'px', 'important');
        var op = 1 - Math.abs(h) / 30;
        if (grayPath) grayPath.style.opacity = op;
      }
      setSticker(50, -100, 45, 0);
    } else if (scrollY > STICKER_START && scrollY < STICKER_START + STICKER_RANGE) {
      pageGap.style.setProperty('height', '0px', 'important');
      paperTearBottom.style.setProperty('margin-top', '-30px', 'important');
      if (grayPath) grayPath.style.opacity = '0';
      placeStickerXY();
      var sp = (scrollY - STICKER_START) / STICKER_RANGE;
      var ty = -40 + 40 * sp;
      var tz = 30 - 30 * sp;
      var rx = 35 - 35 * sp;
      var so = Math.min(1, Math.max(0, (sp - 0.35) * 1.54));
      setSticker(tz, ty, rx, so);
    } else if (scrollY >= STICKER_START + STICKER_RANGE) {
      pageGap.style.setProperty('height', '0px', 'important');
      paperTearBottom.style.setProperty('margin-top', '-30px', 'important');
      if (grayPath) grayPath.style.opacity = '0';
      placeStickerXY();
      setSticker(0, 0, 0, 1);
    } else {
      pageGap.style.setProperty('height', '0px', 'important');
      paperTearBottom.style.setProperty('margin-top', '-30px', 'important');
      if (grayPath) grayPath.style.opacity = '0';
      setSticker(30, -40, 35, 0);
    }
  }

  /* ------------------------------------------------------------------
     7. 荧光笔标记：随滚动从左/右逐渐涂满
  ------------------------------------------------------------------ */
  var highlights = document.querySelectorAll('.highlight');
  var highlightData = new Map();

  highlights.forEach(function (hl, index) {
    var direction = index % 2 === 0 ? 'left' : 'right';
    hl.setAttribute('data-direction', direction);
    highlightData.set(hl, { hasStarted: false, startScroll: 0 });
  });

  function updateHighlights() {
    var scrollY = window.scrollY;
    var trigger = scrollY + window.innerHeight * 0.8;

    highlights.forEach(function (hl) {
      var rect = hl.getBoundingClientRect();
      var elementTop = rect.top + scrollY;
      var data = highlightData.get(hl);

      if (!data.hasStarted && trigger >= elementTop) {
        data.hasStarted = true;
        data.startScroll = scrollY;
      }
      if (data.hasStarted) {
        var p = Math.min(1, Math.max(0, (scrollY - data.startScroll) / 100));
        hl.style.setProperty('--highlight-progress', (p * 100) + '%');
      }
      if (data.hasStarted && scrollY < data.startScroll - 50) {
        data.hasStarted = false;
        hl.style.setProperty('--highlight-progress', '0%');
      }
    });
  }

  /* ------------------------------------------------------------------
     8. 入场动画（IntersectionObserver）
   ------------------------------------------------------------------ */
  var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section, .skill-box, .project-card').forEach(function (el) {
    observer.observe(el);
  });

  /* ------------------------------------------------------------------
     9. 联系方式点击获取（微信弹窗/复制，邮箱直接跳转）
   ------------------------------------------------------------------ */
  var contactToast = null;

  function createContactToast() {
    if (contactToast) return;
    contactToast = document.createElement('div');
    contactToast.className = 'contact-toast';
    contactToast.innerHTML = '<i class="fas fa-check-circle"></i> <span class="contact-toast-text"></span>';
    document.body.appendChild(contactToast);
  }

  function showToast(message, duration) {
    createContactToast();
    var text = contactToast.querySelector('.contact-toast-text');
    text.textContent = message;
    contactToast.classList.add('show');
    setTimeout(function () {
      contactToast.classList.remove('show');
    }, duration || 2500);
  }

  function copyTextFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      // ignore
    }
    document.body.removeChild(ta);
  }

  var wechatPopup = document.getElementById('wechat-popup');
  var wechatPopupBack = document.getElementById('wechat-popup-back');
  var wechatPopupClose = document.getElementById('wechat-popup-close');

  function openWechatPopup() {
    if (!wechatPopup) return;
    wechatPopup.classList.add('is-open');
    wechatPopup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeWechatPopup() {
    if (!wechatPopup) return;
    wechatPopup.classList.remove('is-open');
    wechatPopup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.contact-reveal, .wechat-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var type = btn.getAttribute('data-contact');

      if (type === 'wechat' || btn.classList.contains('wechat-trigger')) {
        openWechatPopup();
      }
    });
  });

  if (wechatPopupBack) wechatPopupBack.addEventListener('click', closeWechatPopup);
  if (wechatPopupClose) wechatPopupClose.addEventListener('click', closeWechatPopup);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && wechatPopup && wechatPopup.classList.contains('is-open')) {
      closeWechatPopup();
    }
  });

  /* ------------------------------------------------------------------
     10. Hero 问候语：乱码打字机效果
   ------------------------------------------------------------------ */
  var greetingElement = document.getElementById('hero-greeting');
  var finalText = 'Hi，你好呀 👋';
  var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  function matrixTypingEffect() {
    var iterations = 0;
    var interval = setInterval(function () {
      greetingElement.textContent = finalText
        .split('')
        .map(function (char, index) {
          if (index < iterations) return finalText[index];
          if (char === ' ' || char === '，' || char === '👋') return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join('');

      if (iterations >= finalText.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 50);
  }

  setTimeout(matrixTypingEffect, 500);

  /* ------------------------------------------------------------------
     12. 统一的滚动处理器
  ------------------------------------------------------------------ */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var currentScroll = window.pageYOffset;

      // 智能导航：向下滚隐藏，向上滚出现
      if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScroll < lastScroll) {
        navbar.classList.remove('navbar-hidden');
      }

      // 首次滚动：照片倾斜 + 终端坠落
      if (!photoTilted && currentScroll > 5) {
        heroPhoto.classList.add('tilted');
        photoTilted = true;
      }
      if (!terminalFallen && currentScroll > 5) {
        decoTerminal.classList.add('falling');
        terminalFallen = true;
      }

      updateProgressBar();
      updateCheckpoints();
      updateGapParallax();
      updateHighlights();

      lastScroll = currentScroll;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    updateGapParallax();
  });

  // 初始化时同步一次状态
  requestAnimationFrame(function () {
    updateProgressBar();
    updateCheckpoints();
    updateGapParallax();
    updateHighlights();
  });
  /* ------------------------------------------------------------------
     13. 爱好手帐：3D 翻页（滚轮 / 拖拽 / 按钮） + 照片放大弹窗
     还原参考站 OWARI DIARY 的书本翻页与弹窗节奏
   ------------------------------------------------------------------ */
  var diaryScene = document.getElementById('diary-scene');
  var diaryBook = document.getElementById('diary-book');
  var diaryPages = Array.prototype.slice.call(document.querySelectorAll('.diary-page'));
  var diaryPrevBtn = document.getElementById('diary-prev');
  var diaryNextBtn = document.getElementById('diary-next');
  var diaryPager = document.getElementById('diary-pager');

  var diaryCurrent = 0;
  var diaryLock = false;
  var DIARY_FLIP_MS = 950; // 与 CSS transition 时长匹配
  var diarySuppressClick = false;

  function diaryPad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function diaryApplyStack() {
    diaryPages.forEach(function (page, i) {
      if (i < diaryCurrent) {
        page.style.zIndex = 10 + i;               // 已翻过的页：越后翻越在上
      } else {
        page.style.zIndex = 100 + (diaryPages.length - i); // 未翻的页：当前页最上
      }
    });
  }

  function diaryRender() {
    diaryPages.forEach(function (page, i) {
      page.classList.toggle('is-flipped', i < diaryCurrent);
    });
    diaryApplyStack();
    if (diaryPager) {
      diaryPager.innerHTML = '<b>' + diaryPad(diaryCurrent + 1) + '</b> / ' + diaryPad(diaryPages.length);
    }
    if (diaryPrevBtn) diaryPrevBtn.disabled = diaryCurrent === 0;
    if (diaryNextBtn) diaryNextBtn.disabled = diaryCurrent === diaryPages.length - 1;
  }

  function diaryGo(index) {
    if (diaryLock) return;
    var target = Math.max(0, Math.min(diaryPages.length - 1, index));
    if (target === diaryCurrent) return;

    // 正在翻转的那一页临时置顶，翻完再归位
    var movingIndex = target > diaryCurrent ? diaryCurrent : target;
    var movingPage = diaryPages[movingIndex];
    movingPage.style.zIndex = 600;

    diaryCurrent = target;
    diaryLock = true;
    diaryRender();
    movingPage.style.zIndex = 600;

    setTimeout(function () {
      diaryLock = false;
      diaryApplyStack();
    }, DIARY_FLIP_MS);
  }

  if (diaryPages.length) {
    diaryRender();

    if (diaryPrevBtn) diaryPrevBtn.addEventListener('click', function () { diaryGo(diaryCurrent - 1); });
    if (diaryNextBtn) diaryNextBtn.addEventListener('click', function () { diaryGo(diaryCurrent + 1); });

    /* 滚轮翻页：光标在书本上时，滚轮前后翻页（不阻断页面滚动） */
    if (diaryScene && !prefersReducedMotion) {
      var diaryWheelLock = false;
      diaryScene.addEventListener('wheel', function (e) {
        var rect = diaryScene.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.8 || rect.bottom < window.innerHeight * 0.2) return;
        if (Math.abs(e.deltaY) < 5) return;
        if (diaryWheelLock) return;
        diaryWheelLock = true;
        setTimeout(function () { diaryWheelLock = false; }, 1000);
        if (e.deltaY > 0) {
          diaryGo(diaryCurrent + 1);
        } else {
          diaryGo(diaryCurrent - 1);
        }
      }, { passive: true });
    }

    /* 左右拖拽翻页：grab / grabbing 光标 */
    var diaryDragX = null;
    var diaryDragMoved = false;

    if (diaryBook) {
      diaryBook.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        diaryDragX = e.clientX;
        diaryDragMoved = false;
      });

      window.addEventListener('pointermove', function (e) {
        if (diaryDragX === null) return;
        if (Math.abs(e.clientX - diaryDragX) > 12) {
          diaryDragMoved = true;
          diaryBook.classList.add('is-dragging');
        }
      });

      window.addEventListener('pointerup', function (e) {
        if (diaryDragX === null) return;
        var dx = e.clientX - diaryDragX;
        if (diaryDragMoved && Math.abs(dx) > 60) {
          if (dx < 0) {
            diaryGo(diaryCurrent + 1);
          } else {
            diaryGo(diaryCurrent - 1);
          }
        }
        if (diaryDragMoved) {
          diarySuppressClick = true;
          setTimeout(function () { diarySuppressClick = false; }, 150);
        }
        diaryDragX = null;
        diaryDragMoved = false;
        diaryBook.classList.remove('is-dragging');
      });
    }
  }

  /* 照片放大弹窗：深色遮罩 + 内容上滑入场 + 底部关闭 */
  var diaryPopup = document.getElementById('diary-popup');

  function openDiaryPopup(page) {
    if (!diaryPopup || !page) return;
    var photo = page.querySelector('.polaroid-photo');
    var title = page.querySelector('.diary-title');
    var desc = page.querySelector('.sticky-note');
    var tags = page.querySelectorAll('.hobby-tag');

    var popupImg = document.getElementById('diary-popup-img');
    if (popupImg && photo) {
      popupImg.src = photo.src || '';
      popupImg.alt = photo.alt || (title ? title.textContent : '');
    }

    document.getElementById('diary-popup-title').textContent = title ? title.textContent : '';
    document.getElementById('diary-popup-desc').textContent = desc ? desc.textContent.trim() : '';

    var tagBox = document.getElementById('diary-popup-tags');
    if (tagBox) {
      tagBox.innerHTML = '';
      tags.forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'hobby-tag';
        span.textContent = t.textContent;
        tagBox.appendChild(span);
      });
    }

    diaryPopup.classList.add('is-open');
    diaryPopup.setAttribute('aria-hidden', 'false');
    if (diaryScene) diaryScene.classList.add('is-dim');
    document.body.style.overflow = 'hidden';
  }

  function closeDiaryPopup() {
    if (!diaryPopup) return;
    diaryPopup.classList.remove('is-open');
    diaryPopup.setAttribute('aria-hidden', 'true');
    if (diaryScene) diaryScene.classList.remove('is-dim');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.polaroid').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (diarySuppressClick) return;
      var idx = parseInt(btn.getAttribute('data-hobby'), 10);
      openDiaryPopup(diaryPages[idx]);
    });
  });

  if (diaryPopup) {
    var popupBack = document.getElementById('diary-popup-back');
    var popupCloseBtn = document.getElementById('diary-popup-close');
    if (popupBack) popupBack.addEventListener('click', closeDiaryPopup);
    if (popupCloseBtn) popupCloseBtn.addEventListener('click', closeDiaryPopup);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDiaryPopup();
    });
  }
})();