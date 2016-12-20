tjs.lang.defineTopClass('tjs.editor.Form',
function(url) {
//tjs_debug_start
	tjs.lang.assert(url && tjs.lang.isString(url),'!tjs.lang.isString(url) @'+this.classname);
//tjs_debug_end
	this.url = url;
	this._construct();
},{
	_construct:function() {
		this.oForm = document.createElement('form');
		this.oForm.action = this.url;
		this.oForm.method = 'POST';
		this.oForm.target = tjs.html.getVirtualWindow().name;
		this.oForm.enctype = 'multipart/form-data';
		this.oForm.encoding = 'multipart/form-data';
		tjs.html.getHiddenContainer().appendChild(this.oForm);
	},
	destroy:function() {
		if (this.oForm) {
			tjs.dom.removeNode(this.oForm);
			tjs.lang.destroyObject(this);
		}
	},
	getForm:function() {
		return this.oForm;
	},
	hasItems:function() {
		return this.oForm.hasChildNodes();
	},
	addItem:function(oItem){
//tjs_debug_start
		tjs.lang.assert(tjs.dom.isElement(oItem),'!tjs.dom.isElement(oItem) @'+this.classname+'.addItem');
//tjs_debug_end
		this.oForm.appendChild(oItem);
	},
	addParameter:function(name,value) {
		var oHidden = document.createElement('input');
		oHidden.type = 'hidden';
		oHidden.name = name;
		oHidden.value = value;
		this.oForm.appendChild(oHidden);
	},
	submit:function(){
		if (this.oForm.hasChildNodes()) {
			this.addParameter('Page-Id',tjs.net.getPageId());
			this.oForm.submit();
			this.oForm.innerHTML = '';
		}
	}
});
