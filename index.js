const Spotify = require('./spotifyApp')
const config = require('./config')
const xml2js = require('xml2js')
const fs = require('fs')

const followArtist = false
const addToFavorite = false;

(async () => {

  let notFindTracks = []
  let instance = new Spotify(config.accessToken, config.playlistName)
  await instance.init()

  let parser = new xml2js.Parser()
  let playlistJS = await asyncReaderXML(parser)
  let root = playlistJS.plist.dict[0].dict[0].dict

  for (let x = 0; x < root.length; x++) {
    let track = await instance.findTrack(root[x].string[0], root[x].string[1], followArtist)
    if (!track) {
      notFindTracks.push({'name': root[x].string[0], 'artist': root[x].string[1]})
    } else {
      if (addToFavorite) {
        await instance.addTrackToFavorite(track.id)
      }
      if (instance.playlistTracks.indexOf(track.uri) === -1) {
        await instance.addTracksToPlaylistByUri(track.uri)
      }
    }
  }
})
()

function asyncReaderXML(parser) {
  return new Promise((resolve, reject) => {
    fs.readFile('./playlist.xml', function (err, data) {
      parser.parseString(data, function (err, result) {
        resolve(result)
      })
    })
  })
}