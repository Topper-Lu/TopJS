if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {

(function(){

var copyObject = function(o1, o2) {
	for (var x in o1) {
		o2[x] = o1[x];
	}
};

var copyState = function(s,d) {
	var l = tjs.lang;
	copyObject(s._m,d._m);
	copyObject(s._clip,d._clip);
	d.globalAlpha = s.globalAlpha;
	d.globalCompositeOperation = s.globalCompositeOperation;
	if (l.isObject(s.strokeStyle)) {
		if (l.isObject(d.strokeStyle)) {
			l.destroyObject(d.strokeStyle);
		} else {
			d.strokeStyle = {};
		}
		copyObject(s.strokeStyle,d.strokeStyle);
	} else {
		d.strokeStyle = s.strokeStyle;
	}
	if (l.isObject(s.fillStyle)) {
		if (l.isObject(d.fillStyle)) {
			l.destroyObject(d.fillStyle);
		} else {
			d.fillStyle = {};
		}
		copyObject(s.fillStyle,d.fillStyle);
	} else {
		d.fillStyle = s.fillStyle;
	}
	d.lineWidth = s.lineWidth;
	d.lineCap = s.lineCap;
	d.lineJoin = s.lineJoin;
	d.miterLimit = s.miterLimit;
	d.shadowColor = s.shadowColor;
	d.shadowOffsetX = s.shadowOffsetX;
	d.shadowOffsetY = s.shadowOffsetY;
	d.shadowBlur = s.shadowBlur;
	d.font = s.font;
	d.textAlign = s.textAlign;
	d.textBaseline = s.textBaseline;
	return d;
};

tjs.lang.defineTopClass('tjs.vml.CanvasRenderingContext2D',
function(canvas){
	this.canvas = canvas;
	this._construct();
},{
	destroy:function(){
		if (this.canvas) {
			this._destroy();
			tjs.lang.destroyObject(this);
		}
	},
	_destroy:function(){
		tjs.lang.destroyArray(this._stack,true);
		tjs.lang.destroyArray(this._path,true);
		tjs.lang.destroyObject(this._subpath);
		tjs.lang.destroyObject(this._m);
		tjs.lang.destroyObject(this._clip);
		tjs.lang.destroyObject(this.strokeStyle);
		tjs.lang.destroyObject(this.fillStyle);
	},
	_construct:function(){
		this._createState();
		this._stack = [];
		this._path = [];
		this._subpath = {cnt:0};
	},
	_createState:function(){
		this._m = {m11:1,m12:0,m21:0,m22:1,dx:0,dy:0};
		this._clip = {x:0,y:0,w:this.canvas.width,h:this.canvas.height};
		this.globalCompositeOperation = 'source-over';
		this.globalAlpha = 1.0;
		this.strokeStyle = '#000000';
		this.fillStyle = '#000000';
		this.lineWidth = 1;
		this.lineCap = 'butt';
		this.lineJoin = 'miter';
		this.miterLimit = 10;
		this.shadowColor = 'rgba(0,0,0,0)';
		this.shadowOffsetX = 0;
		this.shadowOffsetY = 0;
		this.shadowBlur = 0;
		this.font = '10px sans-serif';
		this.textAlign = 'start';
		this.textBaseline = 'alphabetic';
	},
	_reset:function(){
		this.canvas.innerHTML = '';
		this._destroy();
		this._createState();
		this._subpath.cnt = 0;
	},
	createPattern:function(image,repetition){
		return new tjs.vml.CanvasPattern(image,repetition);
	},
	createLinearGradient:function(x0,y0,x1,y1){
		return new tjs.vml.LinearGradient(x0,y0,x1,y1);
	},
	createRadialGradient:function(x0,y0,r0,x1,y1,r1){
		return new tjs.vml.RadialGradient(x0,y0,r0,x1,y1,r1);
	},
	save:function(){
		this._stack.push(copyState(this,{_m:{},_clip:{}}));
	},
	restore:function(){
		var s = this._stack.pop();
		copyState(s,this);
		tjs.lang.destroyObject(s,true);
	},
	scale:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.scale');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.scale');
//tjs_debug_end
		var o = this._m;
		o.m11 *= x;
		o.m12 *= x;
		o.m21 *= y;
		o.m22 *= y;
	},
	rotate:function(angle){//in radians
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(angle),'!tjs.lang.isNumber(angle) @'+this.classname+'.rotate');
//tjs_debug_end
		var o = this._m, c = Math.cos(angle), s = Math.sin(angle);
		var m11 = o.m11*c + o.m21*s;
		var m21 = o.m21*c - o.m11*s;
		var m12 = o.m12*c + o.m22*s;
		var m22 = o.m22*c - o.m12*s;
		o.m11 = m11;
		o.m21 = m21;
		o.m12 = m12;
		o.m22 = m22;
	},
	translate:function(dx,dy){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(dx),'!tjs.lang.isNumber(dx) @'+this.classname+'.translate');
		tjs.lang.assert(tjs.lang.isNumber(dy),'!tjs.lang.isNumber(dy) @'+this.classname+'.translate');
//tjs_debug_end
		var o = this._m;
		o.dx += o.m11*dx + o.m21*dy;
		o.dy += o.m12*dx + o.m22*dy;
	},
	transform:function(m11,m12,m21,m22,dx,dy){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(m11),'!tjs.lang.isNumber(m11) @'+this.classname+'.transform');
		tjs.lang.assert(tjs.lang.isNumber(m12),'!tjs.lang.isNumber(m12) @'+this.classname+'.transform');
		tjs.lang.assert(tjs.lang.isNumber(m21),'!tjs.lang.isNumber(m21) @'+this.classname+'.transform');
		tjs.lang.assert(tjs.lang.isNumber(m22),'!tjs.lang.isNumber(m22) @'+this.classname+'.transform');
		tjs.lang.assert(tjs.lang.isNumber(dx),'!tjs.lang.isNumber(dx) @'+this.classname+'.transform');
		tjs.lang.assert(tjs.lang.isNumber(dy),'!tjs.lang.isNumber(dy) @'+this.classname+'.transform');
//tjs_debug_end
		var m = {}, o = this._m;
		m.m11 = o.m11*m11 + o.m21*m12;
		m.m21 = o.m11*m21 + o.m21*m22;
		m.dx  = o.m11*dx  + o.m21*dy + o.dx;
		m.m12 = o.m12*m11 + o.m22*m12;
		m.m22 = o.m12*m21 + o.m22*m22;
		m.dy  = o.m12*dx  + o.m22*dy + o.dy;
		tjs.lang.destroyObject(o);
		this._m = m;
	},
	setTransform:function(m11,m12,m21,m22,dx,dy){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(m11),'!tjs.lang.isNumber(m11) @'+this.classname+'.setTransform');
		tjs.lang.assert(tjs.lang.isNumber(m12),'!tjs.lang.isNumber(m12) @'+this.classname+'.setTransform');
		tjs.lang.assert(tjs.lang.isNumber(m21),'!tjs.lang.isNumber(m21) @'+this.classname+'.setTransform');
		tjs.lang.assert(tjs.lang.isNumber(m22),'!tjs.lang.isNumber(m22) @'+this.classname+'.setTransform');
		tjs.lang.assert(tjs.lang.isNumber(dx),'!tjs.lang.isNumber(dx) @'+this.classname+'.setTransform');
		tjs.lang.assert(tjs.lang.isNumber(dy),'!tjs.lang.isNumber(dy) @'+this.classname+'.setTransform');
