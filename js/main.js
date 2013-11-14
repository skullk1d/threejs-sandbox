var clock = new THREE.Clock();

var angularSpeed = 0.2; 
var lastTime = 0;

var controls = {

  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false

};

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

var keyboard = new THREEx.KeyboardState();

//----- PLAYER -----//
var player = new player();

// key events
player.controls = controls;

// create a new mesh with geometry or import a model, find skin, assign to player
//player.setMaterial('assets/images/crate.jpg');
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
  light.position.set( 200, 450, 500, 1000 );
  light.castShadow = true;
  scene.add(light);

  //----- GROUND -----//
  var gt = THREE.ImageUtils.loadTexture( "assets/images/block_grass_128.jpg" );
  var gg = new THREE.PlaneGeometry( 16384, 16384 );
  var gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );

  var ground = new THREE.Mesh( gg, gm );
  ground.rotation.x = - Math.PI / 2;
  ground.material.map.repeat.set( 64, 64 );
  ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
  ground.receiveShadow = true;

  scene.add( ground );

  //----- CAMERA -----//
  cameraControls.addEventListener( 'change', function() {
    renderer.render(scene, camera);
  } );
}
