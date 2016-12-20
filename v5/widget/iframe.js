tjs.lang.defineClass('tjs.widget.IFrameWrapper',tjs.widget.Widget,
function(o) {
	tjs.widget.Widget.call(this,o);
},{
	_construct:function() {
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname);
//tjs_debug_end
			if (this.oElement.hasChildNodes()) {
				this.oElement.innerHTML = '';
			}
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		tjs.dom.addClass(this.oElement,'tjs_iframe_wrapper');

		this.oIFrame = document.createElement('iframe');
		if (tjs.bom.isIE6 || tjs.bom.isIE7 || tjs.bom.isIE8) {
			this.oIFrame.setAttribute('frameborder','0');
			this.oIFrame.setAttribute('marginwidth','0');
			this.oIFrame.setAttribute('marginheight','0');
			this.oIFrame.setAttribute('scrolling','no');
		}
		this.oIFrame.className = 'tjs_iframe';
		this.oElement.appendChild(this.oIFrame);

		var b = [], k = 0;
		b[k++] = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
		b[k++] = '<html><head><title>TJS IFrame</title>';
		b[k++] = '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
		b[k++] = '</head><body><div id="tjs_body_wrapper"></div></body></html>';
		var s = b.join('');
		tjs.lang.destroyArray(b);

		this.win = this.oIFrame.contentWindow;
		this.doc = this.win.document;
		this.doc.open();
		this.doc.write(s);
		this.doc.close();

		this.html = this.doc.documentElement;
		this.head = tjs.dom.getFirstChildByTagName(this.html,'head');
		this.body = this.doc.body;
		this.bodyWrapper = tjs.dom.getFirstChildByAttribute(this.body,'div','id','tjs_body_wrapper');
	},
	getBodyWrapper:function() {
		return this.bodyWrapper;
	},
	getStyleSheet:function(id) {
		tjs.html.getStyleSheet(id,this.doc);
	},
	removeStyleSheet:function(id) {
		tjs.html.removeStyleSheet(id,this.doc);
	},
	loadStyleSheet:function(url,id,media){
		tjs.html.loadStyleSheet(url,id,media,this.doc);
	},
	createStyleSheet:function(id,media,sText) {
		tjs.html.createStyleSheet(id,media,sText,this.doc);
	}
});
