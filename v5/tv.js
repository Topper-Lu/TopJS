tjs.tv = {
	BYTE_BYTES : 1,
	CHAR_BYTES : 2,
	SHORT_BYTES : 2,
	INT_BYTES : 4,
	LONG_BYTES : 8,
	FLOAT_BYTES : 4,
	DOUBLE_BYTES : 8,
	//
	NONE : 0,
	ARRAY : 0x80,
	//
	BOOLEAN : 0x01,
	BYTE : 0x02,
	CHAR : 0x03,
	SHORT : 0x04,
	INT : 0x05,
	LONG : 0x06,
	FLOAT : 0x07,
	DOUBLE : 0x08,
	STRING : 0x09,
	BIGDECIMAL : 0x0A,
	BIGINTEGER : 0x0B,
	DATE : 0x0C,
	TIME : 0x0D,
	TIMESTAMP : 0x0E,
	MAP : 0x0F,
	//
	BOOLEANS : (BOOLEAN | ARRAY),
	BYTES : (BYTE | ARRAY),
	CHARS : (CHAR | ARRAY),
	SHORTS : (SHORT | ARRAY),
	INTS : (INT | ARRAY),
	LONGS : (LONG | ARRAY),
	FLOATS : (FLOAT | ARRAY),
	DOUBLES : (DOUBLE | ARRAY),
	STRINGS : (STRING | ARRAY),
	BIGDECIMALS : (BIGDECIMAL | ARRAY),
	BIGINTEGERS : (BIGINTEGER | ARRAY),
	DATES : (DATE | ARRAY),
	TIMES : (TIME | ARRAY),
	TIMESTAMPS : (TIMESTAMP | ARRAY),
	MAPS : (MAP | ARRAY)
};

tjs.tv.BufferReader = function(buffer){
	this.buffer = buffer;
	this.dataview = new DataView(buffer);
	this.position = 0;
};
tjs.tv.BufferReader.prototype = {
	readBoolean:function(){
		return this.dataview.getInt8(this.position++) != 0;
	},
	readInt8:function(){
		return this.dataview.getInt8(this.position++);
	},
	readUint8:function(){
		return this.dataview.getUint8(this.position++);
	},
	readInt16:function(){
		var v = this.dataview.getInt16(this.position);
		this.position += 2;
		return v;
	},
	readUint16:function(){
		var v = this.dataview.getUint16(this.position);
		this.position += 2;
		return v;
	},
	readInt32:function(){
		var v = this.dataview.getInt32(this.position);
		this.position += 4;
		return v;
	},
	readUint32:function(){
		var v = this.dataview.getUint32(this.position);
		this.position += 4;
		return v;
	},
	readFloat32:function(){
		var v = this.dataview.getFloat32(this.position);
		this.position += 4;
		return v;
	},
	readFloat64:function(){
		var v = this.dataview.getFloat64(this.position);
		this.position += 8;
		return v;
	},
	readString:function(){
		var len = this.readInt32();
		var a = new Uint8Array(this.buffer, this.position, len);
		this.position += len;
		var decoder = new TextDecoder();
		var v = decoder.decode(a);
		return v;
	},
	readObj:function(){
		var size = this.readInt32();
		if (size <= 0) {
			return null;
		}
		var o = {};
		var tv = tjs.tv;
		while (size--) {
			var key = this.readString();
			var type = this.readUint8();
			switch (type) {
			case tv.BOOLEAN:
				o[key] = this.readBoolean();
				break;
			case tv.BYTE:
				o[key] = this.readInt8();
				break;
			case tv.CHAR:
				o[key] = this.readUint8();
				break;
			case tv.SHORT:
				o[key] = this.readInt16();
				break;
			case tv.INT:
				o[key] = this.readInt32();
				break;
			case tv.FLOAT:
				o[key] = this.readFloat32();
				break;
			case tv.DOUBLE:
				o[key] = this.readFloat64();
				break;
			case tv.STRING:
				o[key] = this.readString();
				break;
			}
		}
	}
};

