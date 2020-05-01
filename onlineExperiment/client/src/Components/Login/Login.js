import React from 'react';

import './Login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      readInstructions: false,
    }
  }

  render() {
    let readInstructions = this.state.readInstructions;

    if (readInstructions === false) {
      return (
        <div className="Login">
          <div className="Intro">
            <p>Welcome! This is an experiment where you can interact with your personalized
              Discover Weekly Playlist from Spotify in order to discover
              new songs and artists. We are interested in the process of music
              discovery, so your interactions will be recorded for research
              purposes. Please ensure before beginning the experiment that
              you are in a comfortable setting, free from significant
              distractions, and have plenty of time so that you can engage with
              each song recommendation.</p>
              <p>Note: You must be a Spotify Premium user in order to proceed.</p>
            <button className="Button"
              onClick={() => {this.setState({readInstructions: true})}}>Read Instructions</button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="Login">
          <div className="Intro">
            <h2>Your task is to explore each song from your Discover Weekly
              playlist and save those that you like and would listen to
              in the future to a new playlist!</h2>
            <p>Before proceeding to the experiment, please follow these simple instructions below</p>
          </div>
          <div className="Intro">
            <h2>1) Open Spotify on your preferred device and play your favorite song!</h2>
            <p>Although you will be interacting with your music within this browser, the music
              itself will be playing through Spotify wherever you have it open.</p>
            <p>If you don't have Spotify's Desktop or Mobile Application downloaded, you can
              visit <a href="https://open.spotify.com/" target="_blank">Spotify's Web Player</a> and
              have the window open in the background during the experiment.</p>
            <h2>2) Make sure you’re following your Discover Weekly playlist</h2>
            <img src='img/dw.jpg' className="Image"></img>
            <p style={{alignSelf: 'center'}}>(the heart symbol should be filled in)</p>
            <h2>3) When you enter the experiment... </h2>
            <p>Your Discover Weekly Playlist will be displayed on the left-hand side,
              and a new playlist that you can add songs to will be displayed on the right-hand side.</p>
            <p>- You can listen to each track by clicking the &#x25B6; / &#10074;&#10074; button.</p>
            <img src='img/play.jpg' className="Image"></img>
            <p>- You can save the song to your library by clicking the &#x2661; button.</p>
            <img src='img/like.jpg' className="Image"></img>
            <p>- You can search for other tracks by the artist by entering the artist’s name into the search bar.</p>
            <img src='img/search.jpg' className="Image"></img>
            <p>- You can add songs that you like by pressing the + button.</p>
            <img src='img/add.jpg' className="Image"></img>
            <p>- Lastly, give your playlist a new name</p>
            <img src='img/new_name.gif' className="Image"></img>
            <p>Once you've checked out every song on your Discover Weekly playlist,
              not to mention the others that you may have come across in searches,
              and have saved those that you liked to your newly named playlist,
              go ahead and <strong>save it to Spotify</strong>!</p>
            <p>**You must complete this step before exiting the experiment in
              order for your data to save and your playlist to be created**</p>
            <h2 style={{alignSelf: 'center'}}>You're all set to begin exploring!</h2>
            <a href="/start" style={{alignSelf: 'center'}}>
              <button className="Button"
                onClick={this.props.logIn}>Login with Spotify</button>
            </a>
          </div>
        </div>
      )
    }
  }
}

export default Login;
