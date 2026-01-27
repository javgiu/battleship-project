import {
    players,
    placePlayersShips,
    changePlayersTurns,
    initPlayerTurn,
} from "./players";
import { renderBoards, renderPlayerBoard } from "../components/player-board";
import {
    coordinatesToKeys,
    convertStringToNumbersArray,
} from "../utilities/converters";
import { initializeStartMenu } from "../components/start-menu";
let playerName;
const [playerHuman, playerComputer] = players;
const gameDiv = document.querySelector(".game");
const gameSections = document.querySelectorAll("section");

export function initGame() {
    showSection("start-menu");
    initializeStartMenu();
    placePlayersShips();
    renderBoards(players);
    setComputerBoardEvents();
    initPlayerTurn(1);
}

export function getPlayerNameFromMenu(name) {
    playerName = name;
    showSection("game");
}

function showSection(sectionId) {
    gameSections.forEach((section) => {
        if (section.id === sectionId) {
            section.classList.remove("hide");
        } else {
            section.classList.add("hide");
        }
    });
}

function handleComputerAttacks() {
    function makeAttack() {
        const slotCoordinates = coordinatesToKeys(playerComputer.attack());
        if (playerComputer.isTurnToAttack()) {
            const result = playerHuman.receiveAttack(
                convertStringToNumbersArray(slotCoordinates),
            );
            renderPlayerBoard(playerHuman);

            if (result === "EndGame") {
                endGame();
                return;
            }
            if (result === null) {
                changePlayersTurns();
            }
            if (playerComputer.isTurnToAttack()) {
                setTimeout(makeAttack, 1000);
            }
        }
    }
    setTimeout(makeAttack, 1000);
}

function setComputerBoardEvents() {
    gameDiv.addEventListener("click", (e) => {
        const isSlot = e.target.classList.contains("slot");
        const onComputerBoard =
            e.target.parentElement.dataset.type === "computer";
        if (isSlot && onComputerBoard) {
            const slot = e.target;
            const slotCoordinates = convertStringToNumbersArray(
                slot.dataset.coordinates,
            );
            if (playerHuman.isTurnToAttack()) {
                const result = playerComputer.receiveAttack(slotCoordinates);
                renderPlayerBoard(playerComputer);
                if (result === "EndGame") {
                    endGame();
                    return;
                }
                if (result === null) {
                    changePlayersTurns();
                    handleComputerAttacks(playerComputer);
                }
            }
        }
    });
}

function endGame() {
    const winner = players.find((player) => !player.lost());
    const boardDivs = [...document.querySelectorAll(".board")];
    boardDivs.forEach((board) => board.classList.add("game-ended"));
}
