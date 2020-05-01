import React from 'react';

import './NowPlaying.css';

class NowPlaying extends React.Component {
  render() {
    if(this.props.trackName) {
      return (
        <div className="NowPlaying">
          <h2>Now Playing:</h2>
          <img src={ this.props.trackImage } style={{width: 150}} alt=""/>
          <h3>{ this.props.trackName } by {this.props.trackArtist}</h3>
        </div>
      )
    } else {
      return (
        <div className="NowPlaying">
          <h2>Now Playing:</h2>
          <h3>Please play a song in the Spotify Application on your preferred device before beginning.</h3>
        </div>
      )
    }

  }
}

export default NowPlaying;
