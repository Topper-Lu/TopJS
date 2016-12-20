tjs.lang.defineClass('tjs.widget.Calendar',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.widget.clsWidget,{
	_checkAll:function(){
		this._checkClsId();
		this._oCalendar = new Date();
		this._today = {year:this._oCalendar.getFullYear(),month:this._oCalendar.getMonth(),date:this._oCalendar.getDate()};
	},
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
		//tjs.dom.addClass(this.oElement,'pos_rel');
		//tjs.dom.addClass(this.oElement,'overflow_hidden');
		tjs.dom.addClass(this.oElement,'tjs_calendar');
		tjs.dom.addClass(this.oElement,'tjs_calendar_'+this._clsId);

		this._oTable = this.constructor.getTable4Date(this._clsId);
		this.oElement.appendChild(this._oTable);

		var cells = this._oTable.tHead.rows[0].cells;
		this._createYearEditor(cells[0].firstChild);
		this._createMonthEditor(cells[2].firstChild);
		this._yearEditor.setValue(this._oCalendar.getFullYear());
		this._monthEditor.setValue(this._oCalendar.getMonth());
		this._oTBody = this._oTable.tBodies[0];
		this._createNodes();

		var te = tjs.event, f, f1, f2;
		f1 = this.oMap.remove('fMouseover');
		f2 = this.oMap.remove('fMouseout');
		if (tjs.lang.isFunction(f1) && tjs.lang.isFunction(f2)) {
			this.fMouseover = f1;
			this.fMouseout = f2;
			this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
			this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
			te.addListener(this._oTBody,'mouseover',this._mouseoverHandler_);
			te.addListener(this._oTBody,'mouseout',this._mouseoutHandler_);
		}
		f = this.oMap.remove('fClick');
		if (tjs.lang.isFunction(f)) {
			this.fClick = f;
			this._clickHandler_ = this._clickHandler.bindAsEventListener(this);
			te.addListener(this._oTBody,'click',this._clickHandler_);
		}
		f = this.oMap.remove('fDrawContainer');
		if (tjs.lang.isFunction(f)) {
			this.fDrawContainer = f;
		}

		this._doInit = true;
	},
	_destroy:function() {
		var te = tjs.event;
		if (this._clickHandler_) {
			te.removeListener(this._oTBody,'click',this._clickHandler_);
		}
		if (this._mouseoverHandler_) {
			te.removeListener(this._oTBody,'mouseover',this._mouseoverHandler_);
			te.removeListener(this._oTBody,'mouseout',this._mouseoutHandler_);
		}
		this._destroyNodes();
	},
	layout:function(){
		var w = tjs.css.getContentBoxWidth(this.oElement);
		this._oTable.width = w;
		if (this._doInit) {
			delete this._doInit;
			this._onCalendarChanged();
		}
	},
	getYear:function(){
		return this._oCalendar.getFullYear();
	},
	getMonth:function(){
		return this._oCalendar.getMonth();
	},
	setYearInterval:function(minYear,maxYear,fireEvent) {
		this._yearEditor.setMinValue(minYear,fireEvent);
		this._yearEditor.setMaxValue(maxYear,fireEvent);
	},
	_createYearEditor:function(oContainer) {
		var minYear = this.oMap.remove('minYear') || 1;
		var maxYear = this.oMap.remove('maxYear') || 9999;
		this._yearEditor = new tjs.editor.Spinner({oParent:oContainer,width:60,maxLength:4,minValue:minYear,maxValue:maxYear});
		this._yearEditor.addHandler(tjs.data.VALUE_CHANGED,this._yearChanged.bind(this));
	},
	_createMonthEditor:function(oContainer) {
		this._monthEditor = new tjs.editor.Combobox({oParent:oContainer,width:100,datas:tjs.editor.oDateTime.getMonthDatas()});
		this._monthEditor.addHandler(tjs.data.VALUE_CHANGED,this._monthChanged.bind(this));
	},
	_createNodes:function(){
		this._oNodes = [];
		var oRows = this._oTBody.rows, k = 0, row, col, oCells, oCell;
		for (row = 0; row < 6; row++) {
			oCells = oRows[row].cells;
			for (col = 0; col < 7; col++) {
				oCell = oCells[col];
				oCell.oNode = {idx:k,row:row,col:col,oCell:oCell,oDate:oCell.firstChild,oContainer:oCell.lastChild};
				this._oNodes[k++] = oCell.oNode;
			}
		}
	},
	_destroyNodes:function(){
		var i = this._oNodes.length, oNode;
		while (i--) {
			oNode = this._oNodes[i];
			this._oNodes[i] = null;
			oNode.oCell.oNode = null;
			tjs.lang.destroyObject(oNode);
		}
		this._oNodes.length = 0;
	},
	getNodeByDate:function(d){
		return this._oNodes[this.currOffset + d - 1];
	},
	getContainerByDate:function(d){
		return this.getNodeByDate(d).oContainer;
	},
	_onCalendarChanged:function(){
		this.currOffset = this._getFirstDayOfFirstWeek();
		var year = this._oCalendar.getFullYear();
		var month = this._oCalendar.getMonth();
		var days = this._getHowManyDays(year, month);
		var doToday = year == this._today.year && month == this._today.month;
		var i,j,isize,oNode;
		for (i = 0; i < this.currOffset; i++) {
			oNode = this._oNodes[i];
			oNode.date = null;
			oNode.oCell.className = 'tjs_calendar_col tjs_calendar_col_'+oNode.col+' tjs_calendar_col_nodate';
			oNode.oDate.innerHTML = '&nbsp;';
			oNode.oContainer.innerHTML = '&nbsp;';
		}
		for (j = 1; j <= days; j++, i++) {
			oNode = this._oNodes[i];
			oNode.date = j;
			oNode.oCell.className = 'tjs_calendar_col tjs_calendar_col_'+oNode.col+' tjs_calendar_col_hasdate';
			if (doToday && j == this._today.date) {
				tjs.dom.addClass(oNode.oCell,'tjs_calendar_col_today');
			}
			oNode.oDate.innerHTML = j;
			oNode.oContainer.innerHTML = '&nbsp;';
		}
		for (isize = this._oNodes.length; i < isize; i++) {
			oNode = this._oNodes[i];
			oNode.date = null;
			oNode.oCell.className = 'tjs_calendar_col tjs_calendar_col_'+oNode.col+' tjs_calendar_col_nodate';
			oNode.oDate.innerHTML = '&nbsp;';
			oNode.oContainer.innerHTML = '&nbsp;';
		}
		this.fire('calendarChanged',{year:year,month:month,days:days});
	},
	redraw:function(){
		if (this.fDrawContainer) {
			var year = this._oCalendar.getFullYear();
			var month = this._oCalendar.getMonth();
			var days = this._getHowManyDays(year, month);
			for (var i = this.currOffset, j = 1; j <= days; j++, i++) {
				this.fDrawContainer(this._oNodes[i]);
			}
		}
	},
	_yearChanged:function(source,type) {
		if (this.yearType == 'TW') {
			this._oCalendar.setFullYear(this._yearEditor.getValue()+1911);
		} else {
			this._oCalendar.setFullYear(this._yearEditor.getValue());
		}
		this._monthEditor.setValue(this._oCalendar.getMonth());
		this._onCalendarChanged();
	},
	_monthChanged:function(source,type) {
		this._oCalendar.setMonth(this._monthEditor.getValue());
		this._monthEditor.setValue(this._oCalendar.getMonth());//don't delete this one!
		this._onCalendarChanged();
	},
	_getFirstDayOfFirstWeek:function() {
		var date = this._oCalendar.getDate();
		this._oCalendar.setDate(1);
		var dayOfWeek = this._oCalendar.getDay();
		this._oCalendar.setDate(date);
		return dayOfWeek;
	},
	_getHowManyDays:function(year, month) {
		if (month == 1) {
			if ((year%4 == 0 && year%100 != 0) || year%400 == 0) {
				return 29;
			} else {
				return 28;
			}
		} else if (month == 3 || month == 5 || month == 8 || month == 10) {
			return 30;
		} else {
			return 31;
		}
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		var oCell = tjs.dom.getAncestorByClassName(oTarget,'td','tjs_calendar_col',this._oTBody);
		if (oCell && oCell.oNode && oCell.oNode.date) {
			this.fMouseover(oEvent,oCell.oNode);
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		var oCell = tjs.dom.getAncestorByClassName(oTarget,'td','tjs_calendar_col',this._oTBody);
		if (oCell && oCell.oNode && oCell.oNode.date) {
			this.fMouseout(oEvent,oCell.oNode);
		}
	},
	_clickHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		var oCell = tjs.dom.getAncestorByClassName(oTarget,'td','tjs_calendar_col',this._oTBody);
		if (oCell && oCell.oNode && oCell.oNode.date) {
			this.fClick(oEvent,oCell.oNode);
		}
	}
});
tjs.lang.extend(tjs.widget.Calendar,{
	getTable4Date:function(clsId) {
		if (!this.oTable4Date) {
			var weekDayNames = tjs.config.oResource.get('weekDayNames2');
			var buf = [], k = 0,i,j;
			buf[k++] = '<table class="tjs_calendar_table tjs_calendar_table_'+clsId+'" border="0" cellpadding="0" cellspacing="0">';
			buf[k++] = '<colgroup>';
			buf[k++] = '<col width="15%">';
			buf[k++] = '<col width="14%">';
			buf[k++] = '<col width="14%">';
			buf[k++] = '<col width="14%">';
			buf[k++] = '<col width="14%">';
			buf[k++] = '<col width="14%">';
			buf[k++] = '<col width="15%">';
			buf[k++] = '</colgroup>';
			buf[k++] = '<thead>';
			buf[k++] = '<tr class="tjs_calendar_hd_row tjs_calendar_hd_row_0">';
			buf[k++] = '<td colspan="3" class="tjs_calendar_col"><div class="tjs_calendar_year"></div></td>';
			buf[k++] = '<td class="tjs_calendar_col">&nbsp;</td>';
			buf[k++] = '<td colspan="3" class="tjs_calendar_col"><div class="tjs_calendar_month"></div></td>';
			buf[k++] = '</tr>';
			buf[k++] = '<tr class="tjs_calendar_hd_row tjs_calendar_hd_row_1">';
			for (j = 0; j < 7; j++) {
				buf[k++] = '<td class="tjs_calendar_col tjs_calendar_col_'+j+'"><div class="tjs_calendar_date">';
				buf[k++] = weekDayNames[j];
				buf[k++] = '</div></td>';
			}
			buf[k++] = '</tr>';
			buf[k++] = '</thead>';
			buf[k++] = '<tbody>';
			for (i = 0; i < 6; i++) {
				buf[k++] = '<tr class="tjs_calendar_row tjs_calendar_row_'+i+'">';
				for (j = 0; j < 7; j++) {
					buf[k++] = '<td class="tjs_calendar_col tjs_calendar_col_'+j+'"><div class="tjs_calendar_date"></div><div class="tjs_calendar_content"></div></td>';
				}
				buf[k++] = '</tr>';
			}
			buf[k++] = '</tbody>';
			buf[k++] = '</table>';
			var oDiv = document.createElement('div');
			oDiv.innerHTML = buf.join('');
			tjs.lang.destroyArray(buf);
			this.oTable4Date = tjs.dom.getFirstChildByTagName(oDiv,'table');
			oDiv.removeChild(this.oTable4Date);
		}
		return this.oTable4Date.cloneNode(true);
	}
});
