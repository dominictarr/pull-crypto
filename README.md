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
    inputEncoding : 'utf8',
    encoding : 'base64'
  },
  decrypt : {
    inputEncoding : 'base64',
    encoding : 'utf8'
  },
  algorithm : 'aes-256-cbc',
  password : 'secret'
}
   
pull(
  pull.values(['a', 'b', 'c']),
  pc.encoder(opts),
  pull.log()
)
```
Note : options object is intentionally verbose in above example to show all properties. The only thing you are required to pass in is the `password` property. This will ensure your data is not encrypted with any default password. If not supplied it will throw!

Options Object defaults :
* algorithm : `aes-256-cbc`
* encrypt.inputEncoding : `utf8`
* encrypt.encoding : `hex`
* decrypt.inputEncoding : `hex`
* decrypt.encoding : `utf8`

Below is same example as above with Callback supplied. It also has a slimmed down options object.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret'
}
   
pull.values(['a', 'b', 'c'])
  .pipe(pc.encoder(opts, function(err, encrypted) {
    if (err) throw err
    console.log(encrypted)
  }))
```

## decrypt

this is the same as encrypt. It can either be piped down stream or take a callback. Below we take encrypted `base64` data and pipe it to the `decoder` and then print out the decrypted data to the console, which yields `abc`.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret'
}
   
pull.values(['9f6199ceee0c2a6f36137fa80eeb2a59'])
  .pipe(pc.decoder(opts))
  .pipe(pull.log())
```

You can also pass a callback to the `decoder` as shown above with the `encoder` example.

### algorithms

You can choose any algorithm that is available through node's `crypto.getCiphers()` method. You can take a look in the tests folder for the `allCiphers.js` file. This will go attempt to encrypt and decrypt values using all possible ciphers on your system.

### encoding

Again see node's `crypto` module for details on possible input and output encoding.

## License

MIT
