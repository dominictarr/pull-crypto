var crypto = require('crypto'),
  pull = require('pull-stream'),
  bops = require('bops')


exports.encypher = function cryptoStreamEncypher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.encrypt) opts.encrypt = {}
  var alg = opts.algorithm || 'aes-256-cbc'
  var ine = (opts.encrypt.inputEncoding === undefined ? 'ascii' : opts.encrypt.inputEncoding)
  var enc = (opts.encrypt.encoding === undefined ? undefined : opts.encrypt.encoding)
  var cipher = crypto.createCipher(alg, opts.password);
  var encrypt = pull.Through(function (read) {
    var sent = false,
        buffers = [],
        cipherTxt = '',
        dataType;
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
        if (bops.is(data)) {
          dataType = 'buffer'
          try {
            buffer = new Buffer(cipher.update(data))
            buffer.len = buffer.length
            buffers.push(buffer)
          } catch (e) {
            cb(e)
          }
        } else if (data !== undefined) {
          enc = (enc === undefined ? 'ascii' : enc)
          try {
            cipherTxt += cipher.update(data, ine, enc)
          } catch (e) {
            cb(e)
          }
        }
        if (end === true && sent === false) {
            if (dataType === 'buffer') {
              var last, all
              try {
                last = new Buffer(cipher.final())
              } catch (e) {
                cb(e)
              }
              last.len = last.length
              buffers.push(last)
              all = bops.join(buffers, enc)
              sent = true
              cb(false, all)
            } else {
              try {
                cipherTxt += cipher.final(enc)
              } catch (e) {
                cb(e)
              }
              sent = true
              cb(false, cipherTxt)
            }
        } else if (end === true && sent === true) {
          cb(true)
        } else if (data !== null) {
          read(end, next)
        }
      })
    }
  })
  return encrypt()
}

exports.decypher = function cryptoStreamDecipher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.decrypt) opts.decrypt = {}
  var alg = opts.algorithm || 'aes-256-cbc'
  var ine = (opts.decrypt.inputEncoding === undefined ? 'base64' : opts.decrypt.inputEncoding)
  var enc = (opts.decrypt.encoding === undefined ? undefined : opts.decrypt.encoding)
  var decipher = crypto.createDecipher(alg, opts.password);
  var decrypt = pull.Through(function (read) {
    var sent = false,
        buffers = [],
        plainTxt = '',
        dataType;
    return function (end, cb) {
      read(end, function next(end, data) {
        var buffer
       if (bops.is(data)) {
          dataType = 'buffer'
          try {
            buffer = new Buffer(decipher.update(data))
            buffer.len = buffer.length
            buffers.push(buffer)
          } catch (e) {
            cb(e)
          }
        } else if (data !== undefined) {
          enc = (enc === undefined ? 'ascii' : enc)
          try {
            plainTxt += decipher.update(data, ine, enc)
          } catch (e) {
            cb(e)
          }
        }
        if (end === true && sent === false) {
            if (dataType === 'buffer') {
              var last, all
              try {
                last = new Buffer(decipher.final())
              } catch (e) {
                cb(e)
              }
              last.len = last.length
              buffers.push(last)
              all = bops.join(buffers, enc)
              sent = true
              cb(false, all)
            } else {
              try {
                plainTxt += decipher.final(enc)
              } catch (e) {
                cb(e)
              }
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
  return decrypt()
}