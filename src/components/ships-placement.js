import {
    convertStringToNumbersArray,
    coordinatesToKeys,
} from "../utilities/converters";

let isPlacementActive = false;
let onComplete = null;
let actualPlayer = null;
const ships = [
    { name: "Destroyer", length: 3, index: 0 },
    { name: "Cruiser", length: 4, index: 1 },
    { name: "Battleship", length: 5, index: 2 },
];

let draggedShip = null;
let draggedShipData = null;
let placedShips = [];

const occupiedPositions = new Set();

const rotateButton = document.getElementById("rotate-ship");
const placementBoard = document.querySelector(".placement-board");

// const handlers = {
//     rotate: rotateShip,
//     click: (e) => handlePlaceShip(e, actualPlayer, ships),
//     mouseover: (e) => handleShowPreview(e, ships),
//     mouseout: (e) => removePreview(e),
// };

function removeEvents() {
    const draggableShips = document.querySelectorAll(".draggable-ships");
    const placementBoard = document.querySelector(".placement-board");

    draggableShips.forEach((ship) => {
        ship.removeEventListener("dragstart", handleDragStart);
        ship.removeEventListener("dragend", handleDragEnd);
    });

    if (placementBoard) {
        placementBoard.removeEventListener("dragover", handleDragOver);
        placementBoard.removeEventListener("drop", handleDrop);
    }

    const rotateButtons = document.querySelectorAll(".rotate-ship-btn");
    rotateButtons.forEach((button) => {
        button.removeEventListener("click", handleRotateClick);
    });
}

export function initShipPlacement(player, callback) {
    if (isPlacementActive) {
        console.warn("Ship placement in progress");
        return;
    }

    isPlacementActive = true;
    onComplete = callback;
    actualPlayer = player;

    renderShipsList();
    renderPlacementBoard(player);
    attachDragEvents();
}

function renderShipsList() {
    const shipsListDiv = document.querySelector(".draggable-ships");
    shipsListDiv.innerHTML = "";

    ships.forEach((ship) => {
        const shipElement = document.createElement("div");
        shipElement.className = `draggable-ship`;
        shipElement.draggable = true;
        shipElement.dataset.index = ship.index;
        shipElement.dataset.length = ship.length;
        shipElement.dataset.name = ship.name;
        shipElement.dataset.orientation = "horizontal";

        // Fill visual ship;
        for (let i = 0; i < ship.length; i++) {
            shipElement.innerHTML += `<div class="ship-piece"></div>`;
        }

        // Add rotation button to ship
        const rotationButton = document.createElement("button");
        rotationButton.innerHTML = "🔄";
        rotationButton.className = "rotate-ship-btn";
        rotationButton.id = `rotate-ship-${ship.index}`;
        shipElement.appendChild(rotationButton);

        shipsListDiv.appendChild(shipElement);
    });
}

function renderShipsOnBoard() {
    // Clean existing ships
    const existingShips = document.querySelectorAll(
        ".placement-board .draggable-ship",
    );
    existingShips.forEach((ship) => ship.remove());

    // Render ships from placedShips
    placedShips.forEach((shipData) => {
        const shipElement = createShipElement(shipData);
        positionShipOnBoard(shipElement, shipData);

        shipElement.addEventListener("dragstart", handleDragStart);
        shipElement.addEventListener("dragend", handleDragEnd);

        const rotateBtn = shipElement.querySelector(".rotate-ship-btn");
        if (rotateBtn) {
            rotateBtn.addEventListener("click", handleRotateClick);
        }

        const placementBoard = document.querySelector(".placement-board");
        placementBoard.appendChild(shipElement);
    });
}

function createShipElement(shipData) {
    const ship = ships.find((s) => s.index === shipData.index);

    const shipElement = document.createElement("div");
    shipElement.className = `draggable-ship on-board ${shipData.orientation}`;
    shipElement.draggable = true;
    shipElement.dataset.index = shipData.index;
    shipElement.dataset.length = shipData.length;
    shipElement.dataset.name = shipData.name;
    shipElement.dataset.orientation = shipData.orientation;

    let shipHTML = "<button class='rotate-ship-btn'>🔄</button>";

    for (let i = 0; i < ship.length; i++) {
        shipHTML += `<div class="ship-piece"></div>`;
    }

    shipElement.innerHTML = shipHTML;

    return shipElement;
}

