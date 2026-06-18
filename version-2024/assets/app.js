(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = $('[data-nav-toggle]');
  var mobilePanel = $('[data-mobile-panel]');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function() {
      mobilePanel.classList.toggle('open');
    });
  }

  $all('img').forEach(function(img) {
    img.addEventListener('error', function() {
      img.classList.add('opacity-0');
    });
  });

  var hero = $('[data-hero]');
  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(next, 5000);
      }
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    var prevBtn = $('[data-hero-prev]', hero);
    var nextBtn = $('[data-hero-next]', hero);

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        show(current - 1);
        restart();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        restart();
      });
    });

    show(0);
    start();
  }

  var filterRoot = $('[data-filter-root]');
  if (filterRoot) {
    var input = $('[data-filter-input]', filterRoot);
    var cards = $all('[data-title]', filterRoot);
    var buttons = $all('[data-filter-button]', filterRoot);
    var empty = $('[data-empty-hint]', filterRoot);
    var activeCategory = '全部';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();

        var category = card.getAttribute('data-category') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === '全部' || category === activeCategory;
        var visible = matchText && matchCategory;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        buttons.forEach(function(item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeCategory = button.getAttribute('data-filter-button') || '全部';
        applyFilter();
      });
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', applyFilter);
    }

    applyFilter();
  }
})();
