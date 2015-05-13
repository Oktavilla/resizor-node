
## Example usage

```javascript
var Resizor = require("resizor-node");
var resizor = new Resizor("apikey");

var addAsset = resizor.addAsset(fileStream);
addAsset.then(function(assetData) {
  var assetUrl = resizor.getAssetURL(assetData.id, {
    size: "w200h200"
  });
  console.log(assetUrl);
});
```

Would yield something like:
```
>> "https://resizor.com/assets/123456789.jpg?size=w200h200&token=w7cw847rtc7c7brc7rcb"
```

## Constructor

The constructor takes two arguments: `apiKey` and `options`. Example and available options:
```javascript
var resizor = new Resizor("apikey", {
  "useSSL": true,
  "CDNHost": "myawesomecdn.resizor.com"
});
```

`CDNHost` can be set if you're using your CloudFront with Resizor. See http://resizor.com/get-started

## "addAsset" method

addAssets takes the arguments: `fileBuffer`, `fileName` and `contentType`. ContentType must be the valid mime type of the asset you're uploading. It will return a promise. Upon success it will be resolved with data regarding the newly created asset.

Example:
```javascript
var addAsset = resizor.addAsset(fileBuffer, fileName, contentType);
addAsset.then(function(assetData) {
  console.log(assetData);
});
```

Would yield something like:
```json
{
  "id": "78584756",
  "name": "something.jpg",
  "mimeType": "image/jpeg",
  "size": 4534534,
  "width": 500,
  "height": 300
}
```

## "deleteAsset" method

deleteAsset takes a single argument: `id`. It will return a promise which will be resolved on success.

Example:
```javascript
resizor.deleteAsset("78584756");
```

## "getAssetURL" method

getAssetURL takes two arguments: `id` and `options`. It will return a valid, public, asset URL. The format of the URL is affected if you set `CDNHost` in the constructors `options`. 

Example:
```javascript
resizor.getAssetURL("78584756", {
  size: "w200h450" // See http://resizor.com/api#resize_syntax
}
```
