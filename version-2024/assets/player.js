(function() {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var button = box.querySelector('[data-player-button]');
    var status = box.querySelector('[data-player-status]');
    var streamUrl = video ? video.getAttribute('data-stream') : '';

    if (!video || !streamUrl) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function markReady() {
      setStatus('准备播放');
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', markReady);
    } else {
      video.src = streamUrl;
      setStatus('点击播放');
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          setStatus('点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function() {
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function() {
        playVideo();
      });
    }

    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('hide');
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function() {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('hide');
      }
      if (video.currentTime > 0 && !video.ended) {
        setStatus('已暂停');
      }
    });

    video.addEventListener('ended', function() {
      if (overlay) {
        overlay.classList.remove('hide');
      }
      setStatus('播放结束');
    });

    video.addEventListener('click', function() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(setupPlayer);
})();
