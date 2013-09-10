$(function() {
  var chooseRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
  };
  var NArray = function(sizes, defVal) {
    var length = sizes.shift();
    if (length) {
      var newArray = [];
      for (var i = length; i--;) {
        newArray.push(NArray(sizes.slice(), defVal));
      }
      return newArray;
    } else {
      return defVal;
    }
  };
  var createNArray = function(sizes, defVal) {
    if (!Array.isArray(sizes)) {
      sizes = [sizes];
    }
    var narray = NArray(sizes, defVal);
    narray.swap = function(m, n) {
      if (!Array.isArray(m)) {
        m = [m];
      }
      if (!Array.isArray(n)) {
        n = [n];
      }
      var tmpM = this;
      for (var i = 0, il = m.length - 1; i < il; i++) {
        tmpM = tmpM[m[i]];
      }
      var tmpN = this;
      for (var j = 0, jl = m.length - 1; j < jl; j++) {
        tmpN = tmpN[n[j]];
      }
      var tmp = tmpM[m[i]];
      tmpM[m[i]] = tmpN[n[j]];
      tmpN[n[j]] = tmp;
    };
    return narray;
  };
  var X = 8;
  var Y = 8;
  var netas = ['nori', 'shari', 'toro', 'salmon'];
  netas.chooseRandom = chooseRandom;
  var $window = $(window);
  var manaitaSize = Math.min($window.height(), $window.width());
  var $manaita = $('#manaita');
  $manaita.css({
    height: manaitaSize,
    width: manaitaSize
  });
  var cellSize = manaitaSize / X;
  var cellMoveBound = cellSize / 4;
  var magnifier = 10;
  var grid = createNArray([Y, X]);
  var animeDuration = 200;
  var swapCell = function(cA, cB) {
    var ax = cA[1];
    var ay = cA[0];
    var bx = cB[1];
    var by = cB[0];
    var a = grid[ay][ax];
    var b = grid[by][bx];
    a.data('x', bx);
    a.data('y', by);
    b.data('x', ax);
    b.data('y', ay);
    a.animate({
      top: cellSize * by,
      left: cellSize * bx
    },
    animeDuration);
    b.animate({
      top: cellSize * ay,
      left: cellSize * ax
    },
    animeDuration);
    grid.swap(cA, cB);
  }
  for (var i = 0; i < Y; i++) {
    for (var j = 0; j < X; j++) {
      var $cell = $('<div></div>', {
        'class': 'cell'
      });
      $cell.addClass(netas.chooseRandom());
      $cell.data({
        x: j,
        y: i
      });
      $cell.css({
        height: cellSize,
        width: cellSize,
        top: cellSize * i,
        left: cellSize * j
      });
      //$cell.hover(function(e) {
      //  e.preventDefault();
      //  var $this = $(this);
      //  var pos = $this.position();
      //  $this.css({
      //    height: cellSize + magnifier * 2,
      //    width: cellSize + magnifier * 2,
      //    top: pos.top - magnifier,
      //    left: pos.left - magnifier,
      //    'z-index': 99
      //  });
      //},
      //function(e) {
      //  e.preventDefault();
      //  var $this = $(this);
      //  var pos = $this.position();
      //  $this.css({
      //    height: cellSize,
      //    width: cellSize,
      //    top: pos.top + magnifier,
      //    left: pos.left + magnifier,
      //    'z-index': 0
      //  });
      //});
      $cell.mousedown(function(e) {
        e.preventDefault();
        var $this = $(this);
        var offset = $this.offset();
        var pageX = e.pageX;
        var pageY = e.pageY;
        var top = pageY - offset.top;
        var left = pageX - offset.left;
        var directionX;
        $window.mousemove(function(e) {
          e.preventDefault();
          var pageXDiff = pageX - e.pageX;
          var pageYDiff = pageY - e.pageY;
          var pageXAbs = Math.abs(pageXDiff);
          var pageYAbs = Math.abs(pageYDiff);
          if (directionX === undefined) {
            directionX = pageXAbs > pageYAbs;
          }
          if (directionX) {
            if (pageXAbs > cellMoveBound) {
              if (pageXDiff > 0) {
                swapCell([$this.data('y'), $this.data('x') - 1], [$this.data('y'), $this.data('x')]);
              } else {
                swapCell([$this.data('y'), $this.data('x') + 1], [$this.data('y'), $this.data('x')]);
              }
              $window.unbind('mousemove');
            }
            $this.offset({
              left: e.pageX - left
            });
          } else {
            if (pageYAbs > cellMoveBound) {
              if (pageYDiff > 0) {
                swapCell([$this.data('y') - 1, $this.data('x')], [$this.data('y'), $this.data('x')]);
              } else {
                swapCell([$this.data('y') + 1, $this.data('x')], [$this.data('y'), $this.data('x')]);
              }
              $window.unbind('mousemove');
            }
            $this.offset({
              top: e.pageY - top
            });
          }
        });
        $this.css({
          'z-index': 99
        });
      }).mouseup(function(e) {
        e.preventDefault();
        var $this = $(this);
        $window.unbind('mousemove');
        $this.animate({
          top: cellSize * $this.data('y'),
          left: cellSize * $this.data('x')
        },
        animeDuration, function() {
          $this.css({
            'z-index': 0
          });
        });
      });
      $manaita.append($cell.attr('id', 'cell_' + (i + j).toString(16)));
      grid[i][j] = $cell;
    }
  }
});

