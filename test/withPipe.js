var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
  }

//tape('ecrypt then pipe to decrypt then pipe to collect values', function(t) {
 //t.plan(1)
  var vals = ['one', 'two', 'three', 'four']
  pull(
    pull.infinite(),
    encrypt(opts),
    decrypt(opts),
    pull.log()
      //t.equal(vals.join(''), result.join(''), "Values should be same after being encrypted and then decrypted")
    //})
  )
//})