//tjs_debug_end
		var o = this._m;
		o.m11 = m11;
		o.m12 = m12;
		o.m21 = m21;
		o.m22 = m22;
		o.dx = dx;
		o.dy = dy;
	},
	_toXY:function(x,y,o){
		if (!o) {
			o = {};
		}
		var m = this._m;
		o.x = m.m11*x + m.m21*y + m.dx;
		o.y = m.m12*x + m.m22*y + m.dy;
		return o;
	},
	_fromXY:function(x,y,o){
		if (!o) {
			o = {};
		}
		var m = this._m;
		var d = m.m11*m.m22 - m.m12*m.m21;
		var dx = x - m.dx, dy = y - m.dy;
		o.x = (m.m22*dx - m.m21*dy)/d;
		o.y = (m.m11*dy - m.m12*dx)/d;
		return o;
	},
	beginPath:function(){
		tjs.lang.destroyArray(this._path,true);
		tjs.lang.destroyObject(this._subpath);
		this._subpath.cnt = 0;
	},
	closePath:function(){
		var sp = this._subpath;
		if (sp.cnt > 1) {
			this._path.push({cmd:'x'});
			sp.cnt = 1;
			sp.x = sp.x0;
			sp.y = sp.y0;
		}
	},
	moveTo:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.moveTo');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.moveTo');
//tjs_debug_end
		var sp = this._subpath;
		if (sp.cnt == 1) {
			var o = this._path[this._path.length - 1];
			if (o.cmd == 'm') {
				tjs.lang.destroyObject(this._path.pop());
			}
		}
		this._moveTo(this._toXY(x,y));
	},
	_moveTo:function(o){
		o.cmd = 'm';
		this._path.push(o);
		var sp = this._subpath;
		sp.cnt = 1;
		sp.x0 = o.x;
		sp.y0 = o.y;
		sp.x = sp.x0;
		sp.y = sp.y0;
	},
	lineTo:function(x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.lineTo');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.lineTo');
