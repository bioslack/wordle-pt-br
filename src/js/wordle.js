import ptbr from "./wordlist-br";

const wordlists = {
  ptbr,
};

class GameElement {
  render() {}
}

const removeFromArray = function (element, __array) {
  const temp = [...__array];
  const index = temp.indexOf(element);
  if (index > -1) {
    temp.splice(index, 1);
    return temp;
  }
  return temp;
};

const removeSpecialCharacters = function (word) {
  return word
    .replace(/[ÀÁÂÃÄ]/, "A")
    .replace(/[àáâãä]/, "a")
    .replace(/[ÈÉÊË]/, "E")
    .replace(/[èéêë]/, "e")
    .replace(/[ÌÍ]/, "I")
    .replace(/[ìí]/, "i")
    .replace(/[ÒÓÔÕÖ]/, "O")
    .replace(/[òóôõö]/, "o")
    .replace(/[ÙÚÜ]/, "U")
    .replace(/[ùúü]/, "u")
    .replace(/[Ç]/, "C")
    .replace(/[ç]/, "c")
    .toLowerCase();
};

class SidePanel extends GameElement {
  answer = "???";
  message = "";
  pastResults = [
    {
      index: "1",
      counter: 0,
    },
    {
      index: "2",
      counter: 0,
    },
    {
      index: "3",
      counter: 0,
    },
    {
      index: "4",
      counter: 0,
    },
    {
      index: "5",
      counter: 0,
    },
    {
      index: "6",
      counter: 0,
    },
    {
      index: "💀",
      counter: 0,
    },
  ];

  constructor() {
    super();
    this.loadPastResults();
  }

  loadPastResults() {
    this.pastResults = JSON.parse(localStorage.getItem("past-results")) || [
      {
        index: "1",
        counter: 0,
      },
      {
        index: "2",
        counter: 0,
      },
      {
        index: "3",
        counter: 0,
      },
      {
        index: "4",
        counter: 0,
      },
      {
        index: "5",
        counter: 0,
      },
      {
        index: "6",
        counter: 0,
      },
      {
        index: "💀",
        counter: 0,
      },
    ];
    console.log(this.pastResults);
  }

  showAnswer(answer) {
    this.answer = answer;
  }

  showMessage(message) {
    this.message = message;
  }

  render() {
    const div = document.createElement("div");
    div.classList.add("side-panel");

    const answerContainer = document.createElement("div");
    answerContainer.classList.add("side-panel__answer");
    answerContainer.innerHTML = this.answer;

    const gameMessageContainer = document.createElement("div");
    gameMessageContainer.classList.add("side-panel__message");
    gameMessageContainer.innerHTML = this.message;

    const button = document.createElement("button");
    button.classList.add("button");
    button.innerHTML = "New Game";

    const resultsContainer = document.createElement("div");
    resultsContainer.classList.add("side-panel__results");
    const results = this.pastResults
      .map((r) => r.counter)
      .reduce((sum, current) => (sum += current), 0);
    this.pastResults.forEach((element, i) => {
      const line = document.createElement("div");
      line.classList.add("side-panel__results-line");
      const indexContainer = document.createElement("div");
      indexContainer.style =
        "width: 20px; text-align: center; margin-right: 10px;";
      indexContainer.innerHTML = `${element.index}`;
      const gaugeContainer = document.createElement("div");
      gaugeContainer.classList.add("side-panel__results-gauge");
      line.appendChild(indexContainer);
      line.appendChild(gaugeContainer);
      gaugeContainer.style.transform = `scaleX(${
        (this.pastResults[i].counter / (results || 0.00000000001)) * 100
      }%)`;
      resultsContainer.appendChild(line);
    });

    div.appendChild(button);
    div.appendChild(answerContainer);
    div.appendChild(gameMessageContainer);
    div.appendChild(resultsContainer);

    return div;
  }
}

export class Wordle {
  matrix;
  answer;
  wordlist;

  constructor(wordlist) {
    this.matrix = [];
    this.wordlist = wordlist;
    this.generateAnswer();
    // this.answer = "tênis";
  }

  generateAnswer() {
    const size = this.wordlist.length;
    this.answer = this.wordlist[Math.floor(Math.random() * size)];
  }

  isAValidGuess(guess) {
    return this.wordlist
      .map((w) => removeSpecialCharacters(w))
      .includes(guess.toLowerCase());
  }

  isGameOver() {
    return this.hasWon() || this.matrix.length === 6;
  }

  hasWon() {
    return (
      this.matrix.length > 0 &&
      removeSpecialCharacters(this.answer) ===
        removeSpecialCharacters(
          this.matrix[this.matrix.length - 1].map((l) => l.letter).join("")
        )
    );
  }

  guess(word) {
    if (word.length !== 5) return false;

    let line = [];
    const cleanAnswer = removeSpecialCharacters(this.answer);
    let answerLetters = cleanAnswer.split("");
    let notExactMatches = answerLetters.filter((l, i) => l !== word[i]);
    const guessInWordlist = this.wordlist.find(
      (w) => removeSpecialCharacters(w) === word
    );

    word.split("").forEach(function (w, i) {
      if (w === cleanAnswer[i]) {
        line = [
          ...line,
          {
            letter: guessInWordlist[i],
            match: "exact-match",
          },
        ];
        answerLetters = removeFromArray(w, answerLetters);
      } else if (notExactMatches.includes(w)) {
        line = [...line, { letter: guessInWordlist[i], match: "match" }];
        notExactMatches = removeFromArray(w, notExactMatches);
      } else {
        line = [...line, { letter: guessInWordlist[i], match: "miss" }];
      }
    });

    this.matrix = [...this.matrix, line];

    console.log(this.matrix);

    return true;
  }
}

