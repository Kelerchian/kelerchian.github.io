// var row = function(obj){
// 	obj = Object.assign({}, obj || {})
// 	obj.class = ("row " + (obj.class || "")).trim()
// 	return obj
// }
//
// var col = function(suffix, obj){
// 	var className = "col" + (suffix || "")
// 	obj = Object.assign({}, obj || {})
// 	obj.class = (className + " " + (obj.class || "")).trim()
// 	return obj
// }
//
// var body = {
// 	$cell: true,
// 	$type: "main",
// 	id: "main",
// 	class: "container justify-content-md-center",
// 	$components: [
// 		{
// 			class: "col-6",
// 			$components: [
// 				{ $type: "h1", $text: "Hi," },
// 				{ $type: "p", $html: "I'm Alan, Back End - Front End guy. I'm a software developer working frequently but not exclusively with <a href='https://nodejs.org/en/'>Node</a>, <a href='https://expressjs.com/'>Express</a>, <a class='https://laravel.com/'>Laravel</a>, <a href='https://facebook.github.io/react/'>React</a>, and <a href='https://electron.atom.io/'>Electron</a>"},
// 			]
// 		}
// 	]
// }
//
// var canvas = {
// 	$cell: true,
// 	$type: "canvas",
// 	id: "canvas",
// 	$init: function(){
// 		Anvas(this)
// 	}
// }

document.addEventListener("DOMContentLoaded", function(){
	Anvas( window['canvas'] || document.getElementByID("canvas") )
}, true)
