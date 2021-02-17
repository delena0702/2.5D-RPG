let ctx;
const c_width = 500;
const c_height = 700;

let see;
const see_inert = 0.1;

const basex2d = c_width - 110;
const basey2d = 110;
const basex3d = c_width / 2;
const basey3d = c_height / 2;
const rad2d = 100;

const w2d = 15 * Math.cos(Math.PI / 4);
const h2d = 15 * Math.sin(Math.PI / 4);
const w3d = 50 * Math.cos(Math.PI / 6);
const h3d = 50 * Math.sin(Math.PI / 6);
const player_rad = 0.2;
const player_height = 0.2;
const prad2d = 8;
const prad3d = 50 * player_rad;
const sharad3d = 10;
const player_gmove = 0.15;

const usekey = ['w', 'a', 's', 'd', ' '];
let keystat = {};

let data;
let width, height;

let objs;
let player;

let display = {};

window.onload = () => {
    let output = document.getElementById('output');
    output.width = c_width;
    output.height = c_height;
    ctx = output.getContext('2d');

    window.onkeydown = (e) => { if (usekey.includes(e.key)) keystat[e.key] = true; };
    window.onkeyup = (e) => { if (usekey.includes(e.key)) keystat[e.key] = false; };
    initData();

    setInterval(proc, 30);
};

/**
 * 컨텍스트 출력 위치 조정
 * mode value ->
 * 1 : 평면 화면
 * 2 : 입체 화면
 * else : reset (Default)
 * 
 * @param {number} mode
 */
