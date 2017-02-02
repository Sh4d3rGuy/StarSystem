"use strict";

var StarS = StarS || {};

StarS.System = function ( src, scene ) {

   // Sonne
   this.starList = [];

   // Planeten
   this.planetList = [];

   // 3D render data
   this.renderer = new StarS.SystemRender( this, scene );

   if (src) {
      this.load( src );
   }

}

StarS.System.prototype = {

   addPlanet: function ( planet ) {
      this.planetList.push( planet );
   },

   load: function ( src ) {

      //Source: http://stackoverflow.com/questions/950087/how-to-include-a-javascript-file-in-another-javascript-file

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;

      var that = this;

      //Adding Events
      script.onload = function (evt) {
         var data = getSystemData();

         if (data.stars) {
            for (var i = 0; i < data.stars.length; i++) {
               that.starList.push( new StarS.Star(that, data.stars[i]) );
            }
         }

         if (data.planets) {
            for (var i = 0; i < data.planets.length; i++) {
               var planet = new StarS.Planet(that, data.planets[i]);
               planet.createOrbit();
               that.planetList.push( planet );
            }
         }

         document.body.removeChild(script);

         that.renderer.buildRenderObjects();

      }

      script.onerror = function (evt) {
         console.error("Could not load " + src);
         console.error(evt);

         document.body.removeChild(script);

         return;
      }

      // Start loading
      document.body.appendChild(script);

   }

}
