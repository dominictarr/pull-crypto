var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  fs = require('fs'),
  pass = 'secret',
  thisFile = fs.createReadStream(__filename);



tape('read file 2 times and collect encrypted text and check it it matches', function(t) {
  var encrypted1, encrypted2

  // read file --> encrypt text --> collect encrypted text in variable
  pull(
    toPull(thisFile),
    encrypt({password : pass}),
    decrypt({password : pass}),
    pull.collect(function(err, a) {
      if (err) throw err
      encrypted1 = Buffer.concat(a, totalLength(a))
      t.ok(Buffer.isBuffer(encrypted1), "Should be buffer")
    })
  )
  thisFile.on('end', function() {
    pull(
      toPull(fs.createReadStream(__filename)),
      encrypt({password : pass}),
      decrypt({password : pass}),
      pull.collect(function(err, b) {
        if (err) throw err
        encrypted2 = Buffer.concat(b, totalLength(b))
        t.ok(Buffer.isBuffer(encrypted2), "Should be buffer")
        t.equal(encrypted1.toString('utf8'), encrypted2.toString('utf8'), "Both should be equal")
        t.end()
      })
    )
  })
})

function totalLength(buffArray) {
  var total = 0
  buffArray.forEach(function(buff) {
    if (Buffer.isBuffer(buff)) {
      total += buff.length
      return
    }
  })
  return total
}


