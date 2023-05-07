const playButton = document.getElementById('play');
const clearButton = document.getElementById('clear');
const tempo = document.getElementById('tempo');
const sliders = document.querySelectorAll('.slider');
const masterSlider = document.getElementById('master-volume');
const saveButton = document.getElementById('save-button');

let drumpadArray = [];
for (let i = 0; i < rows; i++) {
    drumpadArray[i] = [];
    for (let j = 0; j < cols; j++) {
        drumpadArray[i][j] = false;
    }
}

const pitches = [51, 49, 43, 47, 50, 46, 42, 38, 36];
let velocities = [64, 64, 64, 64, 64, 64, 64, 64, 64];
const intervalIds = [];
const timeoutIds = [];
let bpm = 120;
let isPlaying = false;
let currNote = 0;
let masterVol = 64;

// Starts playing the drum beat
function startLoop() {
    for (let j = 0; j < cols; j++) {
        timeoutIds.push(setTimeout(function () {
            if (isPlaying) {
                playSound(j);
                intervalIds.push(setInterval(() => playSound(j), 4 * 1000 / (bpm / 60)));
            }
        }, j * 1000 / (bpm / 60) / 4));
    }
}

// Stops playing the drum beat
function stopLoop() {
    for (let i = 0; i < intervalIds.length; i++) clearInterval(intervalIds[i]);
    for (let i = 0; i < timeoutIds.length; i++) clearTimeout(timeoutIds[i]);
    for (let i = 0; i < rows; i++) document.getElementById(`box-${i}-${currNote}`).style.border = '1px solid white';
}

// Add event listener to play button
playButton.addEventListener('click', function () {
    if (isPlaying) {
        playButton.innerHTML = "Play";
        stopLoop();
    } else {
        playButton.innerHTML = "Stop";
        startLoop();
    }
    isPlaying = !isPlaying;
});

// Add event listener to tempo input
tempo.addEventListener("change", function () {
    bpm = parseInt(tempo.value);
    if (bpm < 1) {
        bpm = 1;
        tempo.value = 1;
    }
    if (isPlaying) {
        stopLoop();
        playButton.innerHTML = "Start";
        isPlaying = !isPlaying;
    }
});

// Add event listeners to toggle padState array and button state
drumpad.addEventListener('click', function (event) {
    if (event.target.matches('.box')) {
        const [row, col] = event.target.id.split('-').slice(1).map(Number);
        const newState = event.target.dataset.state === 'on' ? false : true;
        drumpadArray[row][col] = newState;
        event.target.dataset.state = newState ? 'on' : 'off';
        if (newState === true) playSoundfontPreview(row);   // play soundfont once when clicked on
    }
});

// Add event listener to clear button
clearButton.addEventListener('click', clearDrumpad);

// Loop through each slider and add an event listener to it
sliders.forEach((slider, i) => {
    slider.addEventListener('input', () => {
        // Update the corresponding element in the velocity array
        velocities[i] = parseInt(slider.value);
    });
});

// Add event listener to master slider
masterSlider.addEventListener('input', () => {
    masterVol = parseInt(masterSlider.value);
    MIDI.setVolume(0, masterVol);
});

// Add event listener to save button
saveButton.addEventListener('click', saveJson);

// Saves the pattern as a JSON file
function saveJson() {
    const data = { "tempo": bpm, "pattern": drumpadArray, "velocities": velocities };
    const filename = 'myPattern.json';
    const jsonStr = JSON.stringify(data);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Loads the pattern from a JSON file
function loadJson() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file === null || file === undefined) return;
    clearDrumpad();

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
        const json = JSON.parse(reader.result);
        bpm = json["tempo"];
        tempo.value = bpm;
        drumpadArray = json["pattern"];
        velocities = json["velocities"];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                document.getElementById(`box-${i}-${j}`).dataset.state = drumpadArray[i][j] ? "on" : "off";
            }
            document.getElementById(`slider-${i}`).value = velocities[i];
        }
    };
}


// Clears the drumpad
function clearDrumpad() {
    if (isPlaying) {
        stopLoop();
        playButton.innerHTML = "Start";
        isPlaying = !isPlaying;
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            drumpadArray[i][j] = false;
            document.getElementById(`box-${i}-${j}`).dataset.state = 'off';
        }
        velocities[i] = 64;
        document.getElementById(`slider-${i}`).value = 64;
    }
}

// Plays the sounds corresponding to the note
function playSound(note) {
    currNote = note;
    for (let i = 0; i < rows; i++) {
        const button = document.getElementById(`box-${i}-${note}`);
        button.style.border = '2px solid black';
        const lastButton = document.getElementById(`box-${i}-${(note - 1 + cols) % cols}`);
        lastButton.style.border = '1px solid white';
        if (drumpadArray[i][note]) {
            MIDI.noteOn(0, pitches[i], velocities[i]);
            setTimeout(function () {
                MIDI.noteOff(0, pitches[i]);
            }, 200);
        }
    }
}

// Plays the soundfont once as a preview
function playSoundfontPreview(row) {
    MIDI.noteOn(0, pitches[row], velocities[row]);
    setTimeout(function () {
        MIDI.noteOff(0, pitches[row]);
    }, 200);
}

// MIDI.js
$(document).ready(function () {
    fetch('./patterns/defaultPattern.json')
        .then(response => response.json())
        .then(json => {
            bpm = json["tempo"];
            tempo.value = bpm;
            drumpadArray = json["pattern"];
            velocities = json["velocities"];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    document.getElementById(`box-${i}-${j}`).dataset.state = drumpadArray[i][j] ? "on" : "off";
                }
                document.getElementById(`slider-${i}`).value = velocities[i];
            }
        });
    MIDI.loadPlugin({
        soundfontUrl: "./midi-js/soundfont/",
        instruments: "drum",
        onprogress: function (state, progress) {
            console.log(state, progress);
        },
        onsuccess: function () {
            // Resuming the AudioContext when there is user interaction
            $("body").click(function () {
                if (MIDI.getContext().state != "running") {
                    MIDI.getContext().resume().then(function () {
                        console.log("Audio Context is resumed!");
                    });
                }
            });

            // Hide the loading text and show the container
            $(".loading").hide();
            $(".container").show();

            // At this point the MIDI system is ready
            MIDI.setVolume(0, 64);     // Set the volume level
            MIDI.programChange(0, 0);
        }
    });
});