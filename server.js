console.log("THIS SERVER IS WORKING");

//require dotenv in dev mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var socket = require('socket.io');
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

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET
});

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

app.post('/selectedSong', (request, response) => {
  console.log("'" + request.body.songID + "'");

  var songID_string = request.body.songID.toString();

  return spotifyApi.getTrack(songID_string).then(function(data) {
    console.log(data.body);
    //nome canzone
    //nome artista
    //nome album
    //cover album
    //id canzone

    track = data.body;

    var songINFO = {
      song: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      cover: track.album.images[0].url,
      uri: track.uri,
      id: track.id,
      preview: track.preview_url
    };

    response.json(songINFO);




  }).catch(function(err) {
    console.log('Something went wrong:', err.message);
  });
});
