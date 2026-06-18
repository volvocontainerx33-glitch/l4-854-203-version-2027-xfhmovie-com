(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  qsa('[data-mobile-toggle]').forEach(function (button) {
    var target = qs(button.getAttribute('data-mobile-toggle'));
    if (!target) {
      return;
    }
    button.addEventListener('click', function () {
      target.classList.toggle('is-open');
    });
  });

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    carousel.addEventListener('mouseleave', play);
    show(0);
    play();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var scope = document;
    var queryInput = qs('[data-filter-query]', panel);
    var regionSelect = qs('[data-filter-region]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var cards = qsa('[data-filter-card]', scope);

    function apply() {
      var query = (queryInput && queryInput.value || '').trim().toLowerCase();
      var region = regionSelect && regionSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var year = yearSelect && yearSelect.value || '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.textContent).toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        card.classList.toggle('hide-card', !ok);
      });
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }
    apply();
  });
})();
