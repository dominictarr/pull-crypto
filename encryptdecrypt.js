var crypto = require('crypto'),
  pull = require('pull-stream'),
  toPull = require('stream-to-pull-stream'),
  bops = require('bops')


// options should be input encoding which defaults to buffer
// and output encoding which is what you want the output to be
// output encoding should default to buffer
exports.encypher = function cryptoStreamEncypher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.encrypt) opts.encrypt = {}
  var alg = opts.algorithm || 'aes-256-cbc'
  var ine = (opts.encrypt.inputEncoding === undefined ? 'utf8' : opts.encrypt.inputEncoding)
  var enc = (opts.encrypt.encoding === undefined ? undefined : opts.encrypt.encoding)
  var encipher = crypto.createCipher(alg, opts.password)
  encipher.pause()
  var concat = pull.Through(function (read) {
    var sent = false, dataType,
        plainTxt = '', buffers = []
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
        if (Buffer.isBuffer(data)) {
          dataType = 'buffer'
          buffer = data
          buffer.len = buffer.length
          buffers.push(buffer)
        } else if (data !== undefined) {
          dataType = 'string'
          plainTxt += data;
          (enc !== undefined ? encipher.setEncoding(enc) : '')
        }
        if (end === true && sent === false) {
            if (dataType === 'buffer') {
              var all = Buffer.concat(buffers, totalLen(buffers))
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
  var decipher = crypto.createDecipher(alg, opts.password)
  decipher.pause();
  (enc !== undefined ? decipher.setEncoding(enc) : '')
  var concat = pull.Through(function (read) {
    var sent = false, dataType,
        cipherTxt = '', buffers = []
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
        if (data !== undefined) {
          if (Buffer.isBuffer(data)) {
            buffer = data
            buffer.len = buffer.length
            buffers.push(buffer)
          } else {
            buffer = new Buffer(data, opts.encrypt.encoding)
            buffer.len = buffer.length
            buffers.push(buffer);
          }
        }
        if (end === true && sent === false) {
            var all = Buffer.concat(buffers, totalLen(buffers))
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

function totalLen(buffArray) {
  return buffArray.reduce(function(a, b) {
    return a.len + b.len
  })
}