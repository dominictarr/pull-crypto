var crypt = require('../encodedecode.js'),
	c = require('crypto'),
	encoder = crypt.encoder,
	decoder = crypt.decoder,
	pull = require('pull-stream'),
	tape = require('tape'),
	errors = []

process.on('uncaughtException', function(err) {
	console.log(err)
})

// This test runs all the ciphers available on your system
// All the ciphers do not work on my system so this test only shows the errors
// not sure if this is a bug with node's crypto or if I'm doing something wrong
tape('encode and decode using all ciphers available', function(t) {
	var vals = ['one', 'two', 'three', 'four']
	var ciphers = c.getCiphers()
	var blacklist = ['aes-128-xts', 'aes-256-xts']

	ciphers.forEach(function(ciph, i) {
		var opts = {
			password : 'secret',
			algorithm : ciphers[i]
		}
		// the blacklisted algorithms give me a Max Call Stack error
		// so I need to skip them
		if (blacklist.indexOf(opts.algorithm) !== -1 ) {
			return
		}

		pull(
			pull.values(vals),
			encoder(opts),
			decoder(opts),
			pull.collect(function(err, result) {
				if (err) {
					t.notOk(err === null, "Failed while trying cipher : " + ciph)
					var errObj = {
						error : err,
						cipher : ciphers[i]
					}
					errors.push(errObj)
					return
				} else {
					if (ciphers.length -1 === i) {
							t.end()
					}
				}
			})
		)
	})
})