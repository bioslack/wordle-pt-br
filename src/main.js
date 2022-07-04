import { Board } from "./js/wordle";

const board = new Board("ptbr");

board.render();

const letters = "abcdefghijklmnopqrstuvwxyz";

document.addEventListener("keydown", function (event) {
  if (letters.includes(event.key) && !board.game.isGameOver()) {
    board.editGuess(event.key);
  }

  if (event.key === "Backspace") {
    board.deleteChar();
  }

  if (event.key === "Enter") {
    board.reveal();
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("button")) {
    board.newGame();
  }
});
