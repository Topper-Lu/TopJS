tjs.lang.defineTopClass('tjs.sql.Encoder',
function() {
},{
	constructor:tjs.sql.Encoder,
	concatenate:function(str1,str2) {
		return str1 + "||" + str2;
	},
	encode:function(dataType,sqlType,value) {
		var dataTypes = tjs.data.types;
		switch (dataType) {
			case dataTypes.BOOLEAN:
				return this.encodeBoolean(sqlType,value);
			case dataTypes.INTEGER:
			case dataTypes.NUMBER:
				return this.encodeNumber(sqlType,value);
			case dataTypes.DATE:
				return this.encodeDate(sqlType,value);
			case dataTypes.TIME:
				return this.encodeTime(sqlType,value);
			case dataTypes.TIMESTAMP:
				return this.encodeTimestamp(sqlType,value);
			case dataTypes.STRING:
				return this.encodeString(sqlType,value);
			case dataTypes.OTHER:
			default:
				return this.encodeString(sqlType,value);
		}
	},
	encodeBoolean:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isBoolean(value),"!tjs.lang.isBoolean(value) @"+this.classname+".encodeBoolean");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.BOOLEAN:
				return value ? "TRUE" : "FALSE";
			case sqlTypes.BIT:
			case sqlTypes.TINYINT:
			case sqlTypes.SMALLINT:
			case sqlTypes.INTEGER:
			case sqlTypes.BIGINT:
				return value ? "1" : "0";
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
				return value ? "'1'" : "'0'";
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeBoolean");
		}
	},
	encodeNumber:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(value),"!tjs.lang.isNumber(value) @"+this.classname+".encodeNumber");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TINYINT:
			case sqlTypes.SMALLINT:
			case sqlTypes.INTEGER:
			case sqlTypes.BIGINT:
			case sqlTypes.REAL:
			case sqlTypes.FLOAT:
			case sqlTypes.DOUBLE:
			case sqlTypes.DECIMAL:
			case sqlTypes.NUMERIC:
				return String(value);
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
			case sqlTypes.LONGVARCHAR:
				return "'"+String(value)+"'";
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeNumber");
		}
	},
	encodeString:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeString");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
			case sqlTypes.LONGVARCHAR:
			case sqlTypes.CLOB:
				if (value == '') {
					return "''";
				} else if (!value) {
					return "NULL";
				} else {
					return tjs.sql.Encoder.escapeString(value);
				}
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeString");
		}
	},
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
			case sqlTypes.LONGVARCHAR:
				if (!value) {
					return "NULL";
				} else {
					return "'"+value+"'";
				}
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeDate");
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
			case sqlTypes.LONGVARCHAR:
				if (!value) {
					return "NULL";
				} else {
					return "'"+value+"'";
				}
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeTime");
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.CHAR:
			case sqlTypes.VARCHAR:
			case sqlTypes.LONGVARCHAR:
				if (!value) {
					return "NULL";
				} else {
					return "'"+value+"'";
				}
			default:
				throw new Error("Wrong SQL Type @"+this.classname+".encodeTimestamp");
		}
	}
});
tjs.lang.extend(tjs.sql.Encoder,{
	_regexp_str_1: /[']/,
	_regexp_str_2: /[']/g,
	escapeString:function(str) {
		if (this._regexp_str_1.test(str)) {
			str = str.replace(this._regexp_str_2,"''");
		}
		return "'"+str+"'";
	},
	oMap: new tjs.util.Map(),
	get:function(id){
		var oEncoder = this.oMap.get(id);
		if (!oEncoder) {
			oEncoder = this._create(id);
		}
		return oEncoder;
	},
	_create:function(id){
		var oEncoder;
		switch (id) {
			case 'H2':
				oEncoder = new tjs.sql.Encoder4H2();
				break;
			case 'MSSQL':
				oEncoder = new tjs.sql.Encoder4MSSQL();
				break;
			case 'MYSQL':
				oEncoder = new tjs.sql.Encoder4MySQL();
				break;
			case 'ORACLE':
				oEncoder = new tjs.sql.Encoder4Oracle();
				break;
			case 'POSTGRESQL':
				oEncoder = new tjs.sql.Encoder4PostgreSQL();
				break;
			default:
				throw new Error("no implementation of tjs.sql.Encoder for "+id);
		}
		this.oMap.put(id,oEncoder);
		return oEncoder;
	},
	destroy:function(){
		this.oMap.forEach(function(o){o.destroy();});
		this.oMap.destroy();
		delete this.oMap;
	}
});

tjs.lang.defineClass('tjs.sql.Encoder4H2',tjs.sql.Encoder,
function() {
},{
	encodeBoolean:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isBoolean(value),"!tjs.lang.isBoolean(value) @"+this.classname+".encodeBoolean");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.BOOLEAN:
			case sqlTypes.BIT:
				return value ? "TRUE" : "FALSE";
			default:
				return tjs.sql.Encoder.prototype.encodeBoolean.call(this,sqlType, value);
		}
	},
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
				if (!value) {
					return "NULL";
				} else {
					return "date'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'" + value + " 00:00:00'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeDate.call(this,sqlType, value);
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIME:
				if (!value) {
					return "NULL";
				} else {
					return "time'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'1970-01-01 " + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTime.call(this,sqlType, value);
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'" + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTimestamp.call(this,sqlType, value);
		}
	}
});

