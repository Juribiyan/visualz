(function($) { //td set audio volume to max
  $.fn.analyze = function(plist, options, forEachFrame, forEachUnit) {
    options = options || {}
    conf = $.extend({}, defaults, options)
    audio = this[0]
    source = audioCtx.createMediaElementSource(audio)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = conf.fftSize
    gainNode = audioCtx.createGain()
    controls.volume = conf.volume //!!
    source.connect(analyser)
    analyser.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    analyser.smoothingTimeConstant = conf.smoothing
    units = new Uint8Array(analyser.frequencyBinCount)
    playList.init(plist)

    draw(forEachFrame, forEachUnit)

    return controls
  }

  var defaults = {
    fftSize: 2048,
    smoothing: 0.2, 
    volume: 1,
    domain: 'time',
    audioDir: 'tracks/'
  }, conf = {}

  var playList = {
    list: [],
    current: null,
    init: function(plist) {
      this.list = plist
      this.load(false)
    },
    get random() {
      console.log(`Random track requested. Current track is ${this.current}, playlist=`, this.list, this.list.size-1)
      while(this.list.length-1) {
        var next = this.list[Math.floor(Math.random()*this.list.length)]
        console.log(`May the next track be ${next}`)
        if(next !== this.current)
          return next
      }
      return this.list[0]
    },
    addSrc: function(name, ext) {
      var mime = (ext.toLowerCase() == 'mp3') ? 'mpeg' : 'ogg'
      $(audio).append('<source src="'+conf.audioDir+name+'.'+ext+'" type="audio/'+mime+'">')
    },
    load: function(immed, track) {
      if(typeof track === 'undefined') 
        track = this.random
      console.log(`About to load audio ${track}${immed ? ' and play it immediately' : ''}.`)
      immed = undefined || false
      var played = !audio.paused
      audio.pause()
      $(audio).find('source').remove()
      var match = /(.+?)\.(mp3|ogg)$/i.exec(track);
      if(match) {
        addSrc(match[0], match[1])
      }
      else {
        ['ogg', 'mp3'].forEach((function(ext) {
          this.addSrc(track, ext)
        }).bind(this))
      }
      audio.load()
      if(immed || played)
        audio.play()
      this.current = track
    }
  }

  var audio, source, analyser, gainNode, units, domain;

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  var controls = {
    set volume(val) {
      gainNode.gain.value = val
    },
    set position(pos) {
      audio.currentTime = audio.duration * pos
    },
    set smoothing(val) {
      conf.smoothing = val
    },
    set domain(d) {
      conf.domain = (d==='frequency') ? d : 'time'
    },
    set fftSize(size) {
      conf.fftSize = size
    },
    playPause: function() {
      if(audio.paused)
        audio.play()
      else
        audio.pause()
    },
    switchTrack: function() {
      playList.load(true)
    }
  }

  function draw(forEachFrame, forEachUnit) {
    if(conf.domain == 'frequency')
      analyser.getByteFrequencyData(units)
    else 
      analyser.getByteTimeDomainData(units)

    if(forEachFrame)
      forEachFrame(units)

    if(forEachUnit) {
      for (var i = 0; i < analyser.frequencyBinCount; i++) {
        forEachUnit(i, units[i] / 256)
      }
    }
    frame(function() {
      draw(forEachFrame, forEachUnit)
    })
  }

  var frame = (function() {
  return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function( callback ) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
}(jQuery));