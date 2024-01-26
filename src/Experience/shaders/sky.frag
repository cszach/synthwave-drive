uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float skyStart;
uniform float skyEnd;
varying vec2 vUv;

void main() {
  gl_FragColor =
      vec4(mix(bottomColor, topColor,
               clamp((vUv.y - skyEnd) / (skyStart - skyEnd), 0.0, 1.0)),
           1.0);
}