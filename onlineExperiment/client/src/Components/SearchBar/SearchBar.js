import React from 'react';

import './SearchBar.css';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      term: ''
    }

    this.handleTermChange = this.handleTermChange.bind(this);
    this.search = this.search.bind(this);
  }

  search() {
    this.props.onSearch(this.state.term);
  }

  handleTermChange(event) {
    this.setState({ term: event.target.value });
  }

  render() {
    return (
      <div className="SearchBar">
        <input onChange={this.handleTermChange}
          placeholder="Search for an Artist" />
        <button onClick={this.search}
          className="SearchButton">SEARCH</button>
      </div>
    )
  }
}

export default SearchBar;
