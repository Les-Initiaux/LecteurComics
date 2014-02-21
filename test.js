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
var i = 0;
var maxElement = 0;
var tab=new Array;
eltPages.style.display = "none";

//lecture fichier rar et zip
document.querySelector('input[type="file"]').onchange = function(e) {
	i=0;
	t = filePicker.value.lastIndexOf("/");
	console.log("local name = "+t);
	eltPages.style.display="block";
	// lecture fichier rar
	var file = RarArchive(this.files[0], function(err) {
		if(err) {
			console.log(err);
			return;
		}
		this.entries.forEach(function(val) {
		console.log(val.path);
		tab[i]=val.path;
		console.log(i+" :"+tab[i]);
		i=i+1;
		});	
		maxElement = i-1;
		i=0;
	});
	
	
	// lecture fichier zip
	
	
	
	
	console.log(i);
	console.log(maxElement);
	var image = "<img src=" + tab[i] + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	console.log(image);
	eltFlip.innerHTML=image;
};

eltLeft.onclick = function(){
	if(i!=0){
		i=i-1;
	}
	else {
		i=0;
	}
	console.log(maxElement);
	console.log(i);
	console.log(tab[i]);
	var image = "<img src=" + tab[i] + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	eltFlip.innerHTML=image;
};

eltRight.onclick = function(){
	if(i<maxElement){
		i=i+1;
	}
	else {
		i=0;
	}
	console.log(maxElement);
	console.log(i);
	console.log(tab[i]);
	var image = "<img src=" + tab[i] + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	eltFlip.innerHTML=image;
};