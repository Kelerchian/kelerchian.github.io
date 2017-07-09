var row = function(obj){
	obj = Object.assign({}, obj || {})
	obj.class = ("row " + (obj.class || "")).trim()
	return obj
}

var col = function(suffix, obj){
	var className = "col" + (suffix || "")
	obj = Object.assign({}, obj || {})
	obj.class = (className + " " + (obj.class || "")).trim()
	return obj
}

var body = {
	$cell: true,
	$type: "main",
	id: "main",
	class: "container",
	$components: [
		row({
			$components:[
				col("",{
					class: "text-center",
					$components: [{ $type: "h1", $text: "Hello World"}]
				})
			]
		})
	]
}

var canvas = {
	$cell: true,
	$type: "canvas",
	id: "canvas",
	$init: function(){
		Anvas(this) 
	}
}
