import EventEmitter from "./EventEmitter";

export default class Keyboard extends EventEmitter {
  constructor() {
    super();

    this.keyStatus = {};

    window.addEventListener("keydown", (e) => {
      this.keyStatus[e.code] = true;
      this.trigger("keydown", [e.code]);
    });

    window.addEventListener("keyup", (e) => {
      this.keyStatus[e.code] = false;
      this.trigger("keyup", [e.code]);
    });
  }
}
