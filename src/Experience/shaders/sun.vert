varying vec2 vUv;

void main() {
  vec4 projectedPosition =
      projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  gl_Position = projectedPosition;

  vUv = uv;
}