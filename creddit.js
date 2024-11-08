const columns = [];

// col-0부터 col-49까지의 요소를 columns 배열에 추가
for (let i = 0; i < 50; i++) {
    columns.push(document.getElementById(`col-${i}`));
}
const scoreDisplay = document.getElementById('score');
const panjungPerfect = document.getElementById('panjung-perfect');
const panjungSlow = document.getElementById('panjung-slow');
const panjungFast = document.getElementById('panjung-fast');
const panjungMiss = document.getElementById('panjung-miss');
const fullComboText = document.getElementById('fullcombo');

let score = 0;
let mxcombo = 0;
let combo = 0;
let notes = [];
let noteTimings = [];
let nextNoteIndex = 0;
let gameStartTime = 0;
const noteTravelDuration = 4000; // Time for the note to travel down (milliseconds)
let keysPressed = {}; // Tracks currently pressed keys

// Create note object
function createNote(columnIndex, hitTime, duration = 0) {
    const note = document.createElement('div');

    if (duration > 0) {
        note.classList.add('long-note');
        note.dataset.duration = duration;
    } else {
        note.classList.add('note');
    }

    note.dataset.hitTime = hitTime; // Set absolute hit time for the note
    columns[columnIndex].appendChild(note);
    notes.push({
        element: note,
        columnIndex: columnIndex,
        hitTime: hitTime,
        duration: duration,
        isHolding: false,
        judged: false,
        releaseJudged: false,
        holdStartTime: null, // Time when the hold started
    });
}

// Start the game
function startGame() {
    gameStartTime = performance.now(); // Save the game start time
    requestAnimationFrame(updateGame);
}

// Calculate score
function calculateScore(panjung) {
    let comboBonus = Math.floor(combo / 10) * 30;
    if (panjung == 1) {
        return 1000 + comboBonus;
    } else if (panjung == 2) {
        return 500 + comboBonus;
    } else {
        return 0;
    }
}

