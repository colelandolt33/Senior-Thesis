import React from 'react';

import './Playlist.css';

import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.handleNameChange = this.handleNameChange.bind(this);
  }

  handleNameChange(event) {
    this.props.onNameChange(event.target.value);
  }

  render() {
    return (
      <div className="Playlist">
        <input defaultValue={this.props.playlistName}
          onChange={this.handleNameChange}/>
        <TrackList tracks={this.props.playlistTracks}
          nowPlaying={this.props.nowPlaying}
          onSave={this.props.onSave}
          onUnsave={this.props.onUnsave}
          onPlay={this.props.onPlay}
          onPause={this.props.onPause}
          onRemove={this.props.onRemove}
          isRemoval={true}/>
        <button className="Playlist-save"
          onClick={this.props.onSavePlaylist}>SAVE TO SPOTIFY</button>
      </div>
    )
  }
}

export default Playlist;