//tjs_debug_end
		var sp = this._subpath;
		if (sp.cnt == 0) {
			this.moveTo(x,y);
		} else {
			var p = this._toXY(x,y);
			if (p.x != sp.x || p.y != sp.y) {
				this._lineTo(p);
			}
		}
	},
	_lineTo:function(o){
		o.cmd = 'l';
		this._path.push(o);
		var sp = this._subpath;
		sp.x = o.x;
		sp.y = o.y;
		sp.cnt++;
	},
	rect:function(x,y,w,h){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.rect');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.rect');
		tjs.lang.assert(tjs.lang.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.rect');
		tjs.lang.assert(tjs.lang.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.rect');
//tjs_debug_end
		if (w == 0 && h == 0) {
			return;
		}
		this.moveTo(x,y);
		if (w == 0) {
			this.lineTo(x,y+h);
		} else if (h == 0) {
			this.lineTo(x+w,y);
		} else {
			this.lineTo(x+w,y);
			this.lineTo(x+w,y+h);
			this.lineTo(x,y+h);
		}
		this.closePath();
	},
	quadraticCurveTo:function(cpx,cpy,x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(cpx),'!tjs.lang.isNumber(cpx) @'+this.classname+'.quadraticCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(cpy),'!tjs.lang.isNumber(cpy) @'+this.classname+'.quadraticCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.quadraticCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.quadraticCurveTo');
//tjs_debug_end
		var sp = this._subpath;
		if (sp.cnt == 0) {
			this.moveTo(cpx,cpy);
			this.lineTo(x,y);
		} else if (cpx == x && cpy == y) {
			this.lineTo(x,y);
		} else {
			var cp = this._toXY(cpx,cpy);
			var p = this._toXY(x,y);
			if (cp.x == sp.x && cp.y == sp.y) {
				this._lineTo(p);
			} else {
				var cp1 = {x:sp.x+2.0/3.0*(cp.x-sp.x),y:sp.y+2.0/3.0*(cp.y-sp.y)};
				var cp2 = {x:cp1.x+(p.x-sp.x)/3.0,y:cp1.y+(p.y-sp.y)/3.0};
				this._bezierCurveTo(cp1,cp2,p);
			}
		}
	},
	bezierCurveTo:function(cp1x,cp1y,cp2x,cp2y,x,y){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(cp1x),'!tjs.lang.isNumber(cp1x) @'+this.classname+'.bezierCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(cp1y),'!tjs.lang.isNumber(cp1y) @'+this.classname+'.bezierCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(cp2x),'!tjs.lang.isNumber(cp2x) @'+this.classname+'.bezierCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(cp2y),'!tjs.lang.isNumber(cp2y) @'+this.classname+'.bezierCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.bezierCurveTo');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.bezierCurveTo');
//tjs_debug_end
		var sp = this._subpath;
		if (sp.cnt == 0) {
			this.moveTo(cp1x,cp1y);
		}
		var cp1 = this._toXY(cp1x, cp1y);
		var cp2 = this._toXY(cp2x, cp2y);
		var p = this._toXY(x,y);
		this._bezierCurveTo(cp1,cp2,p);
	},
	_bezierCurveTo:function(cp1,cp2,p){
		p.cmd = 'c';
		p.cp1x = cp1.x;
		p.cp1y = cp1.y;
		p.cp2x = cp2.x;
		p.cp2y = cp2.y;
		this._path.push(p);
		var sp = this._subpath;
		sp.x = p.x;
		sp.y = p.y;
		sp.cnt++;
	},
	arc:function(x,y,radius,startAngle,endAngle,anticlockwise){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.arc');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.arc');
		tjs.lang.assert(tjs.lang.isNumber(radius),'!tjs.lang.isNumber(radius) @'+this.classname+'.arc');
		tjs.lang.assert(tjs.lang.isNumber(startAngle),'!tjs.lang.isNumber(startAngle) @'+this.classname+'.arc');
		tjs.lang.assert(tjs.lang.isNumber(endAngle),'!tjs.lang.isNumber(endAngle) @'+this.classname+'.arc');
		tjs.lang.assert(radius >= 0,'radius < 0 @'+this.classname+'.arc');
//tjs_debug_end
		if (radius == 0) {
			this.lineTo(x,y);
		} else if (startAngle == endAngle) {
			this.lineTo(x + radius*Math.cos(startAngle),y + radius*Math.sin(startAngle));
		} else {
			this._arc(x,y,radius,startAngle,endAngle,anticlockwise);
		}
	},
	_arc:function(x,y,radius,startAngle,endAngle,anticlockwise){
		var _m = {};
		copyObject(this._m,_m);
		this.translate(x,y);//
		var th0 = (endAngle - startAngle), th, cnt = 0;
		if (th0 <= 0.5*Math.PI) {
			th = th0;
		} else if (th0 <= Math.PI) {
			th = th0/2;
			cnt = 1;
		} else if (th0 <= 1.5*Math.PI) {
			th = th0/3;
			cnt = 2;
		} else {
			th = th0/4;
			cnt = 3;
		}
		this.rotate(th/2 + startAngle);//
		var xs = Math.cos(th/2);
		var ys = Math.sin(th/2);
		var xc = (4 - xs)/3;
		var yc = (1 - xs)*(3 - xs)/(3*ys);
		xs *= radius;
		ys *= radius;
		xc *= radius;
		yc *= radius;
		var sp = this._subpath;
		if (sp.cnt == 0) {
			this.moveTo(xs,-ys);
		} else {
			this.lineTo(xs,-ys);
		}
		this.bezierCurveTo(xc,-yc,xc,yc,xs,ys);
		for (var i = 0; i < cnt; i++) {
			this.rotate(th);//
			this.bezierCurveTo(xc,-yc,xc,yc,xs,ys);
		}
		copyObject(_m,this._m);
		tjs.lang.destroyObject(_m);
	},
	arcTo:function(x1,y1,x2,y2,radius){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x1),'!tjs.lang.isNumber(x1) @'+this.classname+'.arcTo');
		tjs.lang.assert(tjs.lang.isNumber(y1),'!tjs.lang.isNumber(y1) @'+this.classname+'.arcTo');
		tjs.lang.assert(tjs.lang.isNumber(x2),'!tjs.lang.isNumber(x2) @'+this.classname+'.arcTo');
		tjs.lang.assert(tjs.lang.isNumber(y2),'!tjs.lang.isNumber(y2) @'+this.classname+'.arcTo');
		tjs.lang.assert(tjs.lang.isNumber(radius),'!tjs.lang.isNumber(radius) @'+this.classname+'.arcTo');
		tjs.lang.assert(radius >= 0,'radius < 0 @'+this.classname+'.arcTo');
