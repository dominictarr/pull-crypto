
var hash = require('../index.js').hash
var pull = require('pull-stream')
require('tape')('abc', function (t) {
pull(
  pull.values(['a', 'b', 'c']),
  hash(function (err, sum) {
    if(err) throw err
    console.log(sum)
    t.equals(sum, 'a9993e364706816aba3e25717850c26c9cd0d89d')
    t.end()
  })
)

})
