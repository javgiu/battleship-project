import { players, changePlayersTurns } from "../modules/players";
import {
    convertStringToNumbersArray,
    coordinatesToKeys,
} from "../utilities/converters";

const boardDivs = [...document.querySelectorAll(".board")];

function renderPlayersBoards(players) {
    players.forEach((player, playerIndex) => {
        const playerBoard = player.getBoard();
        const boardDiv = boardDivs[playerIndex];
        boardDiv.innerHTML = "";
        boardDiv.setAttribute("data-id", player.id);
        boardDiv.innerHTML = playerBoard
            .flatMap((row, rowIndex) =>
                row.map((slot, slotIndex) => {
                    return `
            <div class="slot ${slot ? "ship" : "empty"}" data-coordinates="${rowIndex},${slotIndex}"></div>
        `;
                }),
            )
            .join("");
    });
}

function handleComputerAttacks(computerPlayer) {
    const player1BoardSlots = [
        ...document.querySelector(".player1 .board").children,
    ];

    function makeAttack() {
        const slotCoordinates = coordinatesToKeys(computerPlayer.attack());
        console.log(slotCoordinates);
        console.log(player1BoardSlots);
        const slotToAttack = player1BoardSlots.find(
            (slot) => slot.dataset.coordinates === slotCoordinates,
        );
        const playerHuman = players.find(
            (player) => player.id === 1 && player.type === "human",
        );
        if (computerPlayer.isTurnToAttack()) {
            const result = playerHuman.receiveAttack(
                convertStringToNumbersArray(slotCoordinates),
                slotToAttack,
            );
            if (result === "EndGame") {
                endGame();
                return;
            }
            if (result === null) {
                changePlayersTurns();
            }
            if (computerPlayer.isTurnToAttack()) setTimeout(makeAttack, 1000);
        }
    }
    setTimeout(makeAttack, 1000);
}

export function renderBoards() {
    renderPlayersBoards(players);

    const player2Board = document.querySelector(".player2 .board");

    setComputerBoardEvents(player2Board);
}

function setComputerBoardEvents(computerBoard) {
    computerBoard.addEventListener("click", (e) => {
        if (e.target.classList.contains("slot")) {
            const slot = e.target;
            const slotCoordinates = convertStringToNumbersArray(
                slot.dataset.coordinates,
            );
            const computerPlayer = players.find(
                (player) => player.id == computerBoard.dataset.id,
            );
            if (players[0].isTurnToAttack()) {
                const result = computerPlayer.receiveAttack(
                    slotCoordinates,
                    slot,
                );
                if (result === "EndGame") {
                    endGame();
                    return;
                }
                if (result === null) {
                    changePlayersTurns();
                    handleComputerAttacks(computerPlayer);
                }
            }
        }
    });
}

function endGame() {
    const winner = players.find((player) => !player.lost());
    boardDivs.forEach((board) => board.classList.add("game-ended"));
}
