let ctx;
const c_width = 700;
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
const player_v = 0.15;

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
            var tx = basex2d - (height + player.pos.x - player.pos.y) * w2d;
            var ty = basey2d - (- width - height + player.pos.x + player.pos.y) * h2d;

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
    num += player.pos.h;
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
    player = makePlayer();
    objs.push(player);
    objs.push(makeEnemy());

    see = {};
    see.x = player.pos.x;
    see.y = player.pos.y;
    see.z = player.pos.z;

    display.queue = [];

    // 플레이어의 기본 모션
    display.queue.push(new DisplayEffect(40, (i) => {
        display.player_k = Math.cos(Math.PI * display.queue[i].cnt / 20) / 20 + 0.35;
        if (display.queue[i].cnt == 1)
            display.queue[i].cnt = 40;
    }));
}

/**
 * a, b 객체가 충돌했는지 판단함.
 * @param {oid} a 
 * @param {oid} b 
 */
function isOverlap(a, b) {
    let ap = objs[a].pos;
    let bp = objs[b].pos;

    if ((bp.x - ap.x) * (bp.x - ap.x) + (bp.y - ap.y) * (bp.y - ap.y) >=
        (ap.r + bp.r) * (ap.r + bp.r))
        return false;
    if (Math.abs((ap.z - ap.h) - (bp.z - bp.h)) >= 1)
        return false;
    return true;
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
    drawShadow(player.pos.x, player.pos.y);

    // 플레이어
    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i <= 6; i += 0.1) {
        let x = height
            + (player.pos.x + player.pos.r * Math.cos(i * Math.PI - player.pos.th))
            - (player.pos.y + player.pos.r * Math.sin(i * Math.PI - player.pos.th));
        let y = - width - height
            + (player.pos.x + player.pos.r * Math.cos(i * Math.PI - player.pos.th))
            + (player.pos.y + player.pos.r * Math.sin(i * Math.PI - player.pos.th))
            - 2 * (player.pos.z + (i * display.player_k - 1) * player.pos.h);

        if (i) ctx.lineTo(x * w3d, y * h3d);
        else ctx.moveTo(x * w3d, y * h3d);
    }
    ctx.stroke();

    let x = height + (player.pos.x) - (player.pos.y);
    let y = - width - height + (player.pos.x) + (player.pos.y)
        - 2 * ((8 * display.player_k - 1) * player.pos.h + player.pos.z);

    ctx.strokeStyle = "#444444";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x * w3d, y * h3d, 12, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (Math.cos(player.pos.th - Math.PI / 4) >= -0.01) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x * w3d + 11 * Math.cos(player.pos.th + (0.25 + 0.15) * Math.PI), y * h3d, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x * w3d + 11 * Math.cos(player.pos.th + (0.25 - 0.15) * Math.PI), y * h3d, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

/**
 * player의 커서 함수
 */
function draw2DPlayer() {
    let px2d = height + player.pos.x - player.pos.y;
    let py2d = - width - height + player.pos.x + player.pos.y;

    ctx.beginPath();
    ctx.fillStyle = "#00ffff";
    ctx.moveTo(px2d * w2d, py2d * h2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.pos.th - Math.PI / 2) * prad2d,
        py2d * h2d + Math.sin(player.pos.th - Math.PI / 2) * prad2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.pos.th + Math.PI / 4) * prad2d,
        py2d * h2d + Math.sin(player.pos.th + Math.PI / 4) * prad2d);
    ctx.lineTo(px2d * w2d + Math.cos(player.pos.th + Math.PI) * prad2d,
        py2d * h2d + Math.sin(player.pos.th + Math.PI) * prad2d);
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

            ctx.fillStyle = makeColor(data[i][j] - player.pos.z);

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
        let x = height + o.pos.x - o.pos.y;
        let y = - width - height + o.pos.x + o.pos.y;
        o.func.draw2D(x, y, i);
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
        entity_check[i].x = height + (o.pos.x) - (o.pos.y);
        entity_check[i].y = - width - height + (o.pos.x) + (o.pos.y) - 2 * (o.pos.z);
        entity_check[i].i = (0 | o.pos.x) + (0 | o.pos.y);
        entity_check[i].dia = 0 | o.pos.x - o.pos.y;
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

                if (e.check && o.pos.z < d &&
                    (e.dia >= 2 * j - i - 2 && e.dia <= 2 * j - i + 1)) {
                    o.func.draw3D(e.x, e.y, k);
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
            objs[i].func.draw3D(entity_check[i].x, entity_check[i].y, i);
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

    if (!o.pos.jump && keystat[' ']) {
        o.pos.jump = true;

        // 점프 모션
        if (i == 0)
            display.queue.push(new DisplayEffect(10, (i) => {
                display.player_k = -0.1 * Math.cos(((10 - display.queue[i].cnt) / 9) * Math.PI) + 0.3;

                if (display.queue[i].cnt == 10)
                    player.pos.vz = 0.55;
                if (display.queue[i].cnt == 1)
                    display.queue[i].cnt = 2;

                if (!player.jump) {
                    display.queue[i].cnt = 0;
                    display.queue[0].cnt = 40;
                }
            }));
        else
            o.pos.vz = 0.55;
    }

    return r;
}

