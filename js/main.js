//----- WORLD -----//

var clock = new THREE.Clock();

var angularSpeed = 0.2; 
var lastTime = 0;

// set the scene size
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 1,
    FAR = 10000;

// get the DOM element to attach to
var $container = $('#container');

// create a WebGL renderer, camera and a scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
var cameraControls = new THREE.OrbitControls( camera );
var scene = new THREE.Scene();

// minecraft blocks
var terrainMesh, worldWidth = 128, worldDepth = 128,
      worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2,
      data = generateHeight( worldWidth, worldDepth );

//----- PLAYER -----//

var player = new player();
var controls = {

  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false

};
player.controls = controls;

var keyboard = new THREEx.KeyboardState();

// create a new mesh with geometry or import a model, find skin, assign to player
var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 16, 16), player.material);
var loader = new THREE.ColladaLoader();
loader.load('assets/models/steve_big.dae', function (result) {
  
  var dae = result.scene;
  dae.rotation.x = 270*(Math.PI/180);
  //dae.scale.set(5,5,5); //scaling makes model disappear? workaround: scale original model before export

  player.setMesh(dae);
  player.obj.position.y = 7;
  scene.add(player.obj);

  // setup 3rd person view
  camera.position.set( 0, 150, 300 );

  player.obj.add(camera);
  camera.lookAt(player.obj.position);
  
  // start animation!
  init();
  animate();
});

//----- ANIMATION LOOP -----//

// executed on each animation frame
function animate(){
  
  // update
  var time = (new Date()).getTime();
  var timeDiff = time - lastTime;
  var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
  // player.obj.rotation.y += angleChange;
  lastTime = time;

  if( keyboard.pressed("w") ) {
    controls.moveForward = true;
  } else { controls.moveForward = false; }
  if( keyboard.pressed("s") ) {
    controls.moveBackward = true;
  } else { controls.moveBackward = false; }
   if( keyboard.pressed("a") ) {
    controls.moveLeft = true;
  } else { controls.moveLeft = false; }
  if( keyboard.pressed("d") ) {
    controls.moveRight = true;
  } else { controls.moveRight = false; }
  
  player.updateMovement(clock.getDelta());

  // render
  renderer.render(scene, camera);

  // request new frame
  requestAnimationFrame(function(){
      animate();
  });
}

//----- INITIALIZATION -----//

function init() {

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $container.append(renderer.domElement);

  //----- LIGHT -----//
  scene.add( new THREE.AmbientLight( 0x222222 ) );

  var light = new THREE.DirectionalLight( 0xffffff, 2.25 );
  light.position.set( 1, 1, 0.5 ).normalize();
  light.castShadow = true;
  scene.add(light);

  //----- GROUND -----//
  createTerrain();
  /*
  var gt = THREE.ImageUtils.loadTexture( "assets/images/block_grass_128.jpg" );
  var gg = new THREE.PlaneGeometry( 16384, 16384 );
  var gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );

  var ground = new THREE.Mesh( gg, gm );
  ground.rotation.x = - Math.PI / 2;
  ground.material.map.repeat.set( 64, 64 );
  ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
  ground.receiveShadow = true;

  scene.add( ground );
  */

  //----- CAMERA -----//
  cameraControls.addEventListener( 'change', function() {
    renderer.render(scene, camera);
  } );
}

//----- METHODS -----//

function createTerrain() {

  // code from threejs.org webgl geometry minecraft example
  var matrix = new THREE.Matrix4();

  var pxGeometry = new THREE.PlaneGeometry( 100, 100 );
  pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  pxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );
  pxGeometry.applyMatrix( matrix.makeTranslation( 50, 0, 0 ) );

  var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
  nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  nxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  nxGeometry.applyMatrix( matrix.makeRotationY( - Math.PI / 2 ) );
  nxGeometry.applyMatrix( matrix.makeTranslation( - 50, 0, 0 ) );

  var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
  pyGeometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
  pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
  pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
  pyGeometry.applyMatrix( matrix.makeRotationX( - Math.PI / 2 ) );
  pyGeometry.applyMatrix( matrix.makeTranslation( 0, 50, 0 ) );

  var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
  pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  pzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  pzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, 50 ) );

  var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
  nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  nzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  nzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );
  nzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, -50 ) );

  //

  var geometry = new THREE.Geometry();
  var dummy = new THREE.Mesh();

  for ( var z = 0; z < worldDepth; z ++ ) {

    for ( var x = 0; x < worldWidth; x ++ ) {

      var h = getY( x, z );

      dummy.position.x = x * 100 - worldHalfWidth * 100;
      dummy.position.y = h * 100;
      dummy.position.z = z * 100 - worldHalfDepth * 100;

      var px = getY( x + 1, z );
      var nx = getY( x - 1, z );
      var pz = getY( x, z + 1 );
      var nz = getY( x, z - 1 );

      dummy.geometry = pyGeometry;
      THREE.GeometryUtils.merge( geometry, dummy );

      if ( ( px != h && px != h + 1 ) || x == 0 ) {

        dummy.geometry = pxGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( nx != h && nx != h + 1 ) || x == worldWidth - 1 ) {

        dummy.geometry = nxGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( pz != h && pz != h + 1 ) || z == worldDepth - 1 ) {

        dummy.geometry = pzGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( nz != h && nz != h + 1 ) || z == 0 ) {

        dummy.geometry = nzGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

    }

  }

  var texture = THREE.ImageUtils.loadTexture( 'assets/images/atlas.png' );
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  var terrainMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb } ) );
  scene.add( terrainMesh );
}

//following utils from threejs.org examples
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  cameraControls.handleResize();

}

function generateHeight( width, height ) {

  var data = [], perlin = new ImprovedNoise(),
  size = width * height, quality = 2, z = Math.random() * 100;

  for ( var j = 0; j < 4; j ++ ) {

    if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;

    for ( var i = 0; i < size; i ++ ) {

      var x = i % width, y = ( i / width ) | 0;
      data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;


    }

    quality *= 4

  }

  return data;

}

function getY( x, z ) {

  return ( data[ x + z * worldWidth ] * 0.2 ) | 0;

}