function setContext(mode) {
    ctx.resetTransform();

    switch (mode) {
        case 1:
            var tx = basex2d - (height + player.x - player.y) * w2d;
            var ty = basey2d - (- width - height + player.x + player.y) * h2d;

            ctx.save();
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(basex2d, basey2d, rad2d, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.clip();

            ctx.fillStyle = "#444444aa";
            ctx.fillRect(basex2d - rad2d, basey2d - rad2d, 2 * rad2d, 2 * rad2d);

            ctx.translate(tx, ty);

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#ffffff";
            ctx.lineWidth = 1;
            break;

        case 2:
            var tx = basex3d - (height + see.x - see.y) * w3d;
            var ty = basey3d - (- width - height + see.y + see.x - 2 * see.z) * h3d;

            ctx.translate(tx, ty);

            ctx.strokeStyle = "#444444";
            break;

        default:
            ctx.translate(0, 0);
            ctx.fillStyle = "#444444";
            ctx.textAlign = "center";
            break;
    }
}

/**
 * 높이 차이(num)에 따른 맵 색 반환
 * @param {number} num 높이 차이
 */
function makeColor(num) {
    num += player_height;
    const max_num = 8;
    const min_color = 64;

    let r = "#";
    let a = 255 - (255 - min_color) * Math.abs(num) / max_num;
    a = (a < min_color) ? min_color : 0 | a;
    a = (a < 16) ? ('0' + a.toString(16)) : a.toString(16);

    if (num >= 0)
        return '#' + a + a + 'ff';
    return '#ff' + a + a;
}

/**
 * x를 min과 max의 사잇값으로 만든다.
 * @param {number} x 계산 값
 * @param {number} min 최솟값
 * @param {number} max 최댓값
 */
function limiter(x, min, max) {
    if (x < min) return min;
    if (max < x) return max;
    return x;
}

/**
 * 프로그램 내부 값 초기화
 */
function initData() {
    data = [
        [0, 10, 10, 9, 9, 9, 8, 8, 8, 7],
        [10, 9, 9, 9, 8, 8, 8, 7, 7, 7],
        [9, 9, 8, 8, 8, 7, 7, 7, 6, 6],
        [9, 8, 8, 7, 7, 7, 6, 6, 6, 5],
        [9, 8, 7, 7, 6, 6, 6, 5, 5, 5],
        [8, 8, 7, 6, 6, 5, 5, 5, 4, 4],
        [8, 7, 7, 6, 5, 5, 4, 4, 4, 3],
        [8, 7, 6, 6, 5, 4, 4, 3, 3, 3],
        [7, 7, 6, 5, 5, 4, 3, 3, 2, 2],
        [7, 6, 6, 5, 4, 4, 3, 2, 2, 1],
    ];

    /**
    data = [
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
    ];
    /**/

    width = data[0].length;
    height = data.length;

    objs = [];
    player = new EntityObject(draw2DPlayer, draw3DPlayer, movePlayer, () => { },
        2, -1, player_gmove, width - 0.5, height - 0.5, data[height - 1][width - 1],
        player_rad, player_height, () => { }, () => { return true; });
    player.vz = 0;
    objs.push(player);
    objs.push(new EntityObject((x, y, i) => {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc((x) * w2d, (y) * h2d, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }, (x, y, i) => {
        drawShadow(objs[i].x, objs[i].y);
        ctx.save();
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc((x) * w3d, (y) * h3d, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }, movePlayer, () => { },
        -2, -1, 0.1, 1.5, 1.5, data[1][1] + 0.2,
        0.2, 0.2, () => { }, makeDefaultCanMove(1.5, 1.5, 10)));

    see = {};
    see.x = player.x;
    see.y = player.y;
    see.z = player.z;

    display.queue = [];

    // 플레이어의 기본 모션
    display.queue.push(new DisplayEffect(40, (i) => {
        display.player_k = Math.cos(Math.PI * display.queue[i].cnt / 20) / 20 + 0.35;
        if (display.queue[i].cnt == 1)
            display.queue[i].cnt = 40;
    }));
}

/**
 * 그림자 출력
 * @param {number} x 
 * @param {number} y 
 */
function drawShadow(x, y) {
    let px3d = height - y + x;
    let ky3d = - width - height + y + x - 2 * data[0 | y][0 | x];

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#00000044";
    ctx.arc(px3d * w3d, ky3d * h3d, sharad3d, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

/**
 * player의 커서 함수
 */
function draw3DPlayer() {
    // 그림자
    drawShadow(player.x, player.y);

    // 플레이어
    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i <= 6; i += 0.1) {
        let x = height
            + (player.x + player_rad * Math.cos(i * Math.PI - player.th))
            - (player.y + player_rad * Math.sin(i * Math.PI - player.th));
        let y = - width - height
            + (player.x + player_rad * Math.cos(i * Math.PI - player.th))
            + (player.y + player_rad * Math.sin(i * Math.PI - player.th))
            - 2 * (player.z + (i * display.player_k - 1) * player_height);

        if (i) ctx.lineTo(x * w3d, y * h3d);
        else ctx.moveTo(x * w3d, y * h3d);
    }
    ctx.stroke();

    let x = height + (player.x) - (player.y);
    let y = - width - height + (player.x) + (player.y)
        - 2 * ((8 * display.player_k - 1) * player_height + player.z);

    ctx.strokeStyle = "#444444";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x * w3d, y * h3d, 12, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (Math.cos(player.th - Math.PI / 4) >= -0.01) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x * w3d + 11 * Math.cos(player.th + (0.25 + 0.15) * Math.PI), y * h3d, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x * w3d + 11 * Math.cos(player.th + (0.25 - 0.15) * Math.PI), y * h3d, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

/**
 * player의 커서 함수
 */
function draw2DPlayer() {
    let px2d = height + player.x - player.y;
    let py2d = - width - height + player.x + player.y;

    ctx.beginPath();
    ctx.fillStyle = "#00ffff";
    ctx.moveTo(px2d * w2d, py2d * h2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.th - Math.PI / 2) * prad2d,
        py2d * h2d + Math.sin(player.th - Math.PI / 2) * prad2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.th + Math.PI / 4) * prad2d,
        py2d * h2d + Math.sin(player.th + Math.PI / 4) * prad2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.th + Math.PI) * prad2d,
        py2d * h2d + Math.sin(player.th + Math.PI) * prad2d);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/**
 * 화면 출력
 */
function show() {
    showBackground();
    show3D();
    show2D();
}

/**
 * 배경을 그림
 */
function showBackground() {
    setContext(0);
    ctx.fillRect(0, 0, c_width, c_height);
}

/**
 * 2D 화면(미니맵)을 그림
 */
function show2D() {
    setContext(1);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (data[i][j] == 0) continue;

            ctx.fillStyle = makeColor(data[i][j] - player.z);

            let x = height - i + j;
            let y = - width - height + i + j;
            ctx.beginPath();
            ctx.moveTo((x) * w2d, (y) * h2d);
            ctx.lineTo((x + 1) * w2d, (y + 1) * h2d);
            ctx.lineTo((x) * w2d, (y + 2) * h2d);
            ctx.lineTo((x - 1) * w2d, (y + 1) * h2d);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    for (let i = objs.length - 1; i >= 0; i--) {
        let o = objs[i];
        let x = height + o.x - o.y;
        let y = - width - height + o.x + o.y;
        o.draw2D(x, y, i);
    }

    ctx.restore();
}

/**
 * 3D 화면을 그림
 */
function show3D() {
    setContext(2);

    let entity_check = [];

    for (let i = 0; i < objs.length; i++) {
        let o = objs[i];
        entity_check.push({});
        entity_check[i].x = height + (o.x) - (o.y);
        entity_check[i].y = - width - height + (o.x) + (o.y) - 2 * (o.z);
        entity_check[i].i = (0 | o.x) + (0 | o.y);
        entity_check[i].dia = 0 | o.x - o.y;
        entity_check[i].check = false;
    }

    for (let i = 0; i < width + height; i++) {
        for (let j = i < height ? 0 : i - height + 1; j < (i < width ? i + 1 : width); j++) {
            if (data[i - j][j] == 0) continue;

            let x = height - (i - j) + j;
            let y = - width - height + (i - j) + j;
            let d = data[i - j][j];

            // 엔티티 출력 체크
            for (let k = entity_check.length - 1; k >= 0; k--) {
                let o = objs[k];
                let e = entity_check[k];
                console.log();
                if (e.check && o.z < d &&
                    (e.dia >= 2 * j - i - 2 && e.dia <= 2 * j - i + 1)) {
                    o.draw3D(e.x, e.y, k);
                    e.check = false;
                }
            }

            // 위
            ctx.fillStyle = "#cccccc";
            ctx.beginPath();
            ctx.moveTo(x * w3d, (y - 2 * d) * h3d);
            ctx.lineTo((x + 1) * w3d, (y - 2 * d + 1) * h3d);
            ctx.lineTo(x * w3d, (y - 2 * d + 2) * h3d);
            ctx.lineTo((x - 1) * w3d, (y - 2 * d + 1) * h3d);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 좌
            ctx.fillStyle = "#aaaaaa";
            ctx.beginPath();
            ctx.moveTo((x - 1) * w3d, (y - 2 * d + 1) * h3d);
            ctx.lineTo(x * w3d, (y - 2 * d + 2) * h3d);
            ctx.lineTo(x * w3d, (y + 2) * h3d);
            ctx.lineTo((x - 1) * w3d, (y + 1) * h3d);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 우
            ctx.fillStyle = "#888888";
            ctx.beginPath();
            ctx.moveTo(x * w3d, (y - 2 * d + 2) * h3d);
            ctx.lineTo((x + 1) * w3d, (y - 2 * d + 1) * h3d);
            ctx.lineTo((x + 1) * w3d, (y + 1) * h3d);
            ctx.lineTo(x * w3d, (y + 2) * h3d);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        for (let j = 0; j < entity_check.length; j++)
            if (entity_check[j].i == i)
                entity_check[j].check = true;
    }

    for (let i = 0; i < entity_check.length; i++)
        if (entity_check[i].check)
            objs[i].draw3D(entity_check[i].x, entity_check[i].y, i);
}

/**
 * Objs을 전부 1틱 뒤의 상황으로 움직임
 */
function moveObjs() {
    for (let i = 0; i < objs.length; i++)
        if (moveobj(i) && --objs[i].cnt < 0)
            objs.splice(i--, 1);
}

/**
 * 플레이어 위치 조절
 */
function movePlayer(i) {
    let o = objs[i];
    let r = { x: 0, y: 0 };

    if (keystat.w) { r.x--; r.y--; }
    if (keystat.a) { r.x--; r.y++; }
    if (keystat.s) { r.x++; r.y++; }
    if (keystat.d) { r.x++; r.y--; }
    
    r.x = limiter(r.x, -1, 1);
    r.y = limiter(r.y, -1, 1);

    if (!o.jump && keystat[' ']) {
        o.jump = true;

        // 점프 모션
        if (i == 0)
            display.queue.push(new DisplayEffect(10, (i) => {
                display.player_k = -0.1 * Math.cos(((10 - display.queue[i].cnt) / 9) * Math.PI) + 0.3;

                if (display.queue[i].cnt == 10)
                    player.vz = 0.55;
                if (display.queue[i].cnt == 1)
                    display.queue[i].cnt = 2;

                if (!player.jump) {
                    display.queue[i].cnt = 0;
                    display.queue[0].cnt = 40;
                }
            }));
        else
            o.vz = 0.55;
    }

    return r;
}

function makeDefaultmove(i) {
    let r = { x: 1, y: 0 };
    return r;
}

function moveobj(i) {
    let o = objs[i];
    let d = o.move(i);

    let xycheck = 0 | o.gmove + 1;
    let min, max;
    let ind;

    for (ind = 0; (ind < xycheck) && ((0 | o.x - ind) > 0); ind++)
        if (o.z < data[0 | o.y][0 | o.x - ind - 1])
            break;
    min = limiter((0 | o.x - ind) + o.gmove, 0, width - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | o.x + ind + 1) < width); ind++)
        if (o.z < data[0 | o.y][0 | o.x + ind + 1])
            break;
    max = limiter((0 | o.x + ind + 1) - o.gmove, 0, width - 0.01);
    o.x = limiter(o.x + o.gmove * d.x, min, max);

    for (ind = 0; (ind < xycheck) && ((0 | o.y - ind) > 0); ind++)
        if (o.z < data[0 | o.y - ind - 1][0 | o.x])
            break;
    min = limiter((0 | o.y - ind) + o.gmove, 0, height - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | o.y + ind + 1) < height); ind++)
        if (o.z < data[0 | o.y + ind + 1][0 | o.x])
            break;
    max = limiter((0 | o.y + ind + 1) - o.gmove, 0, height - 0.01);
    o.y = limiter(o.y + o.gmove * d.y, min, max);

    if (d.x || d.y) o.th = Math.PI * ((d.x == 1 && d.y == 0) ? 0 : d.y * (-d.x - 2) + 4) / 4;

    if (o.jump || o.z > data[0 | o.y][0 | o.x] + o.h) {
        o.z += o.vz;
        o.vz -= 0.1;
    }

    if (o.z < data[0 | o.y][0 | o.x] + o.h) {
        o.z = data[0 | o.y][0 | o.x] + o.h;
        o.vz = 0;
        o.jump = false;
    }

    if (o.z <= o.h) {
        console.log("떨어짐");
        o.x = width - 0.5;
        o.y = height - 0.5;
        o.z = data[height - 1][width - 1];
        o.th = - Math.PI / 4;
        o.vz = 0;
        o.jump = false;
    }

    if (o.cnt < 0) return false;
    return true;
}

