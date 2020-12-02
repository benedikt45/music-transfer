const Spotify = require('./spotifyApp')
const config = require('./config');

(async () => {
  let notFindTracks = []
  let tracksUriToAdd = []
  let instance = new Spotify(config.accessToken, config.playlistName)
  await instance.init()

  let trackUri = await instance.findTrack('Привет', 'Kasta')
  if (!trackUri) {
    notFindTracks.push()
  } else {
    if (instance.playlistTracks.indexOf(trackUri) === -1) {
      tracksUriToAdd.push(trackUri)
    }
  }
  await instance.addTrackListToPlaylist(tracksUriToAdd)
})()
