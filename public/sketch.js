var socket;
var searchResults; //variabile che memorizza i results della ricerca
var database;
var songINFO;
var lastKey = [];
var moodCategory;
var foundSongs = [];


function setup() {
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

function keyCheck(index) {
  var ref = database.ref(index);
  ref.on('value', gotMood, errMood);

  //retrieve last key to increase database
  function gotMood(data) {
    if (lastKey[index] == null) {
      console.log(index);
      lastKey[index] = 0;
      console.log(lastKey);
    } else {
      lastKey[index] = Object.keys(data.val()).length;
    }
  }

  function errMood(err) {
    console.log('Error: ' + err);
  }
}



function changePage(from, to) {
  console.log(lastKey);
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
    console.log(Object.keys(searchResults.results).length);

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
  console.log(lastKey);
  console.log(moodCategory);
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

console.log(foundSongs);

  // resultUri = spotify URI of random found song

  document.getElementById("spotifyPreviewB").src = 'https://open.spotify.com/embed?uri=' + resultURI;
}

function errData(err) {
  console.log('Error: ' + err);
}



//set mood in section B

function setMoodB(mood) {
  //moodCategory button defined from 5 to 9, moods from 0 to 4; This is the reason why we subtract 5 to moodCategory
  moodCategory = mood -5;
  
  cleanButtons(5);
  document.getElementsByClassName("moodButton")[mood].classList.add("buttonDown");
  document.getElementById('receiveSong').disabled = false;


}

//receive Song
function receiveSong() {




}
