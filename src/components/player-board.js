import { players } from "../modules/player";

function convertStringToNumbersArray(string) {
    return string.split(",").map((char) => parseInt(char));
}

export function renderPlayerBoard(player) {
    // gameDiv.innerHTML = "";
    let playerDiv = document.querySelector(
        player.id === 1 ? ".player1" : ".player2",
    );
    const playerBoard = player.getBoard();
    const boardDiv = document.createElement("div");
    boardDiv.className = "board";
    boardDiv.setAttribute("data-id", player.id);
    boardDiv.innerHTML = playerBoard
        .flatMap((row, rowIndex) =>
            row.map((tile, tileIndex) => {
                return `
            <div class="tile ${tile ? "ship" : "empty"}" data-coordinates="${rowIndex},${tileIndex}"></div>
        `;
            }),
        )
        .join("");

    playerDiv.appendChild(boardDiv);
}

export function setBoardsEvents() {
    const gameDiv = document.querySelector(".game");
    gameDiv.addEventListener("click", (e) => {
        const tile = e.target.classList.contains("tile") ? e.target : null;
        if (tile) {
            const player = players.find(
                (player) =>
                    player.id === parseInt(tile.parentElement.dataset.id),
            );
            const coordinates = convertStringToNumbersArray(
                tile.dataset.coordinates,
            );

            if (player.isTurn()) tile.classList.add("shot");
            player.receiveAttack(coordinates);
        }
        return;
    });
}
