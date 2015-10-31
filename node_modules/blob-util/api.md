###Index

**Functions**

* [createBlob(parts, options)](#createBlob)
* [createObjectURL(blob)](#createObjectURL)
* [revokeObjectURL(url)](#revokeObjectURL)
* [blobToBinaryString(blob)](#blobToBinaryString)
* [base64StringToBlob(base64, type)](#base64StringToBlob)
* [binaryStringToBlob(binary, type)](#binaryStringToBlob)
* [blobToBase64String(blob)](#blobToBase64String)
* [dataURLToBlob(dataURL)](#dataURLToBlob)
* [imgSrcToDataURL(src, type)](#imgSrcToDataURL)
* [canvasToBlob(canvas, type)](#canvasToBlob)
* [imgSrcToBlob(src, type)](#imgSrcToBlob)
* [arrayBufferToBlob(buffer, type)](#arrayBufferToBlob)
* [blobToArrayBuffer(blob)](#blobToArrayBuffer)
 
<a name="createBlob"></a>
###createBlob(parts, options)
Shim for
[new Blob()](https://developer.mozilla.org/en-US/docs/Web/API/Blob.Blob)
to support
[older browsers that use the deprecated <code>BlobBuilder</code> API](http://caniuse.com/blob).

**Params**

- parts `Array` - content of the <code>Blob</code>  
- options `Object` - usually just <code>{type: myContentType}</code>  

**Returns**: `Blob`  
<a name="createObjectURL"></a>
###createObjectURL(blob)
Shim for
[URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
to support browsers that only have the prefixed
<code>webkitURL</code> (e.g. Android <4.4).

**Params**

- blob `Blob`  

**Returns**: `string` - url  
<a name="revokeObjectURL"></a>
###revokeObjectURL(url)
Shim for
[URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL.revokeObjectURL)
to support browsers that only have the prefixed
<code>webkitURL</code> (e.g. Android <4.4).

**Params**

- url `string`  

<a name="blobToBinaryString"></a>
###blobToBinaryString(blob)
Convert a <code>Blob</code> to a binary string. Returns a Promise.

**Params**

- blob `Blob`  

**Returns**: `Promise` - Promise that resolves with the binary string  
<a name="base64StringToBlob"></a>
###base64StringToBlob(base64, type)
Convert a base64-encoded string to a <code>Blob</code>. Returns a Promise.

**Params**

- base64 `string`  
- type `string` | `undefined` - the content type (optional)  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="binaryStringToBlob"></a>
###binaryStringToBlob(binary, type)
Convert a binary string to a <code>Blob</code>. Returns a Promise.

**Params**

- binary `string`  
- type `string` | `undefined` - the content type (optional)  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="blobToBase64String"></a>
###blobToBase64String(blob)
Convert a <code>Blob</code> to a binary string. Returns a Promise.

**Params**

- blob `Blob`  

**Returns**: `Promise` - Promise that resolves with the binary string  
<a name="dataURLToBlob"></a>
###dataURLToBlob(dataURL)
Convert a data URL string
(e.g. <code>'data:image/png;base64,iVBORw0KG...'</code>)
to a <code>Blob</code>. Returns a Promise.

**Params**

- dataURL `string`  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="imgSrcToDataURL"></a>
###imgSrcToDataURL(src, type)
Convert an image's <code>src</code> URL to a data URL by loading the image and painting
it to a <code>canvas</code>. Returns a Promise.

<p/>Note: this will coerce the image to the desired content type, and it
will only paint the first frame of an animated GIF.

**Params**

- src `string`  
- type `string` | `undefined` - the content type (optional, defaults to 'image/png')  

**Returns**: `Promise` - Promise that resolves with the data URL string  
<a name="canvasToBlob"></a>
###canvasToBlob(canvas, type)
Convert a <code>canvas</code> to a <code>Blob</code>. Returns a Promise.

**Params**

- canvas `string`  
- type `string` | `undefined` - the content type (optional, defaults to 'image/png')  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="imgSrcToBlob"></a>
###imgSrcToBlob(src, type)
Convert an image's <code>src</code> URL to a <code>Blob</code> by loading the image and painting
it to a <code>canvas</code>. Returns a Promise.

<p/>Note: this will coerce the image to the desired content type, and it
will only paint the first frame of an animated GIF.

**Params**

- src `string`  
- type `string` | `undefined` - the content type (optional, defaults to 'image/png')  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="arrayBufferToBlob"></a>
###arrayBufferToBlob(buffer, type)
Convert an <code>ArrayBuffer</code> to a <code>Blob</code>. Returns a Promise.

**Params**

- buffer `ArrayBuffer`  
- type `string` | `undefined` - the content type (optional)  

**Returns**: `Promise` - Promise that resolves with the <code>Blob</code>  
<a name="blobToArrayBuffer"></a>
###blobToArrayBuffer(blob)
Convert a <code>Blob</code> to an <code>ArrayBuffer</code>. Returns a Promise.

**Params**

- blob `Blob`  

**Returns**: `Promise` - Promise that resolves with the <code>ArrayBuffer</code>  
