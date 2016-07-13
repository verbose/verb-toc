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
    var opts = createOpts(app, file);

    if (method !== opts.toc.method) {
      next(null, file);
      return;
    }

    if (opts.toc.render !== true) {
      next(null, file);
      return;
    }

    opts.linkify = opts.linkify || function(token, name, slug, tocOpts) {
      if (/^[{<]%?/.test(name)) {
        var view = app.view('toctemp' + file.extname, {content: name});
        app.compile(view, opts);
        token.content = view.fn(app.cache.data);
      }
      toc.linkify(token, name, slug, tocOpts);
      return token;
    };

    file.toc = toc(file.content, opts);
    if (app.hasListeners('toc')) {
      app.emit('toc', file, next);
      return;
    }

    next(null, file);
  };
};

function injectToc(app) {
  return function(file, next) {
    var opts = createOpts(app, file);
    var str = file.contents.toString();

    if (opts.toc.method === 'preWrite') {
      file.toc = toc(file.content, opts);
    }

    var tocString = (file.toc && file.toc.content) ? file.toc.content : '';
    var min = opts.toc.minLevels;

    // does the TOC have the minimum expected levels to render?
    if (typeof min === 'number') {
      opts.toc.render = hasMinimumLevels(tocString, min);
    }

    if (tocString === '' || opts.toc.render !== true) {
      str = str.replace(/^#+ (TOC|table of contents)/gmi, '');
      tocString = '';
    } else {
      tocString += opts.toc.footer || '';
    }

    // don't render toc comments in backticks
    str = str.replace(/(?!`)<!-- toc -->(?!`)/g, tocString);
    // fix escaped code comments (used as macros)
    str = str.split('<!!--').join('<!--');
    str = str.replace(/\n{2,}/g, '\n\n');
    file.contents = new Buffer(str);
    next(null, file);
  };
}

function createOpts(app, file) {
  var opts = extend({toc: {}}, app.options, file.options, file.data);
  if (typeof opts.toc === 'string') {
    opts.toc = { method: opts.toc };
  }

  if (typeof opts.toc === 'boolean') {
    opts.toc = { render: opts.toc };
  }
  if (typeof opts.toc.method === 'string' || opts.toc.match || typeof opts.toc.minLevels === 'number') {
    opts.toc.render = true;
  }
  if (opts.toc && typeof opts.toc === 'object' && typeof opts.toc.method !== 'string') {
    opts.toc.method = 'postLayout';
  }

  opts = extend({}, opts, opts.toc);
  return opts;
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
