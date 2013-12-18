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
    var buffers = [],
        cipherTxt = '',
        all,
        dataType;
    return function (end, cb) {
      read(end, function next(end, data) {
        console.log(data)
        console.log("Data is Buffer? : " + Buffer.isBuffer(data))
        cipherTxt = ''
        if (end === true) {
          console.log("Sending FINAL from Encrypt")
          cb(false, cipher.final(enc))
          return cb(true)
        }
        var buffer
        if (bops.is(data)) {
          dataType = 'buffer'
          enc = (enc === 'buffer' ? undefined : enc)
          try {
            return cb(false, cipher.update(data))
          } catch (e) {
            return cb({
              op : 'cipher update',
              dataType : dataType,
              dataChunk : data,
              buffer : buffer,
              error : e
            })
          }
          //buffers.push(buffer)
          // try {
          //   finalBuff = new Buffer(cipher.final())
          // } catch (e) {
          //   return cb({
          //     op : 'cipher final',
          //     dataType : dataType,
          //     dataChunk : data,
          //     buffer : finalBuff,
          //     error : e
          //   })
          // }
          // buffers.push(finalBuff)
          // all = bops.join(buffers, enc)
          // if (enc !== undefined && enc !== 'buffer') {
          //   all = bops.to(all, enc)
          // }
          //buffers = []
          //return cb(false, all)
        } else if (typeof data === 'string') {
          enc = (enc === undefined ? 'base64' : enc)
          dataType = 'string';
          try {
            return cb(false, cipher.update(data, ine, enc));
          } catch (e) {
            return cb({
              op : 'cipher update',
              dataType : dataType,
              dataChunk : data,
              cipherTxt : cipherTxt,
              error : e
            })
          }
          // try {
          //   cipherTxt += cipher.final(enc);
          // } catch (e) {
          //   return cb({
          //     op : 'cipher final',
          //     dataType : dataType,
          //     dataChunk : data,
          //     cipherTxt : cipherTxt,
          //     error : e
          //   })
          // }
          //return cb(false, cipherTxt)
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
    var buffers = [],
        plainTxt = '',
        all,
        dataType;
    return function (end, cb) {
      read(end, function next(end, data) {
        console.log("Decrypt Data : " + data)
        console.log("Data is Buffer? : " + Buffer.isBuffer(data))
        plainTxt = ''
        if (end === true) {
          console.log("Sending FINAL from Decrypt")
          cb(false, decipher.final(enc))
          return cb(true)
        }
        var buffer
        if (bops.is(data)) {
          dataType = 'buffer'
          enc = (enc === 'buffer' ? undefined : enc)
          try {
            return cb(false, decipher.update(data))
          } catch (e) {
            return cb({
              op : 'decipher update',
              dataType : dataType,
              dataChunk : data,
              buffer : buffer,
              error : e
            })
          }
          // buffers.push(buffer)
          // try {
          //   finalBuff = new Buffer(decipher.final())
          // } catch (e) {
          //   return cb({
          //     op : 'decipher final',
          //     dataType : dataType,
          //     dataChunk : data,
          //     buffer : finalBuff,
          //     error : e
          //   })
          // }
          // buffers.push(finalBuff)
          // all = bops.join(buffers, enc)
          // if (enc !== undefined && enc !== 'buffer') {
          //   all = bops.to(all, enc)
          // }
          // buffers = []
          // return cb(false, all)
        } else if (typeof data === 'string') {
          dataType = 'string'
          enc = (enc === undefined ? 'ascii' : enc)
          dataType = 'string';
          try {
            return cb(false, decipher.update(data, ine, enc));
          } catch (e) {
            return cb({
              op : 'decipher update',
              dataType : dataType,
              dataChunk : data,
              plaintTxt : plainTxt,
              error : e
            })
          }
        //   try {
        //     plainTxt += decipher.final(enc);
        //   } catch (e) {
        //     return cb({
        //       op : 'decipher final',
        //       dataType : dataType,
        //       dataChunk : data,
        //       plaintTxt : plainTxt,
        //       error : e
        //     })
        //   }
        //   return cb(false, plainTxt)
        }
        if (end !== true) {
          read(end, next)
        }
      })
    }
  })
  return decrypt()
}