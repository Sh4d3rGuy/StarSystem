"use strict";

/*
- Apoapsis
- Periapsis
- Zentrum?
- Exzentrizität
- Umlaufzeit
- Rotationsgeschwindigkeit
- Durchmesser
- Achsneigung
- Bahnneigung
- Masse
*/
var StarS = StarS || {};


StarS.Planet = function ( parent, parameters ) {

   this.name = "";

   // Physical data
   this.apoapsis = 10;                 // AE
   this.periapsis = 10;                // AE
   this.eccentricity = 0;              // °
   this.siderealOrbitTime = 10;        // Siderische Umlaufzeit
   this.orbitInclination = 0;          // Neigung der Bahnebene in °

   this.siderealRotationTime = 1;      // Siderischer Tag
   this.axisInclination = 0;           // Neigung der Rotationsachse in °

   this.radius = 1;                    // Äquatorradius in km
   this.mass = 1;                      // Info als Text (Zahlen sind zu groß;)


   // Render Data

   this.children = [];
   this.parent = parent;

   this.curve = undefined;
   this.orbitColor = undefined;
   this.planetColor = undefined;

   this.object = undefined;



   this.orbitInclinationMatrix = undefined;

   this.rotationAxis = undefined;
   this.rotationMatrix = new THREE.Matrix4();

   this.transformMatrix = undefined;

   this.setValues( parameters );
}

StarS.Planet.prototype = {

   setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "StarS.Planet: '" + key + "' parameter is undefined." );
				continue;

			}

			var currentValue = this[ key ];

			if ( typeof (currentValue) === undefined ) {

				console.warn( "StarS." + this.type + ": '" + key + "' is not a property of this class." );
				continue;

			}

			this[ key ] = newValue;

		}

      if (!this.planetColor) {
         this.planetColor = new THREE.Color( 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5 );
      } else {
         // Make sure color is of type Color
         this.planetColor = new THREE.Color( this.planetColor );
      }

      if (!this.orbitColor) {
         this.orbitColor = new THREE.Color( 0.5 + (1.0 - this.planetColor.r), 0.5 + (1.0 - this.planetColor.g), 0.5 + (1.0 - this.planetColor.b) );
      } else {
         this.orbitColor = new THREE.Color( this.orbitColor );
      }

	},

   createOrbit: function ( factor ) {

      // Orbitalbahn konstruieren

      var grosseHalbachse = (this.apoapsis + this.periapsis) * 0.5;

      var e = this.eccentricity * grosseHalbachse;
      //var factor = this.parent.renderer.factor;

      var b = grosseHalbachse * Math.sqrt( 1 - (this.eccentricity * this.eccentricity) );

      this.curve = new THREE.EllipseCurve( 0 + (factor * e), 0, grosseHalbachse * factor, b * factor, 0, Math.PI * 2, true);

      return this.curve;

   },

   getPosition: function ( timeInDays ) {

      var result = new THREE.Vector3();

      var curvePoint = timeInDays / this.siderealOrbitTime;

      var pos = this.curve.getPoint(curvePoint);

      result.set(pos.x, 0, pos.y);

      var mat = this.getOrbitInclinationMatrix();
      result.applyMatrix4(mat);

      return result;

   },

   getOrbitInclinationMatrix: function () {
      if (!this.orbitInclinationMatrix) {
         this.orbitInclinationMatrix = new THREE.Matrix4();
         this.orbitInclinationMatrix.makeRotationZ( THREE.Math.DEG2RAD * this.orbitInclination );
      }
      return this.orbitInclinationMatrix;
   },

   getRotationMatrix: function ( timeInDays ) {
      if (!this.rotationAxis) {

         this.rotationAxis = new THREE.Vector3( 0, 1, 0 );
         var axisRot = new THREE.Matrix4();
         axisRot.makeRotationZ( THREE.Math.degToRad( this.axisInclination ));
         this.rotationAxis.applyMatrix4(axisRot);

      }

      this.rotationMatrix.makeRotationAxis(this.rotationAxis, (timeInDays / this.siderealRotationTime) * Math.PI * 2 );
      return this.rotationMatrix;
   },

   getTransformationMatrix: function () {
      var movMat = this.getOrbitInclinationMatrix();
      var rotMat = this.getRotationMatrix();

      if (!this.transformMatrix) {
         this.transformMatrix = new THREE.Matrix4();
         this.transformMatrix.multiplyMatrices(movMat, rotMat);

      }
      return this.transformMatrix;

   }


}
