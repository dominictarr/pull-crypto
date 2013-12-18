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
    var cipherTxt = '',
        dataType,
        finalized = false
    return function (end, cb) {
      read(end, function next(end, data) {
        cipherTxt = ''
        if (end === true && finalized === false) {
          finalized = true
          if (dataType === 'buffer') {
            try {
              var finalbuffer = new Buffer(cipher.final())
            } catch (e) {
              return cb({
                op : 'cipher final',
                dataType : dataType,
                dataChunk : data,
                finalbuffer : finalbuffer,
                error : e
              })
            }
            cb(false, (enc !== 'buffer' && enc !== undefined ? bops.to(finalbuffer, enc) : finalbuffer))
          } else {
            cb(false, cipher.final(enc))
          }
        } else if (end === true && finalized === true) {
          return cb(true)
        }
        if (bops.is(data)) {
          dataType = 'buffer'
          enc = (enc === 'buffer' ? undefined : enc)
          try {
            var buffer = new Buffer(cipher.update(data))
          } catch (e) {
            return cb({
              op : 'cipher update',
              dataType : dataType,
              dataChunk : data,
              buffer : buffer,
              error : e
            })
          }
          return cb(false, (enc !== 'buffer' && enc !== undefined ? bops.to(buffer, enc) : buffer))
        } else if (typeof data === 'string') {
          enc = (enc === undefined ? 'base64' : enc)
          dataType = 'string';
          try {
            cipherTxt = cipher.update(data, ine, enc)
          } catch (e) {
            return cb({
              op : 'cipher update',
              dataType : dataType,
              dataChunk : data,
              cipherTxt : cipherTxt,
              error : e
            })
          }
          return cb(false, cipherTxt);
        }
        if (end !== true) {
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
    var plainTxt = '',
        dataType,
        finalized = false
    return function (end, cb) {
      read(end, function next(end, data) {
        plainTxt = ''
        if (end === true && finalized === false) {
          finalized = true
          if (dataType === 'buffer') {
            try {
              var finalbuffer = new Buffer(decipher.final())
            } catch (e) {
              return cb({
                op : 'decipher final',
                dataType : dataType,
                dataChunk : data,
                finalbuffer : finalbuffer,
                error : e
              })
            }
            cb(false, (enc !== 'buffer' && enc !== undefined ? bops.to(finalbuffer, enc) : finalbuffer))
          } else {
            cb(false, decipher.final(enc))
          }
        } else if (end === true && finalized === true) {
          return cb(true)
        }
        if (bops.is(data)) {
          dataType = 'buffer'
          enc = (enc === 'buffer' ? undefined : enc)
         try {
            var buffer = new Buffer(decipher.update(data))
          } catch (e) {
            return cb({
              op : 'decipher update',
              dataType : dataType,
              dataChunk : data,
              buffer : buffer,
              error : e
            })
          }
          return cb(false, (enc !== 'buffer' && enc !== undefined ? bops.to(buffer, enc) : buffer))
        } else if (typeof data === 'string') {
          enc = (enc === undefined ? 'ascii' : enc)
          dataType = 'string';
          try {
            plainTxt = decipher.update(data, ine, enc)
          } catch (e) {
            return cb({
              op : 'decipher update',
              dataType : dataType,
              dataChunk : data,
              plainTxt : plainTxt,
              error : e
            })
          }
          return cb(false, plainTxt);
        }
        if (end !== true) {
          read(end, next)
        }
      })
    }
  })
  return decrypt()
}