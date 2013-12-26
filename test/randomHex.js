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
    
  },
  seeThrough = pull.Through(function(read, map) {
    return function (end, cb) {
      read(end, function next(end, data) {
        if (end === true) {
          return cb(true)
        } else {
          map(data)
        }
        if (end !== true) {
          read(end, next)
        }
      })
    }
  }),
  fin = curry(function (read) {
    read(null)
  }),
  count = 0

var random = []
var results = []
for (var i = 0; i < 10; i += 1) {
  random.push(genData())
}
tape('generate 10 random hex values, encrypt and decrypt them and see if they match the original hex value', function(t) {
  
  pull(
    pull.values(random),
    encrypt(opts),
    decrypt(opts),
    seeThrough(function(data) {
      results.push(data)
      if (++count >= (random.length + 1)) {
        t.equal(random.join(''), results.join(''), "Whole string should be equal even if chunks are broken up")
        t.end()
      }
    }),
    fin()
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