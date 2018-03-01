import { grid, hud } from "./display";
import { Coord } from "./types";
export var canvas = <HTMLCanvasElement>document.getElementById("myCan");
export var context = <CanvasRenderingContext2D>canvas.getContext('2d');

/* Canvas dimensions */
export var stepping = { ver: 50, hor: 0 };

/* Base functions */
/* Compare two object */
export function isSameTwoObjects(obj1: Object, obj2: Object) {
  return (JSON.stringify(obj1) == JSON.stringify(obj2));
}

/* Snake */
export var snake = {
  coords: Array(0),
  afterCoord: { x: 0, y: 0 },
  direction: "",
  isGrow: false,
  init: function(): void {
    snake.coords = Array(0);
    snake.coords.push({
      x: Math.trunc(stepping.ver / 2),
      y: Math.trunc(stepping.hor / 2)
    });
    snake.draw();
  },
  setDir: (dir: string): string => snake.direction = dir,
  getDir: (): string => snake.direction,
  find: function(coord: Coord): number {
    return snake.coords.findIndex(
      (obj): boolean => isSameTwoObjects(obj, coord)
    );
  },
  bite: function(coord: Coord): number {
    return snake.coords.slice(1).findIndex(function(obj) {
      return (isSameTwoObjects(obj, coord));
    });
  },
  move: function(direction?: string): void {
    let dir = direction || snake.direction;
    let coords = snake.coords;
    let head = coords[0];

    switch (dir) {
      /* Y axis */
      case "up": coords.unshift({ x: head.x, y: head.y - 1 }); break; // Y-
      case "down": coords.unshift({ x: head.x, y: head.y + 1 }); break; // Y+
      /* X axis */
      case "left": coords.unshift({ x: head.x - 1, y: head.y }); break; // X-
      case "right": coords.unshift({ x: head.x + 1, y: head.y }); break; // X+
      default: ;
    }

    // Update head after step
    head = coords[0];

    /* Head on the food */
    let index = food.find(head);
    if (index > -1) {
      food.eat(index);
      snake.isGrow = true;
      hud.score.add(10);
      food.place();
    }

    /* Assign after snake coords */
    if (!snake.isGrow) {
      snake.afterCoord = coords.pop();
    } else {
      snake.isGrow = false;
    }

    /* Bite himself */
    if (snake.bite(head) > -1) {
      game.end();
    }

    /* Hit the wall */
    if ((head.y < 0 || head.y >= stepping.hor) ||
      (head.x < 0 || head.x >= stepping.ver)) {
      dir = "";
      game.end();
    }
    snake.setDir(dir);
  },
  draw: function(): void {    
    let head = snake.coords[0];
    context.beginPath();
    context.fillStyle = "#030";

    // Draw Snake's head
    context.fillRect(head.x * grid.getSize() + 1,
      head.y * grid.getSize() + 1,
      grid.getSize() - 2,
      grid.getSize() - 2);

    // Hide Snake's track
    if (!snake.isGrow) {
      context.fillStyle = "darkgreen";
      context.fillRect(snake.afterCoord.x * grid.getSize() + 1,
        snake.afterCoord.y * grid.getSize() + 1,
        grid.getSize() - 2,
        grid.getSize() - 2);
    }
    context.stroke();
  }
}

/* Food */
export var food = {
  coords: [],
  find: (coord: Coord): number => {
    return food.coords.findIndex(function(obj: Coord) {
      return isSameTwoObjects(coord, obj);
    });
  },
  add: (coord: Coord): any => food.coords.push(<never>coord) - 1, // Return index of added element
  eat: (id: number): void => { food.coords.splice(id, 1) },
  reset: function(): void {
    food.coords = [];
    food.place();
  },
  genRandCoord: function(): Coord {
    let rand = function(max: number) { return Math.floor((Math.random() * max)); };
    return { x: rand(stepping.ver), y: rand(stepping.hor) };
  },
  place: function() {
    let coords = food.genRandCoord();
    let pi = Math.PI;
    let r = grid.getSize() / 2;

    // Don't place food on snake
    while (snake.find(coords) > -1) {
      coords = food.genRandCoord();
    }

    // Possible to add multiple food (future feature)
    food.add(coords);

    context.fillStyle = "#C00";
    context.beginPath();
    context.arc(coords.x * grid.getSize() + r, coords.y * grid.getSize() + r, r - 1, 0, 2 * pi);
    context.fill();
    context.stroke();
  }
}

/* Animation control */
export var anim = {
  id: -1,
  speed: 250,
  isPaused: true,
  setSpeed: (speed: number) => anim.speed = speed,
  getSpeed: () => anim.speed,
  play: function() {
    if (anim.id == -1) anim.id = setInterval(function() { // Prevent the rerun
      snake.move();
      snake.draw();
    }, anim.getSpeed());
    anim.isPaused = false;
    return;
  },
  pause: function() {
    clearInterval(anim.id);
    anim.id = -1;
    anim.isPaused = true;
    return;
  },
  toggle: function() {
    if (anim.isPaused === true) anim.play();
    else anim.pause();
  }
}

window.onkeyup = function(event: KeyboardEvent): void {
  /* Cross-browser event handling */
  event = event || <KeyboardEvent>window.event;
  let dir = snake.getDir();

  switch(event.keyCode) {
    /* Opposite direction test, because the snake "Never Back Down" =) */
    case 38: if (dir !== "down") dir = "up"; break;
    case 40: if (dir !== "up") dir = "down"; break;
    case 37: if (dir !== "right") dir = "left"; break;
    case 39: if (dir !== "left") dir = "right"; break;
    case 80: {
      anim.toggle();
      if (anim.isPaused) {
        hud.message.addText("Paused");
        hud.message.show();
      } else hud.message.hide();
    }
    break;
  }

  if (36 < event.keyCode && event.keyCode < 41) {
    if (game.getStatus() == "end") {
      game.reset();
    } else {
      hud.message.hide();
      snake.setDir(dir);
      game.play();
    }
  }
}

export var game = {
  status: "",
  setStatus: (status: string) => game.status = status,
  getStatus: () => game.status,
  start: function() { //Set up for first launch
    game.setStatus("start");
    // Grid
    grid.setSize(25);
    grid.setColor("#333");
    grid.draw();
    // Hud
    hud.message.addText("Press cursor keys to begin");
    // Snake
    snake.init();
    // Food
    food.place();
  },
  play: function() {
    // Hud
    hud.hide("title");
    hud.show(hud.layouts.play);
    // Let's move
    anim.play();
  },
  end: function() {
    game.setStatus("end");
    // Hud
    hud.show("gameOver");
    hud.lives.dead();
    // Stop animation
    anim.pause();
  },
  reset: function() {
    game.setStatus("reset");
    // Grid (clean up)
    grid.clear();
    grid.draw();
    // Hud
    hud.hide("gameOver");
    hud.message.addText("Press cursor keys to begin");
    hud.message.show();
    if (hud.lives.value === 0) {
      hud.lives.reset();
      hud.score.reset();
    }
    // Snake
    snake.init();
    // Food
    food.reset();
  }
}
game.start();