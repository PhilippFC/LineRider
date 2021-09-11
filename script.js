
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let myRequest;

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = GAME_WIDTH + "px";
canvas.style.height = GAME_HEIGHT + "px";
canvas.style.background = "white";

let img = new Image();

let GameState = "build";
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
        this.bremse = -0.9;
        this.c = c;
    }

    move(){
        if(this.vel.x < this.maxVel) this.vel.x = this.vel.x += this.acl.x;
        if(this.vel.y < this.maxVel) this.vel.y = this.vel.y += this.acl.y;

        this.pos.x += this.vel.x ;
        this.pos.y += this.vel.y ;


        //check for Walls
        if(this.checkcollide()){
            this.vel.x ++;
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
    myRequest = requestAnimationFrame(gameLoop);
}


////////////////////// Drawing / Utilities ///////////////////////
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX -rect.left,
        y: event.clientY -rect.top,
    }
}
function setStartPoint(event){
    if(GameState !== "build") return;
    pos1 = getMousePos(event);
    // console.log(pos1);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    
}
function setEndPoint(event){
    if(GameState !== "build") return;
    pos2 = getMousePos(event);
    if(tool === "pen"){
        ctx.lineTo(pos2.x,pos2.y);
        ctx.closePath();    
    }
    if(tool === "curver"){
        const center={
            x: pos1.x + ((pos2.x-pos1.x)/2), 
            y: pos1.y + ((pos2.y-pos1.y)/2)
        }
        radius = Math.sqrt(((pos2.x-pos1.x)**2) + ((pos2.y-pos1.y)**2))/2;
        const cp1={
            x: center.x - radius,
            y: center.y 
        };
        const cp2={
            x: center.x,
            y: center.y + radius 
        };
        ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,pos2.x,pos2.y);
        
        ctx.moveTo(pos2.x,pos2.y);
        ctx.closePath();
        
        //my try an Kurven ohne toBezierCurve()
        // // k1 ist die Ankathe
        // k1 = pos2.y - pos1.y;
        // // console.log("k1 = " + k1);
        // a1 = Math.acos(k1/radius);
        // console.log(a1);

        // startAngle = a1;
        // endAngle = Math.PI;
    
        // // console.log("Radius = " +Math.round(radius));
        // // console.log("center.x = "+Math.round(center.x));
        // // console.log("center.y = "+Math.round(center.y));

        // ctx.moveTo(center.x,center.y);
        // ctx.arc(center.x, center.y, radius, startAngle, endAngle, true);
        // ctx.closePath();
    }
    ctx.stroke();
}
canvas.addEventListener("mousedown",setStartPoint);
canvas.addEventListener("mouseup",setEndPoint);

/////////////////State & Button Logic////////////////////
function showGame(){
    document.getElementById("hidewrapper").style.display = "block";
    document.getElementById("startwrapper").style.display = "none";
}
function cancelPlay(){
    window.cancelAnimationFrame(myRequest);
}
function buildState(){
    cancelPlay();
    clear();
    GameState = "build";
    console.log("State = " + GameState);

    document.getElementById("stopButton").style.background = "";
    document.getElementById("playButton").style.background = "";
    document.getElementById("buildButton").style.background = "grey";
    
    document.body.style.background = "rgb(137,164,162)"
    document.body.style.background = "linear-gradient(160deg, rgba(137,164,162,1) 0%, rgba(54,170,133,0.650997150997151) 39%, rgba(150,93,199,1) 100%)"
}
function playState(){
    if(GameState === "build")img.src = canvas.toDataURL("image/png");
    if(GameState === "play")return;
    GameState = "play";
    p = new Player(100,100,25,0,1,0,0.5,"lightblue");
    console.log("State = " + GameState);
    
    myRequest = requestAnimationFrame(gameLoop);
    
    document.getElementById("stopButton").style.background = "";
    document.getElementById("playButton").style.background = "grey";
    document.getElementById("buildButton").style.background = "";
    
    document.body.style.background = "rgb(124,226,114)"
    document.body.style.background = "linear-gradient(160deg, rgba(124,226,114,0.9052754891018908) 8%, rgba(93,95,199,1) 100%)"
}
function stopState(){
    if(GameState !== "play") return;
    cancelPlay();
    GameState = "stop";
    console.log("State = " + GameState);

    document.getElementById("stopButton").style.background = "grey";
    document.getElementById("playButton").style.background = "";
    document.getElementById("buildButton").style.background = "";
    
    document.body.style.background = "rgb(115,2,84)"
    document.body.style.background = "linear-gradient(160deg, rgba(115,2,84,0.5663399148721988) 5%, rgba(221,240,166,1) 100%)"
}
document.getElementById("buildButton").addEventListener("click",buildState);
document.getElementById("playButton").addEventListener("click",playState);
document.getElementById("stopButton").addEventListener("click",stopState);
document.getElementById("startButton").addEventListener("click",showGame);

////////////////////Tools//////////////////////////////
function toolChange(event){
    if(event.target === pen) tool = "pen";
    if(event.target === eraser) tool = "eraser";
    if(event.target === curver) tool = "curver";
    console.log("tool = " + tool);
}
const pen = document.getElementById("pen");
pen.addEventListener("click", toolChange);
const eraser = document.getElementById("eraser");
eraser.addEventListener("click", toolChange);
const curver = document.getElementById("curver");
curver.addEventListener("click", toolChange);