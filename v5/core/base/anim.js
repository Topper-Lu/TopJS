tjs.anim = {
	DEFAULT_INTERVAL:50,
	DEFAULT_FRAME_COUNT:20,
	ANIMATE_START:'ANIMATE_START',
	ANIMATE_STOP:'ANIMATE_STOP',
	classname:'tjs.anim'
};

tjs.anim.timing = {
	quad:{
		easeIn:function(t){
			return t*t;
		},
		easeOut:function(t){
			t = 1 - t;
			return 1 - t*t;
		},
		easeInOut:function(t){
			if (t <= 0.5) {
				return 2*t*t;
			} else {
				t = 1 - t;
				return 1 - 2*t*t;
			}
		}
	},
	cubic:{
		easeIn:function(t){
			return t*t*t;
		},
		easeOut:function(t){
			t = 1 - t;
			return 1 - t*t*t;
		},
		easeInOut:function(t){
			if (t <= 0.5) {
				return 4*t*t*t;
			} else {
				t = 1 - t;
				return 1 - 4*t*t*t;
			}
		}
	},
	quartic:{
		easeIn:function(t){
			t = t*t;
			return t*t;
		},
		easeOut:function(t){
			t = 1 - t;
			t = t*t;
			return 1 - t*t;
		},
		easeInOut:function(t){
			if (t <= 0.5) {
				t = t*t;
				return 8*t*t;
			} else {
				t = 1 - t;
				t = t*t;
				return 1 - 8*t*t;
			}
		}
	},
	back:{
		easeIn:function(t,s){
			if (!s) {s = 2.6;}
			return t*t*(s*(t - 1) + 1);
		},
		easeOut:function(t,s){
			if (!s) {s = 2.6;}
			t = 1 - t;
			return 1 - t*t*(s*(t - 1) + 1);
		},
		easeInOut:function(t,s){
			if (!s) {s = 3.6;}
			if (t <= 0.5) {
				return 4*t*t*(s*(t - 0.5) + 0.5);
			} else {
				t = 1 - t;
				return 1 - 4*t*t*(s*(t - 0.5) + 0.5);
			}
		}
	},
	bounce:(function(){
		var r = 1/3;
		var a = Math.sqrt(r);
		var aa = a*a;
		var aaa = aa*a;
		var b = (1 - aa*aa)/(1 - a) - 0.5;
		var k = 1/b;
		var t1 = k*0.5;
		var t2 = k*(0.5 + a);
		var t3 = k*(0.5 + a+ aa);
		return {
			easeIn:function(t){
				t = 1 - t;
				var bt;
				if (t <= t1) {
					bt = b*t;
					return 1 - 4*bt*bt;
				} else if (t <= t2) {
					t -= t1;
					bt = b*t;
					return 4*bt*(a - bt);
				} else if (t <= t3) {
					t -= t2;
					bt = b*t;
					return 4*bt*(aa - bt);
				} else {
					t -= t3;
					bt = b*t;
					return 4*bt*(aaa - bt);
				}
			},
			easeOut:function(t){
				var bt;
				if (t <= t1) {
					bt = b*t;
					return 4*bt*bt;
				} else if (t <= t2) {
					t -= t1;
					bt = b*t;
					return 1 - 4*bt*(a - bt);
				} else if (t <= t3) {
					t -= t2;
					bt = b*t;
					return 1 - 4*bt*(aa - bt);
				} else {
					t -= t3;
					bt = b*t;
					return 1 - 4*bt*(aaa - bt);
				}
			}
		};
	})(),
	elastic:(function(){
		var p = 6;
		var q = 8.5*Math.PI;
		return {
			easeIn:function(t){
				t = 1 - t;
				var qt = q*t;
				var pt = p*t;
				return Math.exp(-pt)*(Math.cos(qt) + p*Math.sin(qt)/q);
			},
			easeOut:function(t){
				var qt = q*t;
				var pt = p*t;
				return 1 - Math.exp(-pt)*(Math.cos(qt) + p*Math.sin(qt)/q);
			}
		};
	})()
};

