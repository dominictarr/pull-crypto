var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  opts = {
    password : 'secret',
  };

tape('buffer is default output', function(t) {
  t.plan(3)
  pull.values([new Buffer('buffer goes in and buffer comes out')])
    .pipe(encrypt(opts))
    .pipe(pull.collect(function(err, r) {
      if (err) throw err
      var encrypted = (Buffer.isBuffer(r[0]) === true ? Buffer.concat(r, totalLength(r)) : r.join(''))
      t.equal(Buffer.isBuffer(encrypted), true, "Should receive buffer after encryption")
      pull.values([encrypted])
        .pipe(decrypt(opts))
        .pipe(pull.collect(function(err, d) {
          if (err) throw err
          var decrypted = (Buffer.isBuffer(d[0]) === true ? Buffer.concat(d, totalLength(d)) : d.join(''))
          t.equal(Buffer.isBuffer(decrypted), true, "Should receive buffer after decryption")
          t.equal('buffer goes in and buffer comes out', decrypted.toString('utf8'), "buffer to string decrypted message should match original messase before encryption")
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
