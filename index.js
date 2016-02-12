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
  app.postLayout(/\.md/, createToc(app));
  app.preWrite(/\.md/, injectToc(app));
};

function createToc(app) {
  return function(file, next) {
    var opts = extend({toc: {}}, app.options, file.options);
    if (opts.toc.render !== true) return next();
    file.toc = toc(file.content, opts);
    next(null, file);
  };
};

function injectToc(app) {
  return function(file, next) {
    var opts = extend({toc: {}}, app.options, file.options);
    var str = file.contents.toString();

    var tocString = (file.toc && file.toc.content) || '';
    if (tocString === '' || opts.toc.render !== true) {
      str = str.replace(/^#+ TOC/gm, '');
      tocString = '';
    } else {
      tocString += opts.toc.footer || '';
    }

    str = str.split('<!-- toc -->').join(tocString);
    str = str.replace(/\n{2,}/g, '\n\n');
    file.contents = new Buffer(str);
    next(null, file);
  };
}

module.exports.createToc = createToc;
module.exports.injectToc = injectToc;