function positionShipOnBoard(shipElement, shipData) {
    const [row, col] = shipData.coordinates;

    shipElement.style.gridRowStart = row + 1;
    shipElement.style.gridColumnStart = col + 1;

    if (shipData.orientation === "horizontal") {
        shipElement.style.gridColumnEnd = `span ${shipElement.dataset.length}`;
        shipElement.style.gridRowEnd = "span 1";
    } else {
        shipElement.style.gridRowEnd = `span ${shipElement.dataset.length}`;
        shipElement.style.gridColumnEnd = "span 1";
    }
}

function renderPlacementBoard(player) {
    const board = player.getBoard();
    const placementBoardDiv = document.querySelector(".placement-board");
    const placementBoardContent = board
        .flatMap((row, rowIndex) =>
            row.map((slot, slotIndex) => {
                const hasShip = slot !== null ? "ship" : "";
                return `
        <div class="placement-slot ${hasShip}" data-coordinates="${rowIndex},${slotIndex}"></div>
    `;
            }),
        )
        .join("");
    placementBoardDiv.innerHTML = placementBoardContent;
    // Similar to renderPlayerBoard
    // show hover preview
}

function attachDragEvents() {
    attachRotationEvents();
    attachDragListeners();
    attachFinishButton();
}

function attachFinishButton() {
    const finishBtn = document.getElementById("finish-placement-btn");
    finishBtn.addEventListener("click", handleFinishPlacement);
}

function handleFinishPlacement() {
    placedShips.forEach((shipData) => {
        actualPlayer.placeShip(shipData.index, {
            coordinates: shipData.coordinates,
            orientation: shipData.orientation,
        });
    });

    finishPlacement();
}

function attachRotationEvents() {
    const rotateButtons = document.querySelectorAll(".rotate-ship-btn");

    rotateButtons.forEach((button) => {
        button.addEventListener("click", handleRotateClick);
    });
}

function attachDragListeners() {
    const draggableShips = document.querySelectorAll(".draggable-ship");
    const placementBoard = document.querySelector(".placement-board");

    draggableShips.forEach((ship) => {
        ship.addEventListener("dragstart", handleDragStart);
        ship.addEventListener("dragend", handleDragEnd);
    });

    placementBoard.addEventListener("dragover", handleDragOver);
    placementBoard.addEventListener("drop", handleDrop);
}

function handleRotateClick(e) {
    const button = e.target;
    const shipElement = button.closest(".draggable-ship");

    const currentOrientation = shipElement.dataset.orientation;

    const newOrientation =
        currentOrientation === "horizontal" ? "vertical" : "horizontal";

    if (shipElement.classList.contains("on-board")) {
        const shipPlacedIndex = placedShips.findIndex(
            (ship) => ship.index == shipElement.dataset.index,
        );

        const shipData = placedShips[shipPlacedIndex];

        const [x, y] = shipData.coordinates;

        placedShips.splice(shipPlacedIndex, 1);

        if (isPositionOccupied(x, y, shipData.length, newOrientation)) {
            placedShips.push(shipData);
            console.warn("Can't rotate, position occupied");
            return;
        }
        if (
            (newOrientation === "vertical" && x + shipData.length > 8) ||
            (newOrientation === "horizontal" && y + shipData.length > 8)
        ) {
            placedShips.push(shipData);
            console.warn("Can't rotate, out of board");
            return;
        } else {
            shipData.orientation = newOrientation;
            placedShips.push(shipData);
            console.assert("Rotated");
        }
    }

    shipElement.dataset.orientation = newOrientation;

    shipElement.classList.remove("vertical", "horizontal");
    shipElement.classList.add(newOrientation);
}

