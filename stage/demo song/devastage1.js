const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");

let score = 0;
let combo = 0;
let mxcombo = 0;
let speed = 40;
let noteTimings = [];
let currentNoteIndex = 0;
let startSyncTime = 0;
let gameStartTime; // 게임 시작 시간 저장


// 게임 시작 시 시간 동기화
window.addEventListener("load", () => {
    fetch('./beats.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').map(line => line.trim()).filter(line => line);
            parseNoteTimings(lines);
            gameStartTime = performance.now(); // 시작 시점 저장
            createNotesFromTimings(); // 노트 생성 시작
        })
        .catch(error => console.error('채보 파일을 불러오는 중 오류 발생:', error));
});


// 채보 데이터 파싱
function parseNoteTimings(lines) {
    const [BPM, beatsPerMeasure, syncTime] = lines[0].split(' ').map(Number);  
    const beatInterval = 60000 / BPM; // BPM을 사용해 한 비트 길이 계산 (밀리초)
    startSyncTime = syncTime || 0;  

    let currentMeasure = 0;
    let currentTime = 0;

    noteTimings = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '-') {  // 마디 구분
            currentMeasure++;
            currentTime = currentMeasure * beatsPerMeasure * beatInterval;
            continue;
        }

        const [beat, column] = line.split(' ').map(Number);
        const time = currentTime + (beat - 1) * beatInterval;

        // startSyncTime을 반영한 노트 타이밍 설정
        noteTimings.push({ time: time + startSyncTime, column });
    }
}

