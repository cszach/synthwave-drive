uniform float gapStart;
uniform float initialGapSize;

varying vec2 vUv;

void main() {
	float strength = step(distance(vUv, vec2(0.5)), 0.2);
	float alpha = strength == 0.0 ? 0.0 : 1.0;

	if (vUv.y < gapStart && vUv.y > gapStart - initialGapSize) {
		alpha = 0.0;
	}

	gl_FragColor = vec4(vec3(strength), alpha);
}