"use strict";

var StarS = StarS || {};

StarS.SystemRender = function ( starSystem, scene ) {

   this.system = starSystem;

   this.scene = scene || new THREE.Scene();

   this.factor = 500;
   this.dynamicObjectResize = 100;

   this.orbitSteps = 180;
   this.planetSegments = 32;

   this.starsObject = undefined;
   this.planetsObject = undefined;
   this.orbitsObject = undefined;

}

StarS.SystemRender.prototype = {

   buildRenderObjects: function (  ) {

      // Stern(e)
      this.starsObject = new THREE.Object3D();
      for (var i = 0; i < this.system.starList.length; i++) {
         this.starsObject.add(this.createStar(this.system.starList[i]));
      }
      this.starsObject.renderOrder = 3;
      this.scene.add(this.starsObject);


      // Orbitalbahnen
      var orbitGeometries = [];
      for (var i = 0; i < this.system.planetList.length; i++) {
         orbitGeometries.push(this.createOrbitGeometry(this.system.planetList[i], i));
      }
      var geomOrbits = mergeGeometries(orbitGeometries);

      this.orbitsObject = new THREE.Mesh( geomOrbits, this.getOrbitMaterial( this.system.planetList.length ) );
      this.orbitsObject.frustumCulled = false;
      this.orbitsObject.renderOrder = 1;

      this.scene.add(this.orbitsObject);


      // Planeten
      var planetGeometries = [];
      for (var i = 0; i < this.system.planetList.length; i++) {
         var planetGeom = this.createPlanetGeometry(this.system.planetList[i], i);
         planetGeometries.push(planetGeom);
      }
      var geomPlanets = mergeGeometries(planetGeometries);
      geomPlanets.computeBoundingBox();
      geomPlanets.computeBoundingSphere();

      this.planetsObject = new THREE.Mesh(
         geomPlanets,
         this.getPlanetMaterial( this.system.planetList.length )
      );
      this.planetsObject.frustumCulled = false;
      this.planetsObject.renderOrder = 2;

      this.scene.add(this.planetsObject);

   },

   createOrbitGeometry: function ( planet, planetIndex ) {

      if (!planet) {
         console.error("SystemRender needs planet data to create orbit");
         return;
      }


      // get path for ellipse

      var path = new THREE.CurvePath();
      path.add(planet.createOrbit( this.factor ));
      var pts = path.getPoints( this.orbitSteps );

      // prepare geometry
      var indexLen = pts.length * 2 * 3;

      var geom = new THREE.BufferGeometry();

      var pos = new Float32Array( pts.length * 3 * 2 );
      var prev = new Float32Array( pts.length * 3 * 2 );
      var next = new Float32Array( pts.length * 3 * 2 );
      var uv = new Float32Array( pts.length * 2 * 2 );
      var color = new Float32Array( pts.length * 3 * 2 );
      var oidx = new Float32Array( pts.length * 2 );
      var index = new Uint32Array( indexLen );


      // Matrix for orbit inclination
      var inclinationMatrix = new THREE.Matrix4();
      inclinationMatrix.makeRotationZ( THREE.Math.DEG2RAD * planet.orbitInclination );


      // build the geometry
      var vec = new THREE.Vector3();


      // Position
      for (var i = 0; i < pts.length; i++) {
         var i3 = i * 3 * 2;

         vec.set(pts[i].x, 0 , pts[i].y);
         vec.applyMatrix4(inclinationMatrix);

         pos[i3 + 0] = vec.x;
         pos[i3 + 1] = vec.y;
         pos[i3 + 2] = vec.z;
         pos[i3 + 3] = vec.x;
         pos[i3 + 4] = vec.y;
         pos[i3 + 5] = vec.z;

      }


      // uv
      for (var i = 0; i < pts.length; i++) {
         var i2 = i * 2 * 2;

         uv[i2 + 0] = i / (pts.length - 1);
         uv[i2 + 1] = 1;
         uv[i2 + 2] = i / (pts.length - 1);
         uv[i2 + 3] = -1;

      }


      // prev + next + Farbe
      for (var i = 0; i < pts.length; i++) {
         var iPrev = getPrevOffset(i, pts.length - 1);
         var iNext = getNextOffset(i, pts.length - 1);
         var i3 = i * 3 * 2;

         prev[i3 + 0] = pos[iPrev + 0];
         prev[i3 + 1] = pos[iPrev + 1];
         prev[i3 + 2] = pos[iPrev + 2];
         prev[i3 + 3] = pos[iPrev + 3];
         prev[i3 + 4] = pos[iPrev + 4];
         prev[i3 + 5] = pos[iPrev + 5];

         next[i3 + 0] = pos[iNext + 0];
         next[i3 + 1] = pos[iNext + 1];
         next[i3 + 2] = pos[iNext + 2];
         next[i3 + 3] = pos[iNext + 3];
         next[i3 + 4] = pos[iNext + 4];
         next[i3 + 5] = pos[iNext + 5];

         color[i3 + 0] = planet.orbitColor.r;
         color[i3 + 1] = planet.orbitColor.g;
         color[i3 + 2] = planet.orbitColor.b;
         color[i3 + 3] = planet.orbitColor.r;
         color[i3 + 4] = planet.orbitColor.g;
         color[i3 + 5] = planet.orbitColor.b;
      }


      // Index
      for (var i = 0; i < pts.length - 1; i++) {
         var i2 = i * 2;
         var i6 = i * 6;

         index[i6 + 0] = i2;
         index[i6 + 1] = i2 + 1;
         index[i6 + 2] = i2 + 2;
         index[i6 + 3] = i2 + 2;
         index[i6 + 4] = i2 + 1;
         index[i6 + 5] = i2 + 3;

         oidx[i2 + 0] = planetIndex;
         oidx[i2 + 1] = planetIndex;
      }


      geom.addAttribute("position", new THREE.BufferAttribute(pos, 3));
      geom.addAttribute("previous", new THREE.BufferAttribute(prev, 3));
      geom.addAttribute("next", new THREE.BufferAttribute(next, 3));
      geom.addAttribute("color", new THREE.BufferAttribute(color, 3));
      geom.addAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geom.addAttribute("orbitIndex", new THREE.BufferAttribute(oidx, 1));
      geom.setIndex(new THREE.BufferAttribute(index, 1));

      return geom;


      //*******************************************************************/

      function getNextOffset(idx, lastIdx) {
         var result = idx;

         result++;

         if (result > lastIdx) {
            result -= lastIdx;
         }

         result *= (3 * 2);

         return result;
      }

      function getPrevOffset(idx, lastIdx) {
         var result = idx;

         result--;

         if (result < 0) {
            result += lastIdx;
         }

         result *= (3 * 2);

         return result;
      }

   },

   createStar: function ( star ) {
      var factor = this.factor;

      var radius = (star.radius * factor) / StarS.AU;
      var segments = this.planetSegments;

      //var geom = new THREE.SphereBufferGeometry( radius, segments, segments );//, phiStart, phiLength, thetaStart, thetaLength );

      var width = 2 * Math.sqrt(2 * (radius * radius));
      var height = width;

      var geom = this.createStarGeometry( star, 0 );

      var mat = this.getStarMaterial();

      var starObject = new THREE.Object3D();
      var stars = new THREE.Points( geom, mat );
      starObject.add(stars);
      starObject.add(new THREE.PointLight());

      return starObject;
   },

   createPlanetGeometry: function ( planet, planetIndex ) {
      var radius = (planet.radius * this.factor) / StarS.AU;
      var segments = this.planetSegments;

      var geom = new THREE.SphereBufferGeometry( radius, segments, segments );//, phiStart, phiLength, thetaStart, thetaLength );

      var position = geom.attributes.position.array;
      var pidx = new Float32Array(geom.attributes.position.count);
      var color = new Float32Array(position.length);

      for (var i = 0; i < geom.attributes.position.count; i++) {
         var i3 = i * 3;

         pidx[i] = planetIndex;

         color[i3 + 0] = planet.planetColor.r;
         color[i3 + 1] = planet.planetColor.g;
         color[i3 + 2] = planet.planetColor.b;
      }
      geom.addAttribute("planetIndex", new THREE.BufferAttribute(pidx, 1));
      geom.addAttribute("color", new THREE.BufferAttribute(color, 3));


      return geom;

   },

   createStarGeometry: function ( star, starIndex ) {

      var radius = (star.radius * this.factor) / StarS.AU;
      var width = 2 * Math.sqrt(2 * (radius * radius));
      var height = width;

      var geom = new THREE.BufferGeometry();
      var pos = new Float32Array( 3 );
      var color = new Float32Array( 3 );
      var size = new Float32Array( 1 );

      pos[0] = 0;
      pos[1] = 0;
      pos[2] = 0;

      size[0] = width;

      color[0] = 0.8;
      color[1] = 0.8;
      color[2] = 0;

      geom.addAttribute("position", new THREE.BufferAttribute(pos, 3));
      geom.addAttribute("color", new THREE.BufferAttribute(color, 3));
      geom.addAttribute("starSize", new THREE.BufferAttribute(size, 1));

      return geom;
   },

   getOrbitMaterial: function ( noOfPlanets ) {

      var vs = [
         'precision highp float;',
         '',
         'attribute vec3 position;',
         'attribute vec3 previous;',
         'attribute vec3 next;',
         'attribute vec2 uv;',
         'attribute vec3 color;',
         'attribute float orbitIndex;',
         '',
         'uniform mat4 projectionMatrix;',
         'uniform mat4 modelViewMatrix;',
         'uniform vec2 resolution;',
         'uniform float opacity;',
         'uniform float width;',
         "uniform float orbitRevolution[8];",
         '',
         'varying vec2 vUV;',
         'varying vec4 vColor;',
         'varying float vCounters;',
         '',
         'vec2 fix( vec4 i, float aspect ) {',
         '  vec2 res = i.xy / i.w;',
         '  res.x *= aspect;',
         '  return res;',
         '}',
         '',
         'void main() {',
         '',
         '  float aspect = resolution.x / resolution.y;',
         '  float pixelWidthRatio = 1. / (resolution.x * projectionMatrix[0][0]);',
         '',
         '  vColor = vec4( color, opacity );',
         '  vUV = clamp(uv, 0.0, 1.0);',

         '  float oI = orbitIndex;',
         '  float selection = 0.0;',
         '  float orbitPos = 0.0;',

         '  for (int i = 0; i < 8; i++) {',
         '     float iFloat = float(i);',
         '     selection = -abs(iFloat - orbitIndex);',
         '     selection = step(-0.5, selection);',
         '     orbitPos += selection * orbitRevolution[i];',
         '  }',
         '  vCounters = -orbitPos + uv.x;',

         '',
         '  mat4 m = projectionMatrix * modelViewMatrix;',
         '  vec4 finalPosition = m * vec4( position, 1.0 );',
         '  vec4 prevPos = m * vec4( previous, 1.0 );',
         '  vec4 nextPos = m * vec4( next, 1.0 );',
         '',
         '  vec2 currentP = fix( finalPosition, aspect );',
         '  vec2 prevP = fix( prevPos, aspect );',
         '  vec2 nextP = fix( nextPos, aspect );',
         '',
         '  float pixelWidth = finalPosition.w * pixelWidthRatio;',
         '  float w = 1.8 * pixelWidth * width;',
         '',
         '  vec2 dir;',
         '  if( nextP == currentP ) dir = normalize( currentP - prevP );',
         '  else if( prevP == currentP ) dir = normalize( nextP - currentP );',
         '  else {',
         '     vec2 dir1 = normalize( currentP - prevP );',
         '     vec2 dir2 = normalize( nextP - currentP );',
         '     dir = normalize( dir1 + dir2 );',
         '',
         '     vec2 perp = vec2( -dir1.y, dir1.x );',
         '     vec2 miter = vec2( -dir.y, dir.x );',
         '     //w = clamp( w / dot( miter, perp ), 0., 4. * width );',
         '',
         '  }',
         '',
         '  //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
         '  vec2 normal = vec2( -dir.y, dir.x );',
         '  normal.x /= aspect;',
         '  normal *= .5 * w;',
         '',
         '  vec4 offset = vec4( normal * uv.y, 0.0, 1.0 );',
         '  finalPosition.xy += offset.xy;',
         '',
         '  gl_Position = finalPosition;',
         '}'
      ].join( '\n' );

      var fs = [
         '#extension GL_OES_standard_derivatives : enable',
         'precision mediump float;',
         '',
         //'uniform float alphaTest;',
         //'',
         'varying vec2 vUV;',
         'varying vec4 vColor;',
         'varying float vCounters;',
         '',
         'void main() {',
         '',
         '  vec4 c = vColor;',
         '  gl_FragColor = c;',
         '  gl_FragColor *= clamp(fract(vCounters), 0.0, 0.9999);',
         '  gl_FragColor *= 1.0 - abs(vUV.y * 2.0 - 1.0);',
         //'  if( gl_FragColor.a < alphaTest ) discard;',
         '}'
      ].join( '\n' );

      var resolution = new THREE.Vector2(1745, 885);

      var uniforms = {
         width: { type: 'f', value: 8.0 },
         opacity: { type: 'f', value: 1.0 },
         resolution: { type: 'v2', value: resolution },
         visibility: { type: 'f', value: 1.0},
         orbitRevolution: { type:"fv1", value: new Array( noOfPlanets ) },
         //alphaTest: { type: 'f', value: 0.1},
      };

      var result = new THREE.RawShaderMaterial({
         uniforms: uniforms,
         vertexShader: vs,
         fragmentShader: fs,
         //transparent: true,
         name: "OrbitShader",
         //depthTest: false,
         vertexColors: THREE.VertexColors
      });

      return result;
   },

   getPlanetMaterial: function ( noOfPlanets ) {

      var uniforms = Object.assign(
         {
            opacity:{ type:"f", value: 1 },
            diffuse:{ type:"c", value: new THREE.Color( 0xffffff ) },
            planetPositions:{ type:"fv", value: new Array( noOfPlanets * 3) },
            resizeFactor: { type: 'f', value: this.dynamicObjectResize }
         },
         THREE.UniformsLib["lights"]
      );

      var result = new THREE.RawShaderMaterial({
         uniforms: uniforms,
         vertexShader: getPlanetShader_vs(),
         fragmentShader: getPlanetShader_fs(),
         //transparent: true,
         lights: true,
         name: "PlanetShader",
         vertexColors: THREE.VertexColors
      });

      return result;

   },

   getStarMaterial: function () {

      var vs = [

         'precision highp float;',
         'precision highp int;',
         '',
         '#define SHADER_NAME StarMaterial',
         '#define GAMMA_FACTOR 2',
         'uniform mat4 modelMatrix;',
         'uniform mat4 modelViewMatrix;',
         'uniform mat4 projectionMatrix;',
         'uniform mat4 viewMatrix;',
         'uniform mat3 normalMatrix;',
         'uniform vec3 cameraPosition;',
         'uniform float scale;',
         'uniform float size;',
         'uniform float resizeFactor;',
         '',
         'attribute vec3 position;',
         //attribute vec2 uv;
         'attribute vec3 color;',
         'attribute float starSize;',
         ' ',
         'varying vec3 vColor;',
         '',
         '#ifdef USE_LOGDEPTHBUF',
         '	#ifdef USE_LOGDEPTHBUF_EXT',
         '		varying float vFragDepth;',
         '	#endif',
         '	uniform float logDepthBufFC;',
         '#endif',
         ' ',
         'void main() {',
         '  vec3 transformed = vec3( position );',
         '  vColor = color;',
         '  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );',
         '  gl_Position = projectionMatrix * mvPosition;',
         '',
         '  gl_PointSize = starSize * size * ( scale / -mvPosition.z );',
         '  #ifdef USE_LOGDEPTHBUF',
         '	gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;',
         '     #ifdef USE_LOGDEPTHBUF_EXT',
         '        vFragDepth = 1.0 + gl_Position.w;',
         '     #else',
         '        gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;',
         '     #endif',
         '  #endif',
         '',
      	'  vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );',
         '}'

      ].join( '\n' );

      var fs = [

         'precision highp float;',
         'precision highp int;',
         '',
         '#define SHADER_NAME StarMaterial',
         '#define ALPHATEST 0.1',
         '#define GAMMA_FACTOR 2',
         '#define TONE_MAPPING',
         '#define saturate(a) clamp( a, 0.0, 1.0 )',
         '',
         'uniform mat4 viewMatrix;',
         'uniform vec3 cameraPosition;',
         'uniform vec3 diffuse;',
         'uniform float opacity;',
         'uniform float toneMappingExposure;',
         '',
         'varying vec3 vColor;',
         '',
         '#ifdef USE_COLOR',
         '	varying vec3 vColor;',
         '#endif',
         '',
         '#ifdef USE_LOGDEPTHBUF',
         '	uniform float logDepthBufFC;',
         '	#ifdef USE_LOGDEPTHBUF_EXT',
         '		varying float vFragDepth;',
         '	#endif',
         '#endif',
         '',
         'vec3 LinearToneMapping( vec3 color ) {',
         '	return toneMappingExposure * color;',
         '}',
         'vec4 LinearToLinear( in vec4 value ) {',
         '   return value;',
         '}',
         'vec3 toneMapping( vec3 color ) { return LinearToneMapping( color ); }',
         'vec4 linearToOutputTexel( vec4 value ) { return LinearToLinear( value ); }',
         '',

         'float smoothCircle(vec2 centerOffset, vec2 pos, float size, float falloff) {',
         '',
         '  float result = 0.0;',
         '  vec2 coord = centerOffset - pos;',
         '',
         '  result = 2.0 - (coord.x * coord.x + coord.y * coord.y);',
         '  result *= size;',
         '  result = pow(result, abs(falloff));',
         '',
         '  return result;',
         '}',
         '',
         'vec4 calcSun(vec2 st, vec3 color, float brightness) {',
         '',
         '  vec2 stCenter = st * 2.0 - 1.0;',
         '  vec2 invCenter = 1.0 - abs(stCenter);',
         '  vec3 invColor = 1.0 - color;',
         '',
         '  float falloff = 55.0;',
         '',
         '  float solidSun = step(dot(stCenter, stCenter), 0.5);',
         '  float innerSun = smoothCircle(vec2(0.5, 0.5), st, 0.5, falloff);',
         '  float outerSun = smoothCircle(vec2(0.5, 0.5), st, 0.5, falloff * 0.75);',
         '',
         '  //vec3 solidCol = color * solidSun * brightness * 0.05;',
         '  vec3 innerCol = invColor * innerSun;// * brightness;',
         '  vec3 outerCol = color * outerSun;// * brightness;',
         '',
         '  vec3 col = (innerCol * 0.75 + outerCol * 1.25) * brightness;// * (1.0 / brightness);// + solidCol) * 0.5; ',
         '',
         '  vec4 result = vec4(col, innerSun);',
         '',
         '  return result;',
         '}',
         '',
         'void main() {',
         '  #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)',
         '  	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;',
         '  #endif',
         '',
         '  vec4 diffuseColor = calcSun(gl_PointCoord, vColor, 7.0);',
         '',
         '//  #ifdef ALPHATEST',
         '//  	if ( diffuseColor.a < ALPHATEST ) discard;',
         '//  #endif',
         '',
         '  gl_FragColor = diffuseColor;',
         //'  gl_FragColor.rgb *= vColor;',
         '',
         '  #if defined( TONE_MAPPING )',
         '    gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );',
         '  #endif',
         '',
         '  gl_FragColor = linearToOutputTexel( gl_FragColor );',
         '}'

      ].join( '\n' );

      var uniforms = {
         opacity: { type: 'f', value: 1.0 },
         size: { type: 'f', value: 2.0 },
         scale: { type: 'f', value: 1.0 },
         diffuse: { type: 'v3', value: new THREE.Vector3(1.0, 1.0, 0.0) },
         toneMappingExposure: { type: 'f', value: 1.0 },
         resizeFactor: { type: 'f', value: this.dynamicObjectResize }
      };

      var result = new THREE.RawShaderMaterial({
         uniforms: uniforms,
         vertexShader: vs,
         fragmentShader: fs,
         transparent: true,
         blending: THREE.CustomBlending,
         blendSrc: THREE.OneFactor,
         blendDst: THREE.OneMinusSrcColorFactor,
         blendEquation: THREE.AddEquation,
         name: "StarShader"
      });

      return result;

   },

   renderUpdateStars: function (renderer, camera) {

      if (!this.starsObject) {
         return;
      }

      var stars = this.starsObject.children;
      for (var i = 0; i < stars.length; i++) {
         var starChilds = stars[i].children;
         for (var j = 0; j < starChilds.length; j++) {

            if (starChilds[j].isLight) {
               continue;
            }

            if (starChilds[j].material && starChilds[j].material.uniforms) {
               // size is bigger for sun flares / bloom
               starChilds[j].material.uniforms.size.value = 1.5;//renderer.pixelRatio;
               starChilds[j].material.uniforms.scale.value = renderer.domElement.height * 0.5;
               starChilds[j].material.uniforms.resizeFactor.value = this.dynamicObjectResize;

               starChilds[j].material.needsUpdate = true;
            }

         }

      }

   },

   renderUpdatePlanets: function (renderer, camera, timeInDays) {
      for (var i = 0; i < this.system.planetList.length; i++) {
         var pos = this.system.planetList[i].getPosition(timeInDays);
         var offset = i * 3;
         this.planetsObject.material.uniforms.planetPositions.value[offset + 0] = pos.x;
         this.planetsObject.material.uniforms.planetPositions.value[offset + 1] = pos.y;
         this.planetsObject.material.uniforms.planetPositions.value[offset + 2] = pos.z;
         this.planetsObject.material.uniforms.resizeFactor.value = this.dynamicObjectResize;
         this.planetsObject.material.needsUpdate = true;

         this.orbitsObject.material.uniforms.orbitRevolution.value[i] = ( (timeInDays - 0.5)  / this.system.planetList[i].siderealOrbitTime );
         var size = renderer.getSize();
         this.orbitsObject.material.uniforms.resolution.value.set(size.width, size.height);
         this.orbitsObject.material.needsUpdate = true;

      }
   },

   render: function (renderer, camera, timeInDays) {

      renderer.sortObjects = false;

      this.renderUpdatePlanets(renderer, camera, timeInDays);
      this.renderUpdateStars(renderer, camera);

      renderer.render( this.scene, camera );
   }

}

