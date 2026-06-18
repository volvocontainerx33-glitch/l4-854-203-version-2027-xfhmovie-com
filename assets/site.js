(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.getElementById("site-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
      var prev = carousel.querySelector("[data-slide-prev]");
      var next = carousel.querySelector("[data-slide-next]");
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty]");
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var yearMatch = !yearValue || (yearValue === "2020" ? Number(cardYear) <= 2020 : cardYear === yearValue);
          var queryMatch = !query || text.indexOf(query) !== -1;
          var visible = yearMatch && queryMatch;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      apply();
    });
  }

  var hlsQueue = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsQueue.push(callback);
    if (document.querySelector("script[data-hls]")) {
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls", "1");
    script.onload = function () {
      var callbacks = hlsQueue.slice();
      hlsQueue = [];
      callbacks.forEach(function (item) {
        item();
      });
    };
    document.head.appendChild(script);
  }

  function beginVideo(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-stream");
    if (!video || !source) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    function play() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }
    if (video.getAttribute("data-ready") === "1") {
      play();
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "1");
      play();
      return;
    }
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute("data-ready", "1");
          play();
        });
      } else {
        video.src = source;
        video.setAttribute("data-ready", "1");
        play();
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll(".video-shell").forEach(function (shell) {
      var overlay = shell.querySelector(".player-overlay");
      if (overlay) {
        overlay.addEventListener("click", function () {
          beginVideo(shell);
        });
      }
      shell.addEventListener("click", function (event) {
        if (event.target && event.target.closest && event.target.closest("button")) {
          return;
        }
        beginVideo(shell);
      });
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      }, { once: true });
    });
  }

  ready(function () {
    initMenu();
    initCarousel();
    initFilters();
    initPlayers();
    initImages();
  });
})();
