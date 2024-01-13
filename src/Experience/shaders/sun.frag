uniform float lower;
uniform float upper;
uniform float timeElapsed;

uniform float compression;
uniform float offset;
uniform float timeMultiplier;
uniform float sunRadius;
uniform float lerpStart;
uniform float lerpEnd;
uniform vec3 bottomColor;
uniform vec3 topColor;

varying vec2 vUv;

float wave(float x) {
  return sin(compression / (x - offset) - timeElapsed * timeMultiplier);
}

void main() {
  bool isSun = step(distance(vUv, vec2(0.5)), sunRadius) == 1.0;
  float alpha = isSun ? 1.0 : 0.0;

  if (vUv.y < lower && vUv.y > upper && wave(vUv.y) > 0.0) {
    alpha = 0.0;
  }

  gl_FragColor = vec4(
      mix(topColor, bottomColor, (vUv.y - lerpStart) / (lerpEnd - lerpStart)),
      alpha);
}