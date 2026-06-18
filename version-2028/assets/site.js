(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            body.classList.toggle('menu-open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var setSlide = function (next) {
            if (!slides.length) {
                return;
            }

            current = (next + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === current);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === current);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5000);
        };

        hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                setSlide(current + 1);
                startTimer();
            });
        });

        hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                setSlide(current - 1);
                startTimer();
            });
        });

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-title]'));
        var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
        var regionSelect = filterRoot.querySelector('[data-filter-region]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var emptyState = filterRoot.querySelector('[data-empty-state]');

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var applyFilters = function () {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
                var show = matchesKeyword && matchesRegion && matchesType && matchesYear;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && keywordInput) {
            keywordInput.value = query;
        }

        applyFilters();
    }

    var searchForm = document.querySelector('[data-search-form]');

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = searchForm.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
        });
    }

    var playerFrame = document.querySelector('[data-stream-url]');

    if (playerFrame) {
        var video = playerFrame.querySelector('video');
        var playLayer = playerFrame.querySelector('[data-play-layer]');
        var streamUrl = playerFrame.getAttribute('data-stream-url');
        var ready = false;
        var hls = null;

        var loadVideo = function () {
            if (!video || !streamUrl || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            ready = true;
        };

        var startPlayback = function () {
            loadVideo();

            if (playLayer) {
                playLayer.classList.add('is-hidden');
            }

            if (video) {
                video.controls = true;
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        };

        if (playLayer) {
            playLayer.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }
})();
