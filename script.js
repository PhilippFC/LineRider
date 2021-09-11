
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
    magnitude(v){
        return Math.sqrt(this.x**2 + HTMLDListElement.y**2);
    } 
    mult(n){
        return new Vector(this.x*n, this.y*n);
    }
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
        this.bremse = -0.1;
        this.c = c;
        
    }

    move(){
        if(this.vel.x < this.maxVel) this.vel.x = this.vel.x += this.acl.x;
        if(this.vel.y < this.maxVel) this.vel.y = this.vel.y += this.acl.y;

        this.pos.x += this.vel.x ;
        this.pos.y += this.vel.y ;


        //check for Walls
        if(this.checkcollide()){
            this.vel.y *= this.bremse;     
            this.pos.y = Math.floor(this.pos.y);   
        }
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
    }

    checkcollide(){
        //Colliderbox wird festgelegt
        const colx = this.pos.x;
        const coly = this.pos.y;
        const colr = this.r;
        //Pixeldaten aus dem festgelegten Bereich werden als rgba im Array gespeichert
        const colData = ctx.getImageData(colx-colr,coly-colr,colr*2,colr*2).data;
        //console.log(colData);
        // ctx.fillRect(colx-colr,coly-colr,colr*2,colr*2);
        //filtert diesen Array nach Werten die nicht 0 sind (nicht weiß)
        const myArray = colData.filter(function(element){
            return element >0;
        });
        //console.log(myArray.length);
        if(myArray.length > 0){
            p.x += p.vx;
            return true;
        }
    }
    rotate(){

    }

}

////////////////loop/////////////////////

function clear(){
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
}
function gameLoop(){
    clear();
    ctx.drawImage(img,0,0);
    p.checkcollide();
    p.move();
    p.draw();
    // console.log(img);
    playRequest = requestAnimationFrame(gameLoop);
}
function buildLoop(){
    clear();
    console.log("buildloooping");
    lines.forEach(function(line){
        line.draw()
    });
    buildRequest = requestAnimationFrame(buildLoop);
}

class Line{
    constructor(event){
        this.pos1 = getMousePos(event)
        this.pos2 ={
            x:this.pos1.x,
            y:this.pos1.y
        };
    }
    draw(){
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#141E30';
        ctx.beginPath();
        ctx.moveTo(this.pos1.x, this.pos1.y);
        if(tool === "pen"){
            ctx.lineTo(this.pos2.x,this.pos2.y);
            ctx.closePath();    
        }
        ctx.stroke();
    }
    setEnd(event){
        this.pos2 = getMousePos(event); 
    }
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
    return {
        x: event.clientX -rect.left,
        y: event.clientY -rect.top,
    }
}
canvas.addEventListener("mousedown",mouseDown);
canvas.addEventListener("mouseup",mouseUp);

/////////////////State & Button Logic////////////////////
function showGame(){
    document.getElementById("hidewrapper").style.display = "block";
    document.getElementById("startwrapper").style.display = "none";
    buildRequest = requestAnimationFrame(buildLoop);
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
    buildRequest = requestAnimationFrame(buildLoop);
}
function playState(){
    if(gameState === "build"){
        img.src = canvas.toDataURL("image/png");
        cancelBuild();
    }
    if(gameState === "play")return;
    gameState = "play";
    p = new Player(100,100,25,0,1,0,0.5,"#4b6584");
    playRequest = requestAnimationFrame(gameLoop);
}
function stopState(){
    if(gameState !== "play") return;
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
    console.log("pop");
    lineCount --;
    lines.pop();
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