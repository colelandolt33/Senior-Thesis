import React from 'react';
import './App.css';

import SpotifyWebApi from '../../../node_modules/spotify-web-api-js';
import Login from '../Login/Login';
import NowPlaying from '../NowPlaying/NowPlaying';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import DiscoverWeekly from '../DiscoverWeekly/DiscoverWeekly';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/dynamic';

let timeStart = 0;
let songRecommendations = [];
let timeline = [];

const spotifyApi = new SpotifyWebApi();

let confirmExit = true;
let leave_message = 'Are you sure you want to leave? Your playlist has not yet been saved.'
function goodbye(e) {
  if(confirmExit) {
    if(!e) e = window.event;
    // e.cancelBubble is supported by IE - this will kill the bubbling process.
    e.cancelBubble = true;
    e.returnValue = leave_message;
    // e.stopPropagation works in Firefox.
    if (e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }

    // return works for Chrome and Safari
    return leave_message;
  }
}
window.onbeforeunload = goodbye;

class App extends React.Component {
  constructor(props) {
    super(props);
    const params = this.getHashParams();
    let access_token = params.access_token,
        refresh_token = params.refresh_token,
        expires_in = params.expires_in

    this.state = {
      isLoggedIn: params.access_token ? true : false,
      username: '',
      userID: '',
      nowPlaying: '',
      recommendations: [],
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: []
    }
    if (access_token) {
      console.log('Access Token')
      // Initialize starting time
      timeStart = Date.now();
      //Set Access Token
      spotifyApi.setAccessToken(access_token);
      // Reset Access Token
      setInterval(
        function() {
          var get_refresh_token = new XMLHttpRequest();
          get_refresh_token.open('POST', '/refresh_token', true);
          get_refresh_token.setRequestHeader("Content-type", "application/json");
          get_refresh_token.onload = function() {
              access_token = JSON.parse(get_refresh_token.response).access_token;
              spotifyApi.setAccessToken(access_token);
          };
          get_refresh_token.send(JSON.stringify({
            'refresh_token': refresh_token
          }))
        },
        600000
      )
      // Get User information
      this.getUser();
      // Upload Discover Weekly
      this.getDiscoverWeekly();
      // Check Now Playing
      setIntervalAsync(
        async () => {
          let response = await spotifyApi.getMyCurrentPlaybackState();
          if (response === '') {
            return;
          }
          this.setState({
            nowPlaying: {
              isPlaying: response.is_playing,
              id: response.item.id,
              name: response.item.name,
              artist: response.item.artists[0].name,
              album: response.item.album.name,
              duration_ms: response.item.duration_ms,
              progress_ms: response.progress_ms,
              uri: response.item.uri,
              image: response.item.album.images[0].url
            }
          })
        },
        1000
      );
    }

    this.getUser = this.getUser.bind(this);
    this.getDiscoverWeekly = this.getDiscoverWeekly.bind(this);
    this.search = this.search.bind(this);
    this.beginPlayback = this.beginPlayback.bind(this);
    this.endPlayback = this.endPlayback.bind(this);
    this.saveTrack = this.saveTrack.bind(this);
    this.unsaveTrack = this.unsaveTrack.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  async getUser() {
    let user = await spotifyApi.getMe()
    console.log("User information:", user);
    this.setState({
      username: user.display_name,
      userID: user.id,
    })
  }

  async getDiscoverWeekly() {
    try {
      // Get List of User's Playlists
      let playlist = await spotifyApi.getUserPlaylists({limit: 50})
        .then(function(playlists) {
          return playlists.items.map(pl => ({
            name: pl.name,
            id: pl.id,
          })).filter(item => item.name === "Discover Weekly");
        }, function(err) {
          console.error(err);
        })
      // Get user's Discover Weekly recommendations
      let discoverWeekly = await spotifyApi.getPlaylistTracks(this.state.username, playlist[0].id)
        .then(function(playlist) {
          let tracks = playlist.items.map(track => ({
            id: track.track.id,
            name: track.track.name.substring(0, 40),
            artist: track.track.artists[0].name.substring(0, 70),
            album: track.track.album.name.substring(0, 70),
            duration_ms: track.track.duration_ms,
            uri: track.track.uri
          }))
          return tracks;
        }, function(err) {
          console.error(err);
        })
      // Add Discover Weekly tracks to the app's state
      this.setState({ recommendations: discoverWeekly });
      // Get List of Discover Weekly recommendations' audio features
      let features = await spotifyApi.getAudioFeaturesForTracks(discoverWeekly.map(track => track.id))
        .then(function(data) {
          if(!data["audio_features"]) {
            return [];
          }
          return data["audio_features"].map(track => ({
            id: track.id,
            danceability: track.danceability,
            energy: track.energy,
            key: track.key,
            loudness: track.loudness,
            mode: track.mode,
            speechiness: track.speechiness,
            acousticness: track.acousticness,
            instrumentalness: track.instrumentalness,
            liveness: track.liveness,
            valence: track.valence,
            tempo: track.tempo,
            time_signature: track.time_signature,
          }));
        });
      // Combine the two lists above that were just created
      songRecommendations = discoverWeekly.map((item,i) => {
        if(item.id === features[i].id) {
          return Object.assign({},item,features[i]);
        }
      });
      console.log('Discover Weekly:', songRecommendations);
    } catch(err) {
      console.error(err);
    }
  }

  async search(term) {
    var results = await spotifyApi.searchTracks('artist:'+term)
      .then(function(data) {
        if(!data.tracks) {
          return [];
        }
        return data.tracks.items.map(track => ({
          id: track.id,
          name: track.name.substring(0, 40),
          artist: track.artists[0].name.substring(0, 70),
          album: track.album.name.substring(0, 70),
          uri: track.uri
        }))
      }, function(err) {
        console.error(err);
      })
    console.log('Search Results:', results);
    this.setState({ searchResults: results });
    timeline.push({
      type: "search",
      time_stamp: Date.now()-timeStart,
      artist: term,
    });
  }

  async beginPlayback(uri) {
    let nowPlaying = this.state.nowPlaying;
    if(uri) {
      if(nowPlaying) {
        timeline.push({
          type: "play",
          time_stamp: Date.now()-timeStart-nowPlaying.progress_ms,
          time_end: Date.now()-timeStart,
          id: nowPlaying.id,
          name: nowPlaying.name,
          artist: nowPlaying.artist,
          album: nowPlaying.album,
          duration_ms: nowPlaying.duration_ms,
          progress_ms: nowPlaying.progress_ms,
        })
      }
      await spotifyApi.play({'uris':[uri]}, function(err, data) {
        console.log(err);
        console.log(data);
      });
      timeline.push({
        type: "play",
        time_stamp:Date.now()-timeStart,
        id: nowPlaying.id,
        name: nowPlaying.name,
        artist: nowPlaying.artist,
        album: nowPlaying.album,
        duration_ms: nowPlaying.duration_ms,
        progress_ms: nowPlaying.progress_ms,
      })
    } else {
      await spotifyApi.play({}, function(err, data) {
        console.log(err);
        console.log(data);
      });
    }
  }

  endPlayback(uri) {
    if (this.state.nowPlaying === {}) {
      return;
    }
    spotifyApi.pause({}, function(err, data) {
      console.log(err);
      console.log(data);
    });
  }

  saveTrack(track) {
    spotifyApi.addToMySavedTracks([track])
    let dwObject = this.state.recommendations.filter(function(song){
      return song.id === track;
    });
    let searchObject = this.state.searchResults.filter(function(song){
        return song.id === track;
    });
    let trackObject = dwObject===[] ? searchObject : dwObject;
    console.log(trackObject);
    timeline.push({
      type: "save",
      time_stamp: Date.now()-timeStart,
      id: track,
      name: trackObject.name,
      artist: trackObject.artist,
      album: trackObject.album,
      duration_ms: trackObject.duration_ms,
    });
  }

  unsaveTrack(track) {
    spotifyApi.removeFromMySavedTracks([track])
    let dwObject = this.state.recommendations.filter(function(song){
      return song.id === track;
    });
    let searchObject = this.state.searchResults.filter(function(song){
        return song.id === track;
    });
    let trackObject = dwObject===[] ? searchObject : dwObject;
    console.log(trackObject);
    timeline.push({
      type: "unsave",
      time_stamp: Date.now()-timeStart,
      id: track,
      name: trackObject.name,
      artist: trackObject.artist,
      album: trackObject.album,
      duration_ms: trackObject.duration_ms,
    });
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if(tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    console.log(track);
    timeline.push({
      type: "add",
      time_stamp: Date.now()-timeStart,
      id: track.id,
      name: track.name,
      artist: track.artist,
      album: track.album,
      duration_ms: track.duration_ms,
    });
    tracks.push(track);
    this.setState({ playlistTracks: tracks });
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);
    console.log(track);
    timeline.push({
      type: "remove",
      time_stamp: Date.now()-timeStart,
      id: track.id,
      name: track.name,
      artist: track.artist,
      album: track.album,
      duration_ms: track.duration_ms,
    });
    this.setState({ playlistTracks: tracks });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  async savePlaylist(name) {
    let nowPlaying = this.state.nowPlaying;
    if(nowPlaying) {
      timeline.push({
        type: "play",
        time_stamp:Date.now()-timeStart-nowPlaying.progress_ms,
        time_end: Date.now()-timeStart,
        id: nowPlaying.id,
        name: nowPlaying.name,
        artist: nowPlaying.artist,
        album: nowPlaying.album,
        duration_ms: nowPlaying.duration_ms,
        progress_ms: nowPlaying.progress_ms,
      })
    }
    const trackUris = this.state.playlistTracks.map(track => track.uri);
    if(!name || !trackUris) {
      return;
    }
    let newPlaylist = await spotifyApi.createPlaylist(this.state.userID, {name: this.state.playlistName})
      .then(function(data) {
        return data.id
      })
    console.log(timeline);
    console.log(songRecommendations);
    var save_request = new XMLHttpRequest();
    save_request.open('POST', '/save_data', true);
    save_request.setRequestHeader("Content-type", "application/json");
    save_request.send(JSON.stringify({id: this.state.userID, data: timeline, type: "timeline"}));
    var save_songs = new XMLHttpRequest();
    save_songs.open('POST', '/save_data', true);
    save_songs.setRequestHeader("Content-type", "application/json");
    save_songs.send(JSON.stringify({id: this.state.userID, data: songRecommendations, type:"recommendations"}));
    spotifyApi.addTracksToPlaylist(this.state.userID, newPlaylist, trackUris);
    confirmExit = false;
    alert("You have successfully created a new playlist called " + this.state.playlistName +
      ". You may now exit the experiment. Feel free to revisit next week " +
      "once your Discover Weeekly playlist has reset!");
  }

  render() {
    let isLoggedIn = this.state.isLoggedIn;

    if (isLoggedIn === false) {
      return (
        <div>
          <h1>Music Discovery with <span className="highlight">Spotify</span></h1>
          <div className="App">
            <Login logIn={() => {confirmExit=false;}}/>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <h1>Music Discovery with <span className="highlight">Spotify</span></h1>
          <h2 className="welcome">Welcome, {this.state.username}!</h2>
          <div className="App">
            <div className="App-top">
              <NowPlaying currentTrack={this.getDiscoverWeekly}
                trackName={this.state.nowPlaying.name}
                trackArtist={this.state.nowPlaying.artist}
                trackImage={this.state.nowPlaying.image}/>
              <SearchBar onSearch={this.search}/>
            </div>
            <div className="App-playlist">
              <DiscoverWeekly tracks={this.state.recommendations}
                nowPlaying={this.state.nowPlaying}
                onSave={this.saveTrack}
                onUnsave={this.unsaveTrack}
                onAdd={this.addTrack}
                onPlay={this.beginPlayback}
                onPause={this.endPlayback}/>
              <SearchResults tracks={this.state.searchResults}
                nowPlaying={this.state.nowPlaying}
                onSave={this.saveTrack}
                onUnsave={this.unsaveTrack}
                onChange={this.updateSearchResults}
                onAdd={this.addTrack}
                onPlay={this.beginPlayback}
                onPause={this.endPlayback}/>
              <Playlist playlistName={this.state.playlistName}
                playlistTracks={this.state.playlistTracks}
                nowPlaying={this.state.nowPlaying}
                onSave={this.saveTrack}
                onUnsave={this.unsaveTrack}
                onRemove={this.removeTrack}
                onNameChange={this.updatePlaylistName}
                onSavePlaylist={this.savePlaylist}
                onPlay={this.beginPlayback}
                onPause={this.endPlayback}/>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default App;