// Game update function
function updateGame() {
    const currentTime = performance.now() - gameStartTime;

    // Create notes based on chart data
    while (nextNoteIndex < noteTimings.length && noteTimings[nextNoteIndex].time - noteTravelDuration <= currentTime) {
        const noteData = noteTimings[nextNoteIndex];
        createNote(noteData.column, noteData.time, noteData.duration);
        nextNoteIndex++;
    }

    // Move notes and handle judgments
    notes.forEach((note, index) => {
        const timeToHit = note.hitTime - currentTime; // Time remaining to hit

        if (note.duration > 0) {
            // Handling long notes
            const noteEndTime = note.hitTime + note.duration;
            const timeToEnd = noteEndTime - currentTime;

            // Positioning and size calculation
            let startY = (1 - timeToHit / noteTravelDuration) * 600;
            let endY = (1 - timeToEnd / noteTravelDuration) * 600;

            let top = Math.min(startY, endY);
            let height = Math.abs(endY - startY);

            // Visual shrinking effect while holding
            if (note.isHolding) {
                const holdProgress = (currentTime - note.holdStartTime) / note.duration;
                height = height * (1 - holdProgress);
                if (height < 0) height = 0;
            }

            note.element.style.top = `${top}px`;
            note.element.style.height = `${height}px`;

            // Judging initial hit
            if (!note.judged && Math.abs(timeToHit) <= 300) {
                if (keysPressed[getKeyByColumn(note.columnIndex)]) {
                    // Initial hit is successful
                    note.isHolding = true;
                    note.judged = true;
                    note.holdStartTime = currentTime;

                    // Handle judgment
                    let snotefar = note.hitTime - currentTime;
                    if (Math.abs(snotefar) <= 40) {
                        score += calculateScore(1);
                        combo++;
                        mxcombo = Math.max(mxcombo, combo);
                        playPerfectAnimation();
                        handleNoteHit(nextNoteIndex)
                    } else if (Math.abs(snotefar) <= 80) {
                        score += calculateScore(2);
                        combo++;
                        mxcombo = Math.max(mxcombo, combo);
                        if (snotefar > 0) {
                            playFastAnimation();
                            handleNoteHit(nextNoteIndex);
                        } else {
                            playSlowAnimation();
                            handleNoteHit(nextNoteIndex)
                        }
                    } else if (Math.abs(snotefar) <= 300) {
                        combo = 0;
                        updateScoreDisplay();
                        playMissAnimation();
                    }
                    updateScoreDisplay();
                } else if (timeToHit <= -300) {
                    // Missed the note
                    note.element.remove();
                    notes.splice(index, 1);
                    combo = 0;
                    updateScoreDisplay();
                    playMissAnimation();
                }
            }

            // Handle holding and release
            if (note.isHolding) {
                // Increment score over time
                score += 10; // Adjust the increment value as needed
                updateScoreDisplay();

                const timeAfterEnd = currentTime - noteEndTime;

                if (!keysPressed[getKeyByColumn(note.columnIndex)]) {
                    // Key released
                    handleKeyRelease(columnIndex);
                } else if (timeAfterEnd > 500 && !note.releaseJudged) {
                    // Player didn't release the key in time
                    note.isHolding = false;
                    note.releaseJudged = true;
                    note.element.remove();
                    notes = notes.filter(n => n !== note);
                    combo = 0;
                    updateScoreDisplay();
                    playMissAnimation();
                }

                // Remove the note visually if height is zero
                if (height <= 0 && !note.releaseJudged) {
                    note.element.style.display = 'none'; // Hide the element
                }
            }
        } else {
            // Handling normal notes
            note.element.style.top = `${(1 - timeToHit / noteTravelDuration) * 600}px`; // Adjust top position based on absolute time

            // Miss handling if the note passes the judgment line
            if (timeToHit <= -300) { // After miss judgment time
                note.element.remove();
                notes.splice(index, 1);
                combo = 0; // Reset combo
                updateScoreDisplay();
                playMissAnimation();
            }
        }
    });

    if (nextNoteIndex >= noteTimings.length && notes.length === 0) {
        setTimeout(endGame, 2000); // Call endGame when all notes are gone
    } else {
        requestAnimationFrame(updateGame); // Continue updating if there are remaining notes
    }
}

// Handle keydown and keyup events
window.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    if (keysPressed[key]) return; // Ignore if the key is already pressed
    keysPressed[key] = true;
    let columnIndex = null;

    if (key === 'D') {
        columnIndex = 0;
        startAnimation('white1');
    } else if (key === 'F') {
        columnIndex = 1;
        startAnimation('white2');
    } else if (key === 'J') {
        columnIndex = 2;
        startAnimation('white3');
    } else if (key === 'K') {
        columnIndex = 3;
        startAnimation('white4');
    }

    if (columnIndex !== null) {
        checkHit(columnIndex);
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toUpperCase();
    keysPressed[key] = false;
    let columnIndex = null;

    if (key === 'D') {
        columnIndex = 0;
    } else if (key === 'F') {
        columnIndex = 1;
    } else if (key === 'J') {
        columnIndex = 2;
    } else if (key === 'K') {
        columnIndex = 3;
    }

    if (columnIndex !== null) {
        handleKeyRelease(columnIndex);
    }
});

