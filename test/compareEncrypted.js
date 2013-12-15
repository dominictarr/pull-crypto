var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  fs = require('fs'),
  opts = {
    password : 'secret',
  };
  thisFile = fs.createReadStream(__filename, {encoding : 'utf8'});



tape('read file 2 times and collect encrypted text and check it it matches', function(t) {
  t.plan(3)
  var encrypted1, encrypted2
  // read file encode text collect encrypted text in variable
  pull(
    toPull(thisFile),
    encrypt(opts),
    decrypt(opts),
    pull.collect(function(err, a) {
      if (err) throw err
      encrypted1 = Buffer.concat(a, totalLength(a))
      t.ok(encrypted1, "Should not be empty")
    })
  )
  thisFile.on('end', function() {
    toPull(fs.createReadStream(__filename, {encoding : 'utf8'}))
      .pipe(encrypt(opts))
      .pipe(decrypt(opts))
      .pipe(pull.collect(function(err, b) {
        if (err) throw err
        encrypted2 = Buffer.concat(b, totalLength(b))
        t.ok(encrypted2, "Should not be empty")
        t.equal(encrypted1.toString('utf8'), encrypted2.toString('utf8'), "Both should be equal")
      }))
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


