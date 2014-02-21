/**
 * 
 */

if (!window.console) {
  window.console = {};
  window.console.log = function(str) {};
  window.console.dir = function(str) {};
}
if (window.opera) {
  window.console.log = function(str) {opera.postError(str);};
  window.console.dir = function(str) {};
}

window.kthoom = {};

// key codes
var Key = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, 
A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, 
N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90};

// global variables
var worker;
var currentImage = 0,
  imageFiles = [],
  imageFilenames = [];
var totalImages = 0;
var lastCompletion = 0;

  
var rotateTimes = 0, hflip = false, vflip = false, fitMode = Key.B;

//les notres
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

var createURLFromArray = function(array, mimeType) {
  var offset = array.byteOffset, len = array.byteLength;
  var bb, url;
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
      blob.slice(offset, offset + len, mimeType) : //future behavior
      blob.slice(offset, len, mimeType); //Old behavior
  }
  
  // TODO: Simplify this some time in 2013 (Chrome 8 and 9 are ancient history).
  var url = (typeof createObjectURL == 'function' ? createObjectURL(blob) : //Chrome 9?
              (typeof createBlobURL == 'function' ? createBlobURL(blob) : //Chrome 8
                (((typeof URL == 'object' || typeof URL == 'function') && typeof URL.createObjectURL == 'function') ? URL.createObjectURL(blob) : //Chrome 15? Firefox
                  (((typeof webkitURL == 'object' || typeof webkitURL == 'function') && typeof webkitURL.createObjectURL == 'function') ? webkitURL.createObjectURL(blob) : //Chrome 10
                    ''))));
  return url;
}

// Stores an image filename and its data: URI.
// TODO: investigate if we really need to store as base64 (leave off ;base64 and just
//       non-safe URL characters are encoded as %xx ?)
//       This would save 25% on memory since base64-encoded strings are 4/3 the size of the binary
var ImageFile = function(file) {
  this.filename = file.filename;
  var fileExtension = file.filename.split('.').pop().toLowerCase();
  var mimeType = fileExtension == 'png' ? 'image/png' :
      (fileExtension == 'jpg' || fileExtension == 'jpeg') ? 'image/jpeg' :
      fileExtension == 'gif' ? 'image/gif' : undefined;
  this.dataURI = createURLFromArray(file.fileData, mimeType);
  this.data = file;
};

//lecture fichier rar et zip
document.querySelector('input[type="file"]').onchange = function(e) {
	eltPages.style.display="block";
	var evt=e;
	// lecture fichier rar
	getFile(evt);

	/*console.log(i);
	console.log(maxElement);
	var image = "<img src=" + tab[i] + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	console.log(image);
	eltFlip.innerHTML=image;
};*/// gets the element with the given id
	


// lecture fichier
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
                imageFiles.push(new ImageFile(f));
              }
            }
            console.log(imageFiles);
            console.log(imageFiles[1].dataURI);
            maxElement = imageFiles.length;
            // display first page if we haven't yet
            var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
			console.log(image);
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
	var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
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
	var image = "<img src=" + imageFiles[i].dataURI + " alt=\"page\" width=\"250\" height=\"400\"/>"; 
	eltFlip.innerHTML=image;
};
}