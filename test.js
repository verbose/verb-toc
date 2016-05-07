'use strict';

require('mocha');
var assert = require('assert');
var Base = require('templates');
var toc = require('./');
var app;

describe('verb-toc', function() {
  beforeEach(function() {
    app = new Base();
    app.use(toc);
    app.create('pages');
    app.create('layouts', {viewType: 'layout'});
    app.engine('.md', function(str, locals, cb) {
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
      app.options.toc = { render: true };

      app.on('toc', toc.injectToc(app));

      app.layout('default', {content: 'abc {% body %} xyz'});
      app.page('note.md', {
        content: '\n<!-- toc -->\n\n## Foo\n This is foo.\n\n## Bar\n\nThis is bar.',
        layout: 'default'
      })
        .render(function(err, res) {
          if (err) return cb(err);
          assert(res.content.indexOf('- [Foo](#foo)\n- [Bar](#bar)') !== -1);
          cb();
        });
    });
  });
});
