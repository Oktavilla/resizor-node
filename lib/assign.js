"use strict";

// Merge objects
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== "object") {
      throw new TypeError(source + "must be object");
    }

    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

module.exports = assign;
