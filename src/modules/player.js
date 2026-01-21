import { createGameboard } from "./gameboard.js";

function createPlayer(
    playerId,
    playerName = "Player",
    playerType = "human" || "computer",
) {
    let turn = false;
    const name = playerName;
    const gameboard = createGameboard(8);
    const type = playerType;
    const id = playerId;
    const startTurn = () => {
        turn = true;
    };
    const stopTurn = () => {
        turn = false;
    };

    const isTurn = () => turn;

    const receiveAttack = (coordinates) => {
        if (isTurn()) {
            const target = gameboard.receiveAttack(coordinates);
            if (target === null) changePlayersTurns();
        }
        return;
    };

    const placeShip = (shipIndex, position) => {
        gameboard.placeShip(shipIndex, position);
    };

    const getBoard = () => gameboard.board;
    return {
        type,
        id,
        name,
        isTurn,
        receiveAttack,
        placeShip,
        startTurn,
        stopTurn,
        getBoard,
    };
}

//function checkPlayerTurn() {
//}

// function changeTurn() {

// }

const player1 = createPlayer(1, "Javier");
const player2 = createPlayer(2, "Giulianna");

export const placePlayersShips = () => {
    player1.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    player2.placeShip(0, {
        coordinates: [0, 0],
        disposition: "horizontal",
    });

    player1.placeShip(1, {
        coordinates: [3, 3],
        disposition: "vertical",
    });

    player2.placeShip(1, {
        coordinates: [3, 7],
        disposition: "vertical",
    });
};
export const players = [player1, player2];

export const initPlayerTurn = (playerId) => {
    players[playerId - 1].startTurn();
};

const changePlayersTurns = () => {
    players.forEach((player) => {
        player.isTurn() ? player.stopTurn() : player.startTurn();
    });
};
