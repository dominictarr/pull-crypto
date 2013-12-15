var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
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
  pull(
    toPull(thisFile),
    encrypt(opts),
    toPull(writeStream)
  )
  writeStream.on('close', function() {
    pull(
      toPull(fs.createReadStream('./output.txt', {encoding : 'ascii'})),
      decrypt(opts, function(err, result) {
        if (err) throw err
        pull(
          toPull(fs.createReadStream(__filename)),
          pull.collect(function(err, file) {
            t.equal(file.join(''), result, "File data should be same as the result of decrypting the encrypted file data we just wrote")
            // clean up
            fs.unlinkSync('./output.txt')
          })
        )
      })
    )
  })
})