
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let playRequest;
let buildRequest;

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = GAME_WIDTH + "px";
canvas.style.height = GAME_HEIGHT + "px";
canvas.style.background = "white";

let img = new Image();

let debug = true;

let gameState = "build";
let tool = "pen";
let pos1;
let pos2;
let radius;
let k1;
let k2;
let alpha;
let beta;
let startAngle;
let endAngle;

let lineCount = 0;
const lines = [];
/////////////////Vector/////////////

class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }
    subtract(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }
    magnitude(){ //returns length of vector
        return Math.sqrt(this.x**2 + this.y**2);
    } 
    mult(n){
        return new Vector(this.x*n, this.y*n);
    }
    normal(){
        return new Vector(-this.y,this.x).unit();
    }
    unit(){
        if(this.magnitude() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.magnitude(), this.y/this.magnitude());
        }
    }
    dotProduct(v){ //Skalarprodukt (returned eine Zahl)
        // console.log(this.x * v.x + this.y * v.y);
        return this.x * v.x + this.y * v.y;
    }
}
function radToDeg(radians){
  return radians * (180/Math.PI); 
}

////////////////PlayerLogic/////////////////////

class Player{
    constructor(x,y,r,velx,vely,aclx,acly,c){
        this.x =  x;
        this.y = y;
        this.r = r;
        this.pos = new Vector(this.x,this.y);
        this.initPos = this.pos;
        this.velx = velx;
        this.vely = vely;
        this.vel = new Vector(this.velx,this.vely);    
        this.initVel = this.vel;
        
        this.aclx = aclx;
        this.acly = acly;
        this.acl = new Vector(aclx,acly);
        this.maxVel = 30;
        this.brems = -0.9;
        this.c = c;
        
    }

    move(){
        if(this.vel.x < this.maxVel) this.vel.x = this.vel.x += this.acl.x;
        if(this.vel.y < this.maxVel) this.vel.y = this.vel.y += this.acl.y;

        this.pos.x += this.vel.x ;
        this.pos.y += this.vel.y ;


        //checks for Walls
        if (this.pos.y > GAME_HEIGHT - this.r) {
            this.vel.y *= this.bremse;
            this.pos.y = GAME_HEIGHT - this.r;
        }
        if (this.pos.x > GAME_WIDTH - this.r) {
            this.vel.x *= this.bremse;
            this.pos.x = GAME_WIDTH - this.r;
        }
        if (this.pos.x < this.r) {
            this.vel.x *= this.bremse;
            this.pos.x = this.r;
        }
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.pos.x,this.pos.y, this.r, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.c;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        if(debug){
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.A.x, this.A.y);
            ctx.lineTo(p.pos.x,p.pos.y);
            ctx.closePath();  
            ctx.stroke();  
        }

    }

    checkCollisions(){
        lines.forEach((line) => {//durch arrowfunction ist this das Playerobjekt
            // line.collide(this);
        });
    }
    rotate(){

    }

}
function createPlayer(){
    p = new Player(100,100,25,0,1,0,0.5,"#4b6584");
}

//////////////////////Line/////////////////////