// Check for note hits
function checkHit(columnIndex) {
    const currentTime = performance.now() - gameStartTime;
    const notesInColumn = notes.filter(note => note.columnIndex === columnIndex);

    // Find the closest unjudged note
    let closestNote = null;
    let smallestTimeDiff = Infinity;

    for (const note of notesInColumn) {
        // Skip notes that are already judged (e.g., long notes being held)
        if (note.judged) continue;

        const timeDiff = Math.abs(note.hitTime - currentTime);
        if (timeDiff < smallestTimeDiff) {
            smallestTimeDiff = timeDiff;
            closestNote = note;
        }
    }

    if (closestNote && smallestTimeDiff <= 300) { // If within judgment range
        const snotefar = closestNote.hitTime - currentTime;

        if (closestNote.duration > 0) {
            // Long note initial hit
            if (Math.abs(snotefar) <= 40) {
                // Perfect
                score += calculateScore(1);
                combo++;
                mxcombo = Math.max(mxcombo, combo);
                playPerfectAnimation();
                handleNoteHit(columnIndex)
            } else if (Math.abs(snotefar) <= 80) {
                // Fast or Slow
                score += calculateScore(2);
                combo++;
                mxcombo = Math.max(mxcombo, combo);
                if (snotefar > 0) {
                    playFastAnimation();
                    handleNoteHit(columnIndex)
                } else {
                    playSlowAnimation();
                    handleNoteHit(columnIndex)
                }
            } else if (Math.abs(snotefar) <= 300){
                // Miss
                combo = 0;
                playMissAnimation();
            }
            updateScoreDisplay();
            closestNote.isHolding = true;
            closestNote.judged = true;
            closestNote.holdStartTime = currentTime;
        } else {
            // Normal note
            if (Math.abs(snotefar) <= 40) {
                score += calculateScore(1);
                combo++;
                mxcombo = Math.max(mxcombo, combo);
                playPerfectAnimation();
                handleNoteHit(columnIndex)
            } else if (Math.abs(snotefar) <= 80) {
                score += calculateScore(2);
                combo++;
                mxcombo = Math.max(mxcombo, combo);
                if (snotefar > 0) {
                    playFastAnimation();
                    handleNoteHit(columnIndex)
                } else {
                    playSlowAnimation();
                    handleNoteHit(columnIndex)
                }
            } else if (Math.abs(snotefar) <= 300) {
                combo = 0;
                playMissAnimation();
            }
            updateScoreDisplay();
            closestNote.element.remove();
            notes = notes.filter(note => note !== closestNote);
        }
    } else {
        // No note within judgment range
        if (notesInColumn.length > 0) {
            combo = 0; // 이 줄을 수정해야 합니다.
            playMissAnimation();
        }
        updateScoreDisplay();
    }
}

// Handle key release for long notes
function handleKeyRelease(columnIndex) {
    const currentTime = performance.now() - gameStartTime;
    const holdingNotes = notes.filter(note => note.columnIndex === columnIndex && note.isHolding && !note.releaseJudged);

    holdingNotes.forEach(note => {
        const noteEndTime = note.hitTime + note.duration;
        const timeAfterEnd = currentTime - noteEndTime;

        if (Math.abs(timeAfterEnd) <= 300) {
            // Released at the right time
            score += calculateScore(1);
            combo++;
            mxcombo = Math.max(mxcombo, combo);
            playPerfectAnimation();
            updateScoreDisplay();
            handleNoteHit(columnIndex)
        } else if (timeAfterEnd < -300 && timeAfterEnd > -500) {
            // Released too early
            combo = 0;
            playMissAnimation();
            updateScoreDisplay();
        } else {
            // Released too late
            combo = 0;
            playMissAnimation();
            updateScoreDisplay();
        }
        note.isHolding = false;
        note.releaseJudged = true;
        note.element.remove();
        notes = notes.filter(n => n !== note);
    });
}

// Update score and combo display
function updateScoreDisplay() {
}

// Parse chart data
function parseNoteTimings(lines) {
    const [BPM, beatsPerMeasure, syncTime] = lines[0].split(' ').map(Number);
    const beatInterval = 60000 / BPM; // Calculate one beat length (milliseconds)
    let startSyncTime = syncTime || 0;

    let currentMeasure = 0;
    let currentTime = 0;

    noteTimings = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '-') {  // Measure separator
            currentMeasure++;
            currentTime = currentMeasure * beatsPerMeasure * beatInterval;
            continue;
        }

        const parts = line.split(' ').map(Number);
        const [beat, column] = parts;
        const duration = parts[2] || 0; // Duration is optional; default to 0 for normal notes
        const time = currentTime + (beat - 1) * beatInterval;

        // Convert duration in beats to milliseconds
        const durationMs = duration * beatInterval;

        // Set note timing considering startSyncTime
        noteTimings.push({ time: time + startSyncTime, column, duration: durationMs });
    }
}

