// grid = clearGrid([]);

let gameContainerDiv = document.getElementById("gameContainer");
let counterDiv = document.getElementById("rowCounter");
let nextShapeContainer = document.getElementById("nextShapeContainer");
let swapShapeContainer = document.getElementById("swapShapeContainer");

const long = [
  [1, 1, 1, 1]
];
const sqr = [
  [2, 2],
  [2, 2]
];
const zz1 = [
  [3, 3, 0],
  [0, 3, 3]
];
const zz2 = [
  [0, 4, 4],
  [4, 4, 0]
];
const tee = [
  [0, 5, 0],
  [5, 5, 5]
];
const el1 = [
  [0, 0, 6],
  [6, 6, 6]
];
const el2 = [
  [7, 0, 0],
  [7, 7, 7]
];

function rotateMatrix(matrix) {
  var theta = matrix.reduce((omega, alpha) => omega.concat(alpha));
  var delta = [];
  for (x = 0; x < matrix[0].length; x++) {
    i = x;
    delta[x] = [];
    while (i < theta.length) {
      delta[x].push(theta[i]);
      i += matrix[0].length;
    }
    delta[x].reverse();
  }
  return delta;
}

function getNewShape(shapes) {
  const idx = Math.floor(Math.random() * shapes.length)
  return copyShape(shapes[idx]);
}

function copyShape(shape) {
  return JSON.parse(JSON.stringify(shape));
}

function clearGrid(grid, width, height) {
  grid = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(0);
    }
    grid.push(row);
  }
  return grid;
}

function createDivGrid(containerDiv, width, height) {
  const divGrid = [];
  for (let i = 0; i < height; i++) {
    const newRow = [];
    const newRowDiv = document.createElement('div');
    newRowDiv.classList.add('row');
    for (let j = 0; j < width; j++) {
      const newSqrDiv = document.createElement('div');
      newSqrDiv.classList.add('square');
      newRowDiv.appendChild(newSqrDiv);
      newRow.push(newSqrDiv);
    }
    containerDiv.appendChild(newRowDiv);
    divGrid.push(newRow);
  }
  return divGrid;
}

function putIntoGrid(grid, shape, startX, startY) {
  for (let x = 0; x < shape.length; x++) {
    for (let y = 0; y < shape[x].length; y++) {
      grid[startX + x][startY + y] = grid[startX + x][startY + y] + shape[x][y];
    }
  }
}

