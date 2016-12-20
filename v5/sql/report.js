tjs.lang.defineClass('tjs.sql.Report',tjs.widget.Widget,
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
		tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_sql_report');

		this.oToolBar = new tjs.widget.FlowLayout({oParent:this.oElement});
		tjs.dom.addClass(this.oToolBar.oElement,'tjs_toolbar');

		this.oContainer = document.createElement('div');
		this.oContainer.className = 'pos_rel overflow_auto tjs_sql_report_container';
		this.oElement.appendChild(this.oContainer);

		this.urlLoadDatas = this.oMap.remove('urlLoadDatas');
		this.urlExcel = this.oMap.remove('urlExcel');
		var urlPDF = this.oMap.remove('urlPDF');
		if (tjs.lang.isString(urlPDF) && urlPDF != '') {
			this.urlPDF = urlPDF;
		}
		var cmds = ['refresh','excel'];
		if (this.urlPDF) {
			cmds.push('pdf');
		}

		this.oToolBar.addContainer({cls:'tjs_toolbar_container'});
		this.oIconList = new tjs.widget.IconList({oElement:this.oToolBar.getLastContainer(),datas:tjs.data.convertCmds(cmds),hv:'h'});
		this.oIconList.addHandler(tjs.data.DATA_CLICKED,this._cmdHandler.bind(this));

		this._valueChangedHandler_ = this._valueChangedHandler.bind(this);

		var minYear = this.oMap.remove('minYear');
		var maxYear = this.oMap.remove('maxYear');
		this.oToolBar.addContainer({cls:'tjs_toolbar_container'});
		this.oYearEditor = new tjs.editor.Spinner({oParent:this.oToolBar.getLastContainer(),width:60,maxLength:4,minValue:minYear,maxValue:maxYear});
		this.oYearEditor.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
		this.oYearEditor.setValue(this.oMap.remove('year'));

		var month = this.oMap.get('month');
		if (tjs.lang.isNumber(month) && month > 0) {
			this.oToolBar.addContainer({cls:'tjs_toolbar_container'});
			this.oMonthEditor = new tjs.editor.Combobox({oParent:this.oToolBar.getLastContainer(),width:100,datas:tjs.editor.oDateTime.getMonthDatas()});
			this.oMonthEditor.addHandler(tjs.data.VALUE_CHANGED,this._valueChangedHandler_);
			this.oMonthEditor.setValue(this.oMap.remove('month') - 1);
		}

		this.loadDatas();
	},
	layout:function(){
		var w = tjs.css.getContentBoxWidth(this.oElement);
		var h = tjs.css.getContentBoxHeight(this.oElement);
		tjs.css.setOffsetWidth(this.oToolBar.oElement,w);
		this.oToolBar.layout();
		h -= this.oToolBar.oElement.offsetHeight;
		tjs.css.setOffsetDimension(this.oContainer,w,h);
		tjs.html.evalLayouts(this.oContainer);
	},
	_cmdHandler:function(source,type,oNode){
		var key = oNode.data.getKey();
		switch (key){
		case 'refresh':
			this.loadDatas();
			break;
		case 'excel':
			this._excel();
			break;
		case 'pdf':
			this._pdf();
			break;
		}
	},
	_valueChangedHandler:function(source,type){
		this.loadDatas();
	},
	_pdf:function(){
		var buf = [], k = 0;
		buf[k++] = 'year='+this.oYearEditor.getValue();
		if (this.oMonthEditor) {
			buf[k++] = 'month='+(this.oMonthEditor.getValue() + 1);
		}
		var url = this.urlPDF+'&'+buf.join('&');
		tjs.lang.destroyArray(buf);
		window.open(url,'_blank');//
	},
	_excel:function(){
		var buf = [], k = 0;
		buf[k++] = 'year='+this.oYearEditor.getValue();
		if (this.oMonthEditor) {
			buf[k++] = 'month='+(this.oMonthEditor.getValue() + 1);
		}
		var url = this.urlExcel+'&'+buf.join('&');
		tjs.lang.destroyArray(buf);
		window.location.href = url;//
	},
	loadDatas:function(){
		var buf = [], k = 0;
		buf[k++] = 'year='+this.oYearEditor.getValue();
		if (this.oMonthEditor) {
			buf[k++] = 'month='+(this.oMonthEditor.getValue() + 1);
		}
		var url = this.urlLoadDatas+'&'+buf.join('&');
		tjs.lang.destroyArray(buf);
		tjs.html.loadElementContent(url,this.oContainer);//
	}
});
