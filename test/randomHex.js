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
          cb(true)
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
    read(null, function next (end, data) {
        if(end === true) {
          return
        }
        if (end !== true) {
          read(null, next)
        }
      })
  }),
  count = 0

var random = []
var results = []
for (var i = 0; i < 10; i += 1) {
  random.push(genData())
}
console.dir(random)
tape('generate 10 random hex values, encrypt and decrypt them and see if they match the original hex value', function(t) {
  
  pull(
    pull.values(random),
    encrypt(opts),
    decrypt(opts),
    seeThrough(function(data) {
      t.equal(random[count], data, "Each decrypted chunk should be equal to original array item sent to be encrypted")
      results.push(data)
      if (++count >= 12) {
        console.dir(results)
        t.end()
        return
      }
      return
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