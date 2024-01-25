import * as THREE from "three";
import Experience from "../Experience";

function unlockAudioContext(audioCtx) {
  if (audioCtx.state !== "suspended") return;
  const b = document.body;
  const events = ["touchstart", "touchend", "mousedown", "keydown"];
  events.forEach((e) => b.addEventListener(e, unlock, false));
  function unlock() {
    audioCtx.resume().then(clean);
  }
  function clean() {
    events.forEach((e) => b.removeEventListener(e, unlock));
  }
}

export default class Audio {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setTracks();
    this.setListener();
    this.setAudio();
    this.play();
  }

  setTracks() {
    this.tracks = [
      this.resources.items["bedtime-stories.mp3"],
      this.resources.items["drive.mp3"],
      this.resources.items["fading-echoes.mp3"],
      this.resources.items["the-shining.mp3"],
      this.resources.items["voyager.mp3"],
    ];
  }

  setListener() {
    this.listener = new THREE.AudioListener();
    unlockAudioContext(this.listener.context);
    this.camera.instance.add(this.listener);
  }

  setAudio() {
    this.audio = new THREE.Audio(this.listener);
    this.scene.add(this.audio);
  }

  play() {
    this.index = Math.floor(this.tracks.length * Math.random());

    this.audio.setBuffer(this.tracks[this.index]);

    this.audio.onEnded = () => {
      this.audio.stop();

      this.index = (this.index + 1) % this.tracks.length;

      this.audio.setBuffer(this.tracks[this.index]);
      this.audio.offset = 0;
      this.audio.play();
    };

    this.audio.play();
  }
}
