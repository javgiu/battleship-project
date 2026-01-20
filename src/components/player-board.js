import { createPlayer } from "../modules/player";

const player1 = createPlayer("human", 1);

export function renderPlayerBoard(player) {
    // gameDiv.innerHTML = "";
    let playerDiv = document.querySelector(
        player.id === 1 ? ".player1" : ".player2",
    );
    const playerBoard = player.gameboard;
    const boardDiv = document.createElement("div");
    boardDiv.className = "board";
    boardDiv.setAttribute("data-id", player.id);
    boardDiv.innerHTML = playerBoard.board
        .flatMap((row, rowIndex) =>
            row.map((tile, tileIndex) => {
                return `
            <div class="tile ${playerBoard.ships.includes(tile) ? "ship" : "empty"}" data-coordinates="${rowIndex},${tileIndex}"></div>
        `;
            }),
        )
        .join("");

    playerDiv.appendChild(boardDiv);
}
