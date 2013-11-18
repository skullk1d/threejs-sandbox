player = function () {

	var scope = this; // need reference to self within callbacks

	// movement parameters

	this.maxSpeed = 12;
	this.maxReverseSpeed = -12;

	this.frontAcceleration = 24;
	this.backAcceleration = 24;

	this.frontDecceleration = 24;

	this.angularSpeed = 3;

	// 3d

	this.obj = new THREE.Object3D();

	this.mesh = null;
	this.controls = null;
	this.animationFPS = 24;

	this.scale = 1;

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
	// mesh URL must point to exported threejs .js model
	this.setMesh = function( meshURL ) {

		var loader = new THREE.JSONLoader();
		loader.load( meshURL, function( geometry, materials ) {

			geometry.computeBoundingBox();
			scope.obj.position.y = - scope.scale * geometry.boundingBox.min.y;

			var mesh = new THREE.SkinnedMesh( geometry, materials[0]); // in the iported threejs json, materials is an array!

			//load UV texture
			var mapping = new THREE.UVMapping();
			var charTexture = THREE.ImageUtils.loadTexture( 'assets/models/char.png', mapping, function() {

				scope.material = charTexture;
				mesh.material.map = scope.material;

				//mesh.autoCreateAnimations( scope.animationFPS );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );

				scope.obj.add( mesh );

				// add animation data to the animation handler
				THREE.AnimationHandler.add(geometry.animations[1]);
				// for (var i = 0; i < geometry.animations.length; i++) {
				// 	THREE.AnimationHandler.add(geometry.animations[i]);
				// }
				var runAnimation = new THREE.Animation( mesh, "run" );

				// play the anim
				runAnimation.play(); // <-- not working
			} );
		} );
	};

	// update skin in realtime if needed
	this.setMaterial = function( textureURL ) {
		// TODO: abstract this from setMesh method
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