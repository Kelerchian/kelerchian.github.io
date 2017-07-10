var Anvas = (function(){

	var requestAnimationFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();

	var getViewportData = function(){
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		return {width:width, height:height}
	}









	/**
	* Engine Timescale, scales from CPU
	* (1000/60) = 60 tick per second
	* For independent movement from frames invoked by "requestAnimationFrame"
	*/
	var timescale = Math.round(1000/60)







	/**
	*	Character Section
	*/
	var CharacterMeshData = {
		radius: 9,
		segments: 36,
		rings: 36
	}

	var CharacterMesh = function(geometryOption, materialOption){

		var shadesOfGray = Math.round( Math.random() * 40 ) + 200

		geometryOption = Object.assign(CharacterMeshData, geometryOption || {})
		materialOption = Object.assign({ color: "rgb("+shadesOfGray+","+shadesOfGray+","+shadesOfGray+")"}, materialOption || {})

		return new THREE.Mesh(
			new THREE.SphereGeometry(
				geometryOption.radius,
				geometryOption.segments,
				geometryOption.rings
			),
			new THREE.MeshToonMaterial(materialOption)
		)
	}









	//mouse
	var mouse = new THREE.Vector3()
	mouse.set(0,0,0)
	var pointLight




	var Character = function(){

		if(this == window){ throw new Error("Must be instantiated with `new` keyword.") }
		this.radius = Math.round( Math.random() * 6 ) + 4
		this.speed = new THREE.Vector2()
		this.mesh = new CharacterMesh({
				radius: this.radius
			}
		)
	}

	Character.prototype.move = function(){
			var maxSpeed = Character.trait.maxSpeed
			var maxAcceleration = Character.trait.maxAcceleration
			var speed = this.speed

			var destinationPosition = new THREE.Vector2(mouse.x, mouse.y)
			var characterPosition = new THREE.Vector2(this.mesh.position.x, this.mesh.position.y)

			var dist = destinationPosition.clone().sub(characterPosition)

			var nextSpeed = dist.clone().sub(speed)
			nextSpeed = nextSpeed.length() > maxSpeed ? nextSpeed.normalize().multiplyScalar(maxSpeed) : nextSpeed

			// Repulse Mechanism
			var repulseSpeed = new THREE.Vector2()
			for(var i in Character.list){
				var oC = Character.list[i]
				if(oC == this){ continue; }

				var oPosition = new THREE.Vector2(oC.mesh.position.x, oC.mesh.position.y)
				var oDist = oPosition.clone().sub( characterPosition )

				var rDistScalar = oDist.length() - this.radius - oC.radius
				var rForceRange = (Character.trait.repulseRange) - rDistScalar
						rForceRange = rForceRange < 0 ? 0 : rForceRange

				var rSpeed = oDist.clone()
													.normalize()
													// .multiplyScalar(-1)
													.multiplyScalar(rForceRange)

				rSpeed = rSpeed.length() > maxSpeed ? rSpeed.normalize().multiplyScalar(maxSpeed) : rSpeed
				repulseSpeed.add(rSpeed)

			}
			// repulseSpeed = repulseSpeed.length() > maxSpeed ? repulseSpeed.normalize().multiplyScalar(maxSpeed) : repulseSpeed
			nextSpeed.add(repulseSpeed)


			//Acceleration Mechanism
			var nextAccel = nextSpeed.clone().sub(speed)

			var calculatedCos = nextSpeed.clone().dot(dist) / (nextSpeed.length() * dist.length())
			var calculatedMaxAcceleration = maxSpeed + (((calculatedCos - (-1)) / 2) * maxAcceleration - maxSpeed)

			var hAccel = nextAccel.length() > calculatedMaxAcceleration ? nextAccel.clone().normalize().multiplyScalar(calculatedMaxAcceleration) : nextAccel.clone()


			speed.x += hAccel.x
			speed.y += hAccel.y

			this.mesh.position.x += speed.x
			this.mesh.position.y += speed.y
	}

	Character.prototype.run = function(){
		this.move()
		this.checkDeletion()

		if(!this.isDeleted){
			requestAnimationFrame(this.run.bind(this))
		}
	}

	Character.prototype.checkDeletion = function(){
		if(this.isMarkedForDeletion){
			var list = Character.list

			scene.remove(this.mesh)
			list.splice( list.indexOf(this), 1 )
			this.isDeleted = true
		}
	}

	Character.prototype.enable = function(){
		if(Character.list.indexOf(this) == -1){
			scene.add(this.mesh)
			Character.list.push(this)
			this.run()
		}
	}

	Character.prototype.delete = function(){
		this.isMarkedForDeletion = true
	}

	Character.list = []

	Character.trait = {
		maxAcceleration: 0.2 * timescale,
		maxSpeed: 0.8 * timescale,
		repulseRange: 20,
		maxCount: 8
	}


	var renderer, scene, camera

	/**
	*	Start the canvas
	*/
	var start = function(canvas){


		renderer = new THREE.WebGLRenderer({
			canvas:	canvas,
			antialias: true
		})

		//Set Viewport Data
		var vpData = getViewportData()
		scene = new THREE.Scene()
		scene.background = new THREE.Color(0xFFFFFF)
		//Set Camera
		camera = new THREE.OrthographicCamera(
			vpData.width / -2,
			vpData.width / 2,
			vpData.height / 2,
			vpData.height / -2,
			1,
			1000
		)
		camera.position.z = 300
		camera.matrixAutoUpdate = true
		scene.add(camera)

		window.addEventListener('resize', function(){
			vpData = getViewportData()
			renderer.setSize(vpData.width, vpData.height)
			camera.left = vpData.width / -2
			camera.right = vpData.width / 2
			camera.top = vpData.height / 2
			camera.bottom = vpData.height / -2
			camera.updateProjectionMatrix()
		})

		var ambientLight = new THREE.AmbientLight( 0XFFFFFF, 1 );
		scene.add(ambientLight)

		// var pointLight = new THREE.PointLight( 0XFFFFFF );
		// pointLight.position.x = 0
		// pointLight.position.y = 0
		// pointLight.position.z = 20
		//
		// scene.add(pointLight)

		//Spawn Character

		for(var i = 0; i < Character.trait.maxCount; i++){
			var c = new Character()
			c.enable()
			c.mesh.position.x = Math.random() - 0.5
			c.mesh.position.y = Math.random() - 0.5
		}
		window.addEventListener('click', function(){
			var character = new Character()
			character.enable()
			character.mesh.position.x = mouse.x
			character.mesh.position.y = mouse.y

			// character.deletionTimeout = setTimeout(function(){
			// 	character.delete()
			// }, 4000)

			if(Character.list.length > Character.trait.maxCount){
				// clearTimeout( Character.list[0].deletionTimeout )
				Character.list[0].delete()
			}
		}, true)


		window.addEventListener('mousemove', function(e){
			var x = e.clientX / window.innerWidth * 2 - 1
			var y = - (e.clientY / window.innerHeight) * 2 + 1

			var vector = new THREE.Vector3( x * (camera.right - camera.left) / 2, y * (camera.top - camera.bottom) / 2, 0 )
					mouse.copy(vector)

			// pointLight.position.x = mouse.x
			// pointLight.position.y = mouse.y

		}, true)


		function render(){
			renderer.render(scene, camera)
			requestAnimationFrame(render)
		}
		requestAnimationFrame(render)
























	}

	var rendered = false
	return function(newCanvas){
		if(newCanvas instanceof HTMLElement && !rendered){
			rendered = true
			start(newCanvas)
		}
	}
})()
