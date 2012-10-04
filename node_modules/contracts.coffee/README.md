contracts.coffee
================

contracts.coffee is a dialect of CoffeeScript with contract support.

Contracts allow you to write powerful runtime assertions about your code. 
Like types but less painful, like assert but more useful.

    square :: (Num) -> Num
    square = (x) -> x * x

    # throws a run-time error
    square "a string"   

Documentation, usage, and more examples: http://disnetdev.com/contracts.coffee/

Quick start
===========

Install via npm:

    npm install -g contracts.coffee
    npm install contracts.js

Use the compiler:

    coffee -c --contracts /path/to/script.coffee

An alternative to using the --contracts flag is setting this env variable:

    export CONTRACTS_COFFEE_ENABLED=1

If you are running in the browser then you'll need to load the 
contracts library (found in [lib/contracts/contracts.js](https://github.com/disnet/contracts.coffee/tree/master/lib/contracts))

    <script type="text/javascript" src="contracts.js"></script>

If you are running in node.js then you'll need to install the contracts.js package

    npm install contracts.js

Note that contracts.coffee requires some pretty new features of JavaScript 
([Proxies](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Proxy) 
in particular) so it currently only works on Firefox 4+ and node 0.5.10 (but not 0.6 yet) 
but other JavaScript engines should be adding support soon.

Change Log
----------

* [0.3.0]() (March 15th, 2012)
  * [change](https://github.com/disnet/contracts.coffee/issues/8) to dependent function contracts
  * various contracts.coffee bug fixes: [#27](https://github.com/disnet/contracts.coffee/issues/27), [#41](https://github.com/disnet/contracts.coffee/issues/41), [#33](https://github.com/disnet/contracts.coffee/issues/33), [#31](https://github.com/disnet/contracts.coffee/issues/31),
  * various contracts.js bug fixes: [#9](https://github.com/disnet/contracts.js/pull/9), [#8](https://github.com/disnet/contracts.js/pull/8), [#7](https://github.com/disnet/contracts.js/pull/7), [#6](https://github.com/disnet/contracts.js/pull/6), [#5](https://github.com/disnet/contracts.js/pull/5), [#4](https://github.com/disnet/contracts.js/pull/4)
  * experimental support for require.js
  * based off CoffeeScript 1.3.1
* [0.2.0](https://github.com/disnet/contracts.coffee/tree/c0.2.0) (January 4th, 2012)
  * removed `.use()`, now using `Contracts.exports` and `Contracts.use`
  * various bug fixes
  * based off CoffeeScript 1.2.0
* [0.1.0](https://github.com/disnet/contracts.coffee/tree/c0.1.0) (August 29th, 2011) 
  * initial release
  * based off CoffeeScript 1.1.2
