import { stepping, canvas, context } from "./main";
/* On-screen user interface */
export var hud = {
  create: undefined,
  layouts: { // Layouts
    play: [
      "score",
      "lives"
    ],
    pause: [
      "toast",
      "legend"
    ],
    gameOver: ["gameOver"]
  },
  getElement: function(id: string): HTMLElement {
    return <HTMLElement>document.getElementById(id);
  },
  setText: function(element: HTMLElement, text: string) {
    element.innerText = text;
  },
  message: {
    element: "toast",
    addText: function(text: string) { hud.getElement(this.element).innerText = text; },
    show: function() { hud.show(this.element); },
    hide: function() { hud.hide(this.element); }
  },
  score: {
    element: "score",
    value: 0,
    add: function(num: number) {
      this.value += num;
      this.print();
    },
    reset: function() {
      this.value = 0;
      this.print();
    },
    print: function() {
      hud.getElement("score").innerText = "Score: " + this.value;
    }
  },
  lives: {
    element: "lives",
    value: 3,
    dead: function() {
      this.value -= 1;
      this.print();
    },
    reset: function() {
      this.value = 3;
      this.print();
    },
    print: function() {
      hud.getElement("lives").innerText = this.value + ' lives left';
    }
  },
  show: function(elements: (string | string[])) {
    if (Array.isArray(elements)) {
      for (let i = 0; i < elements.length; i++) {
        this.getElement(elements[i]).style.display = "initial"
      }
    } else {
      this.getElement(elements).style.display = "initial";
    }
  },
  hide: function(elements: (string | string[])): void {
    if (Array.isArray(elements)) {
      for (let i = 0; i < elements.length; i++) {
        this.getElement(elements[i]).style.display = "none"
      }
    } else {
      this.getElement(elements).style.display = "none";
    }
  },
}

/* Board griding */
export var grid = {
  size: 0,
  setSize: function(size: number): void {
    this.size = size;
    stepping.ver = Math.trunc(canvas.width / size);
    stepping.hor = Math.trunc(canvas.height / size);
  },
  getSize: (): number => grid.size,
  setColor: (color: string) => context.strokeStyle = color,
  getColor: (): string => <string>context.strokeStyle,
  getBgColor: () => canvas.style.backgroundColor,
  draw: function() {
    let size = this.getSize();
    context.beginPath();
    for (let x = 0; x <= stepping.ver; x++) {
      context.moveTo(size * x, 0);
      context.lineTo(size * x, canvas.height);
      for (let y = 0; y <= stepping.hor; y++) {
        context.moveTo(0, size * y);
        context.lineTo(canvas.width, size * y);
      }
    }
    context.stroke();
  },
  clear: function() {
    context.beginPath();
    context.fillStyle = "darkgreen";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.stroke();
  }
}