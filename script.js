const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let playRequest;
let buildRequest;

const GAME_WIDTH = '600';
const GAME_HEIGHT = '400';

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = GAME_WIDTH + 'px';
canvas.style.height = GAME_HEIGHT + 'px';
canvas.style.background = 'white';

let debug = false;
let pl2 = false;

let curMousePos;
let gameState = 'build';
let tool = 'pen';

let lineCount = 0;
const lines = [];
let freehandCount;

/////////////////Vector/////////////
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    magnitude() {
        //returns length of vector
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }
    divided(n) {
        return new Vector(this.x / n, this.y / n);
    }
    normal() {
        return new Vector(-this.y, this.x).unit();
    }
    unit() {
        if (this.magnitude() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(
                this.x / this.magnitude(),
                this.y / this.magnitude()
            );
        }
    }
    dotProduct(v) {
        //Skalarprodukt (returned eine Zahl)
        // console.log(this.x * v.x + this.y * v.y);
        return this.x * v.x + this.y * v.y;
    }
    draw(p) {
        ctx.beginPath();
        ctx.moveTo(p.pos.x, p.pos.y);
        ctx.lineTo(this.x + p.pos.x, this.y + p.pos.y);
        ctx.closePath();
        ctx.stroke();
    }
}
////////////////PlayerLogic/////////////////////
class Player {
    constructor(xPos, yPos, r, velx, vely, aclx, acly, c, bremse) {
        this.r = r;
        this.pos = new Vector(xPos, yPos);
        this.initPos = this.pos;
        this.velx = velx;
        this.vely = vely;
        this.vel = new Vector(this.velx, this.vely);
        this.initVel = this.vel;

        this.aclx = aclx;
        this.acly = acly;
        this.acl = new Vector(aclx, acly);
        this.maxVel = 30;
        this.bremse = bremse;
        this.c = c;
        this.dead;
    }

    move() {
        if (this.vel.x < this.maxVel) this.vel.x = this.vel.x += this.acl.x;
        if (this.vel.y < this.maxVel) this.vel.y = this.vel.y += this.acl.y;

        this.pos = this.pos.add(this.vel);

        lines.forEach((line) => {
            line.check4Colwith(this);
        });

        //checks for Walls
        if (this.pos.y > GAME_HEIGHT - this.r) {
            this.vel.y *= this.bremse;
            this.pos.y = GAME_HEIGHT - this.r;
            this.dead = true;
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
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.c;
        if (!debug) ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        if (debug) {
            this.vel.draw(this);
            this.acl.draw(this);
        }
    }
}

function createPlayer() {
    p = new Player(100, 100, 10, 0, 1, 0, 0.5, '#4b6584', -0.2);
    p2 = new Player(200, 100, 30, 0, 1, 0, 0.5, '#4b6584', -0.5);
}
//////////////////////Line/////////////////////
class Line {
    constructor(MP, tool) {
        this.tool = tool;
        this.A = MP;
        this.B = MP;
        this.PzuLVec;
        this.PzuL;
    }
    draw() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#141E30';
        if (this.tool !== 'eraser') {
            ctx.beginPath();
            ctx.moveTo(this.A.x, this.A.y);
            ctx.lineTo(this.B.x, this.B.y);
            ctx.closePath();
            ctx.stroke();
        }
        if (debug) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.A.x, this.A.y);
            ctx.lineTo(p.pos.x, p.pos.y);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.B.x, this.B.y);
            ctx.lineTo(p.pos.x, p.pos.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    setEnd(MP) {
        this.B = MP;
    }
    lineUnitVec() {
        return this.B.subtract(this.A).unit();
    }
    drawCPV(p) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.closestPointTo(p).x, this.closestPointTo(p).y);
        ctx.lineTo(p.pos.x, p.pos.y);
        ctx.closePath();
        ctx.stroke();
    }
    closestPointTo(p) {
        let PzuA = this.A.subtract(p.pos);
        if (this.lineUnitVec().dotProduct(PzuA) > 0) {
            return this.A;
        }
        let BzuP = p.pos.subtract(this.B);
        if (this.lineUnitVec().dotProduct(BzuP) > 0) {
            return this.B;
        }
        let closestDistance = this.lineUnitVec().dotProduct(PzuA);
        let closestVector = this.lineUnitVec().mult(closestDistance);
        return this.A.subtract(closestVector);
    }
    check4Colwith(p) {
        this.PzuLVec = this.closestPointTo(p).subtract(p.pos);
        this.PzuL = this.PzuLVec.magnitude();
        // console.log(this.PzuL);
        // console.log(p.r);
        if (this.PzuL < p.r) {
            // console.log("collision");
            this.fixPenetration(p);
            this.newMove(p);
            return true;
        }
    }
    fixPenetration(p) {
        let penDepth = p.r - this.PzuL;
        let penVec = this.PzuLVec.unit().mult(penDepth);

        p.pos = p.pos.add(penVec.mult(-1));
        if (debug) {
            // console.log(p.pos);
            // console.log(penVec);
            // console.log(penDepth);
        }
    }
    newMove(p) {
        let responseDir = this.PzuLVec.mult(-1).unit();
        let sepVel = p.vel.dotProduct(responseDir);
        let newsepVel = sepVel * p.bremse;
        let difInVel = sepVel - newsepVel;
        p.vel = p.vel.add(responseDir.mult(-difInVel));
        // if (debug) console.log("responseDir");
        // if (debug) console.log(responseDir);
    }
}
class Board {
    draw() {
        ctx.font = "16px 'Noto Sans KR', sans-serif ";
        if (debug) ctx.fillText('LineCount: ' + lineCount, 5, 20);
    }
}
const b = new Board();
////////////////loops/////////////////////
function clear() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function gameLoop() {
    // if (!p.dead) {
    clear();
    lines.forEach((line) => {
        line.draw();
        if (debug) line.drawCPV(p);
    });
    p.move();
    p.draw();
    if (pl2) {
        p2.move();
        p2.draw();
    }
    b.draw();
    playRequest = requestAnimationFrame(gameLoop);
    // } else {
    // window.alert("You died");
    // buildState();
    // }
}

