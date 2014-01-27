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
  pull(
    pull.values([new Buffer('buffer goes in and string comes out')]),
    encrypt(opts),
    pull.collect(function(err, r) {
      if (err) {
        throw new Error(err)
      }
      var encrypted = Buffer.concat(r, totalLength(r))
      t.equal(Buffer.isBuffer(encrypted), true, "Should receive buffer after encryption")
      pull(
        pull.values([encrypted]),
        decrypt(opts),
        pull.collect(function(err, d) {
          if (err) {
            throw err
          }
          t.equal((typeof d[0] === 'string'), true, "Output of decrypt should be a string")
          var decrypted = d.join('')
          t.equal('buffer goes in and string comes out', decrypted, "original string put into buffer should match the decrypted text")
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