//tjs_debug_end
		var sp = this._subpath;
		if (sp.cnt == 0) {
			this.moveTo(x1,y1);
		} else if (radius == 0 || (x1 == x2 && y1 == y2)) {
			this.lineTo(x1,y1);
		} else {
			var p0 = this._fromXY(sp.x,sp.y);
			if (x1 == p0.x && y1 == p0.y) {
				this.lineTo(x1,y1);
			} else {
				var mq = Math.sqrt;
				var x10 = p0.x - x1, y10 = p0.y - y1, x12 = x2 - x1, y12 = y2 - y1;
				var r10 = mq(x10*x10 + y10*y10), r12 = mq(x12*x12 + y12*y12);
				var c = (x10*y12 - y10*x12)/(r10*r12);
				if (Math.abs(c) < 1E-6) {
					this.lineTo(x1,y1);
				} else {
					var ak = c > 0;
					var th = 0.5*Math.acos((x10*x12 + y10*y12)/(r10*r12));
					var f = radius/Math.tan(th);
					var f10 = f/r10;
					var x = x10/r10 + x12/r12, y = y10/r10 + y12/r12;
					f = radius/Math.sin(th);
					f = f/mq(x*x + y*y);
					var xc = x1 + f*x, yc = y1 + f*y;
					var xs = x1 + f10*x10, ys = y1 + f10*y10;
					var startAngle = Math.atan2(ys - yc,xs - xc);
					var endAngle = Math.PI - 2*th;
					endAngle = ak ? (startAngle - endAngle) : (startAngle + endAngle);
					this._arc(xc,yc,radius,startAngle,endAngle,ak);
				}
			}
			tjs.lang.destroyObject(p0);
		}
	},
	_createPoint:function(x,y){
		return 'm '+x+','+y+' l '+x+','+y+' x ';
	},
	_createRect:function(x,y,w,h){
		return 'm '+x+','+y+' l '+(x+w)+','+y+','+(x+w)+','+(y+h)+','+x+','+(y+h)+' x ';
	},
	_createPath:function(F){
		var b = [], k = 0, mr = Math.round, o;
		for (var i = 0, isize = this._path.length; i < isize; i++) {
			o = this._path[i];
			switch (o.cmd) {
			case 'm':
			case 'l':
				b[k++] = o.cmd+' '+mr(o.x*F)+','+mr(o.y*F)+' ';
				break;
			case 'x':
				b[k++] = o.cmd+' ';
				break;
			case 'c':
				b[k++] = o.cmd+' '+mr(o.cp1x*F)+','+mr(o.cp1y*F)+','+mr(o.cp2x*F)+','+mr(o.cp2y*F)+','+mr(o.x*F)+','+mr(o.y*F)+' ';
				break;
			}
		}
		var s = b.join('');
		tjs.lang.destroyArray(b);
		return s;
	},
	_createPath2:function(F){
		var b = [], k = 0, mr = Math.round, c = {}, o;
		for (var i = 0, isize = this._path.length; i < isize; i++) {
			o = this._path[i];
			switch (o.cmd) {
			case 'm':
			case 'l':
				this._fromXY(o.x,o.y,c);
				b[k++] = o.cmd+' '+mr(c.x*F)+','+mr(c.y*F)+' ';
				break;
			case 'x':
				b[k++] = o.cmd+' ';
				break;
			case 'c':
				this._fromXY(o.cp1x,o.cp1y,c);
				b[k++] = o.cmd+' '+mr(c.x*F)+','+mr(c.y*F)+',';
				this._fromXY(o.cp2x,o.cp2y,c);
				b[k++] = mr(c.x*F)+','+mr(c.y*F)+',';
				this._fromXY(o.x,o.y,c);
				b[k++] = mr(c.x*F)+','+mr(c.y*F)+' ';
				break;
			}
		}
		tjs.lang.destroyObject(c);
		var s = b.join('');
		tjs.lang.destroyArray(b);
		return s;
	},
	fillRect:function(x,y,w,h){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.fillRect');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.fillRect');
		tjs.lang.assert(tjs.lang.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.fillRect');
		tjs.lang.assert(tjs.lang.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.fillRect');
//tjs_debug_end
		if (w == 0 || h == 0) {
			return;
		}
		var path = this._path, sp = this._subpath;
		this._path = [];
		this._subpath = {cnt:0};
		this.rect(x,y,w,h);
		this.fill();
		tjs.lang.destroyArray(this._path,true);
		tjs.lang.destroyObject(this._subpath);
		this._path = path;
		this._subpath = sp;
	},
	strokeRect:function(x,y,w,h){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(x),'!tjs.lang.isNumber(x) @'+this.classname+'.strokeRect');
		tjs.lang.assert(tjs.lang.isNumber(y),'!tjs.lang.isNumber(y) @'+this.classname+'.strokeRect');
		tjs.lang.assert(tjs.lang.isNumber(w),'!tjs.lang.isNumber(w) @'+this.classname+'.strokeRect');
		tjs.lang.assert(tjs.lang.isNumber(h),'!tjs.lang.isNumber(h) @'+this.classname+'.strokeRect');
//tjs_debug_end
		if (w == 0 && h == 0) {
			return;
		}
		var path = this._path, sp = this._subpath;
		this._path = [];
		this._subpath = {cnt:0};

		this.rect(x,y,w,h);
		this.stroke();

		tjs.lang.destroyArray(this._path,true);
		tjs.lang.destroyObject(this._subpath);
		this._path = path;
		this._subpath = sp;
	},
	stroke:function(){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2, tc = tjs.color, c = tc.parseColor(this.strokeStyle);
		var path = this._createPath(F);
		this._drawBlur(path,true);
		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="false" stroked="true" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;">';
		b[k++] = '<v:path v="'+path+'" />';
		/*
		var m = this._m;
		var f = Math.sqrt(Math.abs(m.m11*m.m22 - m.m12*m.m21))*this.lineWidth;
		if (f < 1) {
			f = 1;
		}
		*/
		b[k++] = '<v:stroke color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" weight="'+this.lineWidth+'px" joinstyle="'+this.lineJoin+'" miterlimit="'+this.miterLimit+'" endcap="'+this._toLineCap(this.lineCap)+'" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	_toLineCap:function(lc) {
		switch (lc) {
		case 'butt':
			return 'flat';
		case 'round':
			return 'round';
		case 'square':
		default:
			return 'square';
		}
	},
	fill:function(){
		if (tjs.lang.isString(this.fillStyle)) {
			this._fill();
		} else if (this.fillStyle instanceof tjs.vml.LinearGradient) {
			this._fillLinearGradient();
		} else if (this.fillStyle instanceof tjs.vml.RadialGradient) {
			this._fillRadialGradient();
		} else if (this.fillStyle instanceof tjs.vml.CanvasPattern) {
			this._fillPattern();
		}
	},
	_fill:function(){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2;

		var path = this._createPath(F);
		this._drawBlur(path,false);

		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="true" stroked="false" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;">';
		b[k++] = '<v:path v="'+path+'" />';
		var tc = tjs.color, c = tc.parseColor(this.fillStyle);
		b[k++] = '<v:fill color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	_fillLinearGradient:function(){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2;

		var path = this._createPath(F);
		this._drawBlur(path,false);

		var ps = this.fillStyle._points;
		var p0 = this._toXY(ps.x0,ps.y0);
		var p1 = this._toXY(ps.x1,ps.y1);
		var pa = this._toXY(0,0);
		var pb = this._toXY(w,0);
		var pc = this._toXY(w,h);
		var pd = this._toXY(0,h);
		var xmin = Math.min(pa.x,pb.x,pc.x,pd.x);
		var xmax = Math.max(pa.x,pb.x,pc.x,pd.x);
		var ymin = Math.min(pa.y,pb.y,pc.y,pd.y);
		var ymax = Math.max(pa.y,pb.y,pc.y,pd.y);
		var x = p1.x - p0.x, y = p1.y - p0.y;
		var r = Math.sqrt(x*x + y*y);
		var r1 = ((xmin - p0.x)*x + (ymin - p0.y)*y)/r;
		var r2 = ((xmin - p0.x)*x + (ymax - p0.y)*y)/r;
		var r3 = ((xmax - p0.x)*x + (ymin - p0.y)*y)/r;
		var r4 = ((xmax - p0.x)*x + (ymax - p0.y)*y)/r;
		var rmin = Math.min(r1,r2,r3,r4);
		var rmax = Math.max(r1,r2,r3,r4);
		var dt = rmax - rmin;
		var t0 = -rmin/dt, f = r/dt;
		var angle = Math.atan2(x*(xmax-xmin),y*(ymax-ymin))*180/Math.PI;
		if (angle < 0) {
			angle += 360;
		}

		var cs = this.fillStyle.getColors();
		var d = [], j = 0, len = cs.length;
		var tc = tjs.color, c;
		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="true" stroked="false" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;">';
		b[k++] = '<v:path v="'+path+this._createPoint(xmin*F,ymin*F)+this._createPoint(xmax*F,ymax*F)+'" />';
		b[k++] = '<v:fill type="gradient" method="none" focus="1" angle="'+angle+'"';
		c = cs[0];
		b[k++] = ' color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'"';
		c = cs[len - 1];
		b[k++] = ' color2="'+tc.toHexString(c)+'" o:opacity2="'+c.a*this.globalAlpha+'" colors="';
		for (var i = 0; i < len; i++) {
			c = cs[i];
			d[j++] = (t0 + f*c.o)+' '+tc.toHexString(c);
		}
		b[k++] = d.join(',');
		tjs.lang.destroyArray(d);
		b[k++] = '" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	_fillRadialGradient:function(){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2;
		var ps = this.fillStyle._points;
		var cs = this.fillStyle.getColors();
		var len = cs.length;
		var tc = tjs.color, c0 = cs[0], c1 = cs[len - 1];
		var m = this._m, mr = Math.round;

		var path = this._createPath(F);
		this._drawBlur(path,false);

		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="true" stroked="false" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;">';
		b[k++] = '<v:path v="'+path+'" />';
		b[k++] = '<v:fill color="'+tc.toHexString(c1)+'" opacity="'+c1.a*this.globalAlpha+'" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);

		var pa = this._toXY(ps.x1 - ps.r1,ps.y1 - ps.r1), pb = this._toXY(ps.x1 + ps.r1,ps.y1 - ps.r1), pc = this._toXY(ps.x1 + ps.r1,ps.y1 + ps.r1), pd = this._toXY(ps.x1 - ps.r1,ps.y1 + ps.r1);
		var x_min = Math.min(pa.x,pb.x,pc.x,pd.x);
		var y_min = Math.min(pa.y,pb.y,pc.y,pd.y);
		var r2 = 2*ps.r1, fcs = ps.r0/ps.r1;
		var fcx = (ps.x0 - ps.r0 - ps.x1 + ps.r1)/r2, fcy = (ps.y0 - ps.r0 - ps.y1 + ps.r1)/r2;
		b[k++] = '<v:oval filled="true" stroked="false" style="position:absolute;left:'+mr(x_min - ps.x1 + ps.r1)+'px;top:'+mr(y_min - ps.y1 + ps.r1)+'px;width:'+r2+'px;height:'+r2+'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11='+m.m11+',M12='+m.m21+',M21='+m.m12+',M22='+m.m22+',Dx='+m.dx+',Dy='+m.dy+',SizingMethod=\'auto expand\');">';
		b[k++] = '<v:fill type="gradientRadial" color="'+tc.toHexString(c0)+'" opacity="'+c0.a*this.globalAlpha+'" color2="'+tc.toHexString(c1)+'" o:opacity2="'+c1.a*this.globalAlpha+'" method="none" focus="1" focusposition="'+fcx+','+fcy+'" focussize="'+fcs+','+fcs+'" />';
		b[k++] = '</v:oval>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	_fillPattern:function(){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2;
		var m = this._m;
		var c = this.fillStyle;

		var path = this._createPath(F);
		this._drawBlur(path,false);

		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="true" stroked="false" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11='+m.m11+',M12='+m.m21+',M21='+m.m12+',M22='+m.m22+',Dx='+m.dx+',Dy='+m.dy+');">';
		b[k++] = '<v:path v="'+this._createPath2(F)+this._createPoint(0,0)+this._createPoint(W,0)+this._createPoint(W,H)+this._createPoint(0,H)+'" />';
		b[k++] = '<v:fill type="tile" opacity="'+this.globalAlpha+'" src="'+c.image.src+'" origin="0,0" position="0,0" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	_drawImage3:function(image,dx,dy){
		var w = image.width, h = image.height;
		if (dx == null) {
			dx = 0;
		}
		if (dy == null) {
			dy = 0;
		}
		this._drawImage(image,0,0,w,h,dx,dy,w,h);
	},
	_drawImage5:function(image,dx,dy,dw,dh){
		var w = image.width, h = image.height;
		if (dx == null) {
			dx = 0;
		}
		if (dy == null) {
			dy = 0;
		}
		if (dw == null) {
			dw = w;
		}
		if (dh == null) {
			dh = h;
		}
		this._drawImage(image,0,0,w,h,dx,dy,dw,dh);
	},
	_drawImage9:function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		var w = image.width, h = image.height;
		if (sx == null) {
			sx = 0;
		}
		if (sy == null) {
			sy = 0;
		}
		if (sw == null) {
			sw = w;
		}
		if (sh == null) {
			sh = h;
		}
		if (dx == null) {
			dx = 0;
		}
		if (dy == null) {
			dy = 0;
		}
		if (dw == null) {
			dw = sw;
		}
		if (dh == null) {
			dh = sh;
		}
		this._drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
	},
	_drawImage:function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		var F = 100;
		var w = this.canvas.width, h = this.canvas.height;
		var W = w*F, H = h*F;
		var b = [], k = 0, O = F/2;
		var m = this._m, mr = Math.round;

		if (this.shadowBlur > 0) {
			var p1 = this._toXY(dx,dy), p2 = this._toXY(dx+dw,dy), p3 = this._toXY(dx+dw,dy+dh), p4 = this._toXY(dx,dy+dh);
			var path = 'm '+mr(p1.x*F)+','+mr(p1.y*F)+' l '+mr(p2.x*F)+','+mr(p2.y*F)+','+mr(p3.x*F)+','+mr(p3.y*F)+','+mr(p4.x*F)+','+mr(p4.y*F)+' x';
			this._drawBlur(path,false);
			tjs.lang.destroyObject(p1);
			tjs.lang.destroyObject(p2);
			tjs.lang.destroyObject(p3);
			tjs.lang.destroyObject(p4);
		}

		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="true" stroked="false" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11='+m.m11+',M12='+m.m21+',M21='+m.m12+',M22='+m.m22+',Dx='+m.dx+',Dy='+m.dy+');">';
		b[k++] = '<v:path v="'+this._createRect(mr(dx*F),mr(dy*F),mr(dw*F),mr(dh*F))+this._createPoint(0,0)+this._createPoint(W,0)+this._createPoint(W,H)+this._createPoint(0,H)+'" />';
		var wi = image.width, hi = image.height;
		var ws = wi*dw/sw, hs = hi*dh/sh;
		b[k++] = '<v:fill type="tile" src="'+image.src+'" origin="'+sx/wi+','+sy/hi+'" position="'+dx/w+','+dy/h+'" size="'+ws/w+','+hs/h+'" />';
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';
		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	drawImage:function(){
		var a = arguments;
		var len = a.length;
		if (len == 0) {
			throw new TypeError('Need more arguments!');
		} else {
			if (a[0] == null) {
				throw new TypeError('NO image!');
			}
			if (len <= 3) {
				this._drawImage3.apply(this,a);
			} else if (len <= 5) {
				this._drawImage5.apply(this,a);
			} else {
				this._drawImage9.apply(this,a);
			}
		}
	},
	_drawBlur:function(path,stroke){
		if (this.shadowBlur > 0 && path) {
			var tc = tjs.color;
			var c = tc.parseColor(this.shadowColor);
			if (c.a > 0) {
				fill = !stroke;
				var F = 100;
				var w = this.canvas.width, h = this.canvas.height;
				var W = w*F, H = h*F, O = fill ? F/2 : 0;
				var r = Math.round(this.shadowBlur > 8 ? Math.sqrt(2*this.shadowBlur) : this.shadowBlur/2);
				var offX = this.shadowOffsetX - r, offY = this.shadowOffsetY - r;
				var b = [], k = 0;
				b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="'+fill+'" stroked="'+!fill+'" style="position:absolute;left:'+offX+'px;top:'+offY+'px;width:'+w+'px;height:'+h+'px;filter:progid:DXImageTransform.Microsoft.Alpha(opacity='+Math.round(c.a*100)+')progid:DXImageTransform.Microsoft.Blur(pixelRadius='+r+');">';
				b[k++] = '<v:path v="'+path+'" />';
				if (fill) {
					b[k++] = '<v:fill color="'+tc.toHexString(c)+'" />';
				} else {
					b[k++] = '<v:stroke color="'+tc.toHexString(c)+'" weight="'+this.lineWidth+'px" joinstyle="'+this.lineJoin+'" miterlimit="'+this.miterLimit+'" endcap="'+this._toLineCap(this.lineCap)+'" />';
				}
				b[k++] = '</v:shape>';
				this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
				tjs.lang.destroyArray(b);
			}
		}
	},
	_drawShadow:function(){
		var s = '';
		if (this.shadowBlur == 0 && (this.shadowOffsetX != 0 || this.shadowOffsetY != 0)) {
			var tc = tjs.color;
			var c = tc.parseColor(this.shadowColor);
			if (c.a > 0) {
				s = '<v:shadow on="true" offset="'+this.shadowOffsetX+'px,'+this.shadowOffsetY+'px" color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
			}
		}
		return s;
	},
	strokeText:function(text,x,y,maxWidth){
		this._drawText(text,x,y,maxWidth,false);
	},
	fillText:function(text,x,y,maxWidth){
		this._drawText(text,x,y,maxWidth,true);
	},
	_drawText:function(text,x,y,maxWidth,fill){
		var w = this.canvas.width, h = this.canvas.height;
		var F = 100,  W = w*F, H = h*F, O = fill ? F/2 : 0;
		var tm = this.measureText(text), tw, th;
		if (tjs.lang.isNumber(maxWidth) && maxWidth > 0) {
			if (tm.width <= maxWidth) {
				tw = tm.width;
				th = tm.fontSize;
			} else {
				tw = maxWidth;
				th = Math.round(tm.fontSize*maxWidth/tm.width);
			}
		} else {
			tw = tm.width;
			th = tm.fontSize;
		}
		var dir = this.canvas.dir, mr = Math.round;
		var ta,x1,x2;
		switch (this.textAlign) {
		case 'start':
			ta = dir == 'rtl' ? 'right' : 'left';
			break;
		case 'end':
			ta = dir == 'rtl' ? 'left' : 'right';
			break;
		default:
			ta = this.textAlign;
			break;
		}
		switch (ta) {
		case 'left':
			x1 = x;
			x2 = x + tw;
			break;
		case 'right':
			x1 = x - tw;
			x2 = x;
			break;
		case 'center':
			x1 = x - mr(tw/2);
			x2 = x1 + tw;
			break;
		}
		switch (this.textBaseline) {
		case 'top':
			y += mr(0.5*th);
			break;
		case 'bottom':
			y -= mr(0.5*th);
			break;
		case 'middle':
			break;
		case 'alphabetic':
		case 'hanging':
		case 'ideographic':
		default:
			y -= mr(0.25*th);
			break;
		}
		var p1 = this._toXY(x1,y), p2 = this._toXY(x2,y);
		var path = 'm '+mr(p1.x*F)+','+mr(p1.y*F)+' l '+mr(p2.x*F)+','+mr(p2.y*F);
		var b = [], k = 0, tc = tjs.color, c;

		if (this.shadowBlur > 0) {
			c = tc.parseColor(this.shadowColor);
			if (c.a > 0) {
				var r = Math.round(this.shadowBlur > 8 ? Math.sqrt(2*this.shadowBlur) : this.shadowBlur/2);
				var offX = this.shadowOffsetX - r, offY = this.shadowOffsetY - r;
				b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="'+fill+'" stroked="'+!fill+'" style="position:absolute;left:'+offX+'px;top:'+offY+'px;width:'+w+'px;height:'+h+'px;filter:progid:DXImageTransform.Microsoft.Alpha(opacity='+Math.round(c.a*100)+')progid:DXImageTransform.Microsoft.Blur(pixelRadius='+r+');">';
				b[k++] = '<v:path v="'+path+'" textpathok="true" />';
				b[k++] = '<v:textpath on="true" fitpath="true" string="'+text+'" style="font:'+this.font+';v-text-align:'+ta+';" />';
				if (fill) {
					b[k++] = '<v:fill color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
				} else {
					b[k++] = '<v:stroke color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
				}
				b[k++] = '</v:shape>';
				this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
				tjs.lang.destroyArray(b);
			}
		}

		b[k++] = '<v:shape coordorigin="'+O+','+O+'" coordsize="'+W+','+H+'" filled="'+fill+'" stroked="'+!fill+'" style="position:absolute;left:0px;top:0px;width:'+w+'px;height:'+h+'px;">';
		b[k++] = '<v:path v="'+path+'" textpathok="true" />';
		b[k++] = '<v:textpath on="true" fitpath="true" string="'+text+'" style="font:'+this.font+';v-text-align:'+ta+';" />';
		if (fill) {
			c = tc.parseColor(this.fillStyle);
			b[k++] = '<v:fill color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
		} else {
			c = tc.parseColor(this.strokeStyle);
			b[k++] = '<v:stroke color="'+tc.toHexString(c)+'" opacity="'+c.a*this.globalAlpha+'" />';
		}
		b[k++] = this._drawShadow();
		b[k++] = '</v:shape>';

		this.canvas.insertAdjacentHTML('beforeEnd',b.join(''));
		tjs.lang.destroyArray(b);
	},
	measureText:function(text){
		var s = document.createElement('span');
		s.style.cssText = 'visibility:hidden;margin:0px;border:0px none;padding:0px;font:'+this.font+';';
		s.appendChild(document.createTextNode(text));
		//var c = tjs.html.getHiddenContainer();
		this.canvas.appendChild(s);
		var o = {width:s.offsetWidth,fontSize:tjs.css.getFontSize(s)};
		this.canvas.removeChild(s);
		return o;
	},
	createImageData:function(){
		throw new Error('No implementation!');
	},
	drawFocusRing:function(element,x,y){
		throw new Error('No implementation!');
	},
	clearRect:function(x,y,w,h){
		throw new Error('No implementation!');
	},
	clip:function(){
		throw new Error('No implementation!');
	},
	isPointInPath:function(x,y){
		throw new Error('No implementation!');
	}
});

