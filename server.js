//require dotenv in dev mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var socket = require('socket.io');
//require spotify-web-api-node library to make calls to the api easier
var SpotifyWebApi = require('spotify-web-api-node');

var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, () => console.log('listening at 3000'));

var io = socket(server);
io.on('connection', newConnection);

function newConnection(socket) {
  console.log("listening. . .");
}

app.use(express.static('public'));
app.use(express.json({
  limit: '1mb'
}));

//spotify client credentials
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET
});


//post request from the client to get the access token and a list of song given the query by the user
app.post('/selection', (request, response) => {
  console.log(request.body);

  spotifyApi.clientCredentialsGrant().then(
      function(data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // return spotifyApi.searchTracks(request.body.data);
        return spotifyApi.search(request.body.data, ['track', 'artist'], {
          limit: 6,
          offset: 0
        })
      },
      function(err) {
        console.log(
          'Something went wrong when retrieving an access token',
          err.message
        );
      }

    ).then(function(data) {
      // Print some information about the results
      console.log('I got ' + data.body.tracks.total + ' results!');

      // Go through the first page of results
      var firstPage = data.body.tracks.items;

      //list of song found on spotify given the input of the user
      var tracklist = [];

      firstPage.forEach(function(track, index) {

        var infos = {
          song: track.name,
          artist: track.artists[0].name,
          id: track.id
        }
        tracklist.push(infos);
      });

      response.json({
        results: tracklist
      });
    })
    .catch(function(err) {
      console.log('Something went wrong:', err.message);
    });

});

//post request to give back the specific info about the selected song
app.post('/selectedSong', (request, response) => {
  var songID_string = request.body.songID.toString();

  return spotifyApi.getTrack(songID_string).then(function(data) {

    track = data.body;

    //we only need the URI to make the spotify snippet and the ID that will be stored in our database
    var songINFO = {
      uri: track.uri,
      id: track.id
    };

    response.json(songINFO);

  }).catch(function(err) {
    console.log('Something went wrong:', err.message);
  });
});
