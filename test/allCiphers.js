var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  c = require('crypto'),
  pull = require('pull-stream'),
  tape = require('tape')


var ciphers = [
  'aes-256-cbc',
  'aes128', 'aes192', 'aes256', 'bf', 'blowfish', 'cast', 'des', 'des3', 'desx', 'idea', 'rc2', 'seed'
]

ciphers.forEach(function(ciph, i) {

tape('encrypt and decrypt using ' + ciph, function(t) {
  var vals = ['node issue # 6477 told me to make input to xts',
              'more than 16bytes so that is what i am doing so this should work']

    opts = {
      encrypt : {
        encoding : 'base64'
      },
      decrypt : {
        encoding : 'utf8'
      },
      password : 'secret',
      algorithm : ciphers[i]
    };

    pull(
      pull.values(vals),
      encrypt(opts),
      decrypt(opts),
      pull.collect(function(err, result) {
        if (err) {
          t.notOk(err === null, "Failed while trying cipher : " + ciph)
        } else {
          result = (Buffer.isBuffer(result[0]) === true ? Buffer.concat(result, totalLength(result)) : result.join(''))
          t.equal(vals.join(''), result.toString(), "Results should be the same as original values before encrypting for Cipher : " + ciph)
            t.end()
        }
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
