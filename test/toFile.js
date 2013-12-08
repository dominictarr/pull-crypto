var cryptoStreams = require('../index.js'),
  encoder = cryptoStreams.encoder,
  decoder = cryptoStreams.decoder,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  fs = require('fs'),
  thisFile = fs.createReadStream(__filename, {encoding : 'ascii'}),
  writeStream = fs.createWriteStream('./output.txt', {encoding : 'ascii'}),
  opts = {
    encrypt : {
      inputEncoding : 'ascii',
      encoding : 'base64'
    },
    decrypt : {
      inputEncoding : 'base64',
      encoding : 'ascii'
    },
    password : 'secret',
  };

tape('read file then encrypt data write encrypted data to file decrypt encrypted file data', function(t) {
  t.plan(1)
  toPull(thisFile)
    .pipe(encoder(opts))
    .pipe(toPull(writeStream))

  writeStream.on('close', function() {
    pull(
      toPull(fs.createReadStream('./output.txt', {encoding : 'ascii'})),
      decoder(opts, function(err, result) {
        if (err) throw err
        toPull(fs.createReadStream(__filename, {encoding : 'ascii'}))
          .pipe(pull.collect(function(err, file) {
            if (err) throw err
            t.equal(file[0], result, "File data should be same as the result of decrypting the encrypted file data we just wrote")
            fs.unlinkSync('./output.txt')
          }))
      })
    )
  })
})