var socket;
var searchResults; //variabile che memorizza i results della ricerca
var database;
var songINFO;
var lastKey = [];
var moodCategory = 4;
var foundSongs = [];
var canvas2bSlider;
var canvas2bKnob;
var bar;
var dial;



var isButtonChooseSongAbled;
var choosenSongUri;
var transmissionDegrees;

var dragging = false; // Is the slider being dragged?
var rollover = false; // Is the mouse over the slider?
var x = 200;
var y = 150;
var r = 40;
// Knob angle
var angle = 0;
var count = 0;
// Offset angle for turning knob
var offsetAngle = 0;

function preload() {
  bar = loadImage('assets/images/bar.png');
}

var sketchSlider2b = function(s) {

  s.setup = function() {
    canvas2bSlider = s.createCanvas(400, 300);
    canvas2bSlider.parent('sketch2bSlider');
  };

  s.draw = function() {
    s.imageMode(CENTER);
    // rectMode(CENTER);
    s.background("red");

    //reset the selectorStatus, 0 = no song selected
    var selectorStatus = 0;

    cursorX = s.map(transmissionDegrees, 0, 359, 0, s.width);

    //create selector display with the five radio bars
    for (var i = 0; i < 5; i++) {

      //the length of the bar is related to the height of the canvas,
      var barLenght = s.height * 6;



      //if we are in the selected mood
      if (moodCategory == i) {



        //for cycle to go trough the three songs of the selected mood
        for (j = 0; j < 3; j++) {


          //this if is needed to wait the foundSongs array to be full
          if (!(foundSongs.length == 0)) {



            //take casual value that was assigned to the song and stored in the found song Array
            var unMappedCasualx = foundSongs[i][j][1];

            //take casualx and convert it to be placed on the bar
            var casualX = s.map(unMappedCasualx, 0, 100, 10, s.width - 10);

            var transp = 255 - Math.abs(casualX - cursorX);
            s.fill(0, 255, 0, transp);


            //when the slider is on an ellipse song (song is selected)
            if (casualX - 10 < cursorX && cursorX < casualX + 10) {
              cursorX = casualX;
              selectorStatus = 1;
              //assign to a global variable the corresponding SPOTIFY URI
              choosenSongUri = foundSongs[i][j][0];
            }

            //drawing the ellipses representing the songs
            s.noStroke();
            s.ellipse(casualX, s.height / 16 * (2 + (i * 3)), s.height / 20);


          }
        }


      } else {

      }

      //drawing the five radio bar
      s.image(bar, s.width / 2, s.height / 16 * (2 + (i * 3)), s.width, s.height / 8);
    }

    //setting the vertical positions hard stop of the selector
    var hardStop = s.height / 16 * (2 + (moodCategory * 3));
    s.strokeWeight(2);
    s.stroke(255, 204, 0);

    //horizontal line
    s.line(0, hardStop, s.width, hardStop);


    //vertical line
    s.line(cursorX, 0, cursorX, s.height);
    //circle
    s.noFill();
    s.ellipse(cursorX, hardStop, s.height / 12);


    //transmitt the result of the draw cycle to the global var isButtonChooseSongAbled
    //and able or disable the button
    if (selectorStatus == 1) {
      isButtonChooseSongAbled = 1;
      document.getElementById("receiveSong").classList.remove("inactive")
    } else {
      isButtonChooseSongAbled = 0;
      document.getElementById("receiveSong").classList.add("inactive")
    }

  };

};

// var sketchKnob2b = function(k) {
//   k.setup = function() {
//     canvas2bKnob = k.createCanvas(400, 300);
//     canvas2bKnob.parent('sketch2bKnob');
//   };
//
//   k.draw = function() {
//     k.background(100);
//     //create Knob
//     if (count === 0) {
//       // Is it being dragged?
//       if (dragging) {
//         var dx = k.mouseX - x;
//         var dy = k.mouseY - y;
//         var mouseAngle = atan2(dy, dx);
//         angle = mouseAngle - offsetAngle;
//       }
//       // Fill according to state
//       if (dragging) {
//         k.fill(175);
//       } else {
//         k.fill(255);
//       }
//       // Draw ellipse for knob
//       k.push();
//       k.translate(x, y);
//       k.rotate(angle);
//       k.ellipse(0, 0, r * 2, r * 2);
//       k.line(0, 0, r, 0);
//       k.pop();
//       k.fill(0);
//       var calcAngle = 0;
//       if (angle < 0) {
//         calcAngle = k.map(angle, -PI, 0, PI, 0);
//       } else if (angle > 0) {
//         calcAngle = k.map(angle, 0, PI, TWO_PI, PI);
//       }
//
//       k.textAlign(CENTER);
//       k.text();
//       transmissionDegrees = k.int(degrees(calcAngle)), x, y + r + 20;
//
//       var degree = k.int(degrees(calcAngle));
//
//       if (dragging && degree < 10) {
//         count == 2;
//       }
//     }
//     if (count === 2) {
//       var b = k.map(calcAngle, 0, TWO_PI, 0, 255);
//       k.fill(b);
//       k.rect(320, 90, 160, 180);
//     }
//   };
//   mousePressed = function() {
//     // Did I click on slider?
//     if (k.dist(k.mouseX, k.mouseY, x, y) < r) {
//       dragging = true;
//       // If so, keep track of relative location of click to corner of rectangle
//       var dx = k.mouseX - x;
//       var dy = k.mouseY - y;
//       offsetAngle = atan2(dy, dx) - angle;
//     }
//   }
//
//   mouseReleased = function() {
//     // Stop dragging
//     dragging = false;
//   }
// };