/**
 * 시야 위치 조절
 */
function moveSee() {
    for (let i in see)
        see[i] = (1 - see_inert) * see[i] + see_inert * player[i];
}

/**
 * 여러 디스플레이 이펙트의 정의
 * @param {number} cnt 특정 틱 뒤에 이펙트 종료
 * @param {function} active 매 틱 실행되는 행동 (인자 1개는 display.queue 내의 index 값)
 */
function DisplayEffect(cnt, active) {
    this.cnt = cnt;
    this.active = active;
}

/**
 * objs 배열 내의 값들 정의
 * @param {function} draw2D 2D 그리기 (x,y,i)
 * @param {function} draw3D 3D 그리기 (x,y,i)
 * @param {function} move 이동시 사용 함수 (i)
 * @param {function} attack 공격 판정 함수
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @param {number} r 반경
 * @param {number} h 높이
 */
function EntityObject(draw2D, draw3D, move, attack, type, cnt, gmove, x, y, z, r, h, inScan, canMove) {
    this.draw2D = draw2D;
    this.draw3D = draw3D;
    this.move = move;
    this.attack = attack;

    this.type = type;
    this.cnt = cnt;
    this.gmove = gmove;

    this.x = x;
    this.y = y;
    this.z = z;
    this.vz = 0;
    this.r = r;
    this.h = h;
    this.th = Math.PI / 4;
    this.jump = false;

    this.inScan = inScan;
    this.canMove = canMove;
}

/**
 * 매 틱마다 이펙트를 처리
 */
function checkDisplay() {
    for (let i = 0; i < display.queue.length; i++) {
        display.queue[i].active(i);
        if (--display.queue[i].cnt <= 0)
            display.queue.splice(i--, 1);
    }
}

function makeDefaultCanMove(x1, y1, r) {
    return (x, y) => { return (x - x1) * (x - x1) + (y - y1) * (y - y1) <= r * r; }
}

// Test ZONE
let test = [];

function copyObj(o) {
    if (typeof o != "object") return o;

    let r = o.constructor();
    for (let i in o)
        r[i] = copyObj(o[i]);

    return r;
}

function isSame(o1, o2) {
    if (typeof o1 != typeof o2) return false;
    if (typeof o1 != "object") return o1 == o2;

    for (let i in o1)
        if (o1[i] != o2[i])
            return false;

    for (let i in o2)
        if (o1[i] != o2[i])
            return false;

    return true;
}

/**
 * 매 프레임마다 실행되는 함수
 */
function proc() {
    moveObjs();
    moveSee();
    show();
    checkDisplay();

    /*Test ZONE*/
    let t = copyObj(0);
    if (!test.length || !isSame(test[test.length - 1], t))
        test.push(t);
}