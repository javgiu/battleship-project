import { createShip } from "../src/modules/ship";

let ship1;

function initializeVariables() {
    ship1 = createShip(3);
}

beforeAll(() => {
    initializeVariables();
});

describe("ship1 object", () => {
    test("ship1 have length of 3", () => {
        expect(ship1.length).toBe(3);
    });

    test("when initialize ship1 is not sunk", () => {
        expect(ship1.isSunk()).toBe(false);
    });

    test("hit the ship1 3 times to make it sunk", () => {
        ship1.hit();
        ship1.hit();
        ship1.hit();

        expect(ship1.isSunk()).toBe(true);
    });

    test("ship.hit() throw an error if is sunk", () => {
        expect(() => ship1.hit()).toThrow("Ship already sunk");
    });
});