function setup() {
  // //Canvas that contain slider
  // canvas2bSlider = createCanvas(400, 300);
  // canvas2bSlider.parent('sketch2bSlider');
  // //Canvas that contain knob
  // canvas2bKnob = createCanvas(400, 300);
  // canvas2bKnob.parent('sketch2bKnob');

  Ui.P1 = function() {};

  Ui.P1.prototype = Object.create(Ui.prototype);

  Ui.P1.prototype.createElement = function() {
    "use strict";
    Ui.prototype.createElement.apply(this, arguments);
    this.addComponent(new Ui.Pointer({
      type: 'Rect',
      pointerWidth: 3,
      pointerHeight: this.width / 5,
      offset: this.width / 2 - this.width / 3.3 - this.width / 10
    }));

    this.addComponent(new Ui.Scale(this.merge(this.options, {
      drawScale: false,
      drawDial: true,
      radius: this.width / 2.6
    })));

    var circle = new Ui.El.Circle(this.width / 3.3, this.width / 2, this.height / 2);
    this.el.node.appendChild(circle.node);
    this.el.node.setAttribute("class", "p1");
  };

  dial = new Knob(document.getElementById('test'), new Ui.P1());

  socket = io();
  //Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyC0wPI6FHQp7mIKMX6METBMywGG6e9277Q",
    authDomain: "gruppo-9-creative-coding-f2811.firebaseapp.com",
    databaseURL: "https://gruppo-9-creative-coding-f2811.firebaseio.com",
    projectId: "gruppo-9-creative-coding-f2811",
    storageBucket: "gruppo-9-creative-coding-f2811.appspot.com",
    messagingSenderId: "998667217119",
    appId: "1:998667217119:web:28b0fb55aa76850db7e16a",
    measurementId: "G-5TJ938D4SR"
  };
  //Initialize Firebase if does not exist
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  database = firebase.database();
  // firebase.analytics();
  for (var i = 0; i < 5; i++) {
    keyCheck(i);
  }

}

function mouseDragged(){
  transmissionDegrees = dial.value;
  console.log(dial.value);
}

function mouseWheel() {transmissionDegrees = dial.value;}
//
// function draw() {
//   imageMode(CENTER);
//   rectMode(CENTER);
//   canvas2bSlider.background("red");
//
//   //create selector display
//   for (var i = 0; i < 5; i++) {
//     canvas2bSlider.image(bar, width / 2, height / 16 * (2 + (i * 3)), height * 6, height / 8);
//   }
//   var hardStop = height / 16 * (2 + (moodCategory * 3));
//
//   //horizontal line
//   canvas2bSlider.line(0, hardStop, width, hardStop);
//   //vertical line
//   canvas2bSlider.line(width / 2, 0, width / 2, height);
//   //circle
//   canvas2bSlider.ellipse(width / 2, hardStop, height / 16);
//
//   //create Knob
//   if (count === 0) {
//
//     // Is it being dragged?
//     if (dragging) {
//       var dx = mouseX - x;
//       var dy = mouseY - y;
//       var mouseAngle = atan2(dy, dx);
//       angle = mouseAngle - offsetAngle;
//     }
//     // Fill according to state
//     if (dragging) {
//       fill(175);
//     } else {
//       fill(255);
//     }
//     // Draw ellipse for knob
//     push();
//     translate(x, y);
//     rotate(angle);
//     ellipse(0, 0, r * 2, r * 2);
//     line(0, 0, r, 0);
//     pop();
//     fill(0);
//     var calcAngle = 0;
//     if (angle < 0) {
//       calcAngle = map(angle, -PI, 0, PI, 0);
//     } else if (angle > 0) {
//       calcAngle = map(angle, 0, PI, TWO_PI, PI);
//     }
//
//     textAlign(CENTER);
//     text(int(degrees(calcAngle)), x, y + r + 20);
//
//     var degree = int(degrees(calcAngle));
//
//     if (dragging && degree < 10) {
//       count == 2;
//     }
//   }
//   if (count === 2) {
//     var b = map(calcAngle, 0, TWO_PI, 0, 255);
//     fill(b);
//     rect(320, 90, 160, 180);
//   }
//
// }

