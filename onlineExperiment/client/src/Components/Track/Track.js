import React from 'react';

import './Track.css';

class Track extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      saved: false,
    }

    this.saveTrack = this.saveTrack.bind(this);
    this.unsaveTrack = this.unsaveTrack.bind(this);
    this.playTrack = this.playTrack.bind(this);
    this.pauseTrack = this.pauseTrack.bind(this);
    this.checkNowPlaying = this.checkNowPlaying.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }

  playback() {
    if(this.props.uri === this.props.nowPlaying.uri && this.props.nowPlaying.isPlaying) {
      return <button className="Track-action"
        onClick={this.pauseTrack}>&#10074;&#10074;</button>
    } else {
      return <button className="Track-action"
        onClick={this.playTrack}>&#x25B6;</button>
    }
  }

  heart() {
    if(this.state.saved === true) {
      return <button className="Track-action"
        onClick={this.unsaveTrack}>&#x2665;</button>
    } else {
      return <button className="Track-action"
        onClick={this.saveTrack}>&#x2661;</button>
    }
  }

  renderAction() {
    if(this.props.isRemoval) {
      return <button className="Track-action"
        onClick={this.removeTrack}>-</button>
    } else {
      return <button className="Track-action"
        onClick={this.addTrack}>+</button>
    }
  }

  saveTrack() {
    this.props.onSave(this.props.id);
    this.setState({ saved: true });
  }

  unsaveTrack() {
    this.props.onUnsave(this.props.id);
    this.setState({ saved: false });
  }

  pauseTrack() {
    this.props.onPause();
    //this.setState({ isPlaying: false });
  }

  playTrack() {
    if(this.props.nowPlaying.uri === this.props.uri) {
      this.props.onPlay();
    } else {
      this.props.onPlay(this.props.uri);
    }
    //this.setState({ isPlaying: true });
  }

  checkNowPlaying() {
    this.setState({ isPlaying: this.props.nowPlaying.isPlaying});
  }

  addTrack() {
    this.props.onAdd(this.props.track);
  }

  removeTrack() {
    this.props.onRemove(this.props.track);
  }

  render() {
    return (
      <div className="Track">
        <div className="Track-information">
          <h3>{this.props.track.name}</h3>
            <p>{this.props.track.artist} | {this.props.track.album}</p>
        </div>
        {this.playback()}
        {this.heart()}
        {this.renderAction()}
      </div>
    )
  }
}

export default Track;
