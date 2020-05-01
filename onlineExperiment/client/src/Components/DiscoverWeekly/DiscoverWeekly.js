import React from 'react';

import './DiscoverWeekly.css';

import TrackList from '../TrackList/TrackList';

class DiscoverWeekly extends React.Component {
  render() {
    return (
      <div className="DiscoverWeekly">
        <h2>Discover Weekly</h2>
        <TrackList tracks={this.props.tracks}
          nowPlaying={this.props.nowPlaying}
          onSave={this.props.onSave}
          onUnsave={this.props.onUnsave}
          onPlay={this.props.onPlay}
          onPause={this.props.onPause}
          onAdd={this.props.onAdd}
          isRemoval={false}/>
      </div>
    )
  }
}

export default DiscoverWeekly;
