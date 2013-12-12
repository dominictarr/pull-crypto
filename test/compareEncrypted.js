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
  var encrypted1 = '',
      encrypted2 = '';
  // read file encode text collect encrypted text in variable
  pull(
    toPull(thisFile),
    encrypt(opts),
    decrypt(opts),
    pull.collect(function(err, a) {
      if (err) throw err
        encrypted1 = a[0]
        t.ok(encrypted1, "Should not be empty")
    })
  )

  thisFile.on('end', function() {
    toPull(fs.createReadStream(__filename, {encoding : 'utf8'}))
      .pipe(encrypt(opts))
      .pipe(decrypt(opts))
      .pipe(pull.collect(function(err, b) {
        if (err) throw err
          encrypted2 = b[0]
          t.ok(encrypted2, "Should not be empty")
          return pull.values([''])
            .pipe(pull.through(function(data) {
              t.equal(encrypted1,encrypted2, "Cipher text should match eachother")
            }))
            .pipe(pull.log())
      }))
    })
  })


