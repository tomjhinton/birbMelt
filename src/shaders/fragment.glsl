const float PI = 3.1415926535897932384626433832795;
const float TAU = 2.* PI;
uniform vec3 uColor;
uniform vec3 uPosition;
uniform vec3 uRotation;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform vec3 uValueA;
uniform vec2 uMouse;



varying vec2 vUv;
varying float vElevation;
varying float vTime;

precision highp float;

#define PI 3.14159265359




const int RAYMARCH_MAX_STEPS = 200;
const float RAYMARCH_MAX_DIST = 50.;
const float EPSILON = 0.0001;


mat2 rot (float a) {
	return mat2(cos(a),sin(a),-sin(a),cos(a));
}



// p: position c: corner
float sdBox(vec3 p, vec3 c) {
  vec3 q = abs(p) - c;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}



float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float opSmoothUnion( float d1, float d2, float k )
{
    // float h = max(k-abs(d1-d2),0.0);
    // return min(d1, d2) - h*h*0.25/k;
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}


float scene(vec3 pos) {

  vec3 pos2 = pos;
    vec3 pos3 = pos;

	pos.y+= sin(vTime * .4) * .75 ;
  pos2.y+= cos(vTime *.5) * .75;
  // pos.x+= cos(vTime) * .25;
  // pos2.x+= sin(vTime *2.) * .25;


  float sphere = sdSphere(vec3(pos.x -.5, pos.y, pos.z), .05);
  float sphere2 = sdSphere(vec3(pos2.x -.4, pos2.y, pos2.z), .05);

  float box = sdBox(vec3(pos3.x, pos3.y-1.2, pos3.z), vec3(2., .5, .5) );
  float box2 = sdBox(vec3(pos3.x, pos3.y+ .4, pos3.z), vec3(2., .5, .5) );

  float final = opSmoothUnion(sphere, sphere2, 1.);
  // final = opSmoothUnion(final, box, .7);
  final = opSmoothUnion(final, box2, .7);


  return final;
}

vec3 getnormalsmall (vec3 p)
{
		vec2 epsilon = vec2(0.001, 0.);
		return normalize(scene(p) - vec3(scene(p-epsilon.xyy),
										   scene(p-epsilon.yxy),
										   scene(p-epsilon.yyx))
						);
}
vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
  mat2 rotation_matrix=mat2(  vec2(sin(rotation),-cos(rotation)),
                              vec2(cos(rotation),sin(rotation))
                              );
  uv -= pivot;
  uv= uv*rotation_matrix;
  uv += pivot;
  return uv;
}


vec4 raymarch(vec3 rayDir, vec3 pos) {
	// Define the start state
	// reset to 0 steps
	float currentDist = 0.0; // signed distance
	float rayDepth = 0.0;
	vec3 rayLength = vec3(0.0);
	vec3 light = normalize(vec3(1.,sin(vTime),2.));
  vec2 uv = vUv;

  float warpsScale =  3. ;

  vec4 bgColor = vec4(uValueA, 1.);


  vec3 color1 = vec3(uv.y, uv.x, cos(vTime) * .5 + 1.);
  color1.xyz += warpsScale * .1 * cos(3. * color1.yzx + vTime);

  vec3 color2 = vec3(sin(vTime) * .5 + 1., uv.x, uv.y);
  color2.xyz += warpsScale * .1 * sin(3. * color2.yzx + vTime);

	// shooting the ray
 	for (int i=0; i < RAYMARCH_MAX_STEPS; i++) {
     	// steps traveled
		vec3 new_p = pos + rayDir * rayDepth;
		currentDist = scene(new_p);
		rayDepth += currentDist;

		vec3 normals = getnormalsmall(new_p);
		float lighting = max(0.,dot(normals,light));



 		vec4 shapeColor = mix(
			vec4(color1, 1.),
			vec4(color2, 1.),
			lighting
		);


 	    if (currentDist < EPSILON) return shapeColor; // We're inside the scene - magic happens here
 		if (rayDepth > RAYMARCH_MAX_DIST) return bgColor; // We've gone too far
	}

	return bgColor;
}

void main() {
	vec2 uv = (gl_FragCoord.xy - uResolution * .5) / uResolution.yy;
  uv = vUv;
	vec3 camPos = vec3(uv ,10.); // x, y, z axis
	vec3 rayDir = normalize(vec3(0.,0., -1.0)); // DOF

  vec4 final = vec4(raymarch(rayDir, camPos));
  // final.a = .8;
    gl_FragColor = final;
}
