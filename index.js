
var crypto = require('crypto')
var pull   = require('pull-stream')

module.exports = function (opts, cb) {
  if(!cb) cb = opts, opts = {}
  opts = opts || {}
  var alg = opts.algorithm || 'sha1'
  var enc = opts.encoding === false ? null : (opts.encoding || 'hex') 
  var ine = opts.inputEncoding || 'utf-8'
  var hash = crypto.createHash(alg || 'sha') 
  return pull.through(function (data) {
    hash.update(data, ine)
  }).pipe(pull.onEnd(function (err) {
    cb(err, hash.digest(enc))
  }))
}


