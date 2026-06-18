(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobilePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('is-active', Number(dot.getAttribute('data-hero-dot')) === current);
      });
    }

    function playHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        playHero();
      });
    });

    showSlide(0);
    playHero();
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var section = scope.closest('.content-section');
    if (!section) {
      return;
    }
    var input = scope.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(section.querySelectorAll('.filter-card'));
    var empty = section.querySelector('.empty-state');

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchText = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
        var matchSelects = selects.every(function (select) {
          var field = select.getAttribute('data-filter-field');
          var value = select.value;
          return !value || card.getAttribute('data-' + field) === value;
        });
        var show = matchText && matchSelects;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });
    filterCards();
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = (params.get('q') || '').trim().toLowerCase();
    var searchInput = document.getElementById('search-page-input');
    var state = searchPage.querySelector('[data-search-state]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.search-card'));
    var empty = searchPage.querySelector('.empty-state');

    if (searchInput) {
      searchInput.value = params.get('q') || '';
    }

    function applySearch(query) {
      var visible = 0;
      cards.forEach(function (card) {
        var show = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (state) {
        state.textContent = query ? '搜索结果' : '片库影片';
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    applySearch(queryValue);
  }

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
  playerShells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('.play-cover');
    var src = shell.getAttribute('data-src');
    var hls = null;
    var ready = false;

    function attachSource() {
      if (!video || !src || ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }

    function start() {
      attachSource();
      if (!video) {
        return;
      }
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
