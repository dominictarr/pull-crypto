var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  crypto = require('crypto'),
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
    
  }

var random = []
for (var i = 0; i < 1000; i += 1) {
  random.push(genData())
}
//tape('ecrypt then pipe to decrypt then pipe to collect values', function(t) {
 //t.plan(1)
  var vals = ['one', 'two', 'three', 'four']
  pull(
    pull.values(random),
    encrypt(opts),
    decrypt(opts),
    pull.log()
      //t.equal(vals.join(''), result.join(''), "Values should be same after being encrypted and then decrypted")
    //})
  )
//})


function genData() {
  var bytes = 30
  return crypto.pseudoRandomBytes(bytes).toString('hex')
}