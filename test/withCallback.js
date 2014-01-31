var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  pass = 'secret'
  opts = {
    password : 'secret',
    encrypt : {
      inputEncoding : 'ascii',
      encoding : 'hex'
    },
    decrypt : {
      inputEncoding : 'hex',
      encoding : 'ascii'
    }
  };

// Since every chunk is encrypted individually it has to be decrypted in those same chunks
// If you use callback style you must not concat encrypted chunks before sending to decrypt, you must keep them seperate
// you will receive an array of encrypted data and an array of decrypted data
// you have to feed decrypt an array of encryted data and then use decrypted.join('') (for strings, use concat for Buffers) to get back
// the full message after decryption
tape('ecrypt and decrypt into callback', function(t) {
  t.plan(1)
  var vals = ['onesupercallafragalisticespeyalladoeshus', 'two', 'three', 'four']
  pull(
    pull.values(vals),
    encrypt({
      password : pass,
      encoding : 'hex'
    }, function(err, encrypted) {
      if (err) {
        throw err
      }
      pull(pull.values(encrypted), decrypt({
        password : pass,
        inputEncoding : 'hex',
        encoding : 'ascii'
      }, function(err, decrypted) {
        if (err) {
          throw err
        }
        t.equal(vals.join(''), decrypted.join(''), "Original values and decrypted values should match")
      }))
    })
  )
})
