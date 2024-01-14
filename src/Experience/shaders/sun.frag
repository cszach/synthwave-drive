uniform float gapsLower;
uniform float gapsUpper;
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

/**
 * A sinoid wave function. Positive y values correlate to a gap on the sun.
 *
 * https://www.desmos.com/calculator/fazmd7fceq
 */
float wave(float x) {
  return sin(compression / (x - offset) - timeElapsed * timeMultiplier);
}

void main() {
  bool isSun = step(distance(vUv, vec2(0.5)), sunRadius) == 1.0;
  float alpha = isSun ? 1.0 : 0.0;

  if (vUv.y < gapsLower && vUv.y > gapsUpper && wave(vUv.y) > 0.0) {
    alpha = 0.0;
  }

  float lerpValue = (vUv.y - lerpStart) / (lerpEnd - lerpStart);
  gl_FragColor = vec4(mix(topColor, bottomColor, lerpValue), alpha);
}