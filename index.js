var events = require('events')
var fs = require('fs')
var path = require('path')
var util = require('util')

var dirwatcher = require('dirwatcher')

var EventEmitter = events.EventEmitter

module.exports = function() {
  return new FWatch()
}

function FWatch() {
  var self = this

  this.watchers = {}
  this.watched = {}

  this._watcherOpts = {
    skip: function() {
      return true
    },
    include: function(f) {
      return self.isWatched(f) || self.isWatched(path.dirname(f))
    }
  }
}

util.inherits(FWatch, EventEmitter)


/**
 * Start watching the given file.
 */
FWatch.prototype.add = function(file) {
  var self = this
  self.watched[file] = true
  fs.stat(file, function(err, stat) {
    if (err) self.emit('error', err)
    var dir = stat.isFile() ? path.dirname(file) : file
    if (!self.watchers[dir]) {
      self.watchers[dir] = dirwatcher(dir, self._watcherOpts)
      .on('added', function(file, stat) {
        if (self.watched[dir]) {
          fs.stat(dir, function(err, dirStats) {
            self.emit('change', dir, dirStats)
          })
        }
        if (file != dir && self.watched[file]) {
          self.emit('change', file, stat)
        }
      })
      .on('changed', function(file, stat) {
        self.emit('change', file, stat)
      })
      .on('removed', function(file) {
        self.emit('change', file, { deleted: true })
      })
      .on('error', function(err) {
        if (err.code == 'EMFILE') self.poll()
        else self.emit('error', err)
      })
    }
  })
}

/**
 * Whether the given file is being watched.
 */
FWatch.prototype.poll = function() {
  var self = this
  var files = this.list()
  var dirs = Object.keys(this.watchers)

  this.removeAll()

  // re-add files to a polling filewatcher
  var w = dirwatcher.filewatcher({ polling: true })
  files.forEach(w.add, w)

  ;['list', 'add', 'remove', 'removeAll'].forEach(function(m) {
    self[m] = w[m].bind(w)
  })

  ;['change', 'error'].forEach(function(e) {
    w.on(e, function() {
      self.emit.apply(self, [e].concat([].slice.call(arguments)))
    })
  })

  this.emit('fallback', dirs.length)
}


/**
 * Whether the given file is being watched.
 */
FWatch.prototype.isWatched = function(file) {
  return this.watched[file]
}

/**
 * Lists all watched files.
 */
FWatch.prototype.list = function() {
  return Object.keys(this.watched).filter(this.isWatched, this)
}

/**
 * Stop watching the given file.
 */
FWatch.prototype.remove = function(file) {
  this.watched[file] = false
  var watcher = this.watchers[file]
  if (watcher) {
    // file is a watched directory
    watcher.stop()
    delete this.watchers[file]
  }
}

/**
 * Stop watching all currently watched files.
 */
FWatch.prototype.removeAll = function() {
  Object.keys(this.watchers).forEach(this.remove, this)
  this.watched = {}
}
