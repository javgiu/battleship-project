import { createPlayer } from "./players";
import { renderBoards, renderPlayerBoard } from "../components/player-board";
import {
    coordinatesToKeys,
    convertStringToNumbersArray,
} from "../utilities/converters";
import { initializeStartMenu } from "../components/start-menu";
import { initShipPlacement } from "../components/ships-placement";

const players = [];
let playerHuman, playerComputer;
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
    [playerHuman, playerComputer] = players;
    showSection("ship-placement");
    initShipPlacement(playerHuman, () => {
        showSection("game");
        placeComputerShips();
        renderBoards(players);
        setComputerBoardEvents();
        initPlayerTurn(1);
    });
}

// Change logic to allow player place ships
export const placeComputerShips = () => {
    playerComputer.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    playerComputer.placeShip(1, {
        coordinates: [3, 7],
        disposition: "vertical",
    });

    playerComputer.placeShip(2, {
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
        const slotCoordinates = coordinatesToKeys(playerComputer.attack());
        if (playerComputer.isTurnToAttack()) {
            try {
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
            } catch (error) {
                console.warn(error.message);

                if (playerComputer.isTurnToAttack()) {
                    setTimeout(makeAttack, 1000);
                }
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
                try {
                    const result =
                        playerComputer.receiveAttack(slotCoordinates);
                    renderPlayerBoard(playerComputer);

                    if (result === "EndGame") {
                        endGame();
                        return;
                    }

                    if (result === null) {
                        changePlayersTurns();
                        handleComputerAttacks(playerComputer);
                    }
                } catch (error) {
                    console.warn(error.message);
                }
            }
        }
    });
}

function endGame() {
    stopPlayers();
    const winner = players.find((player) => !player.lost());
    const boardDivs = [...document.querySelectorAll(".board")];
    boardDivs.forEach((board) => board.classList.add("game-ended"));
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
