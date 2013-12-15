var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    encrypt : {
      encoding : 'base64'
    },
    decrypt : {
      encoding : 'utf8'
    },
    password : 'secret',
  };

tape('ecrypt then pipe to decrypt then pipe to collect values', function(t) {
  t.plan(1)
  var vals = ['one', 'two', 'three', 'four']
  pull(
    pull.values(vals),
    encrypt(opts),
    decrypt(opts),
    pull.collect(function(err, result) {
      t.equal(vals.join(''), result[0], "Values should be same after being encrypted and then decrypted")
    })
  )
})
