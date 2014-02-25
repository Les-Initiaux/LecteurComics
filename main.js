/**
 * 
 */


//global variables
var currentImage = 0,
imageFiles = [],
imageFilenames = [];

var filePicker = document.getElementById("pick_file_control");
var eltPages = document.getElementById("pages");
var eltFlip = document.getElementById("flipbook");
var eltWelcome = document.getElementById("welcome");
var eltLeft = document.getElementById("go_left");
var eltRight = document.getElementById("go_right");
var Menu = document.getElementById("menu");
var eltMenu = document.getElementsByTagName("miniature");

var content = document.getElementById("content");
var i = 0;
var maxElement = 0;
eltPages.style.display = "none";

var KEY_LEFT = 37, KEY_RIGHT = 39;

// local URL creation for files
var createURLFromArray = function(array, mimeType) {
	var offset = array.byteOffset, len = array.byteLength;
	var blob;

	// Blob constructor, see http://dev.w3.org/2006/webapi/FileAPI/#dfn-Blob.
	if (typeof Blob == 'function') {
		blob = new Blob([array], {type: mimeType});
	} else {
		var bb = (typeof BlobBuilder == 'function' ? (new BlobBuilder()) : //Chrome 8
			(typeof WebKitBlobBuilder == 'function' ? (new WebKitBlobBuilder()) : //Chrome 12
				(typeof MozBlobBuilder == 'function' ? (new MozBlobBuilder()) : //Firefox 6
					null)));
		if (!bb) return false;
		bb.append(array.buffer);
		blob = bb.getBlob();
	}

	if (blob.webkitSlice) { //Chrome 12
		blob = blob.webkitSlice(offset, offset + len, mimeType);
	} else if(blob.mozSlice) { //Firefox 5
		blob = blob.mozSlice(offset, offset + len, mimeType);
	} else if(blob.slice) { //
		blob = blob.slice(2, 3).size == 1 ? 
				blob.slice(offset, offset + len, mimeType) :
					blob.slice(offset, len, mimeType); 
	}

	var url = (typeof createObjectURL == 'function' ? createObjectURL(blob) : //Chrome 9
		(typeof createBlobURL == 'function' ? createBlobURL(blob) : //Chrome 8
			(((typeof URL == 'object' || typeof URL == 'function') && typeof URL.createObjectURL == 'function') ? URL.createObjectURL(blob) : //Chrome 15? Firefox
				(((typeof webkitURL == 'object' || typeof webkitURL == 'function') && typeof webkitURL.createObjectURL == 'function') ? webkitURL.createObjectURL(blob) : //Chrome 10
				''))));
	return url;
}

//Stores an image filename and its data: URI.
var ImageFile = function(file) {
	this.filename = file.filename;
	var fileExtension = file.filename.split('.').pop().toLowerCase();
	var mimeType = fileExtension == 'png' ? 'image/png' :
		(fileExtension == 'jpg' || fileExtension == 'jpeg') ? 'image/jpeg' :
			fileExtension == 'gif' ? 'image/gif' : undefined;
	this.dataURI = createURLFromArray(file.fileData, mimeType);
	this.data = file;
};

//lecture fichier rar, zip et tar
document.querySelector('input[type="file"]').onchange = function(e) {
	eltPages.style.display="block";
	var evt=e;
	getFile(evt);

	// openning
	function getFile(evt) {
		var inp = evt.target;
		console.log(inp);
		var filelist = inp.files;
		console.log(filelist);
		if (filelist.length == 1) {
			//closeBook();

			var fr = new FileReader();
			fr.onload = function() {
				var ab = fr.result;
				var h = new Uint8Array(ab, 0, 10);
				var pathToBitJS = "bitjs/";
				var unarchiver = null;
				// extension detection
				if (h[0] == 0x52 && h[1] == 0x61 && h[2] == 0x72 && h[3] == 0x21) { //Rar!
					unarchiver = new bitjs.archive.Unrarrer(ab, pathToBitJS);
				} else if (h[0] == 80 && h[1] == 75) { //PK (Zip)
					unarchiver = new bitjs.archive.Unzipper(ab, pathToBitJS);
				} else { // Try with tar
					unarchiver = new bitjs.archive.Untarrer(ab, pathToBitJS);
				}
				// Listen for UnarchiveEvents.
				if (unarchiver) {
					unarchiver.addEventListener(bitjs.archive.UnarchiveEvent.Type.INFO,
							function(e) {
						console.log(e.msg);
					});
					unarchiver.addEventListener(bitjs.archive.UnarchiveEvent.Type.EXTRACT,
							function(e) {
						// convert DecompressedFile into a bunch of ImageFiles
						if (e.unarchivedFile) {
							var f = e.unarchivedFile;
							// add any new pages based on the filename
							if (imageFilenames.indexOf(f.filename) == -1) {
								imageFilenames.push(f.filename);
								var ImgMenu = new ImageFile(f);
								// display index of the archive
								var indexPage = imageFilenames.indexOf(f.filename);
								var lien = "<li><img src=" + ImgMenu.dataURI + " alt=\""+indexPage+"\" width=\"50\" height=\"50\" onclick='javascript:selectPicture("+indexPage+")' /></li>";
								Menu.innerHTML+=lien;
								imageFiles.push(ImgMenu);
							}
						}
						maxElement = imageFiles.length;
						// display first page
						var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>";
						eltFlip.innerHTML=image;			
					});
					unarchiver.start();

				} else {
					alert("Some error");
				}
			};
			fr.readAsArrayBuffer(filelist[0]);
		}
	}
}

// Change picture to the left
eltLeft.onclick = function(){
	PreviousPicture();
};

// Change picture to the right
eltRight.onclick = function(){
	NextPicture();
};

// change picture when press left or right
function leftRight(event){
	var e = event || window.event;
	var code = e.charCode || e.keyCode;
	if(code == KEY_LEFT){
		PreviousPicture();
	}
	if(code == KEY_RIGHT){
		NextPicture();
	}
}
document.onkeyup = leftRight;

function PreviousPicture(){
	if(i!=0){
			i=i-1;
		}
		else {
			i=0;
		}
		var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
		eltFlip.innerHTML=image;
}

function NextPicture(){
	if(i<maxElement){
			i=i+1;
		}
		else {
			i=0;
		}
		var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
		eltFlip.innerHTML=image;
}

// Change picture from menu
function selectPicture(idPicture){
	i = idPicture;
	var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>";
	eltFlip.innerHTML=image;
}
