player = function () {

	this.scale = 1;

	// movement parameters

	this.maxSpeed = 300;
	this.maxReverseSpeed = -300;

	this.frontAcceleration = 600;
	this.backAcceleration = 600;

	this.frontDecceleration = 600;

	this.angularSpeed = 3;

	// 3d

	this.obj = new THREE.Object3D();

	this.mesh = null;
	this.controls = null;

	// textures

	this.material = undefined;

	// callback

	this.onLoadComplete = function () {};

	// internals

	this.meshes = [];
	this.animations = {};

	// internal movement control variables

	this.speed = 0;
	this.bodyOrientation = 0;

	// internal animation parameters

	this.activeAnimation = null;

	// mesh and material

	this.setMesh = function( mesh ) {
		this.mesh = mesh;
		this.obj.add(this.mesh);
	};

	this.setMaterial = function( textureURL ) {
		this.material = new THREE.MeshLambertMaterial({
		  map: THREE.ImageUtils.loadTexture( textureURL )
		});
	};

	// movement
	// the math used here is from alteredq's code
	this.updateMovement = function ( delta ) {

		var controls = this.controls;

		if ( controls.moveForward )  this.speed = THREE.Math.clamp( this.speed + delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed );
		if ( controls.moveBackward ) this.speed = THREE.Math.clamp( this.speed - delta * this.backAcceleration, this.maxReverseSpeed, this.maxSpeed );

		// orientation based on controls

		var dir = 1;

		if ( controls.moveLeft ) {

			this.bodyOrientation += delta * this.angularSpeed;
			this.speed = THREE.Math.clamp( this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed );

		}

		if ( controls.moveRight ) {

			this.bodyOrientation -= delta * this.angularSpeed;
			this.speed = THREE.Math.clamp( this.speed + dir * delta * this.frontAcceleration, this.maxReverseSpeed, this.maxSpeed );

		}

		// speed decay

		if ( ! ( controls.moveForward || controls.moveBackward ) ) {

			if ( this.speed > 0 ) {

				var k = exponentialEaseOut( this.speed / this.maxSpeed );
				this.speed = THREE.Math.clamp( this.speed - k * delta * this.frontDecceleration, 0, this.maxSpeed );

			} else {

				var k = exponentialEaseOut( this.speed / this.maxReverseSpeed );
				this.speed = THREE.Math.clamp( this.speed + k * delta * this.backAcceleration, this.maxReverseSpeed, 0 );

			}

		}

		// displacement

		var forwardDelta = this.speed * delta;

		this.obj.position.x += Math.sin( this.bodyOrientation ) * forwardDelta;
		this.obj.position.z += Math.cos( this.bodyOrientation ) * forwardDelta;

		// steering

		this.obj.rotation.y = this.bodyOrientation;

	};

	// utils
	function exponentialEaseOut( k ) { return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1; }

}