/*!
 * verb-toc <https://github.com/jonschlinkert/verb-toc>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var extend = require('extend-shallow');
var toc = require('markdown-toc');

module.exports = function(app) {
  app.postLayout(/\.md/, createToc('postLayout', app));
  app.postRender(/\.md/, createToc('postRender', app));
  app.preWrite(/\.md/, injectToc(app));
};

function createToc(method, app) {
  return function(file, next) {
    var opts = extend({toc: {}}, app.options, file.options);

    if (typeof opts.toc.method === 'string') {
      opts.toc.render = true;
    } else {
      opts.toc.method = 'postLayout';
    }

    if (method !== opts.toc.method) {
      next(null, file);
      return;
    }

    if (opts.toc.match || typeof opts.toc.minLevels === 'number') {
      opts.toc.render = true;
    }

    if (opts.toc.render !== true) {
      next(null, file);
      return;
    }

    file.toc = toc(file.content, opts);
    next(null, file);
  };
};

function injectToc(app) {
  return function(file, next) {
    var opts = extend({toc: {}}, app.options, file.options);
    var str = file.contents.toString();

    var tocString = (file.toc && file.toc.content) || '';
    var min = opts.toc.minLevels;

    // does the TOC have the minimum expected levels to render?
    if (typeof min === 'number') {
      opts.toc.render = hasMinimumLevels(tocString, min);
    }

    if (tocString === '' || opts.toc.render !== true) {
      str = str.replace(/^#+ TOC/gm, '');
      tocString = '';
    } else {
      tocString += opts.toc.footer || '';
    }

    str = str.replace(/(?!`)<!-- toc -->(?!`)/g, tocString);
    str = str.replace(/\n{2,}/g, '\n\n');
    file.contents = new Buffer(str);
    next(null, file);
  };
}

function hasMinimumLevels(str, min) {
  var lines = str.split('\n');
  var len = lines.length;
  var max = 0;
  while (len--) {
    var line = lines[len]
    var ws = /^\s+/.exec(line);
    if (!ws) continue;
    var wlen = ws[0].length;
    if (wlen > max) {
      max = wlen;
    }
  }
  return max >= min;
}

module.exports.createToc = createToc;
module.exports.injectToc = injectToc;