// 노트 생성 및 이동
// 노트 생성 및 이동
function spawnNote(column) {
    const note = document.createElement("div");
    note.classList.add("note");
    note.style.top = "-50px";
    note.dataset.column = column;

    const columnDiv = document.getElementById(`col-${column}`);
    if (!columnDiv) return;
    columnDiv.appendChild(note);

    const targetPosition = gameContainer.clientHeight;
    const travelDuration = 2000; // 도착 시간 고정
    const startTime = performance.now();

    function animateNote() {
        const elapsed = performance.now() - startTime;
        const normalizedElapsed = Math.min(elapsed / travelDuration, 1);
        
        // speed에 따라 위치 계산하되, 도착 시간은 일정하게 유지
        const position = normalizedElapsed * targetPosition * (speed / 20);
        note.style.top = `${position}px`;

        if (position < targetPosition) {
            requestAnimationFrame(animateNote);
        } else {
            columnDiv.removeChild(note); // 화면을 벗어나면 제거
            combo = 0;
            updateScoreDisplay();
                const animatedDiv1 = document.getElementById("panjung-miss");
                resumeAnimation()
            // 애니메이션을 시작하는 함수
            function playAnimation1() {
                animatedDiv1.style.animation = 'panjung 0.2s forwards'; // 애니메이션 시작

                // 애니메이션이 끝난 후 원래 상태로 되돌리기
                animatedDiv1.addEventListener("animationend", () => {
                    animatedDiv1.style.animation = '';
                }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
            }
            playAnimation1();
        }
    }

    requestAnimationFrame(animateNote);
}



// 일정 시간에 맞춰 노트 생성
function createNotesFromTimings() {
    function update() {
        const now = performance.now();
        const elapsed = now - gameStartTime;

        // 현재 경과 시간에 해당하는 노트를 생성
        while (currentNoteIndex < noteTimings.length && noteTimings[currentNoteIndex].time <= elapsed) {
            const { column } = noteTimings[currentNoteIndex];
            spawnNote(column);
            currentNoteIndex++;
        }

        if (currentNoteIndex < noteTimings.length) {
            requestAnimationFrame(update); // 다음 프레임에 다시 실행
        } else {
            setTimeout(endGame, 2000); // 마지막 노트 이후 2초 뒤 종료
        }
    }

    requestAnimationFrame(update); // 애니메이션 루프 시작
}


// 점수 계산
function calculateScore(panjung) {
    let comboBonus = Math.floor(combo / 10) * 5;
    if(panjung==1){
        return 10 + comboBonus;
    }else if(panjung==2){
        return 5 + comboBonus;
    }else{
        return 0;
    }
}
function resumeAnimation() {
    const element1 = document.querySelector('.panjung-perfect');
    element1.style.animationPlayState = 'none';
    const element2 = document.querySelector('.panjung-slow');
    element2.style.animationPlayState = 'none';
    const element3 = document.querySelector('.panjung-fast');
    element3.style.animationPlayState = 'none';
    const element4 = document.querySelector('.panjung-miss');
    element4.style.animationPlayState = 'none';
}

// 노트 히트 체크
function checkHit(column) {
    const columnDiv = document.getElementById(`col-${column}`);
    const notes = columnDiv.getElementsByClassName("note");

    if (notes.length === 0) return; // 노트가 없으면 반환

    const note = notes[0]; // 가장 위에 있는 첫 번째 노트만 체크
    const noteRect = note.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // 유연한 타이밍 체크 (100px 내에서 맞춘 것으로 인정)
    if (noteRect.top >= containerRect.bottom - 120 && noteRect.top <= containerRect.bottom -30) {
        combo++;
        mxcombo=Math.max(mxcombo,combo);
        score += calculateScore(1);
        updateScoreDisplay();
        note.remove(); // 맞춘 노트 제거
        const animatedDiv = document.getElementById("score");

        // 애니메이션을 시작하는 함수
        function playAnimation() {
            animatedDiv.style.animation = 'grow-shrink-shake 0.3s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv.addEventListener("animationend", () => {
                animatedDiv.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation();
        const animatedDiv1 = document.getElementById("panjung-perfect");
        resumeAnimation()
        // 애니메이션을 시작하는 함수
        function playAnimation1() {
            animatedDiv1.style.animation = 'panjung 0.2s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv1.addEventListener("animationend", () => {
                animatedDiv1.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation1();
        const animatedDiv2 = document.getElementById("glow1");
        resumeAnimation()
        // 애니메이션을 시작하는 함수
        function playAnimation2() {
            animatedDiv2.style.animation = 'glowPulse 0.2s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv2.addEventListener("animationend", () => {
                animatedDiv2.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation2();
    } else if (noteRect.top > containerRect.bottom - 150 && noteRect.top < containerRect.bottom -120) {
        combo++;
        mxcombo=Math.max(mxcombo,combo);
        score += calculateScore(2);
        updateScoreDisplay();
        note.remove(); // 맞춘 노트 제거
        const animatedDiv = document.getElementById("score");

        // 애니메이션을 시작하는 함수
        function playAnimation() {
            animatedDiv.style.animation = 'grow-shrink-shake 0.3s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv.addEventListener("animationend", () => {
                animatedDiv.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation();
        const animatedDiv1 = document.getElementById("panjung-fast");
        resumeAnimation()
        // 애니메이션을 시작하는 함수
        function playAnimation1() {
            animatedDiv1.style.animation = 'panjung 0.2s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv1.addEventListener("animationend", () => {
                animatedDiv1.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation1();
    } else if (noteRect.top > containerRect.bottom - 30 && noteRect.top < containerRect.bottom -1) {
        combo++;
        mxcombo=Math.max(mxcombo,combo);
        score += calculateScore(2);
        updateScoreDisplay();
        note.remove(); // 맞춘 노트 제거
        const animatedDiv = document.getElementById("score");

        // 애니메이션을 시작하는 함수
        function playAnimation() {
            animatedDiv.style.animation = 'grow-shrink-shake 0.3s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv.addEventListener("animationend", () => {
                animatedDiv.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation();
        const animatedDiv1 = document.getElementById("panjung-slow");
        resumeAnimation()
        // 애니메이션을 시작하는 함수
        function playAnimation1() {
            animatedDiv1.style.animation = 'panjung 0.2s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv1.addEventListener("animationend", () => {
                animatedDiv1.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation1();
    }else if (noteRect.top >= containerRect.bottom -250) {
        combo=0;
        updateScoreDisplay();
        note.remove(); // 맞춘 노트 제거
        const animatedDiv = document.getElementById("score");

        // 애니메이션을 시작하는 함수
        function playAnimation() {
            animatedDiv.style.animation = 'grow-shrink-shake 0.3s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv.addEventListener("animationend", () => {
                animatedDiv.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation();
        const animatedDiv1 = document.getElementById("panjung-miss");
        resumeAnimation()
        // 애니메이션을 시작하는 함수
        function playAnimation1() {
            animatedDiv1.style.animation = 'panjung 0.2s forwards'; // 애니메이션 시작

            // 애니메이션이 끝난 후 원래 상태로 되돌리기
            animatedDiv1.addEventListener("animationend", () => {
                animatedDiv1.style.animation = '';
            }, { once: true }); // 애니메이션이 끝난 후 다시 이벤트를 추가하지 않도록 설정
        }
        playAnimation1();
    }
}

// 점수와 콤보 업데이트
function updateScoreDisplay() {
    scoreDisplay.innerText = `Score: ${score} | Combo: ${combo}`;
}

// 키 입력 처리
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "d": case "D": checkHit(0); 
        function startAnimation1() {
            const box = document.getElementById('white1');
            
            // 애니메이션을 적용하고, 애니메이션이 끝난 후 클래스를 제거하여 다시 실행 가능하게 설정
            box.classList.add('animate-fade');
            box.addEventListener('animationend', () => {
                box.classList.remove('animate-fade');
            }, { once: true });
        }
        startAnimation1();
        // function playEffect() {
        //     const effectSound = document.getElementById("effect-sound");
        //     effectSound.currentTime = 0; // 매번 처음부터 재생
        //     effectSound.play();
        // }
        // playEffect();
            break;
        case "f": case "F": checkHit(1); 
        function startAnimation2() {
            const box = document.getElementById('white2');
            
            // 애니메이션을 적용하고, 애니메이션이 끝난 후 클래스를 제거하여 다시 실행 가능하게 설정
            box.classList.add('animate-fade');
            box.addEventListener('animationend', () => {
                box.classList.remove('animate-fade');
            }, { once: true });
        }
        startAnimation2();
        // function playEffect() {
        //     const effectSound = document.getElementById("effect-sound");
        //     effectSound.currentTime = 0; // 매번 처음부터 재생
        //     effectSound.play();
        // }
        // playEffect();
            break;
        case "j": case "J": checkHit(2); 
        function startAnimation3() {
            const box = document.getElementById('white3');
            
            // 애니메이션을 적용하고, 애니메이션이 끝난 후 클래스를 제거하여 다시 실행 가능하게 설정
            box.classList.add('animate-fade');
            box.addEventListener('animationend', () => {
                box.classList.remove('animate-fade');
            }, { once: true });
        }
        startAnimation3();
        // function playEffect() {
        //     const effectSound = document.getElementById("effect-sound");
        //     effectSound.currentTime = 0; // 매번 처음부터 재생
        //     effectSound.play();
        // }
        // playEffect();
            break;
        case "k": case "K": checkHit(3); 
        function startAnimation4() {
            const box = document.getElementById('white4');
            
            // 애니메이션을 적용하고, 애니메이션이 끝난 후 클래스를 제거하여 다시 실행 가능하게 설정
            box.classList.add('animate-fade');
            box.addEventListener('animationend', () => {
                box.classList.remove('animate-fade');
            }, { once: true });
        }
        startAnimation4();
        // function playEffect() {
        //     const effectSound = document.getElementById("effect-sound");
        //     effectSound.currentTime = 0; // 매번 처음부터 재생
        //     effectSound.play();
        // }
        // playEffect();
            break;
    }
});


function endGame() {
    const finalScore = score;
    const finalMaxCombo = mxcombo;

    // 게임 성적에 따라 메시지 설정
    let message;
    if (finalScore >= 490) {
        message = 'Full combo!';
        function startAnimation4() {
            const box = document.getElementById('fullcombo');
            
            // 애니메이션을 적용하고, 애니메이션이 끝난 후 클래스를 제거하여 다시 실행 가능하게 설정
            box.classList.add('animate-fullcombo');
            box.addEventListener('animationend', () => {
                box.classList.remove('animate-fullcombo');
            }, { once: true });
        }
        startAnimation4();
    } else if (finalScore >= 360&&finalScore < 490) {
        message = 'Perfect!';
    } else if (finalScore >= 240&&finalScore < 360) {
        message = 'Great!';
    } else if (finalScore >= 120&&finalScore < 240) {
        message = 'Good!';
    }else if (finalScore >= 60&&finalScore < 120) {
        message = 'Bad!';
    }else {
        message = 'Fail!';
    }
    setTimeout(goresult, 1000);
    function goresult(){
        // 결과 화면으로 이동하며 점수와 콤보, 메시지를 전달
        window.location.href = `result.html?score=${finalScore}&maxCombo=${finalMaxCombo}&message=${encodeURIComponent(message)}`;
    }
}

// 게임 종료 조건 예시
function createNotesFromTimings() {
    if (currentNoteIndex < noteTimings.length) {
        const { time, column } = noteTimings[currentNoteIndex];
        setTimeout(() => {
            spawnNote(column);
            currentNoteIndex++;
            createNotesFromTimings();
        }, time - (currentNoteIndex > 0 ? noteTimings[currentNoteIndex - 1].time : 0));
    } else {
        // 모든 노트가 떨어진 후 2초 뒤에 게임 종료
        setTimeout(endGame, 2000);
    }
}
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    if(combo == 0){
        let starspeed = 10;
            // 랜덤한 크기와 방향 설정
    const size = Math.random() * 5 + 1;
    const angle = Math.random() * 2 * Math.PI;
    const distance = 800; // 중앙에서 퍼져나가는 거리 설정
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = "50%";
    star.style.top = "50%";
    star.style.transformOrigin = "center";
    star.style.setProperty("--x", `${x}px`);
    star.style.setProperty("--y", `${y}px`);
    star.style.animationDuration = `${starspeed}s`;

    document.body.appendChild(star);

    star.addEventListener('animationend', () => {
        star.remove();
    });
    }else if(combo<10){
        let starspeed = 10*((2.7)**(-0.0046*combo));
            // 랜덤한 크기와 방향 설정
    const size = Math.random() * 5 + 1;
    const angle = Math.random() * 2 * Math.PI;
    const distance = 800; // 중앙에서 퍼져나가는 거리 설정
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = "50%";
    star.style.top = "50%";
    star.style.transformOrigin = "center";
    star.style.setProperty("--x", `${x}px`);
    star.style.setProperty("--y", `${y}px`);
    star.style.animationDuration = `${starspeed}s`;

    document.body.appendChild(star);

    star.addEventListener('animationend', () => {
        star.remove();
    });
    }
}

setInterval(createStar,1000);