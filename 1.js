let ctx;
const c_width = 500;
const c_height = 700;
const usekey = ['w', 'a', 's', 'd'];

let data;
let width, height;
let player;
let keystat = {};

window.onload = () => {
    let output = document.getElementById('output');
    output.width = c_width;
    output.height = c_height;
    ctx = output.getContext('2d');

    window.onkeydown = (e)=>{ if (usekey.includes(e.key)) keystat[e.key] = true; };
    window.onkeyup = (e)=>{ if (usekey.includes(e.key)) keystat[e.key] = false; };
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
            ctx.translate(c_width - 150, 10);
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#ffffff";
            break;

        case 2:
            ctx.translate(10, c_height - 10);
            ctx.strokeStyle = "#000000";
            break;

        default:
            ctx.translate(0, 0);
            ctx.fillStyle = "#444444";
            ctx.textAlign = "center";
            break;
    }
}

/**
 * (x, y, z)를 출력 장소 좌표로 변환
 * @param {number} x 
 * @param {number} y 
 * @param {number} z
 */
function to2d(x, y, z) {
    return [height - y + x, - width - height + y + x - 2 * z];
}

/**
 * 화면 출력
 */
function show() {
    setContext(0);
    ctx.fillRect(0, 0, c_width, c_height);

    const gap = 30;
    const player_rad = 10;
    const w3d = 30 * Math.cos(Math.PI / 6);
    const h3d = 30 * Math.sin(Math.PI / 6);

    // 평면
    setContext(1);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            ctx.fillRect(j * gap, i * gap, gap, gap);
            ctx.strokeText(data[i][j], (j + 0.5) * gap, (i + 0.5) * gap + 5);
            ctx.strokeRect(j * gap, i * gap, gap, gap);
        }
    }

    ctx.beginPath();
    ctx.fillStyle = "#00ffff";
    ctx.arc(player[0]*gap, player[1]*gap, player_rad, 0, 2*Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player[0] * gap, player[1] * gap);
    ctx.lineTo(player[0] * gap + player_rad * Math.cos(player[3]),
        player[1] * gap + player_rad * Math.sin(player[3]));
    ctx.stroke();

    // 입체
    setContext(2);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let x = height - i + j;
            let y = - width - height + i + j;
            let d = data[i][j];

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
    }

    var p = to2d(player[0], player[1], player[2]);
    
    ctx.beginPath();
    ctx.fillStyle = "#00ffff";
    ctx.arc(p[0] * w3d, p[1] * h3d, player_rad, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p[0] * w3d, p[1] * h3d);
    ctx.lineTo(p[0] * w3d + player_rad * Math.cos(player[3]),
        p[1] * h3d + player_rad * Math.sin(player[3]));
    ctx.stroke();
}

/**
 * 프로그램 내부 값 초기화
 */
function initData() {
    data = [
        [7, 6, 5, 4],
        [6, 5, 4, 3],
        [5, 4, 3, 2],
        [4, 3, 2, 1],
        [3, 2, 1, 0]
    ];

    width = data[0].length;
    height = data.length;

    player = [0.5, 0.5, data[0][0], 0, 0];
}

/**
 * x를 min과 max의 사잇값으로 만든다.
 * @param {number} x 계산 값
 * @param {number} min 최솟값
 * @param {number} max 최댓값
 */
function limiter(x, min, max)
{
    if (x < min) return min;
    if (max < x) return max;
    return x;
}

/**
 * 매 프레임마다 실행되는 함수
 */
function proc()
{
    // key Event
    const p_move = 0.2;

    let dx = 0;
    let dy = 0;

    if (keystat.w) { dx--; dy--; }
    if (keystat.a) { dx--; dy++; }
    if (keystat.s) { dx++; dy++; }
    if (keystat.d) { dx++; dy--; }

    dx = limiter(dx, -1, 1);
    dy = limiter(dy, -1, 1);

    if (dx || dy) player[3] = Math.PI*((dx == 1 && dy == 0) ? 0 : dy * (-dx + 2) + 4)/4;
    // TODO

    player[0] = limiter(player[0] + p_move*dx, 0, width);
    player[1] = limiter(player[1] + p_move*dy, 0, height);

    show();

    return;
}