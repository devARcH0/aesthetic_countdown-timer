/* ===============================
   TIMER CONFIGURATION
================================= */

let totalSeconds = 30; // Default = 30 sec
let remainingTime = totalSeconds;

let animationId = null;
let startTime = null;
let isRunning = false;


/* ===============================
   ELEMENT SELECTORS
================================= */

const ring = document.getElementById('progressRing');
const playBtn = document.querySelector('.btn');           // Inner circle button
const startBtn = document.querySelector('.timer-button'); // Left start button
const timerText = document.querySelector('.timer');
const presetButtons = document.querySelectorAll('.preset-btn');


/* ===============================
   SVG CIRCLE SETUP
================================= */

const radius = ring.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = 0;


/* ===============================
   DISPLAY FUNCTION
================================= */

function updateDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    timerText.textContent =
        `${minutes < 10 ? '0' : ''}${minutes}:` +
        `${seconds < 10 ? '0' : ''}${seconds}`;
}

updateDisplay(totalSeconds);


/* ===============================
   START / PAUSE BUTTON UI STATE
================================= */

function updateStartButton() {
    if (isRunning) {
        startBtn.textContent = "Stop";
        startBtn.classList.add("running");
    } else if (remainingTime < totalSeconds) {
        startBtn.textContent = "Resume";
        startBtn.classList.remove("running");
    } else {
        startBtn.textContent = "Start";
        startBtn.classList.remove("running");
    }
}


/* ===============================
   TIMER RESET
================================= */

function resetTimer() {
    remainingTime = totalSeconds;
    startTime = null;
    isRunning = false;

    cancelAnimationFrame(animationId);
    ring.style.strokeDashoffset = 0;

    playBtn.classList.remove('active');
    updateDisplay(totalSeconds);
    updateStartButton();
}


/* ===============================
   ANIMATION ENGINE
================================= */

function animate(timestamp) {

    if (!startTime) startTime = timestamp;

    const elapsed = (timestamp - startTime) / 1000;
    remainingTime = totalSeconds - elapsed;

    if (remainingTime <= 0) {

        remainingTime = 0;
        updateDisplay(0);
        ring.style.strokeDashoffset = circumference;

        cancelAnimationFrame(animationId);
        isRunning = false;

        playBtn.classList.remove('active');
        updateStartButton();

        // Reset after short delay (natural UX)
        setTimeout(resetTimer, 600);
        return;
    }

    updateDisplay(remainingTime);

    const offset =
        circumference - (remainingTime / totalSeconds) * circumference;

    ring.style.strokeDashoffset = offset;

    animationId = requestAnimationFrame(animate);
}


/* ===============================
   START TIMER FUNCTION
================================= */

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    playBtn.classList.add('active');

    startTime = performance.now() - (totalSeconds - remainingTime) * 1000;

    animationId = requestAnimationFrame(animate);
    updateStartButton();
}


/* ===============================
   BUTTON EVENTS
================================= */

// Left Start Button
startBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(animationId);
        playBtn.classList.remove('active');
        updateStartButton();
    } else {
        startTimer();
    }
});

// Inner Play/Pause Button
playBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(animationId);
        playBtn.classList.remove('active');
    } else {
        startTimer();
    }
    updateStartButton();
});


/* ===============================
   PRESET BUTTONS
================================= */

presetButtons.forEach(btn => {

    btn.addEventListener('click', () => {

        // Stop running timer
        cancelAnimationFrame(animationId);
        isRunning = false;

        // Set new time
        totalSeconds = parseInt(btn.dataset.time);
        remainingTime = totalSeconds;

        // Reset UI
        ring.style.strokeDashoffset = 0;
        updateDisplay(totalSeconds);
        updateStartButton();
        playBtn.classList.remove('active');

        // Highlight active preset
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });

});
