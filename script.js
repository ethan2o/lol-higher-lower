const icons = document.getElementsByClassName("icon");
const champion_names = document.getElementsByClassName("champ-name");
const spell_names = document.getElementsByClassName("spell-name");
const visibleCooldown = document.getElementById("cooldown").children[0];
const hiddenCooldown = document.getElementById("cooldown-2").children[0];
const displayScore = document.getElementById("score");
const card1 = document.getElementById("card-1");
const card2 = document.getElementById("card-2");
const dataURL = "./spellData.json";
const keybinds = ["Q", "W", "E", "R"];
var spellData;
var spells = [];
var score;
var cooldowns = [];

card1.addEventListener("click", () => play(0, 1));
card2.addEventListener("click", () => play(1, 0));

async function loadJSON() {
    try {

        const response = await fetch(dataURL); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();  
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON:', error);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function updateImage(element, imagePath) {
    element.innerHTML = `
        <img src=spell_icons/${imagePath}>
    `;
}

function updateCooldown() {
    visibleCooldown.innerHTML = cooldowns[0];
}

function updateText(element, text) {
    element.innerHTML = text;
}

function updateScore() {
    displayScore.innerHTML = score;
}

function updateCard(index, spell) {
    updateImage(icons[index], spell["image"]);
    updateText(champion_names[index], `${spell["champion"]} ${keybinds[spell["position"]]}`);
    updateText(spell_names[index], spell["spell_name"]);
    cooldowns[index] = spell["cooldown"];
    
    if (index == 0) {
        updateCooldown();
    }
    
}

async function nextRound() {
    updateText(hiddenCooldown, cooldowns[1]);
    await new Promise(r => setTimeout(r, 1000));
    spells[0] = spells[1];
    spells[1] = spellData[getRandomInt(spellData.length)];
    updateCard(0, spells[0]);
    updateCard(1, spells[1]);
    updateText(hiddenCooldown, "?");
}

async function setup() {
    spellData = await loadJSON();
    score = 0;

    for (let i=0; i<2; i++) {
        spells[i] = spellData[getRandomInt(spellData.length)];
        let spell = spells[i];
        updateCard(i, spell);
    }
    updateCooldown();
    updateScore();
}

async function play(shorter, longer) {

    if (cooldowns[shorter] < cooldowns[longer] || cooldowns[shorter] == cooldowns[longer]) {
        score ++;
        updateScore();
        await nextRound();
    }
    else {
        window.alert(`You Lose! Cooldown was ${cooldowns[1]}`);
        setup();
    }
}

document.addEventListener("DOMContentLoaded", setup());