/**
 * 임시
 */
function makeDefaultmove(i) {
    const d_data = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
    ];

    let d = [];
    for (let i=0; i<height; i++) {
        d.push([]);
        for (let j=0; j<width; j++)
            d[i].push({ dir: -1, len: 0 });
    }

    let ep = objs[i].pos;
    let pp = player.pos;

    function _setBoard(x, y, d, l) {
        d[y][x].dir = 5 - d;
        d[y][x].len = l + 1;
        if (x == (0 | ep.x) && y == (0 | ep.y)) return true;

        for (let i=1; i<=4; i++) {
            let dx = d_data[0][0];
            let dy = d_data[0][1];
            
            if ((x+dx) < 0 || (x+dx) >= width ||
                (y+dy) < 0 || (y+dy) >= height) continue;  
            if (data[y+dy][x+dx] - data[y][x] >= -1) continue;
            if (d[y][x].dir != -1) continue;

            if (_setBoard(x + dx, y + dy, i, l + 1)) return true;
        }

        return false;
    }

    _setBoard(0 | pp.x, 0 | pp.y, 5, 0);

    let r = { x: 0, y: 0 };
    return r;
}

/**
 * i객체를 1틱 뒤의 상황으로 움직임
 * @param {oid} i 
 */
function moveobj(i) {
    let o = objs[i];
    let d = o.func.move(i);

    let xycheck = 0 | o.pos.v + 1;
    let min, max;
    let ind;

    for (ind = 0; (ind < xycheck) && ((0 | o.pos.x - ind) > 0); ind++)
        if (o.pos.z < data[0 | o.pos.y][0 | o.pos.x - ind - 1])
            break;
    min = limiter((0 | o.pos.x - ind) + o.pos.v, 0, width - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | o.pos.x + ind + 1) < width); ind++)
        if (o.pos.z < data[0 | o.pos.y][0 | o.pos.x + ind + 1])
            break;
    max = limiter((0 | o.pos.x + ind + 1) - o.pos.v, 0, width - 0.01);
    o.pos.x = limiter(o.pos.x + o.pos.v * d.x, min, max);

    for (ind = 0; (ind < xycheck) && ((0 | o.pos.y - ind) > 0); ind++)
        if (o.pos.z < data[0 | o.pos.y - ind - 1][0 | o.pos.x])
            break;
    min = limiter((0 | o.pos.y - ind) + o.pos.v, 0, height - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | o.pos.y + ind + 1) < height); ind++)
        if (o.pos.z < data[0 | o.pos.y + ind + 1][0 | o.pos.x])
            break;
    max = limiter((0 | o.pos.y + ind + 1) - o.pos.v, 0, height - 0.01);
    o.pos.y = limiter(o.pos.y + o.pos.v * d.y, min, max);

    if (d.x || d.y) o.pos.th = Math.PI * ((d.x == 1 && d.y == 0) ? 0 : d.y * (-d.x - 2) + 4) / 4;

    if (o.pos.jump || o.pos.z > data[0 | o.pos.y][0 | o.pos.x] + o.pos.h) {
        o.pos.z += o.pos.vz;
        o.pos.vz -= 0.1;
    }

    if (o.pos.z < data[0 | o.pos.y][0 | o.pos.x] + o.pos.h) {
        o.pos.z = data[0 | o.pos.y][0 | o.pos.x] + o.pos.h;
        o.pos.vz = 0;
        o.pos.jump = false;
    }

    if (o.pos.z <= o.pos.h) {
        console.log("떨어짐");
        o.pos.x = width - 0.5;
        o.pos.y = height - 0.5;
        o.pos.z = data[height - 1][width - 1];
        o.pos.th = - Math.PI / 4;
        o.pos.vz = 0;
        o.pos.jump = false;
    }

    if (o.att.hp <= 0) {
        console.log("죽음");
        o.pos.x = width - 0.5;
        o.pos.y = height - 0.5;
        o.pos.z = data[height - 1][width - 1];
        o.pos.th = - Math.PI / 4;
        o.pos.vz = 0;
        o.pos.jump = false;
        o.att.hp = 10;
    }

    if (o.cnt < 0) return false;
    return true;
}

