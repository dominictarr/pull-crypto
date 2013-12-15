# pull-crypto

[pull-stream](https://github.com/dominictarr/pull-stream)
wrapper for node's crypto module.

## hash

a Sink stream that will callback the hash of a stream (i.e. a file)

``` js
var pc = require('pull-crypto')
var pull = require('pull-stream')

pull(
  pull.values(['a', 'b', 'c']),
  pc.hash(function (err, sum) {
    if(err) throw err
    console.log(sum)
  })
)
```
which will output: `a9993e364706816aba3e25717850c26c9cd0d89d`

## encrypt

a Through stream that takes an options object and returns encrypted data in callback (if callback is supplied) or stream so it can be piped to a consumer.

Below has no callback and returns a stream so you pipe to another stream.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  encrypt : {
    encoding : 'base64'
  },
  decrypt : {
    encoding : 'utf8'
  },
  algorithm : 'aes-256-cbc',
  password : 'secret'
}
   
pull(
  pull.values(['a', 'b', 'c']),
  pc.encrypt(opts),
  pull.log()
)
```
Note : options object is intentionally verbose in above example to show all properties. The only thing you are required to pass in is the `password` property. This will ensure your data is not encrypted with any default password. If not supplied it will throw!

Options Object defaults :
* algorithm : `aes-256-cbc`
* encrypt.encoding : `buffer`
* decrypt.encoding : `buffer`

Below is same example as above with Callback supplied. It also has a slimmed down options object.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret',
  encrypt : {
    inputEncoding : 'ascii',
    encoding : 'hex'
  }
}
   
pull(
  pull.values(['a', 'b', 'c']),
  pc.encrypt(opts, function(err, encrypted) {
    if (err) throw err
    console.log(encrypted)
  })
)
```

## decrypt

this is the same as encrypt. It can either be piped down stream or take a callback. Below we take encrypted `hex` data and pipe it to `decrypt` and then print out the decrypted data to the console, which yields `abc`.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret',
  decrypt : {
    inputEncoding : 'hex',
    encoding : 'utf8'
  }
}
   
pull(
  pull.values(['9f6199ceee0c2a6f36137fa80eeb2a59']),
  pc.decrypt(opts),
  pull.log()
)
```

You can also pass a callback to `decrypt` as shown above with the `encrypt` example.

### algorithms

You can choose any algorithm that is available through node's `crypto.getCiphers()` method. You can take a look in the tests folder for the `allCiphers.js` file. This will go attempt to encrypt and decrypt values using all possible ciphers on your system.

### encoding

Please note that the output encoding must be set explicitly. This is very important if you would like to control the output of the encrytion or decryption. You could easily set `opts.encrypt.encoding` to `hex` if you would like to store encrypted data in `hex` format. Likewise you can do the same with your decrypted data if you'd like to store it in something other than `ascii` or `utf8`, i.e. human readable.

If you leave these options blank than it will be defaulted to `buffer`. You can pass in a buffer and get a buffer back as long as you don't set the encoding for either the `encrypt` or `decrypt` methods. You can also pass in a buffer and set the `decrypt` encoding to `utf8` and get back `utf8` data.

See node's [crypto](http://nodejs.org/api/crypto.html#crypto_class_cipher) module for details on encoding.

## License

MIT
