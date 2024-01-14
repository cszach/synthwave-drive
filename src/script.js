import Experience from "./Experience/Experience";

const urlParams = new URLSearchParams(window.location.search);

const experience = new Experience(document.querySelector("canvas.webgl"), {
  /** Whether to show debug UI. */
  debugActive: urlParams.has("debug"),
  /** Whether car helpers are enabled (visible) by default. */
  carHelpersEnabled: urlParams.has("carHelpersEnabled"),
  /** Whether physics helpers are enabled (visible) by default. */
  physicsHelpersEnabled: urlParams.has("physicsHelpersEnabled"),
});
