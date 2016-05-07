# verb-toc [![NPM version](https://img.shields.io/npm/v/verb-toc.svg?style=flat)](https://www.npmjs.com/package/verb-toc) [![NPM downloads](https://img.shields.io/npm/dm/verb-toc.svg?style=flat)](https://npmjs.org/package/verb-toc) [![Build Status](https://img.shields.io/travis/verbose/verb-toc.svg?style=flat)](https://travis-ci.org/verbose/verb-toc)

Verb generator that adds middleware for creating and injecting a table of contents into a markdown document.

## TOC

- [Docs](#docs)
- [toc event](#toc-event)
- [verb config](#verb-config)
- [verb CLI](#verb-cli)
  * [toc](#toc)
  * [Save to project's verb config](#save-to-project-s-verb-config)
  * [Save to global verb config](#save-to-global-verb-config)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install verb-toc --save
```

**HEADS UP!!!**

This only works with Verb v0.9.0 and higher! (also works with [assemble](https://github.com/assemble/assemble)).

## Usage

```js
var toc = require('verb-toc');
```

**Basic example**

In your `verbfile.js`:

```js
module.exports = function(verb) {
  verb.extendWith(require('verb-toc'));
  // do stuff, render templates, write files
};
```

Add a `<!-- toc -->` HTML comment to any markdown document where you want a table of contents to be injected. For the TOC middleware to run, you'll need to either call the `postLayout` and `preWrite` middleware handlers yourself, or follow the example below.

***

## Docs

**Middleware**

The main export is a function that when invoked with an instance of `verb` will automatically register two middleware functions:

* a `.postLayout` (`createToc`) middleware that creates the table of contents after a layout has been applied
* a `.preWrite` (`injectToc`) middleware that injects the table of contents back into the document after all other plugins have run.

Both middleware functions are also exposed as properties on `module.exports`, so you can try other stages if you want. Be warned that there are pros and cons to most middleware stages, in my own experience these stages work really well and seem to result in the fewest unwanted side-effects.

## toc event

If you want to completely customize how the TOC is injected, you can listen for the `toc` event.

**Params**

* `file` Exposes the vinyl `file` being rendered

**Example**

```js
verb.on('toc', function(file, next) {
  // do stuff to `file.contents`, then call next
  next();
});
```

**Register the middleware**

In your `verbfile.js`:

```js
module.exports = function(verb) {
  verb.extendWith(require('verb-toc'));
  
  // use any template engine, but you must call `.renderFile` 
  // (below) to trigger the necessary middleware stages
  verb.engine('*', require('engine-base'));

  // example task
  verb.task('docs', function(cb) {
    return verb.src('docs/*.md', { cwd: __dirname })
      .pipe(app.renderFile('*'))
      .pipe(verb.dest('dist'));
  });

  verb.task('default', ['docs']);
};
```

_(In v0.9.0 and higher, verbfiles that export a function are recognized by verb as "generators", allowing them to be locally or globally installed, and composed with other generators. You can alternatively export an instance of verb, but it's not as fun...)_

## verb config

Enable or disable Table of Contents rendering, or pass options on the `verb` config object in `package.json`.

**Example**

```json
{
  "name": "my-project",
  "verb": {
    "toc": true
  }
}
```

## verb CLI

### toc

Disable or enable TOC rendering from the command line.

**Enable**

Enable the table of contents for the current build:

```sh
$ verb --toc
```

**Disable**

Disable the table of contents for the current build:

```sh
$ verb --toc=false
```

### Save to project's verb config

Persist TOC settings for a project to the `verb` config object in `package.json`:

**Enable**

Enable the table of contents for a project:

```sh
$ verb --config=toc
```

**Disable**

Disable the table of contents for a project:

```sh
$ verb --config=toc:false
```

### Save to global verb config

Persist TOC settings to be used as global:

**Enable**

Enable the table of contents for a project:

```sh
$ verb --global=toc
# or
$ verb -g=toc
```

**Disable**

Disable the table of contents for a project:

```sh
$ verb --global=toc:false
# or
$ verb -g=toc:false
```

## Related projects

You might also be interested in these projects:

* [markdown-toc](https://www.npmjs.com/package/markdown-toc): Generate a markdown TOC (table of contents) with Remarkable. | [homepage](https://github.com/jonschlinkert/markdown-toc)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/verbose/verb-toc/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/verbose/verb-toc/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 07, 2016._