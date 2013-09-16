/**
 * kazuyukitanimura all rights reserved 2013
 * TODO scope everything
 */

/**
 * Utilities
 */
var isArray = Array.isArray;
var isInt = function(n) {
  return typeof n === 'number' && n % 1 === 0;
};
var isFunction = function(func) {
  return func instanceof Function;
};
var rand = function(max) { // does not include max
  return Math.floor(Math.random() * max);
};
var chooseRandom = function() {
  return this[rand(this.length)];
};
var chooseBiasedRandom = function() {
  var len = this.length;
  var a = rand(len);
  var b = rand(len);
  return this[Math.abs(a + b - (len - 1))]; // [higherst, ..., lowest] by standard deviation
};

/**
 * NArray class
 */
var NArray = function(sizes, defVal) {
  if (!isArray(sizes)) {
    sizes = [sizes];
  } else {
    sizes = sizes.slice(); // deep clone
  }
  if (!sizes.length) {
    return defVal;
  }
  if (! (this instanceof NArray)) { // enforcing new
    return new NArray(sizes, defVal);
  }
  Array.call(this);
  this.sizes = sizes.slice(); // deep clone one more time
  var length = sizes.shift();
  for (var i = length; i--;) {
    this.push(NArray(sizes, defVal));
  }
};
NArray.prototype = Object.create(Array.prototype); // Inheritance ECMAScript 5 or shim for Object.create
NArray.prototype.swap = function(m, n) {
  if (!isArray(m)) {
    m = [m];
  }
  if (!isArray(n)) {
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
NArray.prototype.dimEach = function(indices, callback, thisArg) { // the callback takes element
  if (isFunction(indices)) {
    thisArg = callback;
    callback = indices;
    indices = [];
  } else if (!isArray(indices)) {
    indices = [indices];
  } else {
    indices = indices.slice(); // deep clone
  }
  thisArg = thisArg || this;
  var i = indices.shift();
  var l;
  if (isInt(i)) {
    l = i + 1;
  } else {
    i = 0;
    l = this.length;
  }
  for (; i < l; i++) {
    var elem = this[i];
    if (elem instanceof NArray) {
      elem.dimEach(indices, callback, thisArg);
    } else {
      callback.call(thisArg, elem);
    }
  }
};

/**
 * Sized Array Class
 */
var SizedArray = function(maxLength) {
  if (! (this instanceof SizedArray)) { // enforcing new
    return new SizedArray(maxLength);
  }
  Array.call(this);
  this.maxLength = maxLength;
};
SizedArray.prototype = Object.create(Array.prototype); // Inheritance ECMAScript 5 or shim for Object.create
SizedArray.prototype.push = function() {
  Array.prototype.push.apply(this, arguments);
  if (this.length > this.maxLength) {
    this.shift();
  }
  return this.length;
};
SizedArray.prototype.mapD = function(callback, thisArg) {
  for (var i = this.length; i--;) {
    this[i] = callback.call(thisArg || this, this[i]);
  }
};

/**
 * Grid Class
 */
var Grid = function(sizes, maxCombo) {
  if (! (this instanceof Grid)) { // enforcing new
    return new Grid(sizes);
  }
  NArray.call(this, sizes);
  this.maxCombo = maxCombo;
};
Grid.prototype = Object.create(NArray.prototype); // Inheritance ECMAScript 5 or shim for Object.create
Grid.prototype.checkCombo = function(menu) {
  var maxCombo = this.maxCombo;
  var sizes = this.sizes;
  var sizeLen = sizes.length;
  var res = [];
  for (var d = 0; d < sizeLen; d++) { // test horizontally first
    var indices = new Array(sizeLen);
    for (var i = sizes[d]; i--;) { // check from the bottom
      indices[d] = i;
      var productSA = new SizedArray(maxCombo);
      var cellSA = new SizedArray(maxCombo);
      this.dimEach(indices, function($cell) {
        var prime = $cell.data('neta').prime;
        productSA.mapD(function(x) {
          return x * prime;
        });
        productSA.push(prime);
        cellSA.push($cell);
        for (var j = 0, l = productSA.length; j < l; j++) {
          var product = productSA[j];
          if (menu.hasOwnProperty(product)) { // found a product at j !
            cells = cellSA.slice(j);
            res.push({
              cells: cells,
              menuVal: menu[product]
            });
          }
        }
      });
    }
  }
  var sortFunc = function(a, b) {
    return b.menuVal.price - a.menuVal.price;
  };
  return res.sort(sortFunc);
};

/**
 * Global Consants
 */
var X = 8;
var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]; // TODO add more
var p = 0;
var NETAS = {
  // name: {prime: prime number}
  nori: {
    prime: PRIMES[p++]
  },
  shari: {
    prime: PRIMES[p++]
  },
  toro: {
    prime: PRIMES[p++]
  },
  salmon: {
    prime: PRIMES[p++]
  },
  unagi: {
    prime: PRIMES[p++]
  },
  avocado: {
    prime: PRIMES[p++]
  }
};
var MAX_COMBO = 4;

/**
 * Global Variables
 */
var menu = {}; // menu can be changed depending on the level, the key should be a product of prime numbers
menu[NETAS.nori.prime * NETAS.shari.prime * NETAS.toro.prime] = {
  name: 'Toro Roll',
  price: 3
};
menu[NETAS.nori.prime * NETAS.shari.prime * NETAS.salmon.prime] = {
  name: 'Salmon Roll',
  price: 3
};
menu[NETAS.nori.prime * NETAS.shari.prime * NETAS.unagi.prime * NETAS.avocado.prime] = {
  name: 'Rock N Roll',
  price: 7
};

$(function() {
  var netas = Object.keys(NETAS);
  //netas.chooseRandom = chooseRandom;
  netas.chooseRandom = chooseBiasedRandom;
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
  var grid = new Grid([X, X], MAX_COMBO);
  var animeDuration = 200;
  var moveCell = function($cell, x, y) {
    $cell.data('x', x);
    $cell.data('y', y);
    $cell.animate({
      top: cellSize * y,
      left: cellSize * x
    },
    animeDuration);
  };
  var netasStr = netas.join(' ');
  var deleteCell = function($cell) {
    $cell.removeClass(netasStr);
    var $tmpCell = $cell;
    for (var x = $cell.data('x'), y = $cell.data('y'); y--;) {
      var cellAbove = grid[x][y];
      var yPlusOne = y + 1;
      moveCell(cellAbove, x, yPlusOne);
      grid[x][yPlusOne] = cellAbove;
    }
    grid[x][0] = $tmpCell;
    $tmpCell.css({
      top: 0,
      left: cellSize * x
    });
    var neta = netas.chooseRandom();
    $tmpCell.data({
      x: x,
      y: 0,
      neta: NETAS[neta]
    });
    $cell.addClass(neta);
  };
  var swapCell = function(cA, cB) {
    var ax = cA[1];
    var ay = cA[0];
    var bx = cB[1];
    var by = cB[0];
    var a = grid[ay] && grid[ay][ax];
    var b = grid[by] && grid[by][bx];
    if (a && b) {
      moveCell(a, bx, by);
      moveCell(b, ax, ay);
      grid.swap(cA, cB);
      var combos;
      do {
        combos = grid.checkCombo(menu);
        console.log(combos);
        for (var i = 0, il = combos.length; i < il; i++) {
          var cells = combos[i].cells;
          for (var j = 0, jl = cells.length; j < jl; j++) {
            var $cell = cells[j];
            deleteCell($cell); // FIXME there must be overlapped cells that should be deleted
          }
        }
      } while (combos.length);
    }
  };
  for (var i = 0; i < X; i++) {
    for (var j = 0; j < X; j++) {
      var $cell = $('<div></div>', {
        'class': 'cell'
      });
      var neta = netas.chooseRandom();
      $cell.data({
        x: j,
        y: i,
        neta: NETAS[neta]
      });
      $cell.addClass(neta);
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
        $this.addClass('front');
      }).on('mouseup mouseout mouseleave', function(e) {
        e.preventDefault();
        var $this = $(this);
        $window.unbind('mousemove');
        $this.animate({
          top: cellSize * $this.data('y'),
          left: cellSize * $this.data('x')
        },
        animeDuration, $this.removeClass.bind($this, 'front'));
      });
      $manaita.append($cell.attr('id', 'cell_' + (i + j).toString(16)));
      grid[i][j] = $cell;
    }
  }
});