/**
 * 시야 위치 조절
 */
function moveSee() {
    for (let i in see)
        see[i] = (1 - see_inert) * see[i] + see_inert * player.pos[i];
}

/**
 * 모든 오브젝트들의 충돌 여부를 검사함
 */
function attackObjs() {
    for (let i = 0; i < objs.length - 1; i++) {
        for (let j = i + 1; j < objs.length; j++) {
            doAttack(i, j);
            doAttack(j, i);
        }
    }
}

/**
 * a가 h를 때림
 * @param {oid} a attacker
 * @param {oid} h hitter
 */
function doAttack(a, h) {
    let ta = objs[a].att.type;
    let th = objs[h].att.type;

    if (Math.abs(th) < 2) return;
    if (ta * th >= 0) return;
    if (ta == 2) return;
    if (!isOverlap(a, h)) return;

    let d = objs[a].func.attack(a, h);
    objs[h].func.hit(a, h, d);
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
 * 엔티티 정의
 * @param {Position} pos 
 * @param {Attribute} att 
 * @param {Callbacks} func 
 * @param {number} cnt cnt 틱 이후에 사라짐(단, 음수면 유지됨)
 */
function EntityObject(pos, att, func, cnt) {
    this.pos = pos;
    this.att = att;
    this.func = func;

    this.cnt = cnt;
}

/**
 * EntityObject의 좌표 및 물리적 정보
 * @param {number} x 좌표
 * @param {number} y 좌표
 * @param {number} z 좌표
 * @param {number} r 반경
 * @param {number} h 높이
 * @param {number} v 평면방향 이동 속도
 */
function Position(x, y, z, r, h, v) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.v = v;
    this.vz = 0;
    this.jump = false;

    this.th = Math.PI / 4;
    this.r = r;
    this.h = h;
}

/**
 * EntityObject의 성질
 * @param {number} type 타입
 * @param {number} magic 마법 속성
 * @param {number} hp 
 * @param {number} mp 
 */
function Attribute(type, magic, hp, mp) {
    this.type = type;
    this.magic = magic;
    this.skills = [];

    this.hp = hp;
    this.mp = mp;
}

/**
 * 
 * @param {function} draw2D 미니맵 오브젝트 커서 그리기 함수
 * @param {function} draw3D 맵 오브젝트 커서 그리기 함수
 * @param {function} move 움직임 정의 함수
 * @param {function} attack 공격함수
 * @param {function} hit 피격함수
 * @param {function} inScan 플레이어 스캔 여부 지정
 * @param {function} canMove 이동 가능 좌표 지정
 */
function Callbacks(draw2D, draw3D, move, attack, hit, inScan, canMove) {
    this.draw2D = draw2D;
    this.draw3D = draw3D;

    this.move = move;
    this.attack = attack;
    this.hit = hit;

    this.inScan = inScan;
    this.canMove = canMove;
}

/**
 * 임시
 */
function Magic() {
    this.a = 0;
}

function makePlayer() {
    let pos = new Position(width - 0.5, height - 0.5, data[height - 1][width - 1],
        player_rad, player_height, player_v);
    let att = new Attribute(2, new Magic(), 10, 10);
    let func = new Callbacks(draw2DPlayer, draw3DPlayer,
        movePlayer, () => { return 0; }, (a, h, d) => { player.att.hp -= d; },
        () => { return false; }, () => { return true; });
    return new EntityObject(pos, att, func, -1);
}

function makeEnemy() {
    let pos = new Position(1.5, 1.5, data[1][1],
        0.2, 0.2, player_v);
    let att = new Attribute(-2, new Magic(), 10, 10);
    let func = new Callbacks((x, y, i) => {//2D
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc((x) * w2d, (y) * h2d, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }, (x, y, i) => {//3D
        drawShadow(objs[i].x, objs[i].y);
        ctx.save();
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc((x) * w3d, (y) * h3d, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },
        movePlayer, (a, h) => { return 1; }, () => { },
        () => { return false; }, () => { return true; });
    return new EntityObject(pos, att, func, -1);
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

function makeDefaultCircle(x1, y1, r) {
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
    attackObjs();
    moveSee();
    show();
    checkDisplay();

    /*Test ZONE*/
    let t = copyObj(player.att.hp);
    if (!test.length || !isSame(test[test.length - 1], t))
        test.push(t);
}