function handleDragStart(e) {
    const shipElement = e.target.closest(".draggable-ship");
    draggedShip = shipElement;

    setTimeout(() => {
        shipElement.remove();
    }, 0);

    draggedShipData = {
        index: parseInt(shipElement.dataset.index),
        length: parseInt(shipElement.dataset.length),
        orientation: shipElement.dataset.orientation,
        name: shipElement.dataset.name,
    };

    // Calculate offset
    const rect = shipElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pieceSize = 50;
    const gap = 5;

    let offsetPieces;

    if (draggedShipData.orientation === "horizontal") {
        offsetPieces = Math.floor(mouseX / (pieceSize + gap));
    } else {
        offsetPieces = Math.floor(mouseY / (pieceSize + gap));
    }

    draggedShipData.offsetPieces = offsetPieces;

    if (shipElement.classList.contains("on-board")) {
        const indexToRemove = placedShips.findIndex(
            (ship) => ship.index === draggedShipData.index,
        );
        if (indexToRemove >= 0) {
            draggedShipData.originalPosition = placedShips[indexToRemove];

            placedShips.splice(indexToRemove, 1);
        }
    }

    shipElement.classList.add("dragging");

    e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
    e.preventDefault();

    e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
    e.preventDefault();

    if (!draggedShip || !draggedShipData) return;

    const targetSlot = e.target.classList.contains(".placement-slot")
        ? e.target
        : e.target.closest(".placement-slot");

    if (!targetSlot) {
        if (draggedShipData.originalPosition) {
            placedShips.push(draggedShipData.originalPosition);
            renderShipsOnBoard();
        }
        return;
    }

    let [x, y] = convertStringToNumbersArray(targetSlot.dataset.coordinates);

    const offset = draggedShipData.offsetPieces || 0;

    if (draggedShipData.orientation === "horizontal") {
        y = y - offset;
    } else {
        x = x - offset;
    }

    if (x < 0 || y < 0 || x > 7 || y > 7) {
        console.warn("Coordinates out of board");
        restoreOriginalPosition();
        return;
    }

    const shipLength = draggedShipData.length;
    const orientation = draggedShipData.orientation;

    if (orientation === "horizontal" && y + shipLength > 8) {
        console.warn("Not enough horizontal space");
        restoreOriginalPosition();
        return;
    }

    if (orientation === "vertical" && x + shipLength > 8) {
        console.warn("Not enough vertical space");
        restoreOriginalPosition();
        return;
    }

    if (
        isPositionOccupied(x, y, shipLength, orientation, draggedShipData.index)
    ) {
        console.warn("Position occupied by other ship");
        restoreOriginalPosition();
        return;
    }

    const newShipData = {
        index: draggedShipData.index,
        coordinates: [x, y],
        orientation: orientation,
        name: draggedShipData.name,
        length: draggedShipData.length,
    };

    placedShips.push(newShipData);

    if (
        draggedShip.parentElement &&
        draggedShip.parentElement.classList.contains("draggable-ships")
    ) {
        draggedShip.remove();
    }

    renderShipsOnBoard();

    updateFinishButton();
}

function restoreOriginalPosition() {
    if (draggedShipData.originalPosition) {
        console.log("restoring position");
        placedShips.push(draggedShipData.originalPosition);
        renderShipsOnBoard();
    }
}

function isPositionOccupied(x, y, length, orientation) {
    const newShipSlot = new Set();
    for (let i = 0; i < length; i++) {
        const slotX = orientation === "vertical" ? x + i : x;
        const slotY = orientation === "horizontal" ? y + i : y;
        newShipSlot.add(coordinatesToKeys([slotX, slotY]));
    }

    for (const ship of placedShips) {
        const [shipX, shipY] = ship.coordinates;
        const shipLength = ships.find((s) => s.index === ship.index).length;

        for (let i = 0; i < shipLength; i++) {
            const occupiedX =
                ship.orientation === "vertical" ? shipX + i : shipX;
            const occupiedY =
                ship.orientation === "horizontal" ? shipY + i : shipY;
            const occupiedSlot = coordinatesToKeys([occupiedX, occupiedY]);

            if (newShipSlot.has(occupiedSlot)) {
                return true;
            }
        }
    }

    return false;
}

function updateFinishButton() {
    const finishBtn = document.getElementById("finish-placement-btn");

    if (placedShips.length === ships.length) {
        finishBtn.disabled = false;
    } else {
        finishBtn.disabled = true;
    }
}

function handleDragEnd(e) {
    const shipElement = e.target;

    shipElement.classList.remove("dragging");

    if (!checkIfShipIsPlaced()) {
        if (draggedShipData.originalPosition) {
            restoreOriginalPosition();
        } else {
            document.querySelector(".draggable-ships").appendChild(draggedShip);
        }
    }

    draggedShip = null;
    draggedShipData = null;
}

