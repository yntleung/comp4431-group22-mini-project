const drumpad = document.querySelector('.drumpad');
const rows = 9; // number of rows
const cols = 16; // number of columns

const sounds = ['Ride Cymbal', 'Crash Cymbal', 'Tom (low)', 'Tom (mid)', 'Tom (high)', 'Hi-hat (open)', 'Hi-hat (closed)', 'Snare drum', 'Kick drum'];

for (let i = 0; i < rows; i++) {
    // Generate the row element
    const row = document.createElement("div");
    row.classList.add("row");
    drumpad.appendChild(row);

    // Generate the label element
    const label = document.createElement("div");
    label.classList.add("label");
    label.innerText = sounds[i];
    row.appendChild(label);

    // Generate boxes containers
    for (let boxcon = 0; boxcon < 4; boxcon++) {
        const boxesContainer = document.createElement("div");
        boxesContainer.classList.add("boxesContainer");
        // Generate boxes
        for (let j = 0; j < 4; j++) {
            const box = document.createElement("button");
            const note = boxcon*4+j;
            box.classList.add("box");
            box.setAttribute('id',`box-${i}-${note}`);
            boxesContainer.appendChild(box);
        }
        row.appendChild(boxesContainer);
    }

    // Generate the slider element
    const slider = document.createElement("input");
    slider.classList.add("slider");
    slider.type = "range";
    slider.setAttribute('id',`slider-${i}`);
    slider.setAttribute("min", "0");
    slider.setAttribute("max", "127");
    slider.setAttribute("step", "1");
    slider.setAttribute("value", "64");
    row.appendChild(slider);
  }