tjs.lang.defineTopClass('tjs.vml.CanvasPattern',
function(image,repetition){
	this.image = image;
	this.repetition = repetition;
},{
	destroy:function(){
		tjs.lang.destroyObject(this);
	}
});

tjs.lang.defineTopClass('tjs.vml.CanvasGradient',
function(){
	this._colors = [];
	this._points = {};
	this._sorted = false;
},{
	destroy:function(){
		if (this._colors) {
			tjs.lang.destroyArray(this._colors,true);
			tjs.lang.destroyObject(this._points);
			tjs.lang.destroyObject(this);
		}
	},
	addColorStop:function(offset,color){
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isNumber(offset),'!tjs.lang.isNumber(offset) @'+this.classname+'.addColorStop');
		tjs.lang.assert(offset >= 0 && offset <= 1,'!tjs.lang.isNumber(y) @'+this.classname+'.addColorStop');
//tjs_debug_end
		var o = tjs.color.parseColor(color);
		o.o = offset;
		this._colors.push(o);
		this._sorted = false;
	},
	_fSort:function(a,b){
		return a.o - b.o;
	},
	getColors:function(){
		if (!this._sorted) {
			this._colors.sort(this._fSort);
		}
		return this._colors;
	}
});

tjs.lang.defineClass('tjs.vml.LinearGradient',tjs.vml.CanvasGradient,
function(x0,y0,x1,y1){
	tjs.vml.CanvasGradient.call(this);
	this._points.x0 = x0;
	this._points.y0 = y0;
	this._points.x1 = x1;
	this._points.y1 = y1;
});

tjs.lang.defineClass('tjs.vml.RadialGradient',tjs.vml.CanvasGradient,
function(x0,y0,r0,x1,y1,r1){
	tjs.vml.CanvasGradient.call(this);
	this._points.x0 = x0;
	this._points.y0 = y0;
	this._points.r0 = r0;
	this._points.x1 = x1;
	this._points.y1 = y1;
	this._points.r1 = r1;
});

})();

}