function checkIfShipIsPlaced() {
    if (
        placedShips.findIndex((ship) => ship.index === draggedShipData.index) >=
        0
    )
        return true;
    return false;
}

function finishPlacement() {
    const callback = onComplete;

    removeEvents();
    resetState();
    callback();
}

function resetState() {
    isPlacementActive = false;
    onComplete = null;
    actualPlayer = null;
    draggedShip = null;
    draggedShipData = null;
    placedShips = [];
}

// function allShipsPlaced() {
//     const remainingShips = document.querySelectorAll(
//         ".draggable-ships .draggable-ship",
//     );

//     if (remainingShips.length === 0) {
//         return true;
//     }

//     return false;
// }

// function showPreview(e, ships) {
//     const [x, y] = convertStringToNumbersArray(e.target.dataset.coordinates);

//     const orientation = currentOrientation;
//     const shipLength = ships[currentIndex].length;
//     const slots = [];
//     for (let i = 0; i < shipLength; i++) {
//         const slotCoordinates =
//             orientation === "horizontal" ? [x, y + i] : [x + i, y];
//         slots.push(slotCoordinates);
//     }
//     const allSlotsValid = () => {
//         return slots.every(([x, y]) => x < 8 && y < 8);
//     };
//     const existingSlots = slots
//         .map((coordinates) => {
//             const stringFromCoordinates = coordinatesToKeys(coordinates);
//             const slot = document.querySelector(
//                 `.placement-slot[data-coordinates="${stringFromCoordinates}"]`,
//             );
//             if (slot) {
//                 return slot;
//             } else return;
//         })
//         .filter(Boolean);
//     const existingSlotsWithShip = () => {
//         return existingSlots.find((slot) => slot.classList.contains("ship"));
//     };

//     if (existingSlotsWithShip() || !allSlotsValid())
//         existingSlots.forEach((slot) => slot.classList.add("invalid"));
//     else existingSlots.forEach((slot) => slot.classList.add("valid"));
// }

// function placeShip(e, player, ships) {
//     const orientation = currentOrientation;
//     const coordinates = convertStringToNumbersArray(
//         e.target.dataset.coordinates,
//     );

//     try {
//         player.placeShip(ships[currentIndex].index, {
//             coordinates,
//             orientation,
//         });
//         showShipPlaced();
//         currentIndex++;

//         if (currentIndex >= ships.length) {
//             finishPlacement();
//         } else {
//             renderPlacementUI(ships[currentIndex], currentOrientation);
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }

// function removePreview(e) {
//     if (e.target.classList.contains("placement-slot")) {
//         const slotsPreviewed = [
//             ...document.querySelectorAll(".placement-slot.valid"),
//             ...document.querySelectorAll(".placement-slot.invalid"),
//         ];
//         slotsPreviewed.forEach((slot) => {
//             slot.classList.contains("valid")
//                 ? slot.classList.remove("valid")
//                 : slot.classList.remove("invalid");
//         });
//     }
// }

// function handleShowPreview(e, ships) {
//     if (e.target.classList.contains("placement-slot")) showPreview(e, ships);
// }

// function handlePlaceShip(e, player, ships) {
//     if (e.target.classList.contains("placement-slot")) {
//         placeShip(e, player, ships);
//     } else return;
// }

// function showShipPlaced() {
//     const slots = [...placementBoard.children].filter((slot) =>
//         slot.classList.contains("valid"),
//     );
//     slots.forEach((slot) => slot.classList.add("ship"));
// }

// Change this function
// function rotateShip() {
//     const visualShip = document.querySelector(".visual-ship");
//     visualShip.classList.remove(currentOrientation);
//     currentOrientation =
//         currentOrientation === "horizontal" ? "vertical" : "horizontal";
//     visualShip.classList.add(currentOrientation);
// }

// function attachEvents() {
//     rotateButton.addEventListener("click", handlers.rotate);
//     0;
//     placementBoard.addEventListener("click", handlers.click);
//     placementBoard.addEventListener("mouseover", handlers.mouseover);
//     placementBoard.addEventListener("mouseout", handlers.mouseout);
// }
