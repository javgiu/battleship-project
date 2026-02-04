export function showResults(winner, onReset) {
    const restartButton = document.getElementById("restart");
    const winnerMessage = document.querySelector(".winner-message");
    winnerMessage.textContent = `${winner.name} WINS!`;
    const restartGame = () => {
        restartButton.removeEventListener("click", restartGame);
        onReset();
    };
    restartButton.addEventListener("click", restartGame);
}
