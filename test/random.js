var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  crypto = require('crypto'),
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
    encrypt : {
      inputEncoding : 'hex',
      encoding : 'base64'
    },
    decrypt : {
      inputEncoding : 'base64',
      encoding : 'hex'
    }
    
  }

var random = []
for (var i = 0; i < 10; i += 1) {
  random.push(genData())
}
tape('generate 1000 random hex values, encrypt and decrypt them and see if they match the original hex value', function(t) {
  
  pull(
    pull.values(random),
    encrypt(opts),
    decrypt(opts),
    pull.collect(function(err, r) {
      t.equal(r.join(''), random.join(''))
      t.end()
    })
  )
})


function genData() {
  var bytes = 30
  return crypto.pseudoRandomBytes(bytes).toString('hex')
}

function curry (fun) {
  return function () {
    var args = [].slice.call(arguments)
    return function (read) {
      args.unshift(read)
      return fun.apply(null, args)
    }
  }
}