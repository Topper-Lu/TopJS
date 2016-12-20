tjs.lang.defineClass('tjs.cell.AccHandler',tjs.cell.TextHandler,
function() {
	tjs.cell.TextHandler.call(this);
},{
	createContent:function(oNode,data){
		tjs.cell.TextHandler.prototype.createContent.call(this,oNode,data);

		var o = data.content;
		delete data.content;
		if (!tjs.lang.isObject(o)) {
			o = {};
		}
		oNode.oContainer = tjs.widget.createContainer(o);
		tjs.dom.addClasses(oNode.oContainer,'tjs_acc_container');

		oNode.oWrapper = document.createElement('div');
		oNode.oWrapper.className = 'tjs_acc_wrapper';
		oNode.oWrapper.appendChild(oNode.oContainer);
		tjs.dom.insertAfter(oNode.oWrapper,oNode.oCell);

		if (o.url && tjs.lang.isString(o.url)) {
			if ('url' in data) {
				delete data.url;
			}
			tjs.html.loadElementContent(o.url,oNode.oContainer);
		} else if (('url' in data) && (!tjs.lang.isString(data.url) || !data.url)) {
			delete data.url;
		}
		tjs.lang.destroyObject(o);
	},
	destroyContent:function(oNode,data){
		delete oNode.oContainer;
		tjs.html.destroyElementContent(oNode.oWrapper);
		delete oNode.oWrapper;

		tjs.cell.TextHandler.prototype.destroyContent.call(this,oNode,data);
	}
});
tjs.cell.addHandler('tjs.cell.AccHandler',new tjs.cell.AccHandler());

tjs.lang.defineClass('tjs.widget.Accordion',tjs.widget.SList,
function(obj) {
	tjs.widget.SList.call(this,obj);
},{
	_listType:'tjs_acc_list',
	_cellHandler:'tjs.cell.AccHandler',
	_checkAll:function() {
		this._handleChildren();
		this.oMap.put('alwaysSelected',true);
		this.doAnim = Boolean(this.oMap.remove('doAnim')) && !tjs.config.get('tjs_anim_disabled');
		tjs.widget.SList.prototype._checkAll.call(this);
	},
	_handleChildren:function(){
		var aChildren = this.oMap.remove('aChildren');
		if (aChildren) {
			var content,data;
			for (var i = 0, isize = aChildren.length; i < isize; i++) {
				content = aChildren[i];
				data = content.title;
				delete content.title;
				if (!tjs.lang.isObject(data)) {
					data = {};
				}
				data.content = content;
				aChildren[i] = data;
			}
			this.oMap.put('datas',aChildren);
		}
	},
	_destroy:function() {
		if (this.oAnimation) {
			this.oAnimation.destroy();
		}
		tjs.widget.SList.prototype._destroy.call(this);
	},
	_construct:function() {
		this.addHandler(tjs.data.DATA_UNSELECTED,this._onDataUnselected.bind(this));//
		this.addHandler(tjs.data.DATA_SELECTED,this._onDataSelected.bind(this));//
		this.addHandler([tjs.data.AFTER_INSERT,tjs.data.AFTER_DELETE],this._onDatasChanged.bind(this));//
		tjs.widget.SList.prototype._construct.call(this);
	},
	layout:function() {
		if (!this.isEmpty()) {
			var tjs_css = tjs.css;
			var w = tjs_css.getContentBoxWidth(this.oElement);
			var h = tjs_css.getContentBoxHeight(this.oElement);
			var isize = this.getDataSize(),i,oNode;
			for (i = 0; i < isize; i++) {
				oNode = this._oNodes[i];
				tjs_css.setOffsetWidth(oNode.oCell,w);
				oNode.oWrapper.style.width = w+'px';
				tjs_css.setOffsetWidth(oNode.oContainer,w);
				h -= oNode.oCell.offsetHeight;
			}
			this.h = h;
			for (i = 0; i < isize; i++) {
				oNode = this._oNodes[i];
				oNode.oWrapper.style.height = oNode.selected ? h+'px' : '0px';
				tjs_css.setOffsetHeight(oNode.oContainer,h);
				tjs.html.evalLayouts(oNode.oContainer);
			}
		}
		this._layouted = true;
	},
	_onDatasChanged:function(source,type,o) {
		this.layout();
	},
	_onDataSelected:function(source,type,oNode) {
		if (oNode.data.url) {
			if (this.oNodeUnselected) {
				this.oNodeUnselected.oWrapper.style.height = '0px';
				delete this.oNodeUnselected;
			}
			oNode.oWrapper.style.height = this.h+'px';
			tjs.html.loadElementContent(oNode.data.url,oNode.oContainer);
			delete oNode.data.url;
		} else if (this.oNodeUnselected) {
			if (this.doAnim) {
				this._doAnimation();
			} else {
				oNode.oWrapper.style.height = this.h+'px';
				this.oNodeUnselected.oWrapper.style.height = '0px';
				delete this.oNodeUnselected;
			}
		}
	},
	_onDataUnselected:function(source,type,oNode) {
		this.oNodeUnselected = oNode;
	},
	_doAnimation:function(){
		if (!this.oAnimation) {
			this.oAnimation = new tjs.anim.Animation({fTiming:tjs.anim.timing.quartic.easeInOut,interval:50,frameCount:16});
			var onStart = (function(actor,cnt,oAnimation){
				actor.setElement(this.oNodeUnselected.oWrapper);
				actor.getHandler('height').setV01(this.h,0);
			}).bind(this);
			var onStop = (function(actor,cnt,oAnimation){
				delete this.oNodeUnselected;
			}).bind(this);
			this.oAnimation.addActor(new tjs.anim.CssActor({handlers:[{name:'height'}],onStart:onStart,onStop:onStop}));//
			onStart = (function(actor,cnt,oAnimation){
				actor.setElement(this.getSelectedNode().oWrapper);
				actor.getHandler('height').setV01(0,this.h);
			}).bind(this);
			this.oAnimation.addActor(new tjs.anim.CssActor({handlers:[{name:'height'}],onStart:onStart}));//
		}
		this.oAnimation.start();
	}
});
