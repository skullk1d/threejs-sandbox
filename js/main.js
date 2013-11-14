// ANIMATION LOOP, executed on each animation frame
var angularSpeed = 0.2; 
var lastTime = 0;

function animate(){
  // update
  var time = (new Date()).getTime();
  var timeDiff = time - lastTime;
  var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
  sphere.rotation.y += angleChange;
  lastTime = time;

  // render
  renderer.render(scene, camera);

  // request new frame
  requestAnimationFrame(function(){
      animate();
  });
}

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
var scene = new THREE.Scene();

// the camera starts at 0,0,0 so pull it back
camera.position.z = 300;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
$container.append(renderer.domElement);

// default material
var sphereMaterial = new THREE.MeshLambertMaterial(
{
    color: 0xCC0000
});

// celulo material
var celMaterial = new THREE.MeshLambertMaterial({
  map: THREE.ImageUtils.loadTexture('assets/images/crate.jpg')
});

// set up the sphere vars
var radius = 50, segments = 16, rings = 16;

// create a new mesh with sphere geometry -
// we will cover the sphereMaterial next!
var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), celMaterial);

// add the sphere to the scene
scene.add(sphere);

// and the camera
scene.add(camera);

// create a point light
var pointLight = new THREE.PointLight( 0xFFFFFF );

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

// start animation!
animate();