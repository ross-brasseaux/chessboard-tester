/// <reference path="jquery.js" />
/// <reference path="core.js" />

var letters = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  1: 'a',
  2: 'b',
  3: 'c',
  4: 'd',
  5: 'e',
  6: 'f',
  7: 'g',
  8: 'h',
};

var $doc = $(document);

var Tester = (function () {
  function getColLetter(col) {
    console.log('validating col arg: ', {
      col,
      colString: `${col}`,
      index: Object.keys(letters).indexOf(`${col}`),
    });
    if (Object.keys(letters).indexOf(`${col}`) < 0)
      throw `Invalid column value: "${col}"`;
    if (isNaN(col)) {
      return col; // return letter
    } else {
      return letters[col]; // return letter
    }
  }

  function getColNumber(col) {
    if (Object.keys(letters).indexOf(`${col}`) < 0)
      throw `Invalid column value: "${col}"`;
    if (isNaN(col)) {
      return letters[col]; // return number
    } else {
      return parseInt(col); // return number
    }
  }

  function getSquareId(row, col) {
    col = getColNumber(col);
    return `${row}_${col}`;
  }

  //#region helper classes
  var Question = (function () {
    // private properties

    // constructor
    function Question(row, col) {
      this._complete = false;
      this._answer = {
        row: null,
        col: null,
      };

      this._row = row;
      this._col = col;

      // private readonly properties
      Object.defineProperties(this, {
        row: {
          get() {
            return this._row;
          },
        },
        col: {
          get() {
            return this._col;
          },
        },
      });
    }

    // api
    Question.prototype = {
      complete: function (value) {
        if (arguments.length == 0) return this._complete;
        this._complete = value;
        return this;
      },
      getSquare: function () {
        var id = getSquareId(this.row, this.col);
        return $(`#${id}`);
      },
      /**
       * Gets or sets the answer to this question. Returns the question instance after setting the value.
       * @param {*} a Can be the jQuery element that was selected, or the row number.
       * @param {*} b If a is the row number, then this must be the col number.
       * @returns
       */
      answer: function (a, b) {
        if (arguments.length == 0) return this._answer;
        if (a instanceof $) {
          // element provided
          var $ele = $(a);
          var row = $ele.data('row');
          var col = $ele.data('col-number');
          this._answer.row = row;
          this._answer.col = col;
        } else {
          if (isNaN(a)) throw 'Invalid row argument.';
          if (isNaN(b)) throw 'Invalid col argument.';

          this._answer.row = parseInt(a);
          this._answer.col = parseInt(b);
        }
        this.complete(true);
        return this;
      },
      getQuestionTexts: function () {
        return {
          row: `${this.row}`,
          col: getColLetter(this.col),
        };
      },
      getAnswerTexts: function () {
        return {
          row: this._answer.row,
          col: getColLetter(this._answer.col),
        };
      },
      correct: function () {
        if (!this.complete()) return false;
        return this._row === this._answer.row && this._col === this._answer.col;
      },
    };

    return Question;
  })();

  var Test = (function () {
    function newKey() {
      return generateHexString();
    }

    function Test() {
      this._key = '';
      this._score = 0;
      this._complete = false;
      this._key = newKey();
      this.questions = [];
      Object.defineProperties(this, {
        score: {
          get() {
            return this._score;
          },
        },
        key: {
          get() {
            return this._key;
          },
        },
      });
    }

    Test.prototype = {
      addQuestion: function (question) {
        if (this._complete) throw 'Test is already complete';
        var i = this.questions.length;
        this.questions.push(question);
        return i;
      },
      finish: function () {
        if (this._complete) return;
        this._complete = true;
        this.questions.forEach((q) => {
          q.complete(true);
        });
      },
      updateScore: function () {
        var correct = 0;
        var total = this.questions.length;
        this.questions.forEach((q) => {
          if (q.correct()) correct++;
        });
        this._score = correct > 0 && total > 0 ? correct / total : 0;
      },
    };

    return Test;
  })();

  //#endregion

  // constructor
  // -----------------------------
  function Tester() {
    this.colors = {
      white: '#EEEED2',
      black: '#759656',
    };

    this.currentTest = null;
    this.currentQuestion = null;
    this.tests = {};

    // private variables
    // -----------------------------
    this._$board = $();

    this.init = false;
    this.colorsInit = false;
    this._$playerTop = null;
    this._$playerBottom = null;
    this._whiteOnTop = false;
  }

  // private functions
  // -----------------------------
  function getColorClass(row, col) {
    return (row + col) % 2 == 0 ? 'black' : 'white';
  }

  function clearBoard(tester) {
    validateTester(tester);
    tester._$board.html('');
    tester.colorsInit = false;
  }

  function validateTester(tester) {
    if (!(tester instanceof Tester))
      throw 'Tester argument  must be an instance of Tester class.';
  }

  function validateJquery($ele, name) {
    if (typeof name !== 'string' || name.length === 0) name = 'The';
    if (!($ele instanceof jQuery))
      throw name + ' argument must be a jQuery element.';
  }

  function addSquares(tester) {
    console.log('adding squares for tester: ', tester);
    validateTester(tester);
    validateJquery(tester._$board, 'The tester board');
    var bounds = tester._whiteOnTop ? {
      rowStart: 1,
      rowEnd: 8,
      colStart: 8,
      colEnd: 1
    } : {
      rowStart: 8,
      rowEnd: 1,
      colStart: 1,
      colEnd: 8
    };

    function addSquare($row, row, col) {
      var label = `${letters[col]}${row}`.toUpperCase();
      var $sq = $(
        `<div class="square" id="${getSquareId(
          row,
          col
        )}" data-row="${row}" data-col-number="${col}" data-col="${
          letters[col]
        }">${label}</div>`
      );
      $row.append($sq);
      tester._$board.append($row);
    }

    if(tester._whiteOnTop){
      for (var row = 1; row <= 8; row++) {
        var $row = $(`<div class="row-container" [data-row]="${row}"></div>`);
        console.log('adding row #'+row, $row);
        for (var col = 8; col >= 1; col--) {
          addSquare($row,row,col);
        }
      }
    } else {
      for (var row = 8; row >= 1; row--) {
        var $row = $(`<div class="row-container" [data-row]="${row}"></div>`);
        console.log('adding row #'+row, $row);
        for (var col = 1; col <= 8; col++) {
          addSquare($row,row,col);
        }
      }
    }
    
  }

  function clearPlayerLabels(tester) {
    validateTester(tester);
    $labels = tester._$playerTop.add(tester._$playerBottom);
    $labels.text('');
    $labels.removeClass('white-label black-label');
  }

  function setPlayerLabels(tester) {
    if(tester._whiteOnTop) {
      tester._$playerTop.text('White').addClass('white-label');
      tester._$playerBottom.text('Black').addClass('black-label');
    } else {
      tester._$playerBottom.text('White').addClass('white-label');
      tester._$playerTop.text('Black').addClass('black-label');
    }
  }

  function setColors(tester) {
    if (tester.colorsInit) throw `Tester colors already set (${this.key})`;
      var $rows = tester._$board.find('.square');
      $rows.each((i, ele) => {
        var $ele = $(ele);
        var row = parseInt($ele.data('row'));
        var col = parseInt($ele.data('col-number'));
        $ele.addClass(getColorClass(row, col));
      });
      tester.colorsInit = true;
  }

  // API
  // -----------------------------
  Tester.prototype = {
    flip: function () {
      clearBoard(this);
      clearPlayerLabels(this);
      this._whiteOnTop = !this._whiteOnTop;
      addSquares(this);
      setColors(this);
      setPlayerLabels(this);
    },
    create: function ($board, $playerTop, $playerBottom) {
      if (this.init) throw `Tester already initialized (${this.key})`;
      validateJquery($board, 'Board');
      validateJquery($playerTop, 'The top player label');
      validateJquery($playerBottom, 'The bottom player label');
      console.log('creating board...', {$board,$playerTop,$playerBottom});
      this._$playerTop = $playerTop;
      this._$playerBottom = $playerBottom;
      this._$board = $board;
      setPlayerLabels(this);
      addSquares(this);
      // for (var row = 1; row <= 8; row++) {
      //   var $row = $(`<div class="row-container" [data-row]="${row}"></div>`);
      //   for (var col = 8; col >= 1; col--) {
      //     var label = `${letters[col]}${row}`.toUpperCase();
      //     var $sq = $(
      //       `<div class="square" id="${getSquareId(
      //         row,
      //         col
      //       )}" data-row="${row}" data-col-number="${col}" data-col="${
      //         letters[col]
      //       }">${label}</div>`
      //     );
      //     $row.append($sq);
      //     this._$board.append($row);
      //   }
      // }
      setColors(this);
      this.init = true;
    },
    startTest: function (questionAskedCallback, questionAnsweredCallback) {
      var test = new Test();
      this._$board.addClass('active');
      this.tests[test.key] = test;
      this.currentTest = test;
      let self = this;
      console.log('Starting test: ', test);
      // The wrapper function that will forward the result to the actual callback and then ask the next question.
      function answeredCallbackWrapper(answeredQuestion) {
        // a question was answered, and this function was informed of the result.

        // propagate event by informing the parent listener of result via the answeredCallback.
        questionAnsweredCallback(answeredQuestion);
        // start a new question
        var newQuestion = self.ask(answeredCallbackWrapper);
        // inform listener of the new question that was asked
        questionAskedCallback(newQuestion);
      }

      // start the test
      var initialQuestion = this.ask(answeredCallbackWrapper);

      questionAskedCallback(initialQuestion);
    },
    finishTest: function () {
      this._$board.off('click').removeClass('active');

      var test = this.currentTest;
      this.currentTest.finish();
      this.currentTest = null;
      return test;
    },
    ask: function (questionAnsweredCallback) {
      if (!this.currentTest) throw 'No test in progress.';
      var inputs = { row: getRandomInt(8), col: getRandomInt(8) };
      var q = new Question(inputs.row, inputs.col);
      console.log('New Question: ', { q, inputs });
      this.currentTest.addQuestion(q);
      this.currentQuestion = q;
      var self = this;

      function listen() {
        self._$board.one('click', (e) => {
          var $target = $(e.target);
          if (!$target.hasClass('square')) {
            listen();
            return;
          }
          self.answer($target, questionAnsweredCallback);
        });
      }

      listen();
      console.log('Question asked: ', q);
      return q;
    },
    answer: function ($target, callback) {
      if (!($target instanceof jQuery))
        throw 'Must provide jQuery instance of click target.';
      // answer question and store result
      var answeredQuestion = this.currentQuestion.answer($target);
      this.currentTest.updateScore();
      // clear Tester reference to current question
      this.currentQuestion = null;
      console.log('Question answered: ', answeredQuestion);
      // inform listener of result via the given callback
      callback(answeredQuestion);
      return answeredQuestion;
    },
  };

  return Tester;
})();
