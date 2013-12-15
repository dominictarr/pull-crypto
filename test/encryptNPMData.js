var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  hq = require('hyperquest'),
  opts = {
    password : 'secret',
  };

tape('encrypt and decrypt multi chunk network data source', function(t) {
  var fromNPM = '',
      afterDecrypt
  t.plan(1)
  toPull(hq('http://registry.npmjs.org/pull-stream'))
    .pipe(pull.collect(function(err, r) {
      fromNPM = (Buffer.isBuffer(r[0]) === true ? Buffer.concat(r, totalLength(r)) : r.join(''));
      pull(
        pull.values([fromNPM]),
        encrypt(opts),
        decrypt(opts, function(err, result) {
          if (err) throw err
          afterDecrypt = result
          t.equal(fromNPM.toString(), afterDecrypt.toString(), "Result collected from Registry should match decrypted text")
        })
      )
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
