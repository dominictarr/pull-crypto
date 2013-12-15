var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
    decrypt : {
      encoding : 'utf8'
    }
  };

tape('ecrypt and decrypt into callback', function(t) {
  t.plan(1)
  var vals = ['one', 'two', 'three', 'four']
  pull(
    pull.values(vals),
    encrypt(opts),
    decrypt(opts, function(err, result) {
        console.dir(result)
        t.equal(vals.join(''), result, "Values should be same after being encrypted and then decrypted")
    })
  )
})
