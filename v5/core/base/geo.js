tjs.lang.defineTopClass('tjs.geo.Point',
function(x,y){
//tjs_debug_start
	tjs.lang.assert(x == null || tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname);
	tjs.lang.assert(y == null || tjs.lang.isNumber(y),'!tjs.lang.isNumber(x) @'+this.classname);
//tjs_debug_end
	this.x = x || 0;
	this.y = y || 0;
},{
	destroy:function() {
		tjs.lang.destroyObject(this);
	},
	toString:function() {
		return 'tjs.geo.Point '+JSON.stringify(this);
	}
});

tjs.lang.defineTopClass('tjs.geo.Dimension',
function(w,h){
	this.w = w || 0;
	this.h = h || 0;
},{
	destroy:function() {
		tjs.lang.destroyObject(this);
	},
	toString:function() {
		return 'tjs.geo.Dimension '+JSON.stringify(this);
	}
});

tjs.lang.defineTopClass('tjs.geo.Region',
function(x,y,w,h) {
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 0;
	this.h = h || 0;
},{
	destroy:function() {
		tjs.lang.destroyObject(this);
	},
	contains:function(x,y){
		return x >= this.x && x < (this.x + this.w) && y >= this.y && y < (this.y + this.h);
	},
	toString:function() {
		return 'tjs.geo.Region '+JSON.stringify(this);
	}
});

tjs.lang.defineTopClass('tjs.geo.Rectangle',
function(x1,y1,x2,y2) {
	this.x1 = x1 || 0;
	this.y1 = y1 || 0;
	this.x2 = x2 || 0;
	this.y2 = y2 || 0;
	if (this.x1 > this.x2) {
		var x = this.x1;
		this.x1 = this.x2;
		this.x2 = x;
	}
	if (this.y1 > this.y2) {
		var y = this.y1;
		this.y1 = this.y2;
		this.y2 = y;
	}
},{
	destroy:function() {
		tjs.lang.destroyObject(this);
	},
	getArea:function() {
		return (this.x2 - this.x1)*(this.y2 - this.y1);
	},
	contains:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.contains');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(x) @'+this.classname+'.contains');
//tjs_debug_end
		return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
	},
	intersect:function(rect) {
//tjs_debug_start
		tjs.lang.assert(rect instanceof tjs.geo.Rectangle,'!(rect instanceof tjs.geo.Rectangle) @'+this.classname+'.intersect');
//tjs_debug_end
	    var x1 = Math.max(this.x1,rect.x1);
	    var y1 = Math.max(this.y1,rect.y1);
	    var x2 = Math.min(this.x2,rect.x2);
	    var y2 = Math.min(this.y2,rect.y2);
	    if (x2 >= x1 && y2 >= y1) {
	        return new tjs.geo.Rectangle(x1,y1,x2,y2);
	    } else {
	        return null;
	    }
	},
	union:function(rect) {
//tjs_debug_start
		tjs.lang.assert(rect instanceof tjs.geo.Rectangle,'!(rect instanceof tjs.geo.Rectangle) @'+this.classname+'.union');
//tjs_debug_end
	    var x1 = Math.min(this.x1,rect.x1);
	    var y1 = Math.min(this.y1,rect.y1);
	    var x2 = Math.max(this.x2,rect.x2);
	    var y2 = Math.max(this.y2,rect.y2);
	    return new tjs.geo.Rectangle(x1,y1,x2,y2);
	},
	toString:function() {
		return 'tjs.geo.Rectangle '+JSON.stringify(this);
	}
});

