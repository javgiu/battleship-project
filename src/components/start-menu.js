import { getPlayerNameFromMenu } from "../modules/game";

const startMenuSection = document.getElementById("start-menu");

export function initializeStartMenu() {
    cleanStartMenu();
    renderStartMenu();
    setStartMenuEvents();
}

function renderStartMenu() {
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.innerHTML = `
        <h2 class="subtitle"> Select game mode</h2>
        <div class="mode-buttons">
            <button class="game-mode-button" data-mode="1-player">Player V.S Computer</button>
            <button class="game-mode-button" data-mode="2-player">Player V.S Player</button>
        </div>
    `;
    startMenuSection.appendChild(menu);
}

function cleanStartMenu() {
    startMenuSection.innerHTML = "";
}

function setStartMenuEvents() {
    startMenuSection.addEventListener("click", gameModeButtonsEvents);
    startMenuSection.addEventListener("click", cancelSelection);
    startMenuSection.addEventListener("click", acceptButtonEvent);
}

function gameModeButtonsEvents(e) {
    if (e.target.dataset.mode === "1-player") {
        cleanStartMenu();
        renderPlayerNameForm();
    }
    if (e.target.dataset.mode === "2-player") {
        alert("Working on it!");
    }
}

function renderPlayerNameForm() {
    startMenuSection.innerHTML = `
        <div class="player-name-form">
            <h2 class="subtitle">Player name:</h2>
            <input type="text"> 
            <div class="form-buttons">
                <button class="accept" id="get-name-button" required>Accept</button>
                <button class="cancel" id="cancel-button">Cancel</button>
            </div>
        </div>
    `;

    focusOnInput();
}

function acceptButtonEvent(e) {
    // Sould make something to get the player name and then create the players
    if (e.target.id === "get-name-button") {
        const input = document.querySelector(".player-name-form input");
        if (input.value === "") return;
        getPlayerNameFromMenu(input.value);
        cleanStartMenu();
    }
}

function cancelSelection(e) {
    if (e.target.id === "cancel-button") {
        initializeStartMenu();
    }
}

function focusOnInput() {
    const input = document.querySelector(".player-name-form input");
    input.focus();
}
