import { players, changePlayersTurns } from "../modules/players";
import {
    convertStringToNumbersArray,
    coordinatesToKeys,
} from "../utilities/converters";

function createPlayerBoard(player) {
    const boardDiv = document.createElement("div");
    boardDiv.className = "board";
    boardDiv.setAttribute("data-id", player.id);

    // clear and fill boardDiv
    const boardFill = player
        .getBoard()
        .flatMap((row, rowIndex) =>
            row.map(
                (slot, slotIndex) =>
                    `<div class="slot ${slot ? "ship" : "empty"}" data-coordinates="${rowIndex},${slotIndex}"></div>`,
            ),
        )
        .join("");

    boardDiv.innerHTML = boardFill;

    return boardDiv;
}

function appendBoardToPlayer(playerDiv, boardDiv) {
    if (playerDiv.querySelector(".board")) {
        alert("Board already exist");
        return;
    }
    playerDiv.appendChild(boardDiv);
}

function renderPlayerBoard(player) {
    const playerDiv = document.querySelector(`.player[data-id='${player.id}']`);

    if (playerDiv.querySelector(".board")) {
        playerDiv.querySelector(".board").remove();
    }

    const boardDiv = createPlayerBoard(player);

    appendBoardToPlayer(playerDiv, boardDiv);
}

export function renderPlayersBoards(players) {
    players.forEach((player) => renderPlayerBoard(player));
}

function handleComputerAttacks(computerPlayer) {
    const player1BoardSlots = [
        ...document.querySelector(".board[data-id='1']").children,
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

    const player2Board = document.querySelector(".board[data-id='2']");

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
                console.log("click");

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
    const boardDivs = [...document.querySelectorAll(".board")];
    boardDivs.forEach((board) => board.classList.add("game-ended"));
}
