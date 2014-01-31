var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  crypto = require('crypto'),
  pull = require('pull-stream'),
  tape = require('tape'),
  pass = 'secret',
  seeThrough,
  fin,
  count = 0,
  random = [],
  results = []
  
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
})

for (var i = 0; i < 2; i += 1) {
  random.push(genData(30))
}

tape('generate 10 random hex values, every chunk sent downstream should not be empty and results concatinated should match orginal hex values', function(t) {
  
  pull(
    pull.values(random),
    encrypt({
      password : pass,
      inputEncoding : 'ascii',
      encoding : 'hex'
    }),
    decrypt({
      password : pass,
      inputEncoding : 'hex',
      encoding : 'ascii'
    }),
    seeThrough(function(data) {
      results.push(data)
      t.ok(data.length, "Downstream Data should NOT be an empty string")
      if (count >= random.length + 1) {
        t.equal(results.join(''), random.join(''), "Results concatinated should be same as orginal hex values")
        t.end()
        return
      }
      count += 1
    }),
    pull.log()
  )
})


function genData(bytes) {
  return crypto.pseudoRandomBytes(bytes).toString('hex')
}

