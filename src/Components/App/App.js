import './App.css';
import React from 'react';
import {SearchBar} from '../SearchBar/SearchBar';
import {SearchResults} from '../SearchResults/SearchResults';
import {Playlist} from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      searchResults: [],
      playlistName: "Awesome mix vol 1",
      playlistTracks: [],
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search=this.search.bind(this);
    this.pageReloads = this.pageReloads.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if(tracks.find(current => current.id === track.id)){
      return;
    }else{
      tracks.push(track);
      this.setState({
        playlistTracks: tracks
      })
    }
  }

  removeTrack(track){
    let newArray = this.state.playlistTracks;
    newArray = newArray.filter(current => current.id !== track.id);
    this.setState({
      playlistTracks: newArray
    })
  }

  updatePlaylistName(name){
    this.setState({
      playlistName: name
    })
  }

  async savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(track => track.uri);
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({
      playlistName:'New Playlist',
      playlistTracks: []
    })
  }

  search(term) {
    Spotify.search(term).then(result => {
      this.setState({searchResults: result})
    })
    console.log(this.state.searchResults)
  }

  pageReloads() {
    const term = localStorage.getItem('term');
    if(term){
      localStorage.removeItem('term');
      this.search(term);
    }
  }

  render() {
    return(
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
          <SearchResults searchResults={this.state.searchResults} 
                         onAdd={this.addTrack}
          />
          <Playlist playlistName={this.state.playlistName}
                    playlistTracks={this.state.playlistTracks} 
                    onRemove={this.removeTrack} 
                    onNameChange={this.updatePlaylistName}
                    onSave={this.savePlaylist}
          />
          </div>
        </div>
      </div>
    )
  }

  componentDidMount(){
    window.addEventListener('load', this.pageReloads);
  }
}



export default App;
