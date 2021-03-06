const axios = require('axios');

class Spotify {
  userId
  playlistId
  playlistTracks

  constructor(accessToken, playlistName) {
    this.accessToken = accessToken
    this.playlistName = playlistName
  }

  async init() {
    // [this.userId, this.playlistId] = await Promise.all([this.getUserId(), this.getPlaylist(playlistName)])
    this.userId = await this.getUserId()
    this.playlistId = await this.getPlaylist()
    this.playlistTracks = await this.getPlaylistTracks()
  }

  async getUserId() {
    try {
      const result = await axios.get('https://api.spotify.com/v1/me/', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      return result.data.id
    } catch (err) {
      throw err
    }
  }

  async getPlaylist() {
    let playlistId = await this.findPlaylist(this.playlistName)
    if (!playlistId) {
      playlistId = await this.createPlaylist(this.playlistName)
    }
    return playlistId
  }

  async findPlaylist(playlistName) {
    try {
      const result = await axios.get(`https://api.spotify.com/v1/users/${this.userId}/playlists?limit=10&offset=0`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
      for (let playlist of result.data.items) {
        if (playlist.name === playlistName) {
          return playlist.id
        }
      }
      return null
    } catch (err) {
      throw err
    }
  }

  async createPlaylist(playlistName) {
    try {
      const result = await axios.post(`https://api.spotify.com/v1/users/${this.userId}/playlists`, {
            'name': playlistName,
            'description': '',
            'public': false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
      return result.data.id;
    } catch (err) {
      throw err
    }
  }

  async getPlaylistTracks() {
    let list = []
    try {
      const result = await axios.get(`https://api.spotify.com/v1/playlists/${this.playlistId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
      for (let track of result.data.tracks.items) {
        list.push(track.track.uri)
      }
      return list
    } catch (err) {
      throw err
    }
  }

  async findTrack(trackName, artistName, followArtist = false) {
    let encodedTrackName = encodeURIComponent(trackName)
    try {
      const result = await axios.get(`https://api.spotify.com/v1/search?q=${encodedTrackName}&type=track&limit=20`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      for (let track of result.data.tracks.items) {
        for (let artist of track.artists) {
          if (artist.name === artistName) {
            if (followArtist) {
              if (!await this.checkIfArtistAlreadyFollowed(artist.id)) {
                await this.followArtistByUri(artist.id)
              }
            }
            return {'uri': track.uri, 'id': track.id}
          }
        }
      }
      return null
    } catch (err) {
      throw err
    }
  }

  async addTracksToPlaylistByUri(trackUri) {
    try {
      await axios.post(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks?uris=${trackUri}`,
          null,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
    } catch (err) {
      throw err
    }
  }

  async followArtistByUri(artistUri) {
    try {
      await axios.post(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistUri}`,
          null,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
    } catch (err) {
      throw err
    }
  }

  async checkIfArtistAlreadyFollowed(artistUri) {
    try {
      const result = await axios.get(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistUri}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
      return result.data[0]
    } catch (err) {
      throw err
    }
  }

  async addTrackToFavorite(trackId) {
    try {
      await axios.put(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`,
          null,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
    } catch (err) {
      throw err
    }
  }
}

module.exports = Spotify