function keyCheck(index) {
  var ref = database.ref(index);
  ref.on('value', gotMood, errMood);

  //retrieve last key to increase database
  function gotMood(data) {
    if (lastKey[index] == null) {
      lastKey[index] = 0;
    } else {
      lastKey[index] = Object.keys(data.val()).length;
    }
  }

  function errMood(err) {
    console.log('Error: ' + err);
  }
}



function changePage(from, to) {
  document.getElementById("page" + from).classList.add("hidden");
  document.getElementById("page" + to).classList.remove("hidden");

}

function cleanSRC(src_id) {
  document.getElementById(src_id).src = "";
}

function cleanPage2a() {
  for (var i = 0; i < 6; i++) {
    document.getElementsByClassName("result")[i].innerHTML = "";
  }
  document.getElementById("searchbar").value = "";
}

function cleanButtons(j) {
  for (i = j; i < j + 5; i++) {
    document.getElementsByClassName("moodButton")[i].classList.remove("buttonDown");
  }

  document.getElementById('sendSong').disabled = true;
  document.getElementById('receiveSong').disabled = true;

}


// Funzione che cerca su spotify le canzoni tramite la searchbar
async function search() {

  var data = document.getElementById("searchbar").value;

  if (data == false) {
    for (var i = 0; i < 6; i++) {
      document.getElementsByClassName("result")[i].innerHTML = "";
    }
  } else {

    var dataJSON = {
      data
    };
    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataJSON)
    };
    var response = await fetch('/selection', options);
    searchResults = await response.json();

    for (var i = 0; i < 6; i++) {
      document.getElementsByClassName("result")[i].innerHTML = "";
    }

    for (var i = 0; i < Object.keys(searchResults.results).length; i++) {
      document.getElementById('searchResults' + i).innerHTML = searchResults.results[i].song + ' by ' + searchResults.results[i].artist;
    }
  }
};



async function selectedResult(index) {
  var songID = searchResults.results[index].id;
  document.getElementById("page2a").classList.add("hidden");

  var dataJSON = {
    songID
  };
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataJSON)
  };

  var response = await fetch('/selectedSong', options);
  songINFO = await response.json();

  document.getElementById("spotifyPreviewA").src = 'https://open.spotify.com/embed?uri=' + songINFO.uri;

  setTimeout(function() {
    document.getElementById("page3a").classList.remove("hidden");
  }, 1000);
};

//set mood in section A
function setMoodA(mood) {
  moodCategory = mood;
  cleanButtons(0);
  document.getElementsByClassName("moodButton")[mood].classList.add("buttonDown");
  document.getElementById('sendSong').disabled = false;
}

//function to send the selected song ID to the database
function sendSong() {
  var songArray = [songINFO.uri, songINFO.id];
  var ref = database.ref(moodCategory);
  ref.on('value', gotKey, errKey);
  var keyString = lastKey[moodCategory];
  var insertSong = ref.child(keyString.toString()).set(songArray);
  //reset button classes when song is sent
  cleanButtons(0);
}

function gotKey(data) {
  lastKey[moodCategory] = Object.keys(data.val()).length;
}

function errKey(err) {
  console.log('Error: ' + err);
}


function retrieveSongs() {
  var ref = database.ref();
  ref.on('value', gotData, errData);

}

//function that retrieves 15 random songs (three for each mood) and associates to every song a random value
//that will be used for displaying.
function gotData(data) {

  for (var i = 0; i < 5; i++) {
    var tempArray = [];

    lastKey[i] = Object.keys(data.val()[i]).length;

    for (var j = 0; j < 3; j++) {

      var randID = Math.floor(random(lastKey[i]));
      var resultURI = data.val()[i][randID][0];
      var randomFreq = Math.floor(random(100));
      var tempArray2 = [];
      tempArray2.push(resultURI, randomFreq);
      tempArray.push(tempArray2);

    }
    foundSongs.push(tempArray);
  }
  // document.getElementById("spotifyPreviewB").src = 'https://open.spotify.com/embed?uri=' + resultURI;
}

function errData(err) {
  console.log('Error: ' + err);
}

//set mood in section B

function setMoodB(mood) {
  //moodCategory button defined from 5 to 9, moods from 0 to 4; This is the reason why we subtract 5 to moodCategory
  moodCategory = mood - 5;

  cleanButtons(5);
  document.getElementsByClassName("moodButton")[mood].classList.add("buttonDown");
  document.getElementById('receiveSong').disabled = false;


}

//receive Song
function receiveSong() {
  if (isButtonChooseSongAbled == 1) {
    changePage('2b', '3b');

    console.log(choosenSongUri);
    document.getElementById("spotifyPreviewB").src = 'https://open.spotify.com/embed?uri=' + choosenSongUri;
  }




}

var p5Slider2b = new p5(sketchSlider2b);
// var p5Knob2b = new p5(sketchKnob2b);
