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

//lecture fichier rar
var tab=new Array;
document.querySelector('input[type="file"]').onchange = function(e) {
	var file = RarArchive(this.files[0], function(err) {
		if(err) {
			console.log(err);
			return;
		}
		var i = 0;
		this.entries.forEach(function(val) {
		console.log(val.path);
		tab[i]=val.path;
		console.log(i+" :"+tab[i]);
		i=i+1;
		});
	});

	var image = "<img src=" + tab[0] + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	console.log(image);
	eltFlip.innerHTML=image;
	console.log("passé!");
};