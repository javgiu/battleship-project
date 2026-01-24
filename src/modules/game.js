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

const [playerHuman, playerComputer] = players;
const gameDiv = document.querySelector(".game");

export function initGame() {
    placePlayersShips();
    renderBoards(players);
    setComputerBoardEvents();
    initPlayerTurn(1);
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
