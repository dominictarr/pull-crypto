var crypto = require('crypto')
var pull   = require('pull-stream')
var cryptoStreams = require('./encryptdecrypt.js')
var encypher = cryptoStreams.encipher
var decypher = cryptoStreams.decipher

exports.hash = function (opts, cb) {
  if(!cb) cb = opts, opts = {}
  opts = opts || {}
  var alg = opts.algorithm || 'sha1'
  var enc = opts.encoding === false ? null : (opts.encoding || 'hex') 
  var ine = opts.inputEncoding || 'utf-8'
  var hash = crypto.createHash(alg || 'sha') 
  return pull(
    pull.through(function (data) {
      hash.update(data, ine)
    }),
    pull.drain(null, function (err) {
      cb(err, hash.digest(enc))
    })
  )
}
exports.encypher =
exports.encrypt = function (opts, cb) {
  if(cb)
    return pull(
      encypher(opts),
      pull.collect(function (err, ary) {
        if(err) return cb(err)
        if (Buffer.isBuffer(ary[0])) {
          cb(null, Buffer.concat(ary))
        } else {
          cb(null, ary)
        }
      })
    )
    return encypher(opts)
}
exports.decypher = 
exports.decrypt = function (opts, cb) {
  if(cb)
    return pull(
      decypher(opts),
      pull.collect(function (err, ary) {
         if(err) return cb(err)
        if (Buffer.isBuffer(ary[0])) {
          cb(null, Buffer.concat(ary))
        } else {
          cb(null, ary)
        }
      })
    )
    return decypher(opts)
}
