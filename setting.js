// 전역 변수
let offset = localStorage.getItem('offset') ? parseInt(localStorage.getItem('offset')) : 0;
let speed = localStorage.getItem('speed') ? parseInt(localStorage.getItem('speed')) : 10;
let keySound = localStorage.getItem('keySound') === 'true';

// 초기 설정값 반영
document.getElementById('offsetSlider').value = offset;
document.getElementById('offsetValue').textContent = offset;

document.getElementById('speedSlider').value = speed;
document.getElementById('speedValue').textContent = speed;

document.getElementById('keySoundToggle').checked = keySound;
document.getElementById('keySoundStatus').textContent = keySound ? "On" : "Off";

// 함수 정의
function updateOffset() {
    offset = parseInt(document.getElementById('offsetSlider').value);
    document.getElementById('offsetValue').textContent = offset;
    localStorage.setItem('offset', offset);
}

function updateSpeed() {
    speed = parseInt(document.getElementById('speedSlider').value);
    document.getElementById('speedValue').textContent = speed;
    localStorage.setItem('speed', speed);
}

function toggleKeySound() {
    keySound = document.getElementById('keySoundToggle').checked;
    document.getElementById('keySoundStatus').textContent = keySound ? "On" : "Off";
    localStorage.setItem('keySound', keySound);
}

// 뒤로가기 버튼 기능 (임시로 console 로그)
function goBack() {
    console.log("Back button clicked");
    // 실제 게임으로 돌아가는 로직 추가 필요
}