// Load chart data and start the game
window.addEventListener("load", () => {
    fetch('./beats.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').map(line => line.trim()).filter(line => line);
            parseNoteTimings(lines);
            startGame(); // Start the game
        })
        .catch(error => console.error('Error loading chart file:', error));
});

function endGame() {
    const finalScore = score;
    const finalMaxCombo = mxcombo;

    // Set message based on game performance
    let message;
    if (finalScore >= 3600) {
        message = 'Full combo!';
        startFullComboAnimation();
    } else if (finalScore >= 2400 && finalScore < 3600) {//761
        message = 'Perfect!';
    } else if (finalScore >= 1800 && finalScore < 2400) {
        message = 'Great!';
    } else if (finalScore >= 1000 && finalScore < 1800) {
        message = 'Good!';
    } else if (finalScore >= 500 && finalScore < 1000) {
        message = 'Bad!';
    } else {
        message = 'Fail!';
    }
    setTimeout(goToResult, 1000);
    function goToResult() {
        // Navigate to result screen with score, combo, and message
        window.location.href = `/start.html`;
    }
}

// Map keys to columns
function getKeyByColumn(columnIndex) {
    switch (columnIndex) {
        case 0: return 'D';
        case 1: return 'F';
        case 2: return 'J';
        case 3: return 'K';
        default: return null;
    }
}

// Animation functions
function startAnimation(elementId) {
    const box = document.getElementById(elementId);
    box.classList.add('animate-fade');
    box.addEventListener('animationend', () => {
        box.classList.remove('animate-fade');
    }, { once: true });
}

function playAnimation(elementId, animationName) {

}

function playPerfectAnimation() {
    playAnimation("score", "grow-shrink-shake");
    playAnimation("panjung-perfect", "panjung");
}

function playFastAnimation() {
    playAnimation("score", "grow-shrink-shake");
    playAnimation("panjung-fast", "panjung");
}

function playSlowAnimation() {
    playAnimation("score", "grow-shrink-shake");
    playAnimation("panjung-slow", "panjung");
}

function playMissAnimation() {
    playAnimation("score", "grow-shrink-shake");
    playAnimation("panjung-miss", "panjung");
}
function playchaeboAnimation1(){
    playAnimation("glow1", "glowPulse");
}
function playchaeboAnimation2(){
    playAnimation("glow2", "glowPulse");
}
function playchaeboAnimation3(){
    playAnimation("glow3", "glowPulse");
}
function playchaeboAnimation4(){
    playAnimation("glow4", "glowPulse");
}

function startFullComboAnimation() {
    const box = document.getElementById('fullcombo');
    box.classList.add('animate-fullcombo');
    box.addEventListener('animationend', () => {
        box.classList.remove('animate-fullcombo');
    }, { once: true });
}
function handleNoteHit(noteIndex) {
    // noteIndex에 따라 다른 함수를 실행
    switch (noteIndex) {
        case 0:
            // 첫 번째 열의 노트 처리
            handleColumn0Hit();
            break;
        case 1:
            // 두 번째 열의 노트 처리
            handleColumn1Hit();
            break;
        case 2:
            // 세 번째 열의 노트 처리
            handleColumn2Hit();
            break;
        case 3:
            // 네 번째 열의 노트 처리
            handleColumn3Hit();
            break;
        default:
            console.warn('Invalid column index');
            break;
    }
}

function handleColumn0Hit() {
    playchaeboAnimation1();
}

function handleColumn1Hit() {
    playchaeboAnimation2();
}

function handleColumn2Hit() {
    playchaeboAnimation3();
}

function handleColumn3Hit() {
    playchaeboAnimation4();
}
