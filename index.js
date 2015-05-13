"use strict";

var assign = require("./lib/assign");
var crypto = require("crypto");
var Q = require("q");
var request = require("request");

var defaultOptions = {
  apiHost: "resizor.com",
  apiPort: "80",
  useSSL: true,
  CDNHost: null
};

// Resizor Class
function Resizor(apiKey, options) {
  if (!apiKey || (apiKey && typeof apiKey !== "string")) {
    throw new Error("An Resizor.com apiKey is required.");
  }

  if (!(this instanceof Resizor)) {
    return new Resizor(apiKey, options);
  }

  this.apiKey = apiKey;
  this.options = defaultOptions;
  if (options) {
    this.set(options);
  }


  // PRIVATE METHODS
  // ---------------

  // Get the Resizor API URL
  var getApiURL = (function() {
    return (this.options.useSSL ? "https" : "http") + "://" + this.options.apiHost + ":" + (this.options.useSSL ? "443" : this.options.apiPort);
  }).bind(this);

  // Get a Resizor token for an asset
  var getResizorToken = (function(id, assetOptions) {
    return crypto.createHash("sha1").update(this.apiKey + "-" + id + "-" + assetOptions.size + "-" + assetOptions.format).digest("hex");
  }).bind(this);

  // Get a queryString style URL
  var getQueryStringURL = function(id, assetOptions) {
    var cutoutString = assetOptions.cutout ? "&cutout=" + assetOptions.cutout : "";
    return getApiURL() + "/assets/" + id + "." + assetOptions.format + "?size=" + assetOptions.size + cutoutString + "&token=" + getResizorToken(id, assetOptions);
  };

  // Get a CDN compatible style URL
  var getCdnCompatibleURL = (function(id, assetOptions) {
    var cutoutString = assetOptions.cutout ? "/" + assetOptions.cutout : "";
    return (this.options.useSSL ? "https" : "http") + "://" + this.options.CDNHost + "/assets/" + assetOptions.size + cutoutString + "/" + getResizorToken(id, assetOptions) + "/" + id + "." + assetOptions.format;
  }).bind(this);


  // PUBLIC METHODS
  // --------------

  // Get an asset URL
  this.getAssetURL = function(id, assetOptions) {
    assetOptions = assign({ size: "200", format: "jpg" }, assetOptions);
    return this.options.CDNHost ? getCdnCompatibleURL(id, assetOptions) : getQueryStringURL(id, assetOptions);
  };

  // Add an asset
  this.addAsset = function(fileBuffer) {
    var deferred = Q.defer();
    if (fileBuffer) {
      request.post({
        url: getApiURL() + "/assets.json",
        formData: {
          "file": fileBuffer,
          "api_key": this.apiKey
        }
      }, function(err, httpResponse, data) {
        if (err) {
          deferred.reject(new Error("Could not add asset"));
        } else {
          deferred.resolve({
            id: data.asset.id,
            name: data.asset.name + data.asset.extension,
            mimeType: data.asset["mime_type"],
            size: data.asset["file_size"],
            width: data.asset.width,
            height: data.asset.height
          });
        }
      })
    } else {
      deferred.reject(new Error("Missing file stream"));
    }

    return deferred.promise;
  };

  // Delete an asset
  this.deleteAsset = function(id) {
    var deferred = Q.defer();
    if (id && typeof id === "string") {
      request.del({
        url: getApiURL() + "/assets/" + id + ".json",
        qs: { 
          "api_key": this.apiKey
        }
      }, function(err, httpResponse) {
        if (err) {
          deferred.reject(new Error("Could not delete asset with id: " + id));
        } else {
          deferred.resolve();
        }
      });
    } else {
      deferred.reject(new Error("Missing or malformed id"));
    }
    return deferred.promise;
  };

  // Set options
  this.set = function(options) {
    assign(this.options, options);
  };
}

module.exports = Resizor;
