(function () {
  function init(config) {
    var video = document.getElementById(config.videoId);
    var layer = document.getElementById(config.layerId);
    var streamUrl = config.url;
    var attached = false;
    var hls;

    function attach() {
      if (attached || !video || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached || video.paused) {
          start();
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.StaticPlayer = {
    init: init
  };
})();
