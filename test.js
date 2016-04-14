'use strict';

require('mocha');
var assert = require('assert');
var Base = require('templates');
var toc = require('./');
var base;

describe('verb-toc', function() {
  beforeEach(function() {
    base = new Base();
    base.use(toc);
    base.create('pages');
    base.create('layouts', {viewType: 'layout'});
    base.engine('.md', function(str, locals, cb) {
      cb(null, str);
    });
  });

  describe('module', function() {
    it('should export a function', function() {
      assert.equal(typeof toc, 'function');
    });
  });

  describe('middleware', function() {
    it('should emit `toc`', function(cb) {
      base.options.toc = { render: true };

      base.on('toc', toc.injectToc(base));

      base.layout('default', {content: 'foo {% body %} bar'});
      base.page('note.md', {content: '\n<!-- toc -->\n\n## Foo\n This is foo.\n\n## Bar\n\nThis is bar.', layout: 'default'})
        .render(function(err, res) {
          if (err) return cb(err);
          assert(res.content.indexOf('- [Foo](#foo)\n- [Bar](#bar)') !== -1);
          cb();
        });
    });
  });
});
