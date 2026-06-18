(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = select('[data-menu-toggle]');
    var nav = select('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = select('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = select('[data-hero-prev]', hero);
    var next = select('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCatalogFilter() {
    var grid = select('[data-filter-grid]');
    var input = select('[data-filter-input]');
    var year = select('[data-filter-year]');
    var count = select('[data-filter-count]');
    if (!grid || (!input && !year)) {
      return;
    }

    var cards = selectAll('.catalog-card', grid);

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var yearValue = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || selectedYear === yearValue;
        var isVisible = matchKeyword && matchYear;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  function initGlobalSearch() {
    var input = select('[data-global-search-input]');
    var button = select('[data-global-search-button]');
    var results = select('[data-global-search-results]');
    var summary = select('[data-global-search-summary]');
    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__link" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="movie-card__poster">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
        '      <span class="movie-card__score">' + movie.score + '</span>',
        '      <span class="movie-card__play">▶</span>',
        '    </div>',
        '    <div class="movie-card__body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-card__meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '      <div class="movie-card__genre">' + escapeHtml(movie.genre) + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch() {
      var keyword = normalize(input.value);
      var matched = [];

      if (keyword) {
        matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.genre,
            movie.year,
            movie.tags,
            movie.oneLine
          ].join(' '));
          return haystack.indexOf(keyword) !== -1;
        });
      }

      if (!keyword) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '请输入关键词开始搜索。';
        }
        return;
      }

      if (summary) {
        summary.textContent = '找到 ' + matched.length + ' 部相关影片。';
      }

      results.innerHTML = matched.slice(0, 240).map(cardTemplate).join('');
    }

    if (button) {
      button.addEventListener('click', runSearch);
    }

    input.addEventListener('input', runSearch);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      runSearch();
    }
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = select('video', shell);
      var start = select('[data-player-start]', shell);
      var status = select('[data-player-status]', shell);
      var src = shell.getAttribute('data-src');
      var hlsInstance = null;

      if (!video || !src) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (video.getAttribute('data-source-attached') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.setAttribute('data-source-attached', 'true');
          setStatus('播放源已就绪');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute('data-source-attached', 'true');
            setStatus('播放源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setStatus('播放源加载中，请稍后重试');
          });
          return;
        }

        video.src = src;
        video.setAttribute('data-source-attached', 'true');
        setStatus('浏览器将尝试直接播放');
      }

      function togglePlay() {
        attachSource();
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              setStatus('请再次点击播放');
            });
          }
        } else {
          video.pause();
        }
      }

      if (start) {
        start.addEventListener('click', togglePlay);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          togglePlay();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
        setStatus('已暂停');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        setStatus('播放结束');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      attachSource();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCatalogFilter();
    initGlobalSearch();
    initPlayers();
  });
})();