function canGoDown(grid, shape, shapeX, shapeY) {
  if (shapeX + shape.length - 1 == grid.length - 1) {
    return false;
  }
  for (let x = 0; x < shape.length; x++) {
    for (let y = 0; y < shape[x].length; y++) {
      if (shape[x][y] > 0) {
        if (grid[shapeX + x + 1][shapeY + y] > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function canGoRight(grid, shape, shapeX, shapeY) {
  if (shapeY + shape[0].length - 1 == grid[0].length - 1) {
    return false;
  }
  for (let x = 0; x < shape.length; x++) {
    for (let y = 0; y < shape[x].length; y++) {
      if (shape[x][y] > 0) {
        if (grid[shapeX + x][shapeY + y + 1] > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function canGoLeft(grid, shape, shapeX, shapeY) {
  if (shapeY === 0) {
    return false;
  }
  for (let x = 0; x < shape.length; x++) {
    for (let y = 0; y < shape[x].length; y++) {
      if (shape[x][y] > 0) {
        if (grid[shapeX + x][shapeY + y - 1] > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function isFull(row) {
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 0) {
      return false;
    }
  }
  return true;
}

function gridTraverse(grid, func) {
	for (let i = 0; i < grid.length; i++) {
      	for (let j = 0; j < grid[i].length; j++) {
        	func(grid[i][j], i, j);
        }
      }
}

const GridModule = function(container, width, height) {
	let grid = clearGrid([], width, height);
  let divGrid = createDivGrid(container, width, height);
  function clear() {
      gridTraverse(grid, (el, i, j) => {
      	grid[i][j] = 0;
        divGrid[i][j].className = "square";
      });
  }
  function render() {
  	gridTraverse(grid, (el, i, j) => {
        divGrid[i][j].className = "square";
				if (grid[i][j] > 0) {
        	divGrid[i][j].classList.add("hasNewShape", "col" + (grid[i][j] - 1));
        }
      });
  }
  return {
    height: height,
    width: width,
    grid: grid,
    divGrid: divGrid,
    mergeShape: function(shape, x, y) {
    	putIntoGrid(grid, shape, x, y);
      render();
    },
    clear: clear,
  }
};

const GameModule = function(gameContainer) {
    let onNextShape = null;
  let onSwapShape = null;
  let onScoreChange = null;
  let container = gameContainer;
  let divGrid = createDivGrid(container, 10, 20);
  let action = '';
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') {
      action = 'left';
    } else if (e.code === 'ArrowRight') {
      action = 'right';
    } else if (e.code === 'ArrowUp') {
      action = 'drop';
    } else if (e.code === 'Space') {
      action = 'rotate';
    } else if (e.code === 'ArrowDown') {
      action = 'down';
    } else if (e.code === 'KeyC') {
      action = 'swap';
    }
  });
  return {
    grid: clearGrid([], 10, 20),
    shapes: [long, sqr, zz1, zz2, tee, el1, el2],
    nextShape: null,
    swappedShape: null,
    newShape: null,
    newShapeX: 0,
    newShapeY: 3,
    container: container,
    divGrid: divGrid,
    downCycle: 0,
    downSpeed: 20,
    action: action,
    score: 0,
    start: function() {
      this.nextShape = getNewShape(this.shapes);
      if (onNextShape) { onNextShape(this.nextShape); }
      this.newShape = getNewShape(this.shapes);
      this.gameStep();
      this.renderStep();
    },
    gameStep: function() {
      this.downCycle = this.downCycle + 1;
      let removeShape = false;
      // handle actions
      if (action && this.newShape) {
        if (action === 'left' && canGoLeft(this.grid, this.newShape, this.newShapeX, this.newShapeY)) {
          this.newShapeY = this.newShapeY - 1;
        } else if (action === 'right' && canGoRight(this.grid, this.newShape, this.newShapeX, this.newShapeY)) {
          this.newShapeY = this.newShapeY + 1;
        } else if (action === 'drop') {
          while (canGoDown(this.grid, this.newShape, this.newShapeX, this.newShapeY)) {
            this.newShapeX = this.newShapeX + 1;
          }
        } else if (action === 'rotate') {
          const rotated = rotateMatrix(this.newShape);
          if (canGoDown(this.grid, rotated, this.newShapeX - 1, this.newShapeY) &&
            canGoLeft(this.grid, rotated, this.newShapeX, this.newShapeY + 1) &&
            canGoRight(this.grid, rotated, this.newShapeX, this.newShapeY - 1)) {
            this.newShape = rotated;
          }
        } else if (action === 'down') {
          this.downCycle += 20;
        } else if (action === 'swap') {
        		let temp = this.newShape;
            this.newShape = this.swappedShape;
            this.swappedShape = temp;
            this.newShapeX = 0;
            this.newShapeY = 3;
            
            if (onSwapShape) {
            	onSwapShape(this.swappedShape);
            }
        }
      }
      // handle movement down
      if (!this.newShape) {
        this.newShape = this.nextShape;
        this.nextShape = getNewShape(this.shapes);
        if (onNextShape) { onNextShape(this.nextShape); }
      } else {
        if (this.downCycle >= this.downSpeed) {
          if (canGoDown(this.grid, this.newShape, this.newShapeX, this.newShapeY)) {
            this.newShapeX = this.newShapeX + 1;
          } else {
            putIntoGrid(this.grid, this.newShape, this.newShapeX, this.newShapeY);
            for (let i = 0; i < this.newShape.length; i++) {
              const row = this.grid[this.newShapeX + i];
              if (isFull(row)) {
                this.score++;
                if (onScoreChange) { onScoreChange(this.score); }
                this.grid.splice(this.newShapeX + i, 1);
                this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
              }
            }
            this.newShape = null;
            this.newShapeX = 0;
            this.newShapeY = 3;

          }
          this.downCycle = 0;
        }
      }

      action = null;
      setTimeout(() => {
        this.gameStep();
      }, 25);
    },
    renderStep: function() {
      this._renderGrid();
      setTimeout(() => {
        this.renderStep();
      }, 50);
    },
    _renderGrid: function() {
      counterDiv.textContent = this.score;
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {

          this.divGrid[i][j].classList.remove('hasNewShape', 'hasShape', 'col0', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6');

          if (this.grid[i][j] > 0) {
            this.divGrid[i][j].classList.add('hasShape', 'col' + (this.grid[i][j] - 1));
          }
        }
      }
      if (this.newShape) {
        for (let i = 0; i < this.newShape.length; i++) {
          for (let j = 0; j < this.newShape[i].length; j++) {
            if (this.newShape[i][j] > 0) {
              this.divGrid[this.newShapeX + i][this.newShapeY + j].classList.add('hasNewShape', 'col' + (this.newShape[i][j] - 1));
            }
          }
        }
      }
    },
    onNextShape: (callback) => {
    	onNextShape = callback;
    },
    onSwapShape: (callback) => {
    	onSwapShape = callback;
    },
    onScoreChange: (callback) => {
    	onScoreChange = callback;
    }
  }
}

const nextGrid = GridModule(nextShapeContainer, 4, 2);
const swapGrid = GridModule(swapShapeContainer, 4, 2);
const game = GameModule(gameContainerDiv);
game.onSwapShape((shape) => {
	swapGrid.clear();
    if (shape.length > 2) {
        shape = rotateMatrix(shape);
    }
  swapGrid.mergeShape(shape, 0, 0);
});
game.onNextShape((shape) => {
    nextGrid.clear();
    if (shape.length > 2) {
        shape = rotateMatrix(shape);
    }
	nextGrid.mergeShape(shape, 0, 0);
});
game.start();