function mergeGeometries( listOfGeometries ) {

   var LIMIT_16 = 65536;

	var hasIndex = false;

	var info = {};
	var attributesSize = 0;
	var attributeSizes = [];

	if ( listOfGeometries.length == 0 ) {
		console.error( new Error( "geometry list is empty" ) );
		return undefined;
	}

	if ( listOfGeometries.length == 1 ) {
		return listOfGeometries[0];
	}

	// collect attributes info

	for ( var i = 0; i < listOfGeometries.length; i++ ) {
		var geometry = listOfGeometries[i];

		if ( !geometry ) {
			console.warn( "listOfGeometries inkonsistent/fehlerhaft" );

			// maybe this will fix the strange undefined error
			listOfGeometries.splice( i, 1 );
			i--;

			continue;
		}

		var indexInfo;

		if ( geometry.index ) {
			hasIndex = true;

			var attr = geometry.index;

			if ( !info["index"] ) {
				info["index"] = {
					offset: 0,
					size: 0,
					name: "index",
					itemSize: 1,
					type: "uint",
					targetBufferOffset: 0,
					valueOffset: 0
				};
			}

			info["index"].size += attr.array.length;
		}

		for ( var key in geometry.attributes ) {
			if ( key === "index" )
				continue;

			var attr = geometry.attributes[key];

			if ( !info[key] ) {
				info[key] = {
					name: key,
					type: getArrayTypeof( attr.array ),
					itemSize: attr.itemSize,
					offset: 0
				};
			}
		}

		attributeSizes[i] = geometry.attributes.position.array.length / 3;
		attributesSize += attributeSizes[i];
	}

	// create new geometry

	var mergedGeometry = new THREE.BufferGeometry();

	// create new buffers

	for ( var key in info ) {
		var _info = info[key];

		// _info.size only set on index attribute
		// thats why size will be overwritten in next if statement

		var size = key == "index" ? _info.size : attributesSize * _info.itemSize;

		switch ( _info.type ) {
			case "float":
				_info.buffer = new Float32Array( size );
				break;

			case "int":
				if ( size < LIMIT_16 ) {
					_info.buffer = new Int16Array( size );
				} else {
					_info.buffer = new Int32Array( size );
				}
				break;

			case "uint":
				if ( size < LIMIT_16 ) {
					_info.buffer = new Uint16Array( size );
				} else {
					_info.buffer = new Uint32Array( size );
				}
				break;
		}

		// check if buffer size is not corrupt
		if ( _info.buffer % _info.itemSize > 0 ) {
			console.warn( "mergeGeometries() : Size of array is broken." );
		}

		var newAttribute = new THREE.BufferAttribute( _info.buffer, _info.itemSize );

		if ( key === "index" ) {
			mergedGeometry.setIndex( newAttribute );
		} else {
			mergedGeometry.addAttribute( key, newAttribute );
		}
	}

	// copy attributes

	var attributesOffset = 0;

	for ( var i = 0; i < listOfGeometries.length; i++ ) {

		var geometry = listOfGeometries[i];

		for ( var key in info ) {
			var _info = info[key];
			var buffer = _info.buffer;

			// get source array

			if ( key === "index" ) {

				if ( !geometry ) {
					console.error( new Error( "geometry is not defined #strange" ) );
				}

				if ( geometry.index ) {

					var source = geometry.index.array;

					for ( var j = 0; j < source.length; j++ ) {
						// without itemSize 'cause index attribute always has itemSize 1
						buffer[_info.targetBufferOffset + j] = _info.valueOffset + source[j];
					}

					_info.targetBufferOffset += source.length;

				}

				// add position attribute size for value offset (position should be available always)
				_info.valueOffset += attributeSizes[i];

			} else if ( geometry.attributes[key] ) {

				var source = geometry.attributes[key].array;

				if ( buffer.length < attributesOffset * _info.itemSize + source.length ) {
					console.error( new Error( "probably invalid buffer size" ) );
					debugger;
				}

				if ( buffer ) {
					buffer.set( source, attributesOffset * _info.itemSize )
				}

			}
		}

		for ( var groupIndex = 0; groupIndex < geometry.groups.length; groupIndex++ ) {
			var group = geometry.groups[groupIndex];
			mergedGeometry.addGroup( attributesOffset + group.start, group.count, group.materialIndex );
		}

		attributesOffset += attributeSizes[i];

	}

	// create new index buffer if geometries didnt have one

	if ( !hasIndex ) {
		// create attribute and add to geometry
		mergedGeometry.setIndex( new THREE.BufferAttribute( createIndexBuffer( attributesSize ), 1 ) );
	}

	if ( mergedGeometry.groups.length > 0 ) {

		var groups = mergedGeometry.groups;

		var materials = [];

		// gather materials informations

		for ( var i = 0; i < groups.length; i++ ) {

			var group = groups[i];

			var materialIndex = group.materialIndex;

			if ( !materials[materialIndex] ) {

				materials[materialIndex] = {
					groups: [],
					size: 0
				};

			}

			materials[materialIndex].groups.push( group );
			materials[materialIndex].size += group.count;

		}

		// create cleaned index array

		mergedGeometry.clearGroups();

		var dirtyIndex = mergedGeometry.index.array;
		var cleanedIndex = new Uint32Array( dirtyIndex.length );
		var start = 0;
		var cleanedOffset = 0;

		for ( var i = 0; i < materials.length; i++ ) {

			var material = materials[i];

			mergedGeometry.addGroup( start, material.size, i );

			for ( var j = 0; j < material.groups.length; j++ ) {

				var group = material.groups[j];

				for ( var k = 0; k < group.count; k++ ) {

					cleanedIndex[cleanedOffset] = dirtyIndex[group.start + k];
					cleanedOffset++;

				}

			}

			start += material.size;

		}

		mergedGeometry.index.array = cleanedIndex;

	}

	// finish

	return mergedGeometry;

	// anonymous functions

	function createIndexBuffer( size ) {
		var array = new Uint32Array( size );
		for ( var i = 0; i < size; i++ ) {
			array[i] = i;
		}
		return array;
	}

	function getArrayTypeof( arr ) {
		if ( arr instanceof Float32Array || arr instanceof Float64Array ) {
			return "float";
		}

		if ( arr instanceof Int8Array || arr instanceof Int16Array || arr instanceof Int32Array ) {
			return "int";
		}

		if ( arr instanceof Uint8Array || arr instanceof Uint16Array || arr instanceof Uint32Array ) {
			return "uint";
		}

		if ( arr instanceof Array ) {
			return "array";
		}

		return undefined;
	}
}
