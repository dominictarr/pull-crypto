var cryptoStreams = require('../index.js'),
  encoder = cryptoStreams.encoder,
  decoder = cryptoStreams.decoder,
  c = require('crypto'),
  pull = require('pull-stream'),
  tape = require('tape'),
  errors = []

// This test runs all the ciphers available on your system
// All the ciphers do not work on my system so this test only shows the errors
// not sure if this is a bug with node's crypto or if I'm doing something wrong


var ciphers = [
  'aes-256-cbc',
  'aes128', 'aes192', 'aes256', 'bf', 'blowfish', 'cast', 'des', 'des3', 'desx', 'idea', 'rc2', 'seed'
]

//c.getCiphers()

ciphers.forEach(function(ciph, i) {

tape('encode and decode using ' + ciph, function(t) {
  var vals = ['node issue # 6477 told me to make input to xts',
              'more than 16bytes so that is what i am doing so this should work']

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
      algorithm : ciphers[i]
    };

    pull(
      pull.values(vals),
      encoder(opts),
      decoder(opts),
      pull.collect(function(err, result) {
        if (err) {
          t.notOk(err === null, "Failed while trying cipher : " + ciph)
          var errObj = {
            error : err,
            cipher : ciphers[i]
          }
        } else {
          t.equal(vals.join(''), result[0], "Results should be the same as original values before encoding for Cipher : " + ciph)
            t.end()
        }
      })
    )

  })
})
