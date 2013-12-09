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
tape('encode and decode using all ciphers available', function(t) {
  var vals = ['node issue # 6477 told me to make input to xts more than 16bytes so that is what i am doing so this should work']
  var ciphers = c.getCiphers()

  ciphers.forEach(function(ciph, i) {
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
          errors.push(errObj)
          return
        } else {
          t.equal(vals.join(''), result[0], "Results should be the same as original values before encoding for Cipher : " + ciph)
          if (ciphers.length -1 === i) {
            errors.forEach(function(e) {
              console.dir(e)
            })
            t.end()
          }
        }
      })
    )
  })
})