class Line extends GameElement {
  squares;
  guessWord;
  line;

  constructor(line = [], guessWord = "") {
    super();
    this.line = line;
    this.squares = [];
    this.guessWord = guessWord;
  }

  reveal(line) {
    let time = 0;
    this.squares.forEach(function (square, i) {
      const revealFunction = () =>
        setTimeout(() => {
          const front = square.querySelector(".square__side--front");
          front.innerHTML = line[i].letter;
          front.classList.add(`square__side--${line[i].match}`);
          const checkbox = square.querySelector("input");
          checkbox.checked = true;
        }, time);
      time += 200;
      revealFunction();
    });
  }

  render() {
    const lineElement = document.createElement("div");
    lineElement.classList.add("row");
    this.squares = [];
    for (let i = 0; i < 5; i++) {
      const element = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      element.appendChild(checkbox);

      const cursor = document.createElement("div");
      cursor.classList.add("square__cursor");

      const front = document.createElement("div");
      front.classList.add("square__side");
      front.classList.add("square__side--front");
      const back = document.createElement("div");
      back.classList.add("square__side");
      back.classList.add("square__side--back");

      if (this.line.length) {
        front.innerHTML = this.line[i].letter;
        checkbox.checked = true;
        front.classList.add(`square__side--${this.line[i].match}`);
      } else if (i < this.guessWord.length) {
        back.innerHTML = this.guessWord[i];
      }

      element.classList.add("square");
      element.appendChild(front);
      element.appendChild(back);
      //   element.appendChild(cursor);
      this.squares = [...this.squares, element];

      lineElement.append(element);
    }
    return lineElement;
  }
}

export class Board extends GameElement {
  game;
  wordlist;
  lines;
  currentGuess;
  sidePanel;
  messageHandler;

  constructor(wordlist) {
    super();
    this.wordlist = wordlists[wordlist];
    this.newGame();
  }

  newGame() {
    this.lines = [];
    this.game = new Wordle(this.wordlist);
    this.currentGuess = "";
    this.sidePanel = new SidePanel();
    this.render();
  }

  editGuess(chr) {
    if (this.currentGuess.length < 5) this.currentGuess += chr;
    this.render();
  }

  deleteChar() {
    this.currentGuess = this.currentGuess.slice(
      0,
      this.currentGuess.length - 1
    );
    this.render();
  }

  showMessage(message, keep = false, timeout = 0) {
    this.sidePanel.showMessage(message);
    if (keep) return;
    clearTimeout(this.messageHandler);
    this.messageHandler = setTimeout(() => {
      this.sidePanel.showMessage("");
      this.render();
    }, timeout);
  }

  reveal() {
    if (this.game.isGameOver()) return;
    if (this.messageHandler) clearTimeout(this.messageHandler);

    if (this.currentGuess.length < 5) {
      this.showMessage("Guess too short!", false, 1000);
      this.render();
      return;
    }

    if (
      !this.wordlist
        .map((w) => removeSpecialCharacters(w))
        .includes(this.currentGuess)
    ) {
      this.showMessage("This word doesn't exists!", false, 1000);
      this.render();
      return;
    }

    this.game.guess(this.currentGuess);

    if (this.game.matrix.length > 0) {
      const i = this.game.matrix.length - 1;
      this.lines[i].reveal(this.game.matrix[i]);
    }
    this.currentGuess = "";

    if (this.game.hasWon()) {
      this.showMessage("You've won 😎", true);
      this.sidePanel.showAnswer(this.game.answer);
      const pastResults = this.sidePanel.pastResults;
      pastResults[this.game.matrix.length - 1].counter++;
      localStorage.setItem("past-results", JSON.stringify(pastResults));
      setTimeout(() => {
        this.render();
      }, 1500);
      return;
    } else if (this.game.isGameOver()) {
      this.showMessage("You've lost 😭", true);
      this.sidePanel.showAnswer(this.game.answer);
      const pastResults = this.sidePanel.pastResults;
      pastResults[this.game.matrix.length].counter++;
      localStorage.setItem("past-results", JSON.stringify(pastResults));
      setTimeout(() => {
        this.render();
      }, 1500);
      return;
    }
  }

  render() {
    const main = document.querySelector(".main");
    main.innerHTML = "";
    const board = document.createElement("div");
    board.classList.add("board");
    this.lines = [];

    for (let i = 0; i < 6; i++) {
      const line =
        i < this.game.matrix.length
          ? new Line(this.game.matrix[i])
          : new Line([]);
      if (i === this.game.matrix.length) line.guessWord = this.currentGuess;

      board.appendChild(line.render());
      this.lines = [...this.lines, line];
    }

    main.appendChild(board);
    main.appendChild(this.sidePanel.render());
    return board;
  }
}
