var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
    decrypt : {
      encoding : 'ascii'
    }
  };

tape('buffer in string out', function(t) {
  t.plan(3)
  pull.values([new Buffer('buffer goes in and string comes out')])
    .pipe(encrypt(opts))
    .pipe(pull.collect(function(err, r) {
      if (err) throw err
      var encrypted = (Buffer.isBuffer(r[0]) === true ? Buffer.concat(r, totalLength(r)) : r.join(''))
      t.equal(Buffer.isBuffer(encrypted), true, "Should receive buffer after encryption")
      pull.values([encrypted])
        .pipe(decrypt(opts))
        .pipe(pull.collect(function(err, d) {
          if (err) throw err
          console.log("Received back from decrypt, a buffer? " + Buffer.isBuffer(d))
          var decrypted = d.join('')
          t.equal(Buffer.isBuffer(decrypted), false, "Should receive string after decryption")
          t.equal('buffer goes in and string comes out', decrypted, "original string put into buffer should match the decrypted text")
        }))
    }))
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
