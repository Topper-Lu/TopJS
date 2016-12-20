tjs.lang.defineClass('tjs.sql.Renderer',tjs.widget.Widget,
function(o){
	tjs.widget.Widget.call(this,o);
},{
	_checkAll:function(){
		this.aFields = this.oMap.remove('aFields');
//tjs_debug_start
		tjs.lang.assert(tjs.lang.isArray(this.aFields) && this.aFields.length > 0,'!tjs.lang.isArray(this.aFields) @'+this.classname);
//tjs_debug_end
	},
	_construct:function(){
		if (this.oElement) {
//tjs_debug_start
			var tagName = this.oElement.tagName.toLowerCase();
			tjs.lang.assert(tagName == 'div','tagName != "div" @'+this.classname+'._construct');
//tjs_debug_end
		} else {
			this.oElement = document.createElement('div');
			var oParent = this.oMap.remove('oParent');
			if (tjs.dom.isElement(oParent)) {
				oParent.appendChild(this.oElement);
			}
		}
		//tjs.dom.addClass(this.oElement,'pos_rel');
		//tjs.dom.addClass(this.oElement,'overflow_auto');
		tjs.dom.addClass(this.oElement,'tjs_data_renderer');
		this.oRendererMap = new tjs.util.Map();

		var url = this.oMap.remove('url');
		if (url && tjs.lang.isString(url)) {
			tjs.html.loadElementContent(url,this.oElement,this._evalTempleate.bind(this));
		} else {
			var template = this.oMap.remove('template');
			if (template && tjs.lang.isString(template)) {
				this.oElement.innerHTML = template;
			} else {
				tjs.dom.cleanWhiteSpace(this.oElement);
				if (!this.oElement.hasChildNodes()) {
					this.oElement.innerHTML = tjs.editor.createTemplate(this.aFields,this.oMap.remove('ratio'));
				}
			}
			this._evalTempleate(this.oElement);
		}
	},
	_destroy:function(){
		this.oRendererMap.destroy();
		tjs.lang.destroyArray(this.aFields);
	},
	_evalTempleate:function(){
		var tjs_sql = tjs.sql;
		tjs_sql.handleContainers(this.aFields,this.oElement,'component_label',tjs_sql.createLabel);
		tjs_sql.handleContainers(this.aFields,this.oElement,'component_container',this._createRenderer.bind(this));
	},
	layout:function(){
		var items = this.oRendererMap.items;
		for (var x in items) {
			items[x].layout();
		}
	},
	_createRenderer:function(oField,oContainer){
		this.oRendererMap.put(oField.getKey(),oField.createRenderer(oContainer));
	},
	getRenderer:function(name){
		return this.oRendererMap.get(name);
	},
	renderData:function(data){
		var oField,oRenderer;
		for (var i = 0, isize = this.aFields.length; i < isize; i++){
			oField = this.aFields[i];
			oRenderer = this.oRendererMap.get(oField.getKey());
			oRenderer.setValue(oField.toRendererValue(data));
		}
	}
});
