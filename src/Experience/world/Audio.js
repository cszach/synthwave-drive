import * as THREE from "three";
import Experience from "../Experience";

export default class Audio {
  constructor() {
    this.experience = new Experience();
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
  }

  setAudio() {
    this.audio = new THREE.Audio(this.listener);
    this.scene.add(this.audio);
  }

  play() {
    this.index = Math.floor(this.tracks.length * Math.random());

    this.audio.setBuffer(this.tracks[this.index]);

    this.audio.onEnded = () => {
      console.log("new music!");
      this.audio.stop();

      this.index = (this.index + 1) % this.tracks.length;

      this.audio.setBuffer(this.tracks[this.index]);
      this.audio.offset = 0;
      this.audio.play();
    };

    this.audio.play();
  }
}
