var crypto = require('crypto')

function createPullCipher(cipher, options) {
  var finalized = false
  return function (read) {
    return function (end, cb) {
      read(null, function next (end, data) {
        
        if (end === true) {
          if (finalized) return cb(true)
          finalized = true
          var fin = cipher.final(options.encoding)
          
          if (fin.length > 0) {
            if (options.encoding !== 'buffer' && Buffer.isBuffer(fin)) {
              cb(null, fin.toString(options.encoding))
            } else if (options.encoding === 'buffer' && !Buffer.isBuffer(fin)) {
              cb(null, new Buffer(fin, options.encoding))
            } else {
              cb(null, fin)
            } 
          }

        } else if (end) {
          cb(end) //error case
        } else {
          var d = cipher.update(data, options.inputEncoding, options.encoding)

          if (d.length > 0) {
            if (options.encoding !== 'buffer' && Buffer.isBuffer(d)) {
              cb(null, d.toString(options.encoding))
            } else if (options.encoding === 'buffer' && !Buffer.isBuffer(d)) {
              cb(null, new Buffer(d, options.encoding))
            } else {
              cb(null, d)
            } 
          }
          read(null, next)
        }
      })
    }
  }
}

exports.encipher = function cryptoStreamEncipher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.encrypt) opts.encrypt = {}

  opts.algorithm = opts.algorithm || 'aes-256-cbc'
  opts.encrypt.inputEncoding = (opts.encrypt.inputEncoding === undefined ? 'buffer' : opts.encrypt.inputEncoding)
  opts.encrypt.encoding = (opts.encrypt.encoding === undefined ? 'buffer' : opts.encrypt.encoding)
  var cipher = crypto.createCipher(opts.algorithm, opts.password)

  return createPullCipher(cipher, opts.encrypt)
}

exports.decipher = function cryptoStreamDecipher(opts) {
  if (!opts.password) throw new Error("Must supply password")
  if (!opts.decrypt) opts.decrypt = {}

  opts.algorithm = opts.algorithm || 'aes-256-cbc'
  opts.decrypt.inputEncoding = (opts.decrypt.inputEncoding === undefined ? 'buffer' : opts.decrypt.inputEncoding)
  opts.decrypt.encoding = (opts.decrypt.encoding === undefined ? 'buffer' : opts.decrypt.encoding)
  var decipher = crypto.createDecipher(opts.algorithm, opts.password)

  return createPullCipher(decipher, opts.decrypt)
}
