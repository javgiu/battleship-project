import {
    convertStringToNumbersArray,
    coordinatesToKeys,
} from "../utilities/converters";

let isPlacementActive = false;
let currentIndex = 0;
let currentOrientation = "horizontal";
let onComplete = null;
let actualPlayer = null;
const ships = [
    { name: "Destroyer", length: 3, index: 0 },
    { name: "Cruiser", length: 4, index: 1 },
    { name: "Battleship", length: 5, index: 2 },
];

const rotateButton = document.getElementById("rotate-ship");
const placementBoard = document.querySelector(".placement-board");

const handlers = {
    rotate: rotateShip,
    click: (e) => handlePlaceShip(e, actualPlayer, ships),
    mouseover: (e) => handleShowPreview(e, ships),
    mouseout: (e) => removePreview(e),
};

function rotateShip() {
    const visualShip = document.querySelector(".visual-ship");
    visualShip.classList.remove(currentOrientation);
    currentOrientation =
        currentOrientation === "horizontal" ? "vertical" : "horizontal";
    visualShip.classList.add(currentOrientation);
}

function attachEvents() {
    rotateButton.addEventListener("click", handlers.rotate);
    0;
    placementBoard.addEventListener("click", handlers.click);
    placementBoard.addEventListener("mouseover", handlers.mouseover);
    placementBoard.addEventListener("mouseout", handlers.mouseout);
}

function removeEvents() {
    rotateButton.removeEventListener("click", handlers.rotate);
    0;
    placementBoard.removeEventListener("click", handlers.click);
    placementBoard.removeEventListener("mouseover", handlers.mouseover);
    placementBoard.removeEventListener("mouseout", handlers.mouseout);
}

export function initShipPlacement(player, callback) {
    if (isPlacementActive) {
        console.warn("Ship placement in progress");
        return;
    }

    isPlacementActive = true;
    onComplete = callback;
    actualPlayer = player;

    renderPlacementUI(ships[currentIndex], currentOrientation);
    renderPlacementBoard(player);
    attachEvents();
}

function renderPlacementUI(ship, currentOrientation) {
    const currentShipInfoDiv = document.querySelector(".current-ships-info");
    currentShipInfoDiv.innerHTML = "";
    const message = document.createElement("h3");
    message.innerHTML = `Place your ${ship.name}`;
    const visualShip = document.createElement("div");
    visualShip.className = `visual-ship ${currentOrientation}`;
    visualShip.dataset.name = ship.name;
    visualShip.innerHTML = "";

    // Fill visual ship;
    for (let i = 0; i < ship.length; i++) {
        visualShip.innerHTML += `<div class="ship-piece"></div>`;
    }

    currentShipInfoDiv.appendChild(message);
    currentShipInfoDiv.appendChild(visualShip);
}

function renderPlacementBoard(player) {
    const board = player.getBoard();
    const placementBoardDiv = document.querySelector(".placement-board");
    const placementBoardContent = board
        .flatMap((row, rowIndex) =>
            row.map(
                (slot, slotIndex) => `
        <div class="placement-slot" data-coordinates="${rowIndex},${slotIndex}"></div>
    `,
            ),
        )
        .join("");
    placementBoardDiv.innerHTML = placementBoardContent;
    // Similar to renderPlayerBoard
    // show hover preview
}

function showPreview(e, ships) {
    const [x, y] = convertStringToNumbersArray(e.target.dataset.coordinates);

    const orientation = currentOrientation;
    const shipLength = ships[currentIndex].length;
    const slots = [];
    for (let i = 0; i < shipLength; i++) {
        const slotCoordinates =
            orientation === "horizontal" ? [x, y + i] : [x + i, y];
        slots.push(slotCoordinates);
    }
    const allSlotsValid = () => {
        return slots.every(([x, y]) => x < 8 && y < 8);
    };
    const existingSlots = slots
        .map((coordinates) => {
            const stringFromCoordinates = coordinatesToKeys(coordinates);
            const slot = document.querySelector(
                `.placement-slot[data-coordinates="${stringFromCoordinates}"]`,
            );
            if (slot) {
                return slot;
            } else return;
        })
        .filter(Boolean);
    const existingSlotsWithShip = () => {
        return existingSlots.find((slot) => slot.classList.contains("ship"));
    };

    if (existingSlotsWithShip() || !allSlotsValid())
        existingSlots.forEach((slot) => slot.classList.add("invalid"));
    else existingSlots.forEach((slot) => slot.classList.add("valid"));
}

function placeShip(e, player, ships) {
    const disposition = currentOrientation;
    const coordinates = convertStringToNumbersArray(
        e.target.dataset.coordinates,
    );

    try {
        player.placeShip(ships[currentIndex].index, {
            coordinates,
            disposition,
        });
        showShipPlaced();
        currentIndex++;

        if (currentIndex >= ships.length) {
            finishPlacement();
        } else {
            renderPlacementUI(ships[currentIndex], currentOrientation);
        }
    } catch (error) {
        console.error(error);
    }
}

function removePreview(e) {
    if (e.target.classList.contains("placement-slot")) {
        const slotsPreviewed = [
            ...document.querySelectorAll(".placement-slot.valid"),
            ...document.querySelectorAll(".placement-slot.invalid"),
        ];
        slotsPreviewed.forEach((slot) => {
            slot.classList.contains("valid")
                ? slot.classList.remove("valid")
                : slot.classList.remove("invalid");
        });
    }
}

function handleShowPreview(e, ships) {
    if (e.target.classList.contains("placement-slot")) showPreview(e, ships);
}

function handlePlaceShip(e, player, ships) {
    if (e.target.classList.contains("placement-slot")) {
        placeShip(e, player, ships);
    } else return;
}

function finishPlacement() {
    const callback = onComplete;

    removeEvents();
    resetState();
    callback();
}
function showShipPlaced() {
    const slots = [...placementBoard.children].filter((slot) =>
        slot.classList.contains("valid"),
    );
    slots.forEach((slot) => slot.classList.add("ship"));
}

function resetState() {
    isPlacementActive = false;
    currentIndex = 0;
    currentOrientation = "horizontal";
    onComplete = null;
    actualPlayer = null;
}
