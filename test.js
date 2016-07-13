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
    app.engine('.md', require('engine-base'));
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

  describe('headings', function() {
    it('should render templates in headings', function(cb) {
      app.options.toc = true;
      app.postRender(/./, toc.injectToc(app));
      app.data({name: 'Test'});

      app.layout('default', {content: 'abc {% body %} xyz'});
      var page = app.page('note.md', {
        content: '\n<!-- toc -->\n\n## <%= name %>\n This is foo.\n\n## Bar\n\nThis is bar.',
        layout: 'default'
      });

      app.render(page, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content, 'abc \n- [Test](#test)\n- [Bar](#bar)\n\n## Test\n This is foo.\n\n## Bar\n\nThis is bar. xyz');
        cb();
      });
    });

    it('should remove `## TOC` when toc is disabled', function(cb) {
      app.options.toc = false;
      app.postRender(/./, toc.injectToc(app));
      app.data({name: 'Test'});

      app.layout('default', {content: 'abc {% body %} xyz'});
      var page = app.page('note.md', {
        content: '\n## TOC <!-- toc -->\n\n## <%= name %>\nThis is foo.\n\n## Bar\n\nThis is bar.',
        layout: 'default'
      });

      app.render(page, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content, 'abc \n \n\n## Test\nThis is foo.\n\n## Bar\n\nThis is bar. xyz');
        cb();
      });
    });

    it('should remove `## Table of Contents` when toc is disabled', function(cb) {
      app.options.toc = false;
      app.postRender(/./, toc.injectToc(app));
      app.data({name: 'Test'});

      app.layout('default', {content: 'abc {% body %} xyz'});
      var page = app.page('note.md', {
        content: '\n## Table of Contents <!-- toc -->\n\n## <%= name %>\nThis is foo.\n\n## Bar\n\nThis is bar.',
        layout: 'default'
      });

      app.render(page, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content, 'abc \n \n\n## Test\nThis is foo.\n\n## Bar\n\nThis is bar. xyz');
        cb();
      });
    });

    it('should render templates in headings with a helper', function(cb) {
      app.helper('upper', function(str) {
        return str.toUpperCase();
      });
      app.options.toc = true;
      app.postRender(/./, toc.injectToc(app));
      app.data({name: 'Test'});

      app.layout('default', {content: 'abc {% body %} xyz'});
      var page = app.page('note.md', {
        content: '\n<!-- toc -->\n\n## <%= upper(name) %>\n This is foo.\n\n## Bar\n\nThis is bar.',
        layout: 'default'
      });

      app.render(page, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content, 'abc \n- [TEST](#test)\n- [Bar](#bar)\n\n## TEST\n This is foo.\n\n## Bar\n\nThis is bar. xyz');
        cb();
      });
    });
  });
});
