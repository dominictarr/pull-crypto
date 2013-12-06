var crypt = require('../encodedecode.js'),
	encoder = crypt.encoder,
	decoder = crypt.decoder,
	pull = require('pull-stream'),
	tape = require('tape'),
	opts = {
		password : 'secret'
	};

tape('encode and decode into callback', function(t) {
	t.plan(1)
	var vals = ['one', 'two', 'three', 'four']
	pull(
		pull.values(vals),
		encoder(opts),
		decoder(opts, function(err, result) {
			console.log("Result : " + result)
			t.equal(vals.join(''), result, "Values should be same after being encrypted and then decrypted")
		})
	)

})
