var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
    encrypt : {
      encoding : 'base64'
    },
    decrypt : {
      inputEncoding : 'base64'
    }
  };

tape('ecrypt and decrypt into callback', function(t) {
  t.plan(1)
  var vals = ['one', 'two', 'three', 'four']
  pull(
    pull.values(vals),
    encrypt(opts, function(err, encrypted) {
      if (err) throw err
      pull(pull.values([encrypted]), decrypt(opts, function(err, decrypted) {
        if (err) throw err
        t.equal(vals.join(''), decrypted, "Original values and decrypted values should match")
      }))
    })
  )
})