tjs.lang.defineClass('tjs.sql.Encoder4MySQL',tjs.sql.Encoder,
function() {
},{
	concatenate:function(str1,str2) {
		return "(CONCAT(" + str1 + "," + str2 + "))";
	},
	encodeBoolean:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isBoolean(value),"!tjs.lang.isBoolean(value) @"+this.classname+".encodeBoolean");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.BIT:
				return value ? "b'1'" : "b'0'";
			default:
				return tjs.sql.Encoder.prototype.encodeBoolean.call(this,sqlType, value);
		}
	},
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
				if (!value) {
					return "NULL";
				} else {
					return "'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "'" + value + " 00:00:00'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeDate.call(this,sqlType, value);
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIME:
				if (!value) {
					return "NULL";
				} else {
					return "'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "'1970-01-01 " + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTime.call(this,sqlType, value);
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "'" + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTimestamp.call(this,sqlType, value);
		}
	}
});

tjs.lang.defineClass('tjs.sql.Encoder4PostgreSQL',tjs.sql.Encoder,
function() {
},{
	encodeBoolean:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isBoolean(value),"!tjs.lang.isBoolean(value) @"+this.classname+".encodeBoolean");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.BOOLEAN:
				return value ? "TRUE" : "FALSE";
			case sqlTypes.BIT:
				return value ? "B'1'" : "B'0'";
			default:
				return tjs.sql.Encoder.prototype.encodeBoolean.call(this,sqlType, value);
		}
	},
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
				if (!value) {
					return "NULL";
				} else {
					return "date'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'" + value + " 00:00:00'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeDate.call(this,sqlType, value);
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIME:
				if (!value) {
					return "NULL";
				} else {
					return "time'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'1970-01-01 " + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTime.call(this,sqlType, value);
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "timestamp'" + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTimestamp.call(this,sqlType, value);
		}
	}
});

tjs.lang.defineClass('tjs.sql.Encoder4Oracle',tjs.sql.Encoder,
function() {
},{
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
				if (!value) {
					return "NULL";
				} else {
					return "DATE'" + value + "'";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "TIMESTAMP'" + value + " 00:00:00'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeDate.call(this,sqlType, value);
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
			case sqlTypes.TIME:
				if (!value) {
					return "NULL";
				} else {
					return "TO_DATE('1970-01-01 " + value + "','SYYYY-MM-DD HH24:MI:SS')";
				}
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "TIMESTAMP'1970-01-01 " + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTime.call(this,sqlType, value);
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "TIMESTAMP'" + value + "'";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTimestamp.call(this,sqlType, value);
		}
	}
});

tjs.lang.defineClass('tjs.sql.Encoder4MSSQL',tjs.sql.Encoder,
function() {
},{
	concatenate:function(str1,str2) {
		return str1 + "+" + str2;
	},
	encodeDate:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeDate");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.DATE:
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "{d'" + value + "'}";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeDate.call(this,sqlType, value);
		}
	},
	encodeTime:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTime");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIME:
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "{t'" + value + "'}";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTime.call(this,sqlType, value);
		}
	},
	encodeTimestamp:function(sqlType,value) {
//tjs_debug_start
		tjs.lang.assert(value == null || tjs.lang.isString(value),"!tjs.lang.isString(value) @"+this.classname+".encodeTimestamp");
//tjs_debug_end
		var sqlTypes = tjs.sql.types;
		switch (sqlType) {
			case sqlTypes.TIMESTAMP:
				if (!value) {
					return "NULL";
				} else {
					return "{ts'" + value + "'}";
				}
			default:
				return tjs.sql.Encoder.prototype.encodeTimestamp.call(this,sqlType, value);
		}
	}
});

