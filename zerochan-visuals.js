(function( $ ) {
  // converts image into a visualisation container
  $.fn.visualize = function(preset) {
    preset = preset || 'random'
    if(typeof preset === 'string') {
      if(presets.hasOwnProperty(preset))
        preset = presets[preset]
      else return false
    }
    var cw = preset.cw, ch =  preset.ch, css = preset.css
    , iw = this.width(), ih = this.height()
    , imgID = this.attr('id'), imgCl = this.attr('class')
    , repID = imgID ? ' id="'+imgID+'"'    : ''
    , repCl = imgCl ? ' class="'+imgCl+'"' : ''
    if(cw === '100%') cw = iw;
    if(ch === '100%') ch = ih;
    var hcc = Math.ceil(iw / cw), vcc = Math.ceil(ih / ch)
    , hrm = iw % cw, vrm = ih % ch
    , $replacement = $('<div'+repID+repCl+' style="height:'+ih+'px; width:'+iw+'px; display: inline-block; position: relative" class="grid-wrap">'+this[0].outerHTML+'</div>')
    var $container = $('<div class="hovergrid cell-grid"></div>')
    $replacement.append($container)
    var rows = 0, cols = 0, lastRow = false, lastCol = false
    , cells = []
    for( ; rows < vcc; rows++) {
      lastRow = (rows === (vcc-1))
      for( ; cols < hcc; cols++) {
        lastCol = (cols === (hcc-1))
        var style = 'background-position: '+(-(cw * cols))+'px '+(-(ch * rows))+'px;';
        if(vrm && lastRow)
          style += ' height:'+vrm+'px;'
        if(hrm && lastCol)
          style += ' width:'+hrm+'px;'
        var $cell = $('<div class="cell" id="cell_'+(rows+1)+'_'+(cols+1)+'" style="'+style+'"></div>')
        $cell.on('mouseenter', function() {
          $(this).flash()
        })
        cells.push($cell)
        $container.append($cell)
      }
      if(!lastRow) $container.append('<br>');
      cols = 0;
    }
    injector.inject('cells', '.cell {height: '+ch+'px; width: '+cw+'px; background-image: url('+getBrightenImg(this[0])+');'+ (css || '') +'}');
    this.removeAttr('id').removeAttr('class').replaceWith($replacement);
    return cells
  }

  // animation of cell
  $.fn.flash = function() {
    if(!this.length || this.hasClass('cell-hover')) return;
    this.addClass('cell-hover');
    var self = this;
    setTimeout(function() {
      self.removeClass('cell-hover');
    }, 250);
  };

  $.VZaddPreset = function(name, preset) {
    visuals[name] = preset;
  }

  var presets = {
    circles: {cw: 30, ch: 30, css: 'box-shadow: 0 0 5px #111; border-radius: 50px;'},
    rows: {cw: '100%', ch: 2},
    columns: {cw: 2, ch: '100%'},
    smallBoxes: {cw: 20, ch: 20},
    bigBoxes: {cw: 50, ch: 50}
  }

  Object.defineProperty(presets, 'random', {
    enumerable: false,
    get: function() {
      return this[pickRandomProperty(this)]
    }
  })
  
  var canvasInitiated = false, hcnv, cctx

  function initCanvas() {
    hcnv = document.createElement('canvas')
    hcnv.style.display = 'none'
    cctx = hcnv.getContext('2d')
    document.body.appendChild(hcnv)
    canvasInitiated = true
  }

  function getBrightenImg(img) {
    if(!canvasInitiated)
      initCanvas()
    hcnv.width = img.width
    hcnv.height = img.height
    cctx.drawImage(img,0,0)
    var imageData = cctx.getImageData(0,0,hcnv.width,hcnv.height)
    , d = imageData.data
    for (var i=0; i<d.length; i+=4) {
      d[i] = 255
      d[i+1] = 255
      d[i+2] = 255
    }
    cctx.clearRect(0,0,hcnv.width,hcnv.height)
    cctx.putImageData(imageData,0,0)
    return hcnv.toDataURL()
  }

  var injector = {
    inject: function(alias, css) {
      var head = document.head || document.getElementsByTagName('head')[0]
      , exists = document.getElementById('injector:'+alias);
      if(exists) head.removeChild(exists);
      var style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'injector:'+alias;
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    },
    remove: function(alias) {
      var head = document.head || document.getElementsByTagName('head')[0];
      head.removeChild(document.getElementById('injector:'+alias));
    }
  }

  function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
      if (Math.random() < 1/++count)
        result = prop;
    return result;
  }

  function arrayShuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  }
}( jQuery ));