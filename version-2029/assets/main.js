(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    play();
  }

  function yearMatched(value, filter) {
    var year = Number(value || 0);
    if (!filter) {
      return true;
    }
    if (filter === 'classic') {
      return year > 0 && year < 2010;
    }
    return year >= Number(filter);
  }

  function setupListing(listing) {
    var cards = selectAll('[data-movie-card]', listing);
    if (!cards.length) {
      return;
    }
    var search = listing.querySelector('[data-search]');
    var region = listing.querySelector('[data-region-filter]');
    var year = listing.querySelector('[data-year-filter]');
    var empty = listing.querySelector('[data-empty-state]');

    function apply() {
      var q = text(search && search.value);
      var r = text(region && region.value);
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardRegion = text(card.getAttribute('data-region'));
        var cardYear = card.getAttribute('data-year');
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && cardRegion.indexOf(r) === -1) {
          ok = false;
        }
        if (!yearMatched(cardYear, y)) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-mask');
      var stream = box.getAttribute('data-stream');
      var started = false;
      var hls = null;

      if (!video || !button || !stream) {
        return;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      function start() {
        if (started) {
          button.classList.add('is-hidden');
          playVideo();
          return;
        }
        started = true;
        button.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(stream);
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hls.destroy();
              } catch (error) {
                hls = null;
              }
              video.src = stream;
            }
          });
          return;
        }

        video.src = stream;
        playVideo();
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    selectAll('[data-listing]').forEach(setupListing);
    setupPlayers();
  });
}());