function buildLoop() {
    clear();
    lines.forEach(function (line) {
        line.draw();
        if (debug) line.drawCPV(p);
    });
    p.draw();
    if (pl2) p2.draw();
    buildRequest = requestAnimationFrame(buildLoop);
}

////////////////////// Drawing / Utilities ///////////////////////
let timer;

function mouseDown(event) {
    // if (gameState !== "build") return;
    freehandCount = 0;
    if (tool === 'pen') {
        lineCount++;
        line = new Line(curMousePos, tool);
        lines.push(line);
    }
    if (tool === 'freehand') {
        //Loop starten die lines beginnt und beendet
        timer = setInterval(function () {
            //beendet Line von der vorigen Loop
            if (freehandCount > 0) {
                lines[lineCount - 1].setEnd(curMousePos);
            }
            //startet neue Line;
            lineCount++;
            freehandCount++;
            line = new Line(curMousePos, 'freehand');
            lines.push(line);
            console.log(lines);
        }, 50);
    }
    if (debug) console.log(lines);
}

function mouseUp(event) {
    clearInterval(timer);
    if (gameState !== 'build') return;
    if (tool === 'pen') lines[lineCount - 1].setEnd(curMousePos);
}

canvas.addEventListener('mousemove', function (event) {
    curMousePos = getMousePos(event);
    // console.log(currentMousePos);
});

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return new Vector(event.clientX - rect.left, event.clientY - rect.top);
}
canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);

/////////////////State & Button Logic////////////////////

function cancelPlay() {
    window.cancelAnimationFrame(playRequest);
}

function cancelBuild() {
    window.cancelAnimationFrame(buildRequest);
}

function buildState() {
    cancelPlay();
    clear();
    gameState = 'build';
    createPlayer();
    buildRequest = requestAnimationFrame(buildLoop);
}

function playState() {
    if (gameState === 'play') return;
    cancelBuild();
    gameState = 'play';
    createPlayer();
    playRequest = requestAnimationFrame(gameLoop);
}

function stopState() {
    if (gameState === 'stop') return;

    cancelPlay();
    cancelBuild();
    gameState = 'stop';
    console.log('State = ' + gameState);
}
document.getElementById('buildButton').addEventListener('click', buildState);
document.getElementById('playButton').addEventListener('click', playState);
document.getElementById('stopButton').addEventListener('click', stopState);

////////////////////Tools//////////////////////////////

document.getElementById('pen').addEventListener('click', function () {
    tool = 'pen';
    console.log(tool);
});
document.getElementById('freehand').addEventListener('click', function () {
    tool = 'freehand';
    freehandCount = 0;
    console.log(tool);
});
document.getElementById('erase').addEventListener('click', function () {
    if (gameState !== 'build') {
        alert('not in Buildmode');
        return;
    }
    if (lineCount > 0) {
        lineCount--;
        if (debug) console.log('pop');
        lines.pop();
    }
    if (debug) console.log(lines);
});
document.getElementById('eraseAll').addEventListener('click', function () {
    if (gameState !== 'build') {
        alert('are you sure you want to erase your track?');
        return;
    }
    lines.splice(0, lines.length);
    lineCount = 0;

    if (debug) console.log(lines);
});
buildState();
