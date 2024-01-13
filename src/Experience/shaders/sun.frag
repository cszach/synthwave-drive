uniform float lower;
uniform float upper;
uniform float timeElapsed;

uniform float compression;
uniform float offset;
uniform float timeMultiplier;

varying vec2 vUv;

float wave(float x) {
  return sin(compression / (x - offset) - timeElapsed * timeMultiplier);
}

void main() {
  float strength = step(distance(vUv, vec2(0.5)), 0.2);
  float alpha = strength == 0.0 ? 0.0 : 1.0;

  if (vUv.y < lower && vUv.y > upper && wave(vUv.y) > 0.0) {
    alpha = 0.0;
  }

  gl_FragColor = vec4(vec3(strength), alpha);
}