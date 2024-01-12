uniform int numGaps;
uniform float gapStart;
uniform float initialGapSize;
uniform float gapSizes[6]; // max number of gaps
uniform float height;

varying vec2 vUv;

void main() {
	float strength = step(distance(vUv, vec2(0.5)), 0.2);
	float alpha = strength == 0.0 ? 0.0 : 1.0;

	float offset = 0.0;

	for (int i = 0; i < numGaps; i++) {
		float end = gapStart - offset - gapSizes[i];

		if (vUv.y < gapStart - offset && vUv.y > end) {
			alpha = 0.0;
		}

		offset += gapSizes[i] + height;
	}

	gl_FragColor = vec4(vec3(strength), alpha);
}