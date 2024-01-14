uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float skyStart;
uniform float skyEnd;
varying vec2 vUv;

void main() {
  vec3 color =
      (vUv.y > skyStart)
          ? topColor
          : (vUv.y < skyEnd ? bottomColor
                            : mix(bottomColor, topColor,
                                  (vUv.y - skyEnd) / (skyStart - skyEnd)));

  gl_FragColor = vec4(color, 1.0);
}