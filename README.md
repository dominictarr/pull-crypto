# pull-crypto

[pull-stream](https://github.com/dominictarr/pull-stream)
wrapper for node's crypto module.

## hash

a Sink stream that will callback the hash of a stream (i.e. a file)

``` js
var pc = require('pull-crypto')
var pull = require('pull-stream')

pull.values(['a', 'b', 'c'])
  .pipe(pc.hash(function (err, sum) {
    if(err) throw err
    console.log(sum)
  }))
```
which will output: `a9993e364706816aba3e25717850c26c9cd0d89d`

## encrypt, decrypt, etc

I don't need this yet - make a PR.


## License

MIT
