var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  tape = require('tape'),
  pass = 'secret'

tape('buffer is default output', function(t) {
  t.plan(3)
  pull(
    pull.values(['string in and get string out']),
    encrypt({
      password : pass,
      inputEncoding : 'ascii',
      encoding : 'base64'
    }),
    pull.collect(function(err, r) {
      if (err) throw err
      var encrypted = (Buffer.isBuffer(r[0]) === true ? Buffer.concat(r, totalLength(r)) : r.join(''))
      t.equal(Buffer.isBuffer(encrypted), false, "Should not receive buffer back")
      pull(
        pull.values([encrypted]),
        decrypt({
          password : pass,
          inputEncoding : 'base64',
          encoding : 'ascii'
        }),
        pull.collect(function(err, d) {
          if (err) throw err
          var decrypted = d.join('')
          t.equal(Buffer.isBuffer(decrypted), false, "Should not receive buffer back from decryption")
          t.equal('string in and get string out', decrypted, "string to string decrypted message should match original messase before encryption")
        })
      )
    })
  )
}) 
