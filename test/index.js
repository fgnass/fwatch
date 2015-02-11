var fs = require('fs')

var fwatch = require('..')
var rimraf = require('rimraf')
var tap = require('tap')

var dir = __dirname + '/tmp'

rimraf.sync(dir)
fs.mkdirSync(dir)


var i = 0
function createFile() {
  var n = dir + '/tmp00' + (i++)
  fs.writeFileSync(n, Date.now())
  return n
}

function touch(f) {
  setTimeout(function() { fs.writeFileSync(f, Date.now()) }, 1000)
}

function del(f) {
  setTimeout(function() { fs.unlinkSync(f) }, 1000)
}

var w // the watcher

function test(name, conf, cb) {
  w = fwatch()
  return tap
    .test(name, conf, cb)
    .once('end', function() {
      w.removeAll()
      w.removeAllListeners()
    })
}

test('change', function(t) {
  t.plan(3)
  var f = createFile()
  w.on('change', function(file, stat) {
    t.equal(file, f)
    t.ok(stat.mtime > 0, 'mtime > 0')
  })
  w.on('error', function(err) { t.fail(err) })
  w.add(f)

  t.equivalent(w.list(), [f])
  touch(f)
})

test('delete', function(t) {
  t.plan(2)
  var f = createFile()
  w.on('change', function(file, stat) {
    t.equal(file, f)
    t.ok(stat.deleted, 'stat.deleted')
  })
  w.add(f)
  del(f)
})

test('add to dir', function(t) {
  t.plan(2)
  w.once('change', function(file, stat) {
    t.equal(file, dir)
  })
  w.add(dir)
  t.equivalent(w.list(), [dir])
  setTimeout(createFile, 1000)
})

test('fire more than once', function(t) {
  t.plan(2)
  var f = createFile()
  w.on('change', function(file, stat) {
    t.equal(file, f)
    if (stat.deleted) touch(f)
  })
  w.add(f)
  del(f)
})

test('remove listener', { timeout: 4000 }, function(t) {
  var f = createFile()
  w.on('change', function(file, stat) {
    t.equal(file, f)
    t.notOk(stat.deleted, 'not deleted')
    w.remove(file)
    del(f)
    setTimeout(function() { t.end() }, 1000)
  })
  w.add(f)
  touch(f)
})

process.on('exit', function() {
  rimraf.sync(dir)
})
