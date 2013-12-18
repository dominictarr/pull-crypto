var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
  };

// Since every chunk is encrypted individually it has to be decrypted in those same chunks
// If you use callback style you must not concat encrypted chunks before sending to decrypt, you must keep them seperate
// you will receive an array of encrypted data and an array of decrypted data
// you have to feed decrypt an array of encryted data and then use decrypted.join('') to get back
// the full message after decryption
tape('ecrypt and decrypt into callback', function(t) {
  t.plan(1)
  var vals = ['onesupercallafragalisticespeyalladoeshus', 'two', 'three', 'four']
  pull(
    pull.values(vals),
    encrypt(opts, function(err, encrypted) {
      if (err) {
        console.dir(err)
        throw err.error
      }
      pull(pull.values(encrypted), decrypt(opts, function(err, decrypted) {
        if (err) {
          console.dir(err)
          throw err.error
        }
        t.equal(vals.join(''), decrypted.join(''), "Original values and decrypted values should match")
      }))
    })
  )
})
