var crypto = require('crypto'),
	pull = require('pull-stream'),
	bops = require('bops')


exports.encoder = function cryptoStreamEncode(opts) {
	if (!opts.password) throw new Error("Must supply password")
	var alg = opts.algorithm || 'aes-256-cbc'
	var enc = opts.encrypt.encoding || 'hex'
	var ine = opts.encrypt.inputEncoding || 'utf8'
	var cipher = crypto.createCipher(alg, opts.password)
	var cipherTxt = '';
	var encode = pull.Through(function (read) {
		var sent = false;
		return function (end, cb) {
			read(end, function next(end, data) {
				console.log("ENCODE CHUNK")
				if (end === true && sent === false) {
					sent = true;
					try {
						cipherTxt += cipher.final(enc)
					} catch(e) {
						cb(e)
					}
					cb(false, cipherTxt)
				} else if (end === true && sent === true) {
					cb(true)
				} else if (data !== null) {
					try {
						cipherTxt += cipher.update(data, ine, enc)
					} catch(e) {
						cb(e)
					}
					read(end, next)
				}
			})
		}
	})
	return encode()

}

exports.decoder = function cryptoStreamDecode(opts) {
	if (!opts.password) throw new Error("Must supply password")
	var alg = opts.algorithm || 'aes-256-cbc'
	var enc = opts.decrypt.encoding || 'utf8'
	var ine = opts.decrypt.inputEncoding || 'hex'
	var decipher = crypto.createDecipher(alg, opts.password)
	var plainTxt = '';
	var decode = pull.Through(function (read) {
		var sent = false;
		return function (end, cb) {
			read(end, function next(end, data) {
				console.log("DECODE CHUNK")
				if (end === true && sent === false) {
					sent = true;
					try {
						plainTxt += decipher.final(enc)
					} catch(e) {
						cb(e)
					}
					cb(false, plainTxt)
				} else if (end === true && sent === true) {
					cb(true)
				} else if (data !== null) {
					try {
						plainTxt += decipher.update(data, ine, enc)
					} catch(e) {
						cb(e)
					}
					read(end, next)
				}
			})
		}
	})
	return decode()
}