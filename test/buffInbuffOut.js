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
  pull(
    pull.values([new Buffer('buffer goes in and buffer comes out'), new Buffer('and then another one goes in and should come out again')]),
    encrypt(opts),
    pull.collect(function(err, r) {
      if (err) throw err
      var encrypted = Buffer.concat(r, totalLength(r))
      t.equal(Buffer.isBuffer(encrypted), true, "Should receive buffer after encryption")
      pull(
        pull.values([encrypted]),
        decrypt(opts),
        pull.collect(function(err, d) {
          if (err) {
            console.dir(err)
            throw err.error
          }
          var decrypted = Buffer.concat(d, totalLength(d))
          t.equal(Buffer.isBuffer(decrypted), true, "Should receive buffer after decryption")
          t.equal('buffer goes in and buffer comes outand then another one goes in and should come out again', decrypted.toString('ascii'), "buffer to string decrypted message should match original message before encryption")
        })
      )
    })
  )
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
