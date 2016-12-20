tjs.cell = {
	_handlers:{},
	addHandler:function(key,oHandler){
		if (!(key in this._handlers)) {
			this._handlers[key] = oHandler;
		}
	},
	getHandler:function(key){
		return this._handlers[key];
	},
	classname:'tjs.cell'
};

tjs.lang.defineTopClass('tjs.cell.Handler',
function() {
},{
	destroy:function() {
	},
	createContent:function(oNode,data){
	},
	updateContent:function(oNode,data){
	},
	destroyContent:function(oNode,data){
	}
});

tjs.lang.defineClass('tjs.cell.TextHandler',tjs.cell.Handler,
function() {
},{
	createContent:function(oNode,data){
		var o = {};
		o.oTextNode = document.createTextNode('');
		o.oText = document.createElement('span');
		o.oText.className = 'tjs_cell_text';
		o.oText.appendChild(o.oTextNode);
		oNode.oCell.appendChild(o.oText);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		oNode.oCellContent.oTextNode.nodeValue = tjs.data.toText(data);
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});
tjs.cell.addHandler('tjs.cell.TextHandler',new tjs.cell.TextHandler());

tjs.lang.defineClass('tjs.cell.IconHandler',tjs.cell.Handler,
function() {
},{
	createContent:function(oNode,data){
		var o = {clsIcon:''};
		o.oIcon = document.createElement('span');
		o.oIcon.className = 'tjs_cell_icon';
		oNode.oCell.appendChild(o.oIcon);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var o = oNode.oCellContent, clsIcon = '', tooltip = '';
		if (tjs.lang.isString(data) && data) {
			clsIcon = data;
			tooltip = tjs.config.oResource.get(data);
		} else if (tjs.lang.isObject(data)) {
			if (data instanceof tjs.data.KeyedObject) {
				tooltip = data.getTooltip() || data.toString();
				clsIcon = data.getClsIcon();
			} else {
				if (('clsIcon' in data) && tjs.lang.isString(data['clsIcon'])) {
					clsIcon = data['clsIcon'];
				}
				if (('tooltip' in data) && tjs.lang.isString(data['tooltip'])) {
					tooltip = data['tooltip'];
				} else if (('caption' in data) && tjs.lang.isString(data['caption'])) {
					tooltip = data['caption'];
				} else {
					tooltip = data.toString();
				}
			}
		}
		if (clsIcon != o.clsIcon) {
			if (o.clsIcon) {
				tjs.dom.removeClass(o.oIcon,'tjs_cell_icon_'+o.clsIcon);
			}
			o.clsIcon = clsIcon;
			if (o.clsIcon) {
				tjs.dom.addClass(o.oIcon,'tjs_cell_icon_'+o.clsIcon);
			}
		}
		o.oIcon.title = tooltip;
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});
tjs.cell.addHandler('tjs.cell.IconHandler',new tjs.cell.IconHandler());

tjs.lang.defineClass('tjs.cell.IconTextHandler',tjs.cell.Handler,
function() {
},{
	createContent:function(oNode,data){
		var o = {clsIcon:''};
		o.oIcon = document.createElement('span');
		o.oIcon.className = 'tjs_cell_icon';
		o.oTextNode = document.createTextNode('');
		o.oText = document.createElement('span');
		o.oText.className = 'tjs_cell_text';
		o.oText.appendChild(o.oTextNode);
		oNode.oCell.appendChild(o.oIcon);
		oNode.oCell.appendChild(o.oText);
		oNode.oCellContent = o;
	},
	updateContent:function(oNode,data){
		var o = oNode.oCellContent, clsIcon = '', caption = '';
		if (tjs.lang.isString(data) && data) {
			clsIcon = data;
			caption = tjs.config.oResource.get(data);
		} else if (tjs.lang.isObject(data)) {
			if (data instanceof tjs.data.KeyedObject) {
				caption = data.toString();
				clsIcon = data.getClsIcon();
			} else {
				if (('clsIcon' in data) && tjs.lang.isString(data['clsIcon'])) {
					clsIcon = data['clsIcon'];
				}
				if (('caption' in data) && tjs.lang.isString(data['caption'])) {
					caption = data['caption'];
				} else {
					caption = data.toString();
				}
			}
		}
		if (clsIcon != o.clsIcon) {
			if (o.clsIcon) {
				tjs.dom.removeClass(o.oIcon,'tjs_cell_icon_'+o.clsIcon);
			}
			o.clsIcon = clsIcon;
			if (o.clsIcon) {
				tjs.dom.addClass(o.oIcon,'tjs_cell_icon_'+o.clsIcon);
			}
		}
		o.oTextNode.nodeValue = caption;
	},
	destroyContent:function(oNode,data){
		tjs.lang.destroyObject(oNode.oCellContent);
		delete oNode.oCellContent;
	}
});
tjs.cell.addHandler('tjs.cell.IconTextHandler',new tjs.cell.IconTextHandler());
