var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  fs = require('fs'),
  thisFile = fs.createReadStream(__filename),
  writeStream = fs.createWriteStream('./output.txt', {encoding : 'ascii'}),
  opts = {
    password : 'secret',
  };

tape('read file then encrypt data write encrypted data to file decrypt encrypted file data', function(t) {
  t.plan(1)
  pull(
    toPull(thisFile),
    encrypt(opts),
    toPull(writeStream)
  )
  writeStream.on('close', function() {
    pull(
      toPull(fs.createReadStream('./output.txt')),
      decrypt(opts),
      pull.collect(function(err, decrypted) {
        if (err) {
          console.dir(err)
          throw err.error
        }
        pull(
          toPull(fs.createReadStream(__filename)),
          pull.collect(function(err, file) {
            if (err) throw err
            t.equal(file.join(''), decrypted.join(''), "File data should be same as the result of decrypting the encrypted file data we just wrote")
            // clean up
            fs.unlinkSync('./output.txt')
          })
        )
        
      })
    )
  })
})