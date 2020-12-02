const Spotify = require('./spotifyApp')
const config = require('./config')
const xml2js = require('xml2js')
const fs = require('fs');


(async () => {
  let notFindTracks = []
  let tracksUriToAdd = []
  let instance = new Spotify(config.accessToken, config.playlistName)
  await instance.init()

  let parser = new xml2js.Parser()
  let playlistJS = await asyncReaderXML(parser)
  let root = playlistJS.plist.dict[0].dict[0].dict

  for (let x = 0; x < root.length; x++) {
    let trackUri = await instance.findTrack(root[x].string[0], root[x].string[1])
    if (!trackUri) {
      notFindTracks.push({'name': root[x].string[0], 'artist': root[x].string[1]})
    } else {
      if (instance.playlistTracks.indexOf(trackUri) === -1) {
        // tracksUriToAdd.push(trackUri)
        await instance.addTracksToPlaylistByUris(trackUri)
      }
    }
  }
  // if (tracksUriToAdd.length !==0 ){
  //   await instance.addTracksToPlaylistByUris(tracksUriToAdd)
  // }
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