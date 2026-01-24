import { coordinatesToKeys } from "../utilities/converters";

const isSlotShot = (player, rowIndex, slotIndex) =>
    player.getShots().has(coordinatesToKeys([rowIndex, slotIndex])) && "shot";

function createPlayerBoard(player) {
    const boardDiv = document.createElement("div");
    boardDiv.className = "board";
    boardDiv.setAttribute("data-id", player.id);
    boardDiv.setAttribute("data-type", player.type);

    // clear and fill boardDiv
    const boardFill = player
        .getBoard()
        .flatMap((row, rowIndex) =>
            row.map(
                (slot, slotIndex) =>
                    `<div class="slot ${slot ? "ship" : "empty"} ${isSlotShot(player, rowIndex, slotIndex)}" data-coordinates="${rowIndex},${slotIndex}"></div>`,
            ),
        )
        .join("");

    boardDiv.innerHTML = boardFill;

    return boardDiv;
}

export function renderPlayerBoard(player) {
    const playerDiv = document.querySelector(`.player[data-id='${player.id}']`);

    if (playerDiv.querySelector(".board")) {
        playerDiv.querySelector(".board").remove();
    }

    const boardDiv = createPlayerBoard(player);

    playerDiv.appendChild(boardDiv);
}

export function renderBoards(players) {
    players.forEach((player) => renderPlayerBoard(player));
}
