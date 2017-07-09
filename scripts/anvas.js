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

	var CharacterMeshData = {
		radius: 9,
		segments: 36,
		rings: 36
	}
	var CharacterMesh = function(geometryOption, materialOption){

		geometryOption = Object.assign(CharacterMeshData, geometryOption || {})
		materialOption = Object.assign({ color: 0xCC0000}, materialOption || {})

		return new THREE.Mesh(
			new THREE.SphereGeometry(
				geometryOption.radius,
				geometryOption.segments,
				geometryOption.rings
			),
			new THREE.MeshLambertMaterial(materialOption)
		)
	}

	var start = function(canvas){


		var renderer = new THREE.WebGLRenderer({
			canvas:	canvas,
			antialias: true
		})

		//Set Viewport Data
		var vpData = getViewportData()
		var scene = new THREE.Scene()
		scene.background = new THREE.Color(0x000000)
		//Set Camera
		var camera = new THREE.OrthographicCamera(
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

		var ambientLight = new THREE.AmbientLight( 0XFFFFFF, 0.3 );
		scene.add(ambientLight)

		var pointLight = new THREE.PointLight( 0XFFFFFF );
		pointLight.position.x = 0
		pointLight.position.y = 0
		pointLight.position.z = 130

		scene.add(pointLight)

		var characterMesh = new CharacterMesh()
		scene.add(characterMesh)

		window.pointLight = pointLight
		window.camera = camera



		//mouse
		var mouse = new THREE.Vector3()
		mouse.set(0,0,0)
		window.addEventListener('mousemove', function(e){
			var x = e.clientX / window.innerWidth * 2 - 1
			var y = - (e.clientY / window.innerHeight) * 2 + 1

			var vector = new THREE.Vector3( x * (camera.right - camera.left) / 2, y * (camera.top - camera.bottom) / 2, pointLight.position.z )

			mouse.copy(vector)

			pointLight.position.copy(vector)

		}, true)


		var timescale = Math.round(1000/60)
		var maxAcceleration = 0.2 * timescale;
		var maxSpeed = 1.4 * timescale

		// maxSpeed = 0.5 * timescale
		// maxAcceleration = 0.01 * timescale
		var acceleration = new THREE.Vector2()
		var speed = new THREE.Vector2()

		window.addEventListener('wheel', function(e){
			var down = e.deltaY > 0

			if(down){
				maxAcceleration += 0.05 * timescale
			}else{
				maxAcceleration -= 0.05 * timescale
			}
			console.log(maxAcceleration/timescale)
		})

		var tspeed = 0


		setInterval(function(){

			var destinationPosition = new THREE.Vector2(mouse.x, mouse.y)
			var characterPosition = new THREE.Vector2(characterMesh.position.x, characterMesh.position.y)

			var dist = destinationPosition.clone().sub(characterPosition)

			var nextSpeed = dist.clone().sub(speed)
					nextSpeed = nextSpeed.length() > maxSpeed ? nextSpeed.normalize().multiplyScalar(maxSpeed) : nextSpeed

			//Acceleration Mechanism
			var nextAccel = nextSpeed.clone().sub(speed)

			var calculatedCos = nextSpeed.clone().dot(dist) / (nextSpeed.length() * dist.length())
			var calculatedMaxAcceleration = maxSpeed + (((calculatedCos - (-1)) / 2) * maxAcceleration - maxSpeed)

			var hAccel = nextAccel.length() > calculatedMaxAcceleration ? nextAccel.clone().normalize().multiplyScalar(calculatedMaxAcceleration) : nextAccel.clone()

			speed.x += hAccel.x
			speed.y += hAccel.y

			characterMesh.position.x += speed.x
			characterMesh.position.y += speed.y

		},timescale)


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
