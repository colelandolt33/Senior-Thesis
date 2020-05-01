import React from 'react';

import './SearchResults.css';

import TrackList from '../TrackList/TrackList';

class SearchResults extends React.Component {
  render() {
    return(
      <div className="SearchResults">
        <h2>Search Results</h2>
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

export default SearchResults;