tjs.lang.defineTopClass('tjs.anim.CssHandler',
function(o){
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	destroy:function(){
		if (this.oMap) {
			this._destroy();
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	construct:function(o){
		this.name = this.oMap.remove('name');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isString(this.name) && this.name != '','!tjs.lang.isString(this.name) @'+this.classname);
//tjs_debug_end
		this._construct();
		if (this.oMap.contains('v0')) {
			this.setV0(this.oMap.remove('v0'));
		}
		if (this.oMap.contains('v1')) {
			this.setV1(this.oMap.remove('v1'));
		}
	},
	getName:function(){
		return this.name;
	},
	setV01:function(v0,v1){
		this.setV0(v0);
		this.setV1(v1);
	},
	// to be overrided
	_destroy:function(){},
	_construct:function(){},
	setV0:function(v){},
	setV1:function(v){},
	setValue:function(oElement,t){}
});

tjs.lang.defineClass('tjs.anim.ColorHandler',tjs.anim.CssHandler,
function(o){
	tjs.anim.CssHandler.call(this,o);
},{
	_destroy:function(){
		tjs.lang.destroyObject(this.v0);
		tjs.lang.destroyObject(this.v1);
		tjs.lang.destroyObject(this.v);
	},
	_construct:function(){
		this.v0 = {};
		this.v1 = {};
		this.v = {};
	},
	setV0:function(v){
		tjs.color.parseColor(v,this.v0);
	},
	setV1:function(v){
		tjs.color.parseColor(v,this.v1);
	},
	setValue:function(oElement,t){
		this.v.r = this.v0.r + t*(this.v1.r - this.v0.r);
		this.v.g = this.v0.g + t*(this.v1.g - this.v0.g);
		this.v.b = this.v0.b + t*(this.v1.b - this.v0.b);
		oElement.style[this.name] = tjs.color.toRGBString(this.v);
	}
});

tjs.lang.defineClass('tjs.anim.OpacityHandler',tjs.anim.CssHandler,
function(o){
	tjs.anim.CssHandler.call(this,o);
},{
	_construct:function(){
		this.v0 = 1;
		this.v1 = 1;
	},
	setV0:function(v){
		this.v0 = v;
	},
	setV1:function(v){
		this.v1 = v;
	},
	setValue:function(oElement,t){
		tjs.css.setOpacity(oElement,this.v0 + t*(this.v1 - this.v0));
	}
});

tjs.lang.defineClass('tjs.anim.LengthHandler',tjs.anim.CssHandler,
function(o){
	tjs.anim.CssHandler.call(this,o);
},{
	_construct:function(){
		this.unit = this.oMap.remove('unit') || 'px';
		this.v0 = 0;
		this.v1 = 0;
	},
	setV0:function(v){
		this.v0 = v;
	},
	setV1:function(v){
		this.v1 = v;
	},
	setValue:function(oElement,t){
		oElement.style[this.name] = (this.v0 + t*(this.v1 - this.v0))+this.unit;
	}
});

tjs.lang.defineClass('tjs.anim.ArrayHandler',tjs.anim.CssHandler,
function(o){
	tjs.anim.CssHandler.call(this,o);
},{
	_destroy:function(){
		tjs.lang.destroyArray(this.unit);
		tjs.lang.destroyArray(this._v);
		tjs.lang.destroyArray(this.v0);
		tjs.lang.destroyArray(this.v1);
	},
	_construct:function(){
		this.length = this.oMap.remove('length') || 2;
		this.seperator = this.oMap.remove('seperator') || ' ';
		this.unit = this.oMap.remove('unit');
		var i;
		if (!tjs.lang.isArray(this.unit) || this.unit.length != this.length) {
			this.unit = [];
			for (i = 0; i < this.length; i++) {
				this.unit[i] = 'px';
			}
		} else {
			for (i = 0; i < this.length; i++) {
				if (!this.unit[i]) {
					this.unit[i] = 'px';
				}
			}
		}
		this._v = [];
		for (i = 0; i < this.length; i++) {
			this._v[i] = 0;
		}
		this.v0 = this._v;
		this.v1 = this._v;
	},
	setV0:function(v){
		if (tjs.lang.isArray(v) && v.length == this.length) {
			this.v0 = v;
		} else {
			this.v0 = this._v;
		}
	},
	setV1:function(v){
		if (tjs.lang.isArray(v) && v.length == this.length) {
			this.v1 = v;
		} else {
			this.v1 = this._v;
		}
	},
	setValue:function(oElement,t){
		var b = [];
		for (var i = 0; i < this.length; i++) {
			b[i] = (this.v0[i] + t*(this.v1[i] - this.v0[i]))+this.unit[i];
		}
		oElement.style[this.name] = b.join(this.seperator);
		tjs.lang.destroyArray(b);
	}
});

tjs.anim.handlers = (function(){
	var o = {opacity:tjs.anim.OpacityHandler}, a;

	a = ['color','backgroundColor','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor'];
	a.forEach(function(n){o[n] = tjs.anim.ColorHandler;});
	tjs.lang.destroyArray(a);

	a = ['fontSize','lineHeight','left','top','right','bottom','width','height','borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth','paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','marginLeft','marginRight'];
	a.forEach(function(n){o[n] = tjs.anim.LengthHandler;});
	tjs.lang.destroyArray(a);

	a = ['backgroundPosition'];
	a.forEach(function(n){o[n] = tjs.anim.ArrayHandler;});
	tjs.lang.destroyArray(a);

	return o;
})();

tjs.anim.createHandler = function(o){
	var handler;
	var hs = tjs.anim.handlers;
	if (tjs.lang.isObject(o) && tjs.lang.isString(o.name) && o.name in hs) {
		handler = new hs[o.name](o);
	}
	return handler;
};

tjs.lang.defineTopClass('tjs.anim.Actor',
function(o){
	this.oMap = tjs.util.toMap(o);
	this.construct();
},{
	destroy:function(){
		if (this.oMap) {
			this._destroy();
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	construct:function(){
		this.oElement = this.oMap.remove('oElement');
		var f;
		f = this.oMap.remove('onStart');
		if (tjs.lang.isFunction(f)) {
			this.oMap.put('onStart',f);
		}
		f = this.oMap.remove('onStop');
		if (tjs.lang.isFunction(f)) {
			this.oMap.put('onStop',f);
		}
		this._construct();
	},
	setElement:function(oElement){
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oElement),'!tjs.dom.isElement(oElement) @'+this.classname+'.setElement');
//tjs_debug_end
		this.oElement = oElement;
	},
	getElement:function(){
		return this.oElement;
	},
	onStart:function(cnt,o){
		var f = this.oMap.get('onStart');
		if (f) {f(this,cnt,o);}
	},
	onStop:function(cnt,o){
		var f = this.oMap.get('onStop');
		if (f) {f(this,cnt,o);}
	},
	// to be overrided
	_destroy:function(){
	},
	_construct:function(){
	},
	render:function(t){
	}
});

tjs.lang.defineClass('tjs.anim.CssActor',tjs.anim.Actor,
function(o){
	tjs.anim.Actor.call(this,o);
},{
	_destroy:function(){
		for (var x in this._handlers) {
			this._handlers[x].destroy();
		}
		tjs.lang.destroyObject(this._handlers);
	},
	_construct:function(){
		this._handlers = {};
		var hs = this.oMap.remove('handlers');
		if (tjs.lang.isArray(hs) && hs.length > 0) {
			var i = hs.length, o, h;
			while (i--) {
				o = hs[i];
				hs[i] = null;
				h = tjs.anim.createHandler(o);
				tjs.lang.destroyObject(o);
				if (h) {
					this._handlers[h.getName()] = h;
				}
			}
			hs.length = 0;
		}
	},
	addHandler:function(h){
//tjs_debug_start
		tjs.lang.assert(h instanceof tjs.anim.CssHandler,'!(h instanceof tjs.anim.CssHandler) @'+this.classname+'.addHandler');
//tjs_debug_end
		this._handlers[h.getName()] = h;
	},
	getHandler:function(name){
		return this._handlers[name];
	},
	removeHandler:function(name){
		var o = this._handlers[name];
		delete this._handlers[name];
		return o;
	},
	render:function(t){
		for (var x in this._handlers) {
			this._handlers[x].setValue(this.oElement,t);
		}
	}
});

tjs.lang.defineClass('tjs.anim.Animation',tjs.util.Trigger,
function(o){
	this.oMap = tjs.util.toMap(o);
	this._construct();
},{
	destroy:function(){
		if (this.oMap) {
			this.stop();
			if (this._actors.length > 0) {
				var i = this._actors.length;
				while (i--) {
					this._actors[i].destroy();
					this._actors[i] = null;
				}
				this._actors.length = 0;
			}
			tjs.util.Trigger.destroyInstance(this);
			this.oMap.destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_construct:function(){
		tjs.util.Trigger.initInstance(this);
		this.fTiming = this.oMap.remove('fTiming') || this._fTiming;
		var tjs_anim = tjs.anim;
		this.interval = this.oMap.remove('interval');
		if (!tjs.lang.isNumber(this.interval)) {
			this.interval = tjs_anim.DEFAULT_INTERVAL;
		} else if (this.interval < 20) {
			this.interval = 20;
		}
		this.frameCount = this.oMap.remove('frameCount');
		if (!tjs.lang.isNumber(this.frameCount)) {
			this.frameCount = tjs_anim.DEFAULT_FRAME_COUNT;
		} else if (this.frameCount < 10) {
			this.frameCount = 10;
		}
		this.animationCount = this.oMap.remove('animationCount');
		if (!tjs.lang.isNumber(this.animationCount) || this.animationCount < 1) {
			this.animationCount = 1;
		}
		this.reverse = Boolean(this.oMap.remove('reverse'));
		this.alternate = Boolean(this.oMap.remove('alternate'));
		this.ensureEnd = Boolean(this.oMap.remove('ensureEnd'));
		this._actors = [];
		this._animate_ = this._animate.bind(this);
	},
	_fTiming:function(t){
		return t;
	},
	setTimingFn:function(f){
//tjs_debug_start
		tjs.lang.assert(f == null || tjs.lang.isFunction(f),'!tjs.lang.isFunction(f) @'+this.classname+'.setTimingFn');
//tjs_debug_end
		this.fTiming = f ? f : this._fTiming;
	},
	addActor:function(o){
//tjs_debug_start
		tjs.lang.assert(o instanceof tjs.anim.Actor,'!(o instanceof tjs.anim.Actor) @'+this.classname+'.addActor');
//tjs_debug_end
		this._actors.push(o);
	},
	getActor:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.getActor');
		tjs.lang.assert(idx > -1 && idx < this._actors.length,'idx is out of bounds @'+this.classname+'.getActor');
//tjs_debug_end
		return this._actors[idx];
	},
	removeActor:function(idx){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(idx),'!tjs.lang.isNumber(idx) @'+this.classname+'.removeActor');
		tjs.lang.assert(idx > -1 && idx < this._actors.length,'idx is out of bounds @'+this.classname+'.removeActor');
//tjs_debug_end
		var a = this._actors.splice(idx,1);
		var o = a[0];
		a[0] = null;
		a.length = 0;
		return o;
	},
	_animate:function(){
		this._render();
		this._next();
	},
	_render:function(){
		var t;
		if (this._frame <= 0) {
			t = 0;
		} else if (this._frame >= this.frameCount) {
			t = 1;
		} else {
			t = this.fTiming(this._frame/this.frameCount);
		}
		for (var i = 0, isize = this._actors.length; i < isize; i++) {
			this._actors[i].render(t);
		}
	},
	_next:function(){
		if (this._reverse) {
			if (this._frame > 0) {
				this._frame--;
			} else {
				this._stop();
			}
		} else {
			if (this._frame < this.frameCount) {
				this._frame++;
			} else {
				this._stop();
			}
		}
	},
	_stop:function(){
		for (var i = 0, isize = this._actors.length; i < isize; i++) {
			this._actors[i].onStop(this._count,this);
		}
		this._count--;
		if (this._count > 0) {
			if (this.alternate) {
				this._reverse = !this._reverse;
			}
			this._start();
		} else {
			window.clearInterval(this._id);
			delete this._id;
			this.fire(tjs.anim.ANIMATE_STOP);
		}
	},
	stop:function(){
		if (this._id) {
			window.clearInterval(this._id);
			delete this._id;
			if (this.ensureEnd) {
				if (this._reverse) {
					if (this._frame > 0) {
						this._frame = 0;
						this._render();
					}
				} else {
					if (this._frame < this.frameCount) {
						this._frame = this.frameCount;
						this._render();
					}
				}
			}
			this._count = 1;
			for (var i = 0, isize = this._actors.length; i < isize; i++) {
				this._actors[i].onStop(this._count,this);
			}
			this.fire(tjs.anim.ANIMATE_STOP);
		}
	},
	_start:function(){
		for (var i = 0, isize = this._actors.length; i < isize; i++) {
			this._actors[i].onStart(this._count,this);
		}
		this._frame = this._reverse ? this.frameCount : 0;
	},
	start:function(){
		if (!this._id) {
			this.fire(tjs.anim.ANIMATE_START);
			this._count = this.animationCount;
			this._reverse = this.reverse;
			this._start();

			this._id = window.setInterval(this._animate_,this.interval);
		}
	},
	isRunning:function(){
		return Boolean(this._id);
	}
});

tjs.lang.defineTopClass('tjs.anim.Queue',
function(){
	this.datas = [];
	this._stopHandler_ = this._stopHandler.bind(this);
	this._running = false;//
},{
	destroy:function(){
		tjs.lang.destroyArray(this.datas);
		tjs.lang.destroyObject(this);
	},
	_isLegal:function(o){
		return (o instanceof tjs.anim.Animation) || tjs.lang.isFunction(o);
	},
	isRunning:function(){
		return this._running;
	},
	append:function(d){
		if (tjs.lang.isArray(d)) {
			var isize = d.length;
			if (isize > 0) {
				var j = this.datas.length, i, o;
				for (i = 0; i < isize; i++) {
					o = d[i];
					if (this._isLegal(o)) {
						this.datas[j++] = o;
					}
				}
			}
		} else if (this._isLegal(d)) {
			this.datas.push(d);
		}
	},
	_next:function(){
		if (this._running) {
			var o = this.datas.shift();
			if (o) {
				if (o instanceof tjs.anim.Animation) {
					this.data = o;
					o.addHandler(tjs.anim.ANIMATE_STOP,this._stopHandler_);
					o.start();
				} else {
					o();
					this._next();
				}
			} else {
				this._running = false;//
			}
		}
	},
	_stopHandler:function(source,type){
		source.removeHandler(type,this._stopHandler_);
		delete this.data;
		this._next();
	},
	start:function(){
		if (!this._running) {
			this._running = true;//
			this._next();
		}
	},
	stop:function(){
		if (this._running) {
			this._running = false;//
			if (this.data) {
				this.data.stop();
			}
			tjs.lang.destroyArray(this.datas);
		}
	}
});
