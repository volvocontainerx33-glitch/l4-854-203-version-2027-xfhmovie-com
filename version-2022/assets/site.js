(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs("[data-menu-toggle]");
    var mobilePanel = qs("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    qsa("img").forEach(function (img) {
        img.addEventListener("error", function () {
            img.style.opacity = "0";
        });
    });

    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    var prev = qs("[data-hero-prev]");
    var next = qs("[data-hero-next]");
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === active);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === active);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();

        if (prev) {
            prev.addEventListener("click", function () {
                stopHero();
                showSlide(active - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                stopHero();
                showSlide(active + 1);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                stopHero();
                showSlide(i);
            });
        });
    }

    var filterRoot = qs("[data-filter-root]");

    if (filterRoot) {
        var queryInput = qs("[data-filter-query]", filterRoot);
        var regionInput = qs("[data-filter-region]", filterRoot);
        var yearInput = qs("[data-filter-year]", filterRoot);
        var typeInput = qs("[data-filter-type]", filterRoot);
        var cards = qsa("[data-movie-card]", filterRoot);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        function read(input) {
            return input ? input.value.trim().toLowerCase() : "";
        }

        function applyFilter() {
            var query = read(queryInput);
            var region = read(regionInput);
            var year = read(yearInput);
            var type = read(typeInput);

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" ").toLowerCase();

                var visible = true;

                if (query && haystack.indexOf(query) === -1) {
                    visible = false;
                }

                if (region && (card.dataset.region || "").toLowerCase().indexOf(region) === -1) {
                    visible = false;
                }

                if (year && (card.dataset.year || "").toLowerCase() !== year) {
                    visible = false;
                }

                if (type && (card.dataset.type || "").toLowerCase().indexOf(type) === -1) {
                    visible = false;
                }

                card.classList.toggle("hidden", !visible);
            });
        }

        [queryInput, regionInput, yearInput, typeInput].forEach(function (input) {
            if (input) {
                input.addEventListener("input", applyFilter);
                input.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }

    qsa("[data-quick-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = qs("input", form);
            var q = input ? input.value.trim() : "";
            var target = "./search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
            window.location.href = target;
        });
    });

    var playerShell = qs("[data-player-shell]");

    if (playerShell) {
        var video = qs("video", playerShell);
        var trigger = qs("[data-play-trigger]", playerShell);
        var started = false;
        var hls = null;

        function startPlayer() {
            if (!video || started) {
                if (video) {
                    video.play().catch(function () {});
                }
                return;
            }

            started = true;
            playerShell.classList.add("playing");
            video.setAttribute("controls", "controls");

            var stream = video.dataset.stream;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = stream;
                video.play().catch(function () {});
            }
        }

        playerShell.addEventListener("click", startPlayer);

        if (trigger) {
            trigger.addEventListener("click", function (event) {
                event.stopPropagation();
                startPlayer();
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
