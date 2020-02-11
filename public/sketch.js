var socket;
var searchResults; //stores search results
var database;
var songINFO;
var lastKey = []; //array used to store the number of songs inside a moodCategory
var moodCategory = 0; //mood category chosen by user. Its initial value is 0 by default
var foundSongs = [];
var canvas2bSlider;
var scaleArray = [];
var dial; //knob to move the tuner
var statsArray = [];
var dictionary = [];
var favouriteSong = [];

var isButtonChooseSongAbled;
var choosenSongUri;
var transmissionDegrees;

//sounds
var clack;
var static;
var staticProx;

function preload() {
  for (i = 0; i < 10; i++) {
    if (i < 5) {
      var scale = loadImage("assets/images/scale" + i + ".png");
      scaleArray.push(scale);
    } else {
      var scale = loadImage("assets/images/scaleActive" + (i - 5) + ".png");
      scaleArray.push(scale);
    }
  }
  clack = loadSound("assets/sounds/clack.wav");
  static = loadSound("assets/sounds/static.mp3");
  staticProx = loadSound("assets/sounds/staticProx.mp3");

}

var sketchSlider2b = function(s) {

  s.setup = function() {
    if (windowWidth < 500) {
      canvas2bSlider = s.createCanvas(windowWidth / 100 * 88, windowWidth / 100 * 66);
    } else {
      canvas2bSlider = s.createCanvas(400, 300);
    }
    canvas2bSlider.parent('sketch2bSlider');
  };



  s.draw = function() {
    s.imageMode(CENTER);
    s.background('#2c3764');

    //reset the selectorStatus, 0 = no song selected
    var selectorStatus = 0;
    //move the cursor according to the knob slider rotation
    cursorX = s.map(transmissionDegrees, 0, 359, 0, s.width);

    //create selector display with the five radio bars
    for (var i = 0; i < 5; i++) {
      if (moodCategory == i) {
        s.image(scaleArray[i + 5], s.width / 2, s.height / 16 * (2 + (i * 3))+s.height/32, s.width, s.width / 17.5);

      } else {
        s.image(scaleArray[i], s.width / 2, s.height / 16 * (2 + (i * 3))+s.height/32, s.width, s.width / 17.5);

      }

      //if we are in the selected mood
      if (moodCategory == i) {
        //drawing the five radio bar

        //for cycle to go trough the three songs of the selected mood
        for (j = 0; j < 3; j++) {

          //this "if" is needed to wait the foundSongs array to be full
          if (!(foundSongs.length == 0)) {
            //take casual value that was assigned to the song and stored in the found song Array
            var unMappedCasualx = foundSongs[i][j][1];
            //take casualx and convert it to be placed on the bar
            var casualX = s.map(unMappedCasualx, 0, 100, 10, s.width - 10);
            var transp = 255 - 2*Math.abs(casualX - cursorX);
            s.fill(201, 209, 234, transp);

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

      }


    }
    //setting the vertical positions hard stop of the selector
    var hardStop = s.height / 16 * (2 + (moodCategory * 3));

    s.rectMode(CENTER);
    s.noStroke();
    s.fill(201, 209, 234, 30);
    s.rect(cursorX, s.height/2, s.width/12, s.height)
    //vertical line
    s.strokeWeight(2);
    s.stroke("#ff8871");
    s.line(cursorX, 0, cursorX, s.height);
    //circle
    s.noFill();

    //transmitt the result of the draw cycle to the global var isButtonChooseSongAbled
    //and able or disable the button
    if (selectorStatus == 1) {
      isButtonChooseSongAbled = 1;
      document.getElementById("receiveSong").classList.remove("inactive");
    } else {
      isButtonChooseSongAbled = 0;
      document.getElementById("receiveSong").classList.add("inactive");
    }

  };

};

function setup() {
  noCanvas();
  //define the P1 style for a new knob slider from knob.js
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

  //connection client-side to server
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
  firebase.analytics();
  for (var i = 0; i < 5; i++) {
    keyCheck(i);
  }

}

function draw() {
  //update the value of transmissionDegrees which is used to move the cursor
  transmissionDegrees = dial.value;
}


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
    document.getElementById('resultsContainer').classList.add("hidden");
  }
  document.getElementById("searchbar").value = "";
}

function cleanPageStats() {
  console.log('clean');
}

function cleanButtons(j) {
  for (i = j; i < j + 5; i++) {
    document.getElementsByClassName("moodButton")[i].classList.remove("buttonDown");
  }

  document.getElementById('sendSong').disabled = true;
  document.getElementById('receiveSong').disabled = true;
}

