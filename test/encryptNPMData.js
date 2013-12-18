var cryptoStreams = require('../index.js'),
  encrypt = cryptoStreams.encrypt,
  decrypt = cryptoStreams.decrypt,
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  tape = require('tape'),
  hq = require('hyperquest'),
  bops = require('bops'),
  opts = {
    password : 'secret',
    encrypt : {
      encoding : 'hex'
    },
    decrypt : {
      inputEncoding : 'hex',
      encoding : 'ascii'
    }
  },
  decrypted,
  seeThrough = pull.Through(function(read, map) {
    return function (end, cb) {
      read(end, function next(end, data) {
        if (end) return cb(true)
        map(data)
        if (end !== true) {
          read(end, next)
        }
      })
    }
  }),
  fin = curry(function (read, done) {
    read(null, function next (end, data) {
        if(end === true) {
          return done(end === true ? null : end, 'done')
        }
        read(null, next)
      })
  })

tape('encrypt and decrypt multi chunk streaming network data source', function(t) {
  pull(
    toPull(hq('http://registry.npmjs.org/pull-stream')),
    seeThrough(function(data) {
      pull(
        pull.values([data]),
        encrypt(opts),
        decrypt(opts),
        pull.collect(function(end, decrypted) {
          //decrypted = bops.join(decrypted)
          t.equal(data.toString(), decrypted.join(''), "each chunk received from network should be same after encryption and decryption")
        })
      )
      return
    }),
    fin(function(err, d) {
      if (err) throw err
      t.end()
      return
    })
  )
})

function curry (fun) {
  return function () {
    var args = [].slice.call(arguments)
    return function (read) {
      args.unshift(read)
      return fun.apply(null, args)
    }
  }
}
