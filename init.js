"use strict";


var stats;
var camera, controls, renderer;
var starSys;

function init() {

   THREE.TOLERANCE = 0.01;

   camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 25000 );
   camera.position.set( 0, 0, 1000 );
   //camera.setLens(20);


   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio( window.devicePixelRatio );
   renderer.setSize( window.innerWidth, window.innerHeight );
   document.body.appendChild( renderer.domElement );


   controls = new THREE.OrbitControls( camera, renderer.domElement );
   //controls.addEventListener( 'change', render );
   controls.enableZoom = true;
   controls.enablePan = true;


   addSceneObjects();


   // performance monitor
   stats = new Stats();
   document.body.appendChild( stats.dom );


   window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize( window.innerWidth, window.innerHeight );

   //render();

}

var days = 73987;

function render() {

   stats.update();

   //renderer.render( sys.scene, camera );
   starSys.renderer.render( renderer, camera, days );
   days += 0.05;

   requestAnimationFrame( render );

}

function addSceneObjects() {

   starSys = new StarS.System("data/Sol.js");

   //sys.load("data/Sol.js");


   //var testGeom = new EllipseCurve( aX, aY, xRadius, yRadius, 0, Math.PI * 2, false, aRotation );

}



init();
render();
