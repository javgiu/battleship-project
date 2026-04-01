import { createPlayer, ResetAvailablePlayerIds } from "./players";
import { renderBoards, renderPlayerBoard } from "../components/player-board";
import {
    coordinatesToKeys,
    convertStringToNumbersArray,
} from "../utilities/converters";
import { initializeStartMenu } from "../components/start-menu";
import { initShipPlacement } from "../components/ships-placement";
import { showResults } from "../components/results";

let boardClickHandler = null;
const players = [];
let player1 = null;
let player2 = null;
const gameDiv = document.querySelector(".game");
const gameSections = document.querySelectorAll("section");

export function initGame() {
    showSection("start-menu");
    initializeStartMenu();
}

export function populatePlayers(playersInfo) {
    playersInfo.forEach((playerInfo) => {
        players.push(createPlayer(playerInfo.type, playerInfo.name));
    });
    [player1, player2] = players;

    // Detect game mode
    const is2Players = playersInfo.every((p) => p.type === "human");

    if (is2Players) {
        start2PlayerGame();
    } else {
        start1PlayerGame();
    }
}

async function start1PlayerGame() {
    showSection("ship-placement");
    await initShipPlacement(player1);

    showSection("game");
    player2.placeShipsRandomly();
    renderBoards(players);
    setComputerBoardEvents();
    initPlayerTurn(1);
}

async function start2PlayerGame() {
    showSection("ship-placement");
    await initShipPlacement(player1);

    await showPassDeviceScreen(player2.name);

    showSection("ship-placement");
    await initShipPlacement(player2);

    await showPassDeviceScreen(player1.name);

    showSection("game");
    render2PlayerBoards(player1, player2);
    set2PlayerBoardEvents();
    initPlayerTurn(1);
}

function showPassDeviceScreen(nextPlayerName) {
    return new Promise((resolve) => {
        showSection("pass-device");

        const message = document.querySelector(".pass-device-message");
        message.textContent = `Pass device to ${nextPlayerName}`;

        const readyButton = document.getElementById("ready-button");

        const handleReady = () => {
            readyButton.removeEventListener("click", handleReady);
            resolve();
        };

        readyButton.addEventListener("click", handleReady);
    });
}

function render2PlayerBoards(currentPlayer, opponent) {
    const boardDivs = [...document.querySelectorAll(".board")];

    // Board 1: Current player showing ships
    const playerBoardDiv = boardDivs[0];
    renderBoardWithShips(currentPlayer, playerBoardDiv);
    playerBoardDiv.dataset.type = "own";
    playerBoardDiv.dataset.playerId = currentPlayer.id;

    // Board 2: Opponent board not showing ships
    const opponentBoardDiv = boardDivs[1];
    renderBoardWithoutShips(opponent, opponentBoardDiv);
    opponentBoardDiv.dataset.type = "enemy";
    opponentBoardDiv.dataset.playerId = opponent.id;

    // Update names in UI
    updatePlayerNames(currentPlayer, opponent);
}

function renderBoardWithShips(player, boardDiv) {
    const board = player.getBoard();
    const shots = player.getShots();

    boardDiv.innerHTML = "";

    const boardContent = board
        .flatMap((row, rowIndex) => {
            return row.map((slot, slotIndex) => {
                const hasShip = slot !== null ? "ship" : "empty";
                const isShot = shots.has(
                    coordinatesToKeys([rowIndex, slotIndex]),
                )
                    ? "shot"
                    : "";

                return `<div class ="slot ${hasShip} ${isShot}" data-coordinates="${rowIndex},${slotIndex}"></div>`;
            });
        })
        .join("");

    boardDiv.innerHTML = boardContent;
}

function renderBoardWithoutShips(player, boardDiv) {
    const board = player.getBoard();
    const shots = player.getShots();

    boardDiv.innerHTML = "";

    const boardContent = board
        .flatMap((row, rowIndex) => {
            return row.map((slot, slotIndex) => {
                const isShot = shots.has(
                    coordinatesToKeys([rowIndex, slotIndex]),
                )
                    ? "shot"
                    : "";
                const hitShip = isShot && slot !== null ? "ship" : "";
                return `<div class ="slot empty ${hitShip} ${isShot}" data-coordinates="${rowIndex},${slotIndex}"></div>`;
            });
        })
        .join("");

    boardDiv.innerHTML = boardContent;
}

function updatePlayerNames(currentPlayer, opponent) {
    const player1Name = document.querySelector(
        ".player[data-id='1'] .player-name",
    );
    const player2Name = document.querySelector(
        ".player[data-id='2'] .player-name",
    );

    player1Name.textContent = `${currentPlayer.name} (You)`;
    player2Name.textContent = opponent.name;
}

