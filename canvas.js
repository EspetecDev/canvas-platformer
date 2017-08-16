var idCount = 0;
var moveLeft = false;
var moveRight = false;
var maxY = 20;
var maxX = 15;
var key = 0;
var right = false;
var left = false;
var jump = false;
var lvl1 = "file:///C:/Users/AT016059/Desktop/webgl/lvl1.map";
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

class Tile{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
    }

    getX(){return this.x}
    getY(){return this.y}
    getType(){return this.type}
    render(ctx){ctx.fillRect(this.x, this.y, 32, 32);}
}

class Map{
    constructor(){
        this.xTiles = 32;
        this.yTiles = 19;
        this.tiles = new Array();
    }

    saveTiles(lines) {
        var xMap = new Array();
        var totalCont = 0;
        while(totalCont < lines.length){
            xMap.push(new Tile(totalCont % this.xTiles, totalCont / this.yTiles, lines[totalCont++]));
            if(totalCont % this.xTiles == 0){
                this.tiles.push(xMap);
                xMap = [];
            }
        }
    }

    loadMap(map){
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", map, false);
        rawFile.onreadystatechange = () => {
            if(rawFile.readyState === 4)
                if(rawFile.status === 200 || rawFile.status == 0){
                    var allText = rawFile.responseText;
                    var lines = allText.split(' ');
                    this.saveTiles(lines);
                }
        };
        rawFile.send(null);
    }

    renderMap(ctx){
        for(var i = 0; i<this.tiles.length; i++)
            for(var j = 0; j < this.tiles[0].length; j++)
                this.tiles[i][j].render(ctx);

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
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    move(){

        if(left){
            if(this.xSpeed == 0)
                this.xSpeed = -maxX;
            else
                console.log('Already left vel.');
        }
        if(right){
            if(this.xSpeed == 0)
                this.xSpeed = maxX;
            else
                console.log('Already right vel.');
        }
        if(jump){
            if(!this.floating){
                this.ySpeed = -maxY;
                this.floating = true;
            }
            else
                console.log('Already on air.');
        }
        // Check collisions and apply physics
        if(this.y >= 201){
            this.y = 200;
            this.floating = false;
        }

        if(this.ySpeed < 0)
            this.ySpeed += 5;
        else if(this.ySpeed == 0)
            this.ySpeed = 3;

        if(this.xSpeed < 0)
            this.xSpeed += 2;
        else if(this.xSpeed > 0)
            this.xSpeed -= 2;

        if(this.xSpeed < 2 && this.xSpeed > -2) this.xSpeed = 0;


        this.x += this.xSpeed;
        this.y += this.ySpeed;
        console.log('Rect ' + this.id + " y: " + this.y + "px. Speed Y: " + this.ySpeed);
        console.log('Rect ' + this.id + " x: " + this.x + "px. Speed X: " + this.xSpeed);
        //key = 0;
    }
    getX(){ return this.x; }
    getY(){ return this.y; }
    getId(){ return this.id; }

}
var r = new Rectangle(25, 200);
var level = new Map();

function update(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // console.log('ID: '+r.getId()+' x: '+r.getX()+', y:'+r.getY());

    console.log(key);
    r.move();
    r.render(ctx);
    level.renderMap(ctx);
}

function draw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var height = 600;
    var width = 800;

    level.loadMap(lvl1);

    if(canvas.getContext)
        setInterval(function() { update(ctx); },16);
    else
        console.log('No context');


}
