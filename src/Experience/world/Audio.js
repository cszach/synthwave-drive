import * as THREE from "three";
import Experience from "../Experience";

// https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos
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
    this.debug = this.experience.debug;

    this.config = {
      volume: 0.3,
    };

    this.setTracks();
    this.setListener();
    this.setAudio();
    if (this.debug.active) this.setDebug();
    this.play();
  }

  setTracks() {
    this.tracks = [
      this.resources.items["song1"],
      this.resources.items["song2"],
    ];
  }

  setListener() {
    this.listener = new THREE.AudioListener();
    unlockAudioContext(this.listener.context);
    this.camera.instance.add(this.listener);
  }

  setAudio() {
    this.audio = new THREE.Audio(this.listener);
    this.audio.setVolume(this.config.volume);
    this.audio.onEnded = this.next.bind(this);

    this.scene.add(this.audio);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Audio");

    this.debugFolder.add(this.config, "volume", 0, 1, 0.1).onChange((v) => {
      this.audio.setVolume(v);
    });
    this.debugFolder.add(this.audio, "play");
    this.debugFolder.add(this.audio, "pause");
    this.debugFolder.add(this, "next");
    this.debugFolder.add(this, "prev");
  }

  next() {
    this.playTrackAt((this.index + 1) % this.tracks.length);
  }

  prev() {
    this.playTrackAt(
      (this.index > 0 ? this.index - 1 : this.tracks.length - 1) %
        this.tracks.length
    );
  }

  play() {
    this.playTrackAt(Math.floor(this.tracks.length * Math.random()));
  }

  playTrackAt(index) {
    this.audio.stop();

    this.index = index;

    this.audio.setBuffer(this.tracks[this.index]);
    this.audio.offset = 0;
    this.audio.play();
  }
}
