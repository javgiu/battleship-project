import { createPlayer } from "../src/modules/player.js";

const player = createPlayer();

describe("player class", () => {
    test("retrun player type = player", () => {
        expect(player).toBe("player");
    });
});
