/**
 * 
 */

var filePicker = document.getElementById("pick_file_control");
var eltPages = document.getElementById("pages");
var eltFlip = document.getElementById("flipbook");
var eltWelcome = document.getElementById("welcome");
var eltLeft = document.getElementById("go_left");
var eltRight = document.getElementById("go_right");

var content = document.getElementById("content");

// eltPages.style.display = "none";
console.log("test");
filePicker.onchange(function() {
	console.log("test3");
	var File = filePicker.value;
	console.log("test2");
	// fire the upload here
	var rar = RarArchive(File, function(err){
		if(err){
			console.log("erreur");
			return;
		}
		var t = new Array();
		this.entries.foreach(function(val){
			t.push(val.path);
			console.log(val.path);
		}
		);
	}
	);
});