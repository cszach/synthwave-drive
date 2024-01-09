import EventEmitter from "./EventEmitter";

export default class Keyboard extends EventEmitter {
  constructor() {
    super();

    this.keyStatus = {};

    window.addEventListener("keydown", (e) => {
      if (this.keyStatus[e.key]) {
        return;
      }

      this.keyStatus[e.key] = true;
      this.trigger("keydown", [e.key]);
    });

    window.addEventListener("keyup", (e) => {
      this.keyStatus[e.key] = false;
      this.trigger("keyup");
    });
  }
}