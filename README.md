[![Build Status](https://travis-ci.org/fgnass/fwatch.png?branch=master)](https://travis-ci.org/fgnass/fwatch)

Drop-in replacement for [filewatcher](https://www.npmjs.com/package/filewatcher)
that watches directories instead of individual files in order to use less file handles.

## About

Watching files with Node.JS is still a mess. While
[filewatcher](https://www.npmjs.com/package/filewatcher) addresses most of these issues, one problem still remains: OS X uses one file  handle for each `fs.watch()` call. Since the maximum number of file handles is quite low by default, you quickly run into `EMFILE` errors.

To use less file handles, `fwatch` uses [dirwatcher](https://www.npmjs.com/package/dirwatcher) (which in turn uses filewatcher under the hood) to watches a file's directory instead.

### Usage

```js
var fwatch = require('fwatch');

var w = fwatch();

// watch a file
w.add(file);

w.on('change', function(file, stat) {
  console.log('File modified:', file);
  if (stat.deleted) console.log('deleted!');
});

w.on('error', function(err) {
  console.log(err);
});

// stop watching a given file
w.remove(file);

// ... stop watching all watched files
w.removeAll();
```

### The MIT License (MIT)

Copyright (c) 2015 Felix Gnass

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
