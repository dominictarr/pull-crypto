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
    inputEncoding : 'ascii',
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
  pc.encrypt(opts),
  pull.log()
)
```
Note : options object is intentionally verbose in above example to show all properties. The only thing you are required to pass in is the `password` property. This will ensure your data is not encrypted with any default password. **If no password is supplied it will throw!**

####Options Object defaults :
* algorithm : `aes-256-cbc`
* string data
  * encrypt.inputEncoding : `ascii`
  * encrypt.encoding : `base64`
  *decrypt.inputEncoding : `base64`
  *decrypt.encoding : `ascii`
* buffer data
  * encrypt.encoding : `buffer`
  * decrypt.encoding : `buffer`

_Note that when passing in a buffer the `inputEncoding` option is ignored so it is not listed above_
_If you don't declare a value for `encoding` and the dataType is buffer then you will receive a buffer back._

## decrypt

this is the same as encrypt. It can either be piped down stream or take a callback. Below we take encrypted `hex` data and pipe it to `decrypt` and then print out the decrypted data to the console, which yields `abc`.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret',
  decrypt : {
    inputEncoding : 'hex',
    encoding : 'ascii'
  }
}
   
pull(
  pull.values(['9f6199ceee0c2a6f36137fa80eeb2a59']),
  pc.decrypt(opts),
  pull.log()
)
```

You can also pass a callback to `decrypt`.

Below is same example as above with Callback supplied. It also has a slimmed down options object.

```js
var pc = require('pull-crypto')
var pull = require('pull-stream')
var opts = {
  password : 'secret',
  decrypt : {
    inputEncoding : 'hex',
    encoding : 'ascii'
  }
}
   
pull(
  pull.values(['2ad16d51e86e596f274c00c1674563eb', 'b4d45754b6c12f8f780b8245cefa3b60', 'eba7bdc73915a45cbd7e45b0b2dd2d29']),
  pc.decrypt(opts, function(err, encrypted) {
    if (err) throw err
    console.log(encrypted.join(''))
  })
)
```
Note that when using the callback style as above __this function will not stream!__
It will buffer all data until upstream calls `cb(true)` indicating there is no more data and then it will call your callback with all of the transformed data.
The returned data will be in the form of an array. Since the data has been encrypted chunk by chunk you will have to decrypt it chunk by chunk. So the callback style is better suited for decryption. When you don't need to stream and you want all the data back at the same time. All you have to do is call `join('')` on the returned data to concatinate the decrypted result as shown above.

### algorithms

You can choose any algorithm that is available through node's `crypto.getCiphers()` method. Check out the tests folder, you'll find the most common algorithms tested.

### encoding

If you input is a `string` please remember you must set `opts.encrypt.encoding` to the same value as `opts.decrypt.inputEncoding` or you will not be able to decrypt the data.

If you send in a `buffer` and you've set `opts.encrypt.encoding` then you will get back a `string`. If you don't set `opts.encrypt.encoding` or you put `buffer` as the value you will get back a `buffer`.

You could easily set `opts.encrypt.encoding` to `hex` if you would like to store encrypted data in `hex` format. Likewise you can do the same with your decrypted data if you'd like to store it in something other than `ascii` or `utf8`, i.e. human readable.

See node's [crypto](http://nodejs.org/api/crypto.html#crypto_class_cipher) module for details on encoding.

## License

MIT
