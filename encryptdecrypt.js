var crypto = require('crypto'),
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  bops = require('bops')


exports.encypher = function cryptoStreamEncypher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.encrypt) opts.encrypt = {}
  var alg = opts.algorithm || 'aes-256-cbc'
  var ine = (opts.encrypt.inputEncoding === undefined ? 'utf8' : opts.encrypt.inputEncoding)
  var enc = (opts.encrypt.encoding === undefined ? undefined : opts.encrypt.encoding)
  var encipher = crypto.createCipher(alg, opts.password);
  (enc !== undefined ? encipher.setEncoding(enc) : '')
  encipher.pause()
  var concat = pull.Through(function (read) {
    var sent = false,
        buffers = [],
        plainTxt = '',
        dataType;
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
        if (bops.is(data)) {
          dataType = 'buffer'
          buffer = data
          buffer.len = buffer.length
          buffers.push(buffer)
        } else if (data !== undefined) {
          plainTxt += data
        }
        if (end === true && sent === false) {
            if (dataType === 'buffer') {
              var all = bops.join(buffers)
              sent = true
              cb(false, all)  
            } else {
              sent = true
              cb(false, plainTxt)
            }
        } else if (end === true && sent === true) {
          cb(true)
        } else if (data !== null) {
          read(end, next)
        }
      })
    }
  })
  return pull(
    concat(),
    toPull(encipher)
  )
}

exports.decypher = function cryptoStreamDecypher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.decrypt) opts.decrypt = {}
  var alg = opts.algorithm || 'aes-256-cbc'
  var ine = (opts.decrypt.inputEncoding === undefined ? 'utf8' : opts.decrypt.inputEncoding)
  var enc = (opts.decrypt.encoding === undefined ? undefined : opts.decrypt.encoding)
  var decipher = crypto.createDecipher(alg, opts.password);
  (enc !== undefined ? decipher.setEncoding(enc) : '')
  decipher.pause();
  var concat = pull.Through(function (read) {
    var sent = false,
        buffers = []
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
        if (data !== undefined) {
          if (bops.is(data)) {
            buffer = data
            buffer.len = buffer.length
            buffers.push(buffer)
          } else {
            buffer = bops.from(data, opts.encrypt.encoding)
            buffer.len = buffer.length
            buffers.push(buffer)
          }
        }
        if (end === true && sent === false) {
            var all = bops.join(buffers)
            sent = true
            cb(false, all)
        } else if (end === true && sent === true) {
          cb(true)
        } else if (data !== null) {
          read(end, next)
        }
      })
    }
  })
  return pull(
    concat(),
    toPull(decipher)
  )
}