function set2PlayerBoardEvents() {
    gameDiv.addEventListener("click", handle2PlayerAttack);
}

async function handle2PlayerAttack(e) {
    const isSlot = e.target.classList.contains("slot");
    const enemyBoard = e.target.closest('[data-type="enemy"]');
    if (!isSlot || !enemyBoard) return;

    const currentPlayer = players.find((player) => player.isTurnToAttack());

    if (!currentPlayer) return;

    const opponentId = parseInt(enemyBoard.dataset.playerId);
    const opponent = players.find((player) => player.id === opponentId);

    const slotCoordinates = convertStringToNumbersArray(
        e.target.dataset.coordinates,
    );

    try {
        const result = opponent.receiveAttack(slotCoordinates);

        const opponentBoardDiv =
            document.querySelector("[data-type='enemy'] .board") ||
            document.querySelectorAll(".board")[1];

        renderBoardWithoutShips(opponent, opponentBoardDiv);

        if (result === "EndGame") {
            endGame();
            return;
        }

        if (result === null) {
            changePlayersTurns();

            const nextPlayer = players.find((player) =>
                player.isTurnToAttack(),
            );

            await showPassDeviceScreen(nextPlayer.name);
            const nextOpponent = players.find(
                (player) => !player.isTurnToAttack(),
            );
            showSection("game");
            render2PlayerBoards(nextPlayer, nextOpponent);
        }
    } catch (error) {
        console.warn(error.message);
    }
}

export const placeComputerShips = () => {
    player2.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    player2.placeShip(1, {
        coordinates: [3, 7],
        disposition: "vertical",
    });

    player2.placeShip(2, {
        coordinates: [3, 2],
        disposition: "vertical",
    });
};

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
        const slotCoordinates = coordinatesToKeys(player2.attack());

        if (player2.isTurnToAttack()) {
            try {
                const result = player1.receiveAttack(
                    convertStringToNumbersArray(slotCoordinates),
                );
                renderPlayerBoard(player1);

                if (result === "EndGame") {
                    endGame();
                    return;
                }

                if (result === null) {
                    player2.reportMiss(
                        convertStringToNumbersArray(slotCoordinates),
                    );
                    changePlayersTurns();
                } else {
                    const sunk = result.isSunk();
                    player2.reportHit(
                        convertStringToNumbersArray(slotCoordinates),
                        sunk,
                    );
                }

                if (player2.isTurnToAttack()) {
                    setTimeout(makeAttack, 1000);
                }
            } catch (error) {
                console.warn(error.message);

                if (player2.isTurnToAttack()) {
                    setTimeout(makeAttack, 1000);
                }
            }
        }
    }
    setTimeout(makeAttack, 1000);
}

function setComputerBoardEvents() {
    boardClickHandler = (e) => {
        const isSlot = e.target.classList.contains("slot");
        const onComputerBoard =
            e.target.parentElement.dataset.type === "computer";
        if (isSlot && onComputerBoard) {
            const slot = e.target;
            const slotCoordinates = convertStringToNumbersArray(
                slot.dataset.coordinates,
            );

            if (player1.isTurnToAttack()) {
                try {
                    const result = player2.receiveAttack(slotCoordinates);
                    renderPlayerBoard(player2);

                    if (result === "EndGame") {
                        endGame();
                        return;
                    }

                    if (result === null) {
                        changePlayersTurns();
                        handleComputerAttacks(player2);
                    }
                } catch (error) {
                    console.warn(error.message);
                }
            }
        }
    };
    gameDiv.addEventListener("click", boardClickHandler);
}

function endGame() {
    stopPlayers();
    const winner = players.find((player) => !player.lost());
    const boardDivs = [...document.querySelectorAll(".board")];
    boardDivs.forEach((board) => board.classList.add("game-ended"));
    showSection("results");
    showResults(winner, () => {
        restartGame();
    });
}

const initPlayerTurn = (playerId) => {
    players[playerId - 1].startTurn();
};

const changePlayersTurns = () => {
    players.forEach((player) => {
        player.isTurnToAttack() ? player.stopTurn() : player.startTurn();
    });
};

function stopPlayers() {
    players.forEach((player) => player.stopTurn());
}

function restartGame() {
    resetState();
    initGame();
}

function resetState() {
    ResetAvailablePlayerIds();
    removeComputerBoardEvents();
    players.length = 0;
    player1 = null;
    player2 = null;
}

function removeComputerBoardEvents() {
    if (boardClickHandler) {
        gameDiv.removeEventListener("click", boardClickHandler);
        boardClickHandler = null;
    }
}
