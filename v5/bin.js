tjs.binUtil = {
	arrayBufferToBase64:function(buffer){
		//var bstr = String.fromCharCode.apply(null,new Uint8Array(buffer));
		var b = []
		var bytes = new Uint8Array(buffer);
		var len = bytes.byteLength;
		for (var i = 0, k = 0; i < len; i++, k++) {
			b[k] = String.fromCharCode(bytes[i])
		}
		var bstr = b.join('');
		b.length = 0;
		return btoa(bstr);
	},
	base64ToArrayBuffer:function(base64){
		var bstr =  atob(base64);
		var len = bstr.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++)        {
			bytes[i] = bstr.charCodeAt(i);
		}
		return bytes.buffer;
	},
	blobToArrayBuffer:function(blob, callback){
		var fileReader = new FileReader();
		fileReader.onload = function() {
			callback(this.result);
		};
		fileReader.readAsArrayBuffer(blob);
	}
};
