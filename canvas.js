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
k = {LEFT: 65, RIGHT: 68, JUMP: 87}

document.addEventListener('keydown', function(event){
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
document.addEventListener('keyup', function(event){
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

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'lvl1.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }

class Tile{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
    }

    getX(){return this.x}
    getY(){return this.y}
    getType(){return this.type}
    render(ctx){
        if(this.type){
            ctx.fillStyle="#0A8692";
            ctx.fillRect(this.x, this.y, 32, 32);
            ctx.fillStyle="#000000";
            ctx.strokeRect(this.x, this.y, 32, 32);
        }
    }
}

class Map{
    constructor(){
        this.xTiles = 25;
        this.yTiles = 19;
        this.tiles = new Array();
    }

    saveTiles(i, j, data){
        this.tiles.push(new Tile(j*32, i*32, data));

    }
    loadMap(){
        loadJSON(function(response) {
            map = JSON.parse(response);
            for(var i=0; i< map.rows.length; i++)
                for(var j=0; j<map.rows[1].columns.length; j++)
                    saveTiles(i,j,map.rows[i].columns[j]);
        });
    }


    renderMap(ctx){
        for(var i=0; i<this.tiles.length; i++)
            this.tiles[i].render(ctx);
    }

}

class Rectangle{

    constructor(x, y){
        this.id = idCount++;
        this.w = 25;
        this.h = 25;
        this.x = x;
        this.y = y;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.floating = false;
    }

    render(ctx){
        // debug
        ctx.fillStyle="#33cc33";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 32, this.y);
        ctx.stroke();
        ctx.fillStyle="#000000";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    move(){

        if(left){
            if(this.xSpeed == 0)
                this.xSpeed = -maxX;
            // else
            //     console.log('Already left vel.');
        }
        if(right){
            if(this.xSpeed == 0)
                this.xSpeed = maxX;
            // else
            //     console.log('Already right vel.');
        }
        if(jump){
            if(!this.floating){
                this.ySpeed = -maxY;
                this.floating = true;
            }
            // else
            //     console.log('Already on air.');
        }
        // Check collisions and apply physics
        this.checkVerticalCollision();
        this.checkHorizontalCollision();



        if(this.ySpeed < 0)
            this.ySpeed += 5;
        // else if(this.ySpeed == 0)
        //     this.ySpeed = 3;

        if(this.xSpeed < 0)
            this.xSpeed += 2;
        else if(this.xSpeed > 0)
            this.xSpeed -= 2;

        if(this.xSpeed < 2 && this.xSpeed > -2) this.xSpeed = 0;


        this.x += this.xSpeed;
        this.y += this.ySpeed;
        ////console.log('Rect ' + this.id + " y: " + this.y + "px. Speed Y: " + this.ySpeed);
        ////console.log('Rect ' + this.id + " x: " + this.x + "px. Speed X: " + this.xSpeed);
    }

    checkVerticalCollision(ttype) {
        // If jumping
        if(this.ySpeed < 0){
            var tx = this.x;
            var ty = this.y + this.h;
            var ttype = map.rows[parseInt(tx / 32)].columns[parseInt(ty / 32)];
            if(ty < 0)   ty = 0;
            if(ty > 600) ty = 600;

            if(parseInt((ty + 32) / 32) * 32 < ty && ttype){
                this.ySpeed = 0;
                this.y = parseInt(ty / 32) * 32;
            }
        // Or falling
        }else if(this.ySpeed > 0){
            var tx = this.x;
            var ty = this.y;
            var ttype = map.rows[parseInt(tx / 32)].columns[parseInt(ty / 32)];
            if(ty < 0)   ty = 0;
            if(ty > 600) ty = 600;

            if(parseInt(ty / 32) * 32 > ty + this.h && ttype){
                this.ySpeed = 0;
                this.y = parseInt(ty / 32) * 32;
            }
        }
    }

    checkHorizontalCollision() {
        // If facing right
        if(this.xSpeed > 0){
            var tx = this.x + this.w;
            var ty = this.y;
            var ttype = map.rows[parseInt(tx / 32)].columns[parseInt(ty / 32)];
            if(tx > 800) tx = 800;
            if(tx < 0)   tx = 0;

            if(parseInt(tx / 32) * 32 < tx + this.w && ttype){
                this.xSpeed = 0;
                this.x = parseInt(tx / 32) * 32;
            }
        // Or facing left
        }else if(this.xSpeed < 0){
            var tx = this.x;
            var ty = this.y;
            var ttype = map.rows[parseInt((tx + 32) / 32)].columns[parseInt(ty / 32)];
            if(tx > 800) tx = 800;
            if(tx < 0)   tx = 0;

            if(parseInt(tx / 32) * 32 > tx && ttype){
                this.xSpeed = 0;
                this.x = parseInt(tx / 32) * 32;
            }
        }
    }

    getX(){ return this.x; }
    getY(){ return this.y; }
    getId(){ return this.id; }

}


var r = new Rectangle(25, 200);
var level = new Map();

function saveTiles(i, j, data){
    level.tiles.push(new Tile(j*32, i*32, data));
}
function update(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // //console.log('ID: '+r.getId()+' x: '+r.getX()+', y:'+r.getY());

    //console.log(key);
    r.move();
    r.render(ctx);
    level.renderMap(ctx);
}

function draw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var height = 600;
    var width = 800;

    level.loadMap();

    if(canvas.getContext)
        setInterval(function() { update(ctx); },16);
    //else
        //console.log('No context');


}
