var idCount = 0;
var moveLeft = false;
var moveRight = false;
var maxY = 20;
var maxX = 15;
var key = 0;
var right = false;
var left = false;
var jump = false;
var map;
k = {
  LEFT: 65,
  RIGHT: 68,
  JUMP: 87
}; //A,D,W 

document.addEventListener('keydown', function (event) {
  key = event.keyCode;
  switch (event.keyCode) {
    case k.LEFT:
      left = true;
      break;
    case k.RIGHT:
      right = true;
      break;
    case k.JUMP:
      jump = true;
      break;
    default:
  }
}, false);
document.addEventListener('keyup', function (event) {
  key = 0;
  switch (event.keyCode) {
    case k.LEFT:
      left = false;
      break;
    case k.RIGHT:
      right = false;
      break;
    case k.JUMP:
      jump = false;
      break;
    default:
  }
}, false);



class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  getX() {
    return this.x
  }
  getY() {
    return this.y
  }
  getType() {
    return this.type
  }
  render(ctx) {
    if (this.type == "1") {
      ctx.fillStyle = "#0A8692";
      ctx.fillRect(this.x, this.y, 32, 32);
      ctx.fillStyle = "#FF008F";
      ctx.strokeRect(this.x, this.y, 32, 32);
    } else if (this.type == "0") {
      ctx.fillStyle = "#f442aa";
      ctx.fillRect(this.x, this.y, 32, 32);
    }
  }
}

// Map Object
function Map() {
  this.xTiles = 32;
  this.yTiles = 19;
  this.contI = 0;
  this.contJ = 0;
  this.tiles = new Array();
}

Map.prototype.saveTiles = function (i, j, data) {
  this.tiles.push(new Tile(i * 32, j * 32, data));
};

Map.prototype.loadMap = function (initGame) {
  fetch('lvl1.map').then(
    function (response) {
      return response.text();
    }).then(function (response) {
    var temparray = new Array();
    map = response.split("\n").map(row => row.split(" "));
    map.forEach((row, j) => row.forEach((cell, i) => level.saveTiles(i, j, cell)));
    initGame();
  });
};


Map.prototype.renderMap = function (ctx) {
  // Rendering this way draws all tiles correctly
  for (var i = 0; i < this.tiles.length; i++)
    if (this.tiles[i].type == "0")
      this.tiles[i].render(ctx);

  for (var i = 0; i < this.tiles.length; i++)
    if (this.tiles[i].type == "1")
      this.tiles[i].render(ctx);
};



function Rectangle(x, y) {
  this.id = idCount++;
  this.w = 25;
  this.h = 25;
  this.x = x;
  this.y = y;
  this.xAccel = 0;
  this.yAccel = 0;
  this.floating = true;
}

Rectangle.prototype.render = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(this.x, this.y, this.w, this.h);
};

Rectangle.prototype.move = function () {
  // Move v2.0

  // Horizontal
  if (right)
    this.xAccel += 1.0;
  else if (left)
    this.xAccel -= 1.0;
  else
    this.xAccel = 0.0;

  if (jump) {
    this.floating = true;
    this.yAccel = -2.0;
  }
  if (this.floating)
    this.yAccel = 2.0;
  var that = this;
  setTimeout(function () {
    that.checkVerticalCollision();
  }, 0);
  setTimeout(function () {
    that.checkHorizontalCollision();
  }, 0);

};

Rectangle.prototype.checkVerticalCollision = function () {
  function checkIt(rect) {
    var ttype = "0";
    for (var tx = rect.x; tx < rect.x + rect.w; tx++) {
      var pos = {
        x: Math.trunc(tx / 32),
        y: Math.trunc(ty / 32)
      };

      if (map[pos.y][pos.x] != "0") {
        ttype=map[pos.y][pos.x];
        break;
      }
    }
    return ttype;

  }
  // If jumping
  if (this.yAccel < 0) {
    var ty = this.y;
    if (ty < 0) ty = 0;
    if (ty > 608) ty = 608;
    if (checkIt(this)!="0") this.yAccel = 0;

    // Or falling
  } else if (this.yAccel > 0) {
    var ty = this.y + this.h;
    if (ty < 0) ty = 0;
    if (ty > 608) ty = 608;
    if (checkIt(this)!="0") this.yAccel = 0;
  }

  this.y += this.yAccel;
};

Rectangle.prototype.checkHorizontalCollision = function () {
  function checkIt(rect) {
    var ttype = "0";
    for (var ty = rect.y; ty < (rect.y + rect.h) - 2; ty++) { //Magic number: -2 to avoid collisions with the ground
      var pos = {
        x: Math.trunc(tx / 32),
        y: Math.trunc(ty / 32)
      };

      if (map[pos.y][pos.x] != "0") {
        ttype = map[pos.y][pos.x];
        break;
      }

      console.log(ty, pos, ttype);
    }
    return ttype;
  }

  // If facing right
  if (this.xAccel > 0) {
    var tx = this.x + this.w;
    if (tx > 1024) tx = 1024;
    if (tx < 0) tx = 0;


    if (checkIt(this) != "0")
      this.xAccel = 0;

    // Or facing left
  } else if (this.xAccel < 0) {
    var tx = this.x;
    if (tx > 1024) tx = 1024;
    if (tx < 0) tx = 0;

    if (checkIt(this) != "0")
      this.xAccel = 0;
  }
  this.x += this.xAccel;
};



var r = new Rectangle(25, 200);
var level = new Map();

function update(ctx) {
  setTimeout(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    level.renderMap(ctx);
    r.move();
    r.render(ctx);
  }, 0);
}

function draw() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var height = 600;
  var width = 800;

  level.loadMap(function () {
    if (canvas.getContext)
      setInterval(function () {
        update(ctx);
      }, 16);
  });


}