//search songs on spotify via searchbar
async function search() {

  var data = document.getElementById("searchbar").value;

  if (data == false) {
    for (var i = 0; i < 6; i++) {
      document.getElementsByClassName("result")[i].innerHTML = "";
      document.getElementById("resultsContainer").classList.add('hidden');
    }
  } else {

    document.getElementById("resultsContainer").classList.remove('hidden');

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
      document.getElementsByClassName("result")[i].classList.add('hidden');
    }

    for (var i = 0; i < Object.keys(searchResults.results).length; i++) {
      document.getElementsByClassName("result")[i].classList.remove('hidden');
      document.getElementById('searchResults' + i).innerHTML = searchResults.results[i].song + ' by ' + searchResults.results[i].artist;
    }

    if (Object.keys(searchResults.results).length == 0) {
      document.getElementById("resultsContainer").classList.add('hidden');
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
  clack.play();
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

  console.log('retrieveSong');
  var ref = database.ref();
  ref.on('value', gotData, errData);
}

//function that retrieves 15 random songs (three for each mood) and associates to every song a random value
//that will be used for displaying.
function gotData(data) {
    console.log('retrieveSong gotData');
  for (var i = 0; i < 5; i++) {
    var tempArray = [];
    lastKey[i] = Object.keys(data.val()[i]).length;
    console.log('retrieveSong gotData for1');
    for (var j = 0; j < 3; j++) {
      var randID = Math.floor(random(lastKey[i]));
      var resultURI = data.val()[i][randID][0];
      var randomFreq = Math.floor(random(10)) * 10;
      var tempArray2 = [];
      tempArray2.push(resultURI, randomFreq);
      tempArray.push(tempArray2);
      console.log('retrieveSong gotData for2');
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
  clack.play();
}

//receive Song
function receiveSong() {
  if (isButtonChooseSongAbled == 1) {
    stopStatic();
    changePage('2b', '3b');
    document.getElementById("spotifyPreviewB").src = 'https://open.spotify.com/embed?uri=' + choosenSongUri;
  }
}


//******************************STATISTICS*PAGE************************************************
function loadStats() {
  for (var i = 0; i < 5; i++) {

    retrieveStats(i);
  }
}

async function retrieveStats(i) {
  var ref = database.ref();
  ref.on('value', gotStats, errStats);

  function gotStats(data) {
    statsArray[i] = Object.keys(data.val()[i]).length;
    var n = 1;
    var frames = statsArray[i] / 150;

    setInterval(() => {
      if (n > 150) {
        return document.getElementById('counterMood' + i).innerHTML = statsArray[i];
      }
      document.getElementById('counterMood' + i).innerHTML = Math.floor(frames * n);
      n++;
    }, frames);
  }

  function errStats() {
    console.log('Error: ' + err);
  }
}

function readDictionary() {
  for (var i = 0; i < 5; i++) {
    writeDictionary(i);
  }
}

function writeDictionary(i) {
  var ref = database.ref();
  ref.on('value', gotDictionary, errDictionary);

  function gotDictionary(data) {
    //per ogni mood
    // console.log('max: '+max);
    for (var j = 0; j < statsArray[i]; j++) {
      //per ogni elemento dentro un mood
      // var tot = dictionary.length;
      if (dictionary.length == 0) {
        //se il dizionario è vuoto
        var tempArray3 = [data.val()[i][j][0], 1];
        dictionary.push(tempArray3);
        favouriteSong = tempArray3;
      } else {
        //confronto con tutti gli elementi del dizionario
        for (var n = 0; n < dictionary.length; n++) {
          if (data.val()[i][j][1] == dictionary[n][0]) {
            dictionary[n][1] += 1;
            if (dictionary[n][1] > favouriteSong[1]) {
              favouriteSong = dictionary[n];
              console.log(favouriteSong);
            }
            break;
          } else {
            if (n == dictionary.length - 1) {
              var tempArray3 = [data.val()[i][j][0], 1];
              dictionary.push(tempArray3);
              break;
            }
          }
        }
      }
    }
    console.log(dictionary);
    document.getElementById('favouriteSong').src= 'https://open.spotify.com/embed?uri=' + favouriteSong[0];
  }

  function errDictionary() {
    console.log('Error: ' + err);
  }
}

//play static radio tuning
function playStatic() {
  static.loop();
}

//stop static radio tuning when the page is changed
function stopStatic() {
  static.stop();
}

function touchMoved(){
  return false;
}


var p5Slider2b = new p5(sketchSlider2b);
