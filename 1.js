let ctx;
const c_width = 500;
const c_height = 700;
const seeinert = 0.1;

const basex2d = c_width - 110;
const basey2d = 110;
const basex3d = c_width/2;
const basey3d = c_height/2;
const rad2d = 100;

const w2d = 15 * Math.cos(Math.PI / 4);
const h2d = 15 * Math.sin(Math.PI / 4);
const w3d = 50 * Math.cos(Math.PI / 6);
const h3d = 50 * Math.sin(Math.PI / 6);
const player_rad = 0.2;
const player_height = 0.2;
const prad2d = 10;
const prad3d = 50 * player_rad;

const usekey = ['w', 'a', 's', 'd', ' '];

let data;
let width, height;
let player;
let see;
let keystat = {};

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
            ctx.fillRect(basex2d-rad2d, basey2d-rad2d, 2*rad2d, 2*rad2d);

            ctx.translate(tx, ty);

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#ffffff";
            ctx.lineWidth = 1;
            break;

        case 2:
            var tx = basex3d - (height + see.x - see.y) * w3d;
            var ty = basey3d - ( - width - height + see.y + see.x - 2 * see.z) * h3d;

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

function makeColor(num) {
    const max_num = 8;
    const min_color = 32;

    let r = "#";
    let a = 255 - (255 - min_color) * Math.abs(num) / max_num;
    a = (a < min_color) ? min_color : 0 | a;
    a = (a < 16) ? ('0' + a.toString(16)) : a.toString(16);

    if (num >= 0)
        return '#' + a + a + 'ff';
    return '#ff' + a + a;
}

/**
 * 화면 출력
 */
function show() {
    setContext(0);
    ctx.fillRect(0, 0, c_width, c_height);

    // 입체
    setContext(2);

    function showPlayer() {
        let px3d = height - player.y + player.x;
        let py3d = - width - height + player.y + player.x - 2 * player.z;
        let ply3d = - width - height + player.y + player.x - 2 * (player.z - player_height);
        let phy3d = - width - height + player.y + player.x - 2 * (player.z + player_height);
        let ky3d = - width - height + player.y + player.x - 2 * data[0 | player.y][0 | player.x];

        // 그림자
        ctx.beginPath();
        ctx.fillStyle = "#00000044";
        ctx.arc(px3d * w3d, ky3d * h3d, prad3d, 0, 2 * Math.PI);
        ctx.fill();

        // 플레이어
        ctx.beginPath();
        ctx.fillStyle = "#00ffff";
        ctx.arc(px3d * w3d, py3d * h3d, prad3d, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px3d * w3d, py3d * h3d);
        ctx.lineTo(px3d * w3d + prad3d * Math.cos(player.th + Math.PI / 4),
            py3d * h3d + prad3d * Math.sin(player.th + Math.PI / 4));
        ctx.stroke();
    }

    let player_i = (0|player.x) + (0|player.y);
    for (let i = 0; i < width + height; i++) {
        for (let j = i < height ? 0 : i - height + 1; j < (i < width ? i + 1 : width); j++) {
            if (data[i-j][j] == 0) continue;

            let x = height - (i - j) + j;
            let y = - width - height + (i-j) + j;
            let d = data[i-j][j];

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
        
        if (player_i == i)
            showPlayer();
    }

    // 평면
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
    ctx.restore();
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
        [99, 98, 89, 88, 71, 70, 45, 44, 11, 10],
        [100, 97, 90, 87, 72, 69, 46, 43, 12, 9],
        [95, 96, 91, 86, 73, 68, 47, 42, 13, 8],
        [94, 93, 92, 85, 74, 67, 48, 41, 14, 7],
        [81, 82, 83, 84, 75, 66, 49, 40, 15, 6],
        [80, 79, 78, 77, 76, 65, 50, 39, 16, 5],
        [59, 60, 61, 62, 63, 64, 51, 38, 17, 4],
        [58, 57, 56, 55, 54, 53, 52, 37, 18, 3],
        [29, 30, 31, 32, 33, 34, 35, 36, 19, 2],
        [28, 27, 26, 25, 24, 23, 22, 21, 20, 1],
    ];
    /**/
    data = [
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 3, 1],
    ];
    /**/

    width = data[0].length;
    height = data.length;

    player = {};
    player.x = width - 0.5;
    player.y = height - 0.5;
    player.z = data[height - 1][width - 1];
    player.th = - Math.PI / 4;
    player.zv = 0;

    see = {};
    see.x = player.x;
    see.y = player.y;
    see.z = player.z;
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
 * 매 프레임마다 실행되는 함수
 */
function proc() {
    const p_move = 0.15;
    const xycheck = 1;

    let dx = 0, dy = 0;
    let min, max;
    let ind;

    if (keystat.w) { dx--; dy--; }
    if (keystat.a) { dx--; dy++; }
    if (keystat.s) { dx++; dy++; }
    if (keystat.d) { dx++; dy--; }

    dx = limiter(dx, -1, 1);
    dy = limiter(dy, -1, 1);

    for (ind = 0; (ind < xycheck) && ((0 | player.x - ind) > 0); ind++)
        if (player.z < data[0 | player.y][0 | player.x - ind - 1])
            break;
    min = limiter((0 | player.x - ind) + player_rad, 0, width - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | player.x + ind + 1) < width); ind++)
        if (player.z < data[0 | player.y][0 | player.x + ind + 1])
            break;
    max = limiter((0 | player.x + ind + 1) - player_rad, 0, width - 0.01);
    player.x = limiter(player.x + p_move * dx, min, max);

    for (ind = 0; (ind < xycheck) && ((0 | player.y - ind) > 0); ind++)
        if (player.z < data[0 | player.y - ind - 1][0 | player.x])
            break;
    min = limiter((0 | player.y - ind) + player_rad, 0, height - 0.01);
    for (ind = 0; (ind < xycheck) && ((0 | player.y + ind + 1) < height); ind++)
        if (player.z < data[0 | player.y + ind + 1][0 | player.x])
            break;
    max = limiter((0 | player.y + ind + 1) - player_rad, 0, height - 0.01);
    player.y = limiter(player.y + p_move * dy, min, max);

    if (dx || dy) player.th = Math.PI * ((dx == 1 && dy == 0) ? 0 : dy * (-dx - 2) + 4) / 4;

    if (player.zv == 0 && keystat[' '])
        player.zv = 0.55;

    if (player.zv || player.z > data[0 | player.y][0 | player.x]) {
        player.z += player.zv;
        player.zv -= 0.1;
    }

    if (player.z < data[0 | player.y][0 | player.x] + player_height) {
        player.z = data[0 | player.y][0 | player.x] + player_height;
        player.zv = 0;
    }

    if (player.z <= 0) {
        console.log("떨어짐");
        player.x = width - 0.5;
        player.y = height - 0.5;
        player.z = data[height - 1][width - 1];
        player.th = - Math.PI / 4;
        player.zv = 0;
    }

    for (let i in see)
        see[i] = (1-seeinert)*see[i] + seeinert*player[i];

    show();

    return;
}