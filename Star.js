"use strict";

var StarS = StarS || {};


StarS.Star = function ( parent, parameters ) {

   this.name = "";

   this.radius = 1;                      // Äquatordurchmesser in km
   this.mass = 1;                      // Info als Text (Zahlen sind zu groß;)
   this.color = new THREE.Color('#ffffff');

   // Render Data

   this.children = [];
   this.parent = parent;

   this.object = undefined;

   this.setValues( parameters );
}

StarS.Star.prototype = {

   setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "StarS.Planet: '" + key + "' parameter is undefined." );
				continue;

			}

			var currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( "StarS." + this.type + ": '" + key + "' is not a property of this class." );
				continue;

			}

			this[ key ] = newValue;

		}

	}

   // initRender: function () {
   //
   //
   // }

}
