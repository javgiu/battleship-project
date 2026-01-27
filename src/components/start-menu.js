import { populatePlayers } from "../modules/game";

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
    startMenuSection.addEventListener("click", handleMenuClick);
}

function handleMenuClick(e) {
    if (e.target.id === "cancel-button") {
        initializeStartMenu();
        return;
    }
    if (e.target.dataset.mode) {
        handleGameModeSelection(e);
    }
}

// Write here logic to choose the game mode
function handleGameModeSelection(e) {
    if (e.target.dataset.mode === "1-player") {
        cleanStartMenu();
        const playersInfo = [
            {
                type: "human",
                name: "",
            },
            {
                type: "computer",
                name: "Computer",
            },
        ];
        renderPlayerNameForm(playersInfo);
    }
    if (e.target.dataset.mode === "2-player") {
        alert("Working on it!");
    }
}

function renderPlayerNameForm(playersInfo) {
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

    const input = document.querySelector(".player-name-form input");
    const acceptButton = document.getElementById("get-name-button");

    const handleAccept = (e) => {
        // Should make something to get the player name and then create the players
        if (input.value === "") {
            return;
        }
        playersInfo[0].name = input.value;
        acceptButton.removeEventListener("click", handleAccept);
        cleanStartMenu();
        populatePlayers(playersInfo);
    };

    acceptButton.addEventListener("click", handleAccept);
}

function focusOnInput() {
    const input = document.querySelector(".player-name-form input");
    input.focus();
}

// Create a function to handle validity of input and add press enter
