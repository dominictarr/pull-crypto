var cryptoStreams = require('../index.js'),
	encoder = cryptoStreams.encoder,
	decoder = cryptoStreams.decoder,
	pull = require('pull-stream'),
	tape = require('tape'),
	opts = {
		password : 'secret'
	};

tape('encode then pipe to decode then pipe to collect values', function(t) {
	t.plan(1)
	var vals = ['one', 'two', 'three', 'four']
	pull(
		pull.values(vals),
		encoder(opts),
		decoder(opts),
		pull.collect(function(err, result) {
			t.equal(vals.join(''), result[0], "Values should be same after being encrypted and then decrypted")
		})
	)

})
