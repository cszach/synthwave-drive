import Experience from "./Experience/Experience";
import { gsap } from "gsap";

const urlParams = new URLSearchParams(window.location.search);

const experience = new Experience(document.querySelector("canvas.webgl"), {
  /** Whether to show debug UI. */
  debugActive: urlParams.has("debug"),
  /** Whether physics helpers are enabled (visible) by default. */
  physicsHelpersEnabled: urlParams.has("physicsHelpersEnabled"),
});

const intro = document.querySelector(".intro");
const button = document.querySelector(".button");

// Intro screen fades when start button is clicked
button.addEventListener("click", () => {
  if (button.classList.contains("activated")) {
    intro.style.pointerEvents = "none";

    gsap.to(intro, {
      opacity: 0,
      duration: 2,
    });

    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      experience.world.car.controls.setJoystick();
    }
  }
});
