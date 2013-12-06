
var crypto = require('crypto')
var pull   = require('pull-stream')
var cryptoStreams = require('./encodedecode.js')
var cryptoStreamEncode = cryptoStreams.encoder
var cryptoStreamDecode = cryptoStreams.decoder

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

exports.encoder = function (opts, cb) {
  if(cb)
    return pull(
      cryptoStreamEncode(opts),
      pull.collect(function (err, ary) {
        if(err) cb(err)
        else   cb(null, bops.join(ary))
      })
    )
    return cryptoStreamEncode(opts)
}

exports.decoder = function (opts, cb) {
  if(cb)
    return pull(
      cryptoStreamDecode(opts),
      pull.collect(function (err, ary) {
        if(err) cb(err)
        else   cb(null, bops.join(ary))
      })
    )
    return cryptoStreamDecode(opts)
}
