(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('.hero-dot', slider);
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initPlayer() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('.movie-player');
      var button = shell.querySelector('.player-start');
      var hlsUrl = shell.getAttribute('data-hls');
      var attached = false;
      var hlsInstance = null;

      function attachMedia() {
        if (attached || !video || !hlsUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = hlsUrl;
        }
      }

      function startPlayback() {
        attachMedia();
        if (button) {
          button.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button && video) {
        button.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
          }
        });
        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeHTML(movie.url) + '" title="' + escapeHTML(movie.title) + ' 在线观看">' +
        '<span class="poster-frame">' +
          '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + ' 高清封面" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="duration">' + escapeHTML(movie.duration) + '</span>' +
          '<span class="score">★ ' + escapeHTML(movie.rating) + '</span>' +
          '<span class="play-circle">▶</span>' +
        '</span>' +
        '<span class="movie-card-body">' +
          '<span class="card-meta-line">' +
            '<span class="category-pill">' + escapeHTML(movie.category) + '</span>' +
            '<span>' + escapeHTML(movie.year) + '</span>' +
          '</span>' +
          '<strong>' + escapeHTML(movie.title) + '</strong>' +
          '<span class="card-desc">' + escapeHTML(movie.desc) + '</span>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
  }

  function initSearch() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var region = document.getElementById('regionFilter');
    var type = document.getElementById('typeFilter');
    var genre = document.getElementById('genreFilter');
    var year = document.getElementById('yearFilter');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
    }

    function read(select) {
      return select ? select.value.trim().toLowerCase() : '';
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var regionValue = read(region);
      var typeValue = read(type);
      var genreValue = read(genre);
      var yearValue = read(year);
      var filtered = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.desc,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okRegion = !regionValue || String(movie.region || '').toLowerCase() === regionValue;
        var okType = !typeValue || String(movie.type || '').toLowerCase() === typeValue;
        var okGenre = !genreValue || String(movie.genre || '').toLowerCase().indexOf(genreValue) !== -1;
        var okYear = !yearValue || String(movie.year || '').toLowerCase() === yearValue;
        return okQuery && okRegion && okType && okGenre && okYear;
      }).slice(0, 96);
      if (!filtered.length) {
        results.innerHTML = '<div class="detail-text"><p>没有找到匹配影片，换一个关键词试试。</p></div>';
        return;
      }
      results.innerHTML = filtered.map(createCard).join('');
    }

    [input, region, type, genre, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPlayer();
    initSearch();
  });
}());
