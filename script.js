
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

////////////////PlayerLogic/////////////////////



const Player = {
    x: 50,
    y: 50,              
    vx: 0,          //Velocity x
    vy: 1,          //Velocity y
    ax: 0,          //Acceleration x
    ay: 0,          //Acceleration y
    width: 50,
    height: 50,

    maxyspeed: 20,
    c: "#ff02ff"
}

function drawPlayer(){
    ctx.fillStyle = Player.c;
    ctx.fillRect(Player.x,Player.y,Player.width,Player.height);
}
function movePlayer(){
    if(colliding() === true){

        //Rotation, work in progress
        // ctx.translate(player.x + player.width/2,player.y +player.y/2);
        // let angle = 1;
        // ctx.rotate(angle);
        // angle++;
        
        Player.vy = 0;
        if(Player.x <  GAME_HEIGHT){
            Player.x += Player.vx;
        }else{
            Player.x = 0;
        }
        return;
    }

    if(Player.vy < Player.maxyspeed)Player.vy+= ay;
    if(Player.y <  GAME_HEIGHT){
        Player.y += Player.vy;
    }else{
        Player.y = 0;
    }
    // console.log("dx = " + player.x);
    // console.log("dy = " + player.y);
}
function colliding(){

    const colliderx = p.x;
    const collidery = p.y + p.height;
    let colliderheight = 100;
    // console.log("x "+coliderx);
    // console.log("y "+colidery);
    if(p.yspeed > p.maxyspeed-1)colliderheight ++;

    const p = ctx.getImageData(colliderx,collidery,p.width,colliderheight).data;
    // console.log(p);
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    // console.log(hex);
    if(hex !== "#000000")p.c = hex;
    if(hex === "#0000ff") return true;

}
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}


////////////////loop/////////////////////

function clear(){
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
}
function gameLoop(){
    clear();
    // console.log(img);
    ctx.drawImage(img,0,0)
    // movePlayer();
    // drawPlayer();

    myRequest = requestAnimationFrame(gameLoop);
}


/////////////////////////////////////////////
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
    Player.c1 = 
    Player.x = 50;
    Player.y = 50;
    Player.vy = 0;
    Player.vx = 1;
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

/////////Tools//////////
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


//////////INPUTS/////////

document.addEventListener("keydown",function keydown(event){
    if(event.key === "w" || "W")console.log("w");
});