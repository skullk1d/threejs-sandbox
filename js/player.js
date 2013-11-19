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

			//var mesh = new THREE.MorphBlendMesh( geometry, materials[0]);
			materials[0].skinning = true;
			materials[0].transparent = true;
			var mesh = new THREE.SkinnedMesh( geometry, materials[0], false); // in the imported threejs json, materials is an array!
			this.mesh = mesh;

			// add animation data to the animation handler
			this.animations = {};
			for (var i = 0; i < geometry.animations.length; i++) {
				THREE.AnimationHandler.add(geometry.animations[i]);
				var newAnimation = new THREE.Animation( mesh, geometry.animations[i].name );
				this.animations[geometry.animations[i].name] = newAnimation;
			}

			//load UV texture
			var mapping = new THREE.UVMapping();
			var charTexture = THREE.ImageUtils.loadTexture( 'assets/models/char.png', mapping, function() {

				charTexture.magFilter = THREE.NearestFilter;
				charTexture.minFilter = THREE.LinearMipMapLinearFilter;

				scope.material = charTexture;
				mesh.material.map = scope.material;

				mesh.scale.set( scope.scale, scope.scale, scope.scale );

				scope.obj.add( mesh );
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

		//animation

		if (controls.moveForward || controls.moveBackward || controls.moveLeft || controls.moveRight) {
			setAnimation('run');
		}
		else {
			setAnimation('stand');
		}
		THREE.AnimationHandler.update( delta );

	};

	// update which animations should play and stop
	function setAnimation(animationName) {

		if (this.mesh) {
			if (this.activeAnimation != animationName) {
				if (this.activeAnimation) {
					this.animations[this.activeAnimation].stop();
				}
				this.animations[animationName].play();
				this.activeAnimation = animationName;
			}
		}
	} 

	// utils
	function exponentialEaseOut( k ) { return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1; }

}