class Line{
    constructor(event){
        this.A = getMousePos(event);
        this.B = this.A;

        //Vektoren zwischen Punkten A,B und Player (P)
        this.AB = new Vector(); 
        this.AP = new Vector();
        this.BP = new Vector();


    }
    draw(){
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#141E30';
        
        // ctx.fillRect(this.A.x-5,this.A.y-5,10,10);
        // ctx.fillRect(this.B.x-5,this.B.y-5,10,10);

        ctx.beginPath();
        ctx.moveTo(this.A.x, this.A.y);
        ctx.lineTo(this.B.x,this.B.y);
        ctx.closePath();    
        ctx.stroke();

        if(debug){
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.A.x, this.A.y);
            ctx.lineTo(p.pos.x,p.pos.y);
            ctx.closePath();  
            ctx.stroke();  
            
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.B.x, this.B.y);
            ctx.lineTo(p.pos.x,p.pos.y);
            ctx.closePath();  
            ctx.stroke();  
        }
    }
    setEnd(event){
        this.B = getMousePos(event); 
    }

    drawCPV(p){
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.closestPointTo(p).x,this.closestPointTo(p).y);
        ctx.lineTo(p.pos.x,p.pos.y);
        ctx.closePath();  
        ctx.stroke();  
    }
 
    closestPointTo(p){

        let PzuA = this.A.subtract(p.pos);
        if(this.lineUnitVec().dotProduct(PzuA) > 0){
            return this.A;
        }

        let BzuP = p.pos.subtract(this.B); 
        if(this.lineUnitVec().dotProduct(BzuP) > 0){
            return this.B;
        }

        let closestDistance = this.lineUnitVec().dotProduct(PzuA);
        let closestVector = this.lineUnitVec().mult(closestDistance);

        return this.A.subtract(closestVector);

    }

    check4Colwith(p){
        let PzuL = this.closestPointTo(p).subtract(p.pos).magnitude();

        console.log(PzuL);
        if(PzuL < p.r){
            console.log("collision");
            return true;
        }
    }

    lineUnitVec(){
        return this.B.subtract(this.A).unit();
    }
}

////////////////loops/////////////////////

function clear(){
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
}
function gameLoop(){
    clear();
    p.move();
    p.draw();
    lines.forEach(function(line){
        line.draw()
        if(debug)line.drawCPV(p);
        
        line.check4Colwith(p);
    });
    playRequest = requestAnimationFrame(gameLoop);
}
function buildLoop(){
    clear();
    lines.forEach(function(line){
        line.draw()
    });
    p.draw();
    buildRequest = requestAnimationFrame(buildLoop);
}

////////////////////// Drawing / Utilities ///////////////////////
function mouseDown(event){
    if(gameState !== "build") return;
    if(tool !== "eraser"){
        lineCount++;
        line = new Line(event);
        lines.push(line);
    }else{
        console.log("pop");
        lineCount --;
        lines.pop();
    }
    console.log(lines);
    
}

function mouseUp(event){
    if(gameState !== "build") return;
    lines[lineCount-1].setEnd(event);
    lines[lineCount-1].draw();
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return new Vector(event.clientX -rect.left,event.clientY -rect.top);
}
canvas.addEventListener("mousedown",mouseDown);
canvas.addEventListener("mouseup",mouseUp);

/////////////////State & Button Logic////////////////////
function showGame(){
    document.getElementById("hidewrapper").style.display = "block";
    document.getElementById("startwrapper").style.display = "none";
    createPlayer();
    buildRequest = requestAnimationFrame(buildLoop);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}
function cancelPlay(){
    window.cancelAnimationFrame(playRequest);
}
function cancelBuild(){
    window.cancelAnimationFrame(buildRequest);
}
function buildState(){
    cancelPlay();
    clear();
    gameState = "build";
    createPlayer();
    buildRequest = requestAnimationFrame(buildLoop);
}
function playState(){
    if(gameState === "play")return;
    cancelBuild();
    gameState = "play";
    createPlayer();
    playRequest = requestAnimationFrame(gameLoop);

}
function stopState(){
    if(gameState === "stop") return;

    cancelPlay();
    cancelBuild();
    gameState = "stop";
    console.log("State = " + gameState);
}
document.getElementById("buildButton").addEventListener("click",buildState);
document.getElementById("playButton").addEventListener("click",playState);
document.getElementById("stopButton").addEventListener("click",stopState);
document.getElementById("startButton").addEventListener("click",showGame);

////////////////////Tools//////////////////////////////
function erase(){
    if(gameState !== "build"){
        alert("not in Buildmode");
        return;
    }
    if(lineCount > 0){
        lineCount --;
        console.log("pop");
        lines.pop();
    }
    console.log(lines);
}

const pen = document.getElementById("pen");
pen.addEventListener("click", function(){
    tool = "pen";
});
const curver = document.getElementById("curver");
curver.addEventListener("click", function(){
    tool = "curver";
});
const eraser = document.getElementById("eraser");
eraser.addEventListener("click", erase);