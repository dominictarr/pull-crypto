var cryptoStreams = require('../index.js'),
  encoder = cryptoStreams.encoder,
  decoder = cryptoStreams.decoder,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  hq = require('hyperquest'),
  opts = {
    encrypt : {
      inputEncoding : 'utf8',
      encoding : 'base64'
    },
    decrypt : {
      inputEncoding : 'base64',
      encoding : 'utf8'
    },
    password : 'secret',
  };

tape('encode and decode multi chunk network data source', function(t) {
  var fromNPM = '',
      afterDecrypt = ''
  t.plan(1)
  toPull(hq('http://registry.npmjs.org/pull-stream'))
    .pipe(pull.collect(function(err, result) {
      fromNPM = result.toString()
      pull(
        pull.values([fromNPM]),
        encoder(opts),
        decoder(opts, function(err, result) {
          if (err) throw err
          afterDecrypt = result
          t.equal(fromNPM, afterDecrypt, "Result collected from Registry should match decrypted text")
        })
      )
    }))
})
