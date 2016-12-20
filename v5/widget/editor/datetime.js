tjs.editor.oDateTime = {
	destroy:function() {
		if (this.aMonths) {
			tjs.lang.destroyArray(this.aMonths);
		}
		if (this.aWeekDays) {
			tjs.lang.destroyArray(this.aWeekDays);
		}
		tjs.lang.destroyObject(this);
	},
	oCalendar:new Date(),
	getWeekDayDatas:function() {
		if (!this.aWeekDays) {
			this.aWeekDays = [];
			var weekDayNames = tjs.config.oResource.get('weekDayNames');
			for (var i = 0; i < 7; i++) {
				this.aWeekDays[i] = new tjs.data.KeyedData(i,weekDayNames[i]);
			}
		}
		return this.aWeekDays;
	},
	getMonthDatas:function() {
		if (!this.aMonths) {
			this.aMonths = [];
			var monthNames = tjs.config.oResource.get('monthNames');
			for (var i = 0; i < 12; i++) {
				this.aMonths[i] = new tjs.data.KeyedData(i,monthNames[i]);
			}
		}
		return this.aMonths.concat();
	},
	getTable4Date:function() {
		if (!this.oTable4Date) {
			var weekDayNames = tjs.config.oResource.get('weekDayNames');
			var buf = [], k = 0,i,j;
			buf[k++] = '<table class="tjs_date" border="0" cellpadding="0" cellspacing="0">';
			buf[k++] = '<thead>';
			buf[k++] = '<tr class="tjs_date_row head">';
			buf[k++] = '<td colspan="3" class="tjs_date_cell"><div class="tjs_date_content"></div></td>';
			buf[k++] = '<td class="tjs_date_cell"><div></div></td>';
			buf[k++] = '<td colspan="3" class="tjs_date_cell"><div class="tjs_date_content"></div></td>';
			buf[k++] = '</tr>';
			buf[k++] = '</thead>';
			buf[k++] = '<tbody>';
			buf[k++] = '<tr class="tjs_date_row body">';
			buf[k++] = '<th class="tjs_date_cell sunday"><div class="tjs_date_content">'+weekDayNames[0]+'</div></th>';
			for (j = 1; j < 6; j++) {
				buf[k++] = '<th class="tjs_date_cell normalday"><div class="tjs_date_content">'+weekDayNames[j]+'</div></th>';
			}
			buf[k++] = '<th class="tjs_date_cell satuday"><div class="tjs_date_content">'+weekDayNames[6]+'</div></th>';
			buf[k++] = '</tr>';
			buf[k++] = '</tbody>';
			buf[k++] = '<tbody>';
			for (i = 0; i < 6; i++) {
				buf[k++] = '<tr class="tjs_date_row body">';
				buf[k++] = '<td class="tjs_date_cell sunday"><div class="tjs_date_content"></div></td>';
				for (j = 1; j < 6; j++) {
					buf[k++] = '<td class="tjs_date_cell normalday"><div class="tjs_date_content"></div></td>';
				}
				buf[k++] = '<td class="tjs_date_cell satuday"><div class="tjs_date-contentt"></div></td>';
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
	},
	getTable4Time:function(){
		if (!this.oTable4Time) {
			var timeCaptions = tjs.config.oResource.get('timeCaptions');
			var buf = [], k = 0,j;
			buf[k++] = '<table class="tjs_time" border="0" cellpadding="0" cellspacing="0">';
			buf[k++] = '<tbody>';
			buf[k++] = '<tr class="tjs_time_row">';
			for (j = 0; j < 3; j++) {
				buf[k++] = '<th class="tjs_time_cell"><div class="tjs_time_content">';
				buf[k++] = timeCaptions[j];
				buf[k++] = '</div></th>';
			}
			buf[k++] = '</tr>';
			buf[k++] = '<tr class="tjs_time_row">';
			for (j = 0; j < 3; j++) {
				buf[k++] = '<td class="tjs_time_cell"><div class="tjs_time_content"></div></td>';
			}
			buf[k++] = '</tr>';
			buf[k++] = '</tbody>';
			buf[k++] = '</table>';
			var oDiv = document.createElement('div');
			oDiv.innerHTML = buf.join('');
			tjs.lang.destroyArray(buf);
			this.oTable4Time = tjs.dom.getFirstChildByTagName(oDiv,'table');
			oDiv.removeChild(this.oTable4Time);
		}
		return this.oTable4Time.cloneNode(true);
	},
	getDateValue:function(oCalendar) {
		var b = [], k = 0, ts = tjs.str;
		b[k++] = oCalendar.getFullYear();
		b[k++] = ts.padLeft(String(oCalendar.getMonth() + 1),2,'0');
		b[k++] = ts.padLeft(String(oCalendar.getDate()),2,'0');
		var value = b.join('-');
		tjs.lang.destroyArray(b);
		return value;
	},
	getTimeValue:function(oCalendar) {
		var b = [], k = 0, ts = tjs.str;
		b[k++] = ts.padLeft(String(oCalendar.getHours()),2,'0');
		b[k++] = ts.padLeft(String(oCalendar.getMinutes()),2,'0');
		b[k++] = ts.padLeft(String(oCalendar.getSeconds()),2,'0');
		var value = b.join(':');
		tjs.lang.destroyArray(b);
		return value;
	},
	getTimestampValue:function(oCalendar) {
		var b = [], k = 0, ts = tjs.str;
		b[k++] = oCalendar.getFullYear();
		b[k++] = '-';
		b[k++] = ts.padLeft(String(oCalendar.getMonth() + 1),2,'0');
		b[k++] = '-';
		b[k++] = ts.padLeft(String(oCalendar.getDate()),2,'0');
		b[k++] = ' ';
		b[k++] = ts.padLeft(String(oCalendar.getHours()),2,'0');
		b[k++] = ':';
		b[k++] = ts.padLeft(String(oCalendar.getMinutes()),2,'0');
		b[k++] = ':';
		b[k++] = ts.padLeft(String(oCalendar.getSeconds()),2,'0');
		var value = b.join('');
		tjs.lang.destroyArray(b);
		return value;
	}
};

tjs.lang.defineTopClass('tjs.editor.AbstractDateChooser',
function() {
},{
	setYearInterval:function(minYear,maxYear,fireEvent) {
		this.yearEditor.setMinValue(minYear,fireEvent);
		this.yearEditor.setMaxValue(maxYear,fireEvent);
	},
	_createYearEditor:function(oContainer) {
		var minYear = this.oMap.remove('minYear') || 1;
		var maxYear = this.oMap.remove('maxYear') || 9999;
		this.yearEditor = new tjs.editor.Spinner({oParent:oContainer,width:60,maxLength:4,minValue:minYear,maxValue:maxYear});
		this.yearEditor.addHandler(tjs.data.VALUE_CHANGED,this._yearChanged.bind(this));
	},
	_createMonthEditor:function(oContainer) {
		this.monthEditor = new tjs.editor.Combobox({oParent:oContainer,width:100,datas:tjs.editor.oDateTime.getMonthDatas()});
		this.monthEditor.addHandler(tjs.data.VALUE_CHANGED,this._monthChanged.bind(this));
	},
	_createDateEditors:function(oTable){
		this.oDates = [];
		this.tBody = oTable.tBodies[1];
		var rows = this.tBody.rows;
		var k = 0,r,c,oCells;
		for (r = 0; r < 6; r++) {
			oCells = rows[r].cells;
			for (c = 0; c < 7; c++) {
				this.oDates[k++] = oCells[c].firstChild;
			}
		}
		this.currDate = null;
		var tjs_event = tjs.event;
		this._dateChanged_ = this._dateChanged.bindAsEventListener(this);
		this._mouseoverHandler_ = this._mouseoverHandler.bindAsEventListener(this);
		this._mouseoutHandler_ = this._mouseoutHandler.bindAsEventListener(this);
		tjs_event.addListener(this.tBody,'click',this._dateChanged_);
		tjs_event.addListener(this.tBody,'mouseover',this._mouseoverHandler_);
		tjs_event.addListener(this.tBody,'mouseout',this._mouseoutHandler_);
	},
	_destroyDateEditors:function(oTable){
		var tjs_event = tjs.event;
		tjs_event.removeListener(this.tBody,'click',this._dateChanged_);
		tjs_event.removeListener(this.tBody,'mouseover',this._mouseoverHandler_);
		tjs_event.removeListener(this.tBody,'mouseout',this._mouseoutHandler_);
		tjs.lang.destroyArray(this.oDates);
	},
	_redrawDates:function() {
		var year = this.calendar.getFullYear();
		var month = this.calendar.getMonth();
		var offset = this._getFirstDayOfFirstWeek();
		var days = this._getHowManyDays(year, month);
		var date = this.calendar.getDate();
		var oDate;
		for (var d = 1 - offset,k = 0,ksize = this.oDates.length; k < ksize; k++,d++) {
			oDate = this.oDates[k];
			oDate.d = d;
			if (d > 0 && d <= days) {
				if (d == date) {
					this.currDate = oDate;
					oDate.className = 'tjs_date_content curr_data';
				} else {
					oDate.className = 'tjs_date_content has_data';
				}
				oDate.innerHTML = d;
			} else {
				oDate.className = 'tjs_date_content no_data';
				oDate.innerHTML = '';
			}
		}
	},
	_yearChanged:function(source,type) {
		if (this.yearType == 'TW') {
			this.calendar.setFullYear(this.yearEditor.getValue()+1911);
		} else {
			this.calendar.setFullYear(this.yearEditor.getValue());
		}
		this.monthEditor.setValue(this.calendar.getMonth());
		this._redrawDates();
		this._stateChanged();
	},
	_monthChanged:function(source,type) {
		this.calendar.setMonth(this.monthEditor.getValue());
		this.monthEditor.setValue(this.calendar.getMonth());//don't delete this one!
		this._redrawDates();
		this._stateChanged();
	},
	_dateChanged:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'div','hover_data',this.tBody);
		if (oTarget) {
			var year = this.calendar.getFullYear();
			var month = this.calendar.getMonth();
			var days = this._getHowManyDays(year, month);
			var newDate = oTarget.d;
			if (newDate > 0 && newDate <= days) {
				this.calendar.setDate(newDate);
				if (this.currDate) {
					tjs.dom.replaceClass(this.currDate,'curr_data','has_data');
				}
				this.currDate = oTarget;
				tjs.dom.replaceClass(this.currDate,'hover_data','curr_data');
				this._stateChanged();
			}
		}
	},
	_mouseoverHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'div','has_data',this.tBody);
		if (oTarget) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.fromElement;
			if (oRelatedTarget && tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				return;
			}
			tjs.dom.replaceClass(oTarget,'has_data','hover_data');
		}
	},
	_mouseoutHandler:function(oEvent) {
		tjs.event.stopPropagation(oEvent);
		tjs.event.preventDefault(oEvent);
		var oTarget = oEvent.target || oEvent.srcElement;
		oTarget = tjs.dom.getAncestorByClassName(oTarget,'div','hover_data',this.tBody);
		if (oTarget) {
			var oRelatedTarget = oEvent.relatedTarget || oEvent.toElement;
			if (oRelatedTarget && tjs.dom.isAncestorOf(oTarget,oRelatedTarget)) {
				return;
			}
			tjs.dom.replaceClass(oTarget,'hover_data','has_data');
		}
	},
	_getFirstDayOfFirstWeek:function() {
		var date = this.calendar.getDate();
		this.calendar.setDate(1);
		var dayOfWeek = this.calendar.getDay();
		this.calendar.setDate(date);
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
	_setDateValue:function(oCalendar,value) {
		var result = false,yy,mm,dd,timeParts;
		if (value && tjs.lang.isString(value)) {
			if (this.yearType == 'TW') {
				if (this.spDate) {
					timeParts = value.split(this.spDate);
					if (timeParts.length == 3) {
						yy = Number(timeParts[0])+1911;
						mm = Number(timeParts[1])-1;
						dd = Number(timeParts[2]);
						result = true;
					}
				} else {
					if (value.length == 7) {
						yy = Number(value.substr(0,3))+1911;
						mm = Number(value.substr(3,2))-1;
						dd = Number(value.substr(5,2));
						result = true;
					}
				}
			} else {
				if (this.spDate) {
					timeParts = value.split(this.spDate);
					if (timeParts.length == 3) {
						yy = Number(timeParts[0]);
						mm = Number(timeParts[1])-1;
						dd = Number(timeParts[2]);
						result = true;
					}
				} else {
					if (value.length == 8) {
						yy = Number(value.substr(0,4));
						mm = Number(value.substr(4,2))-1;
						dd = Number(value.substr(6,2));
						result = true;
					}
				}
			}
			if (result) {
				oCalendar.setFullYear(yy,mm,dd);
			}
		}
		return result;
	},
	_getDateValue:function(oCalendar) {
		var b = [], k = 0;
		if (this.yearType == 'TW') {
			b[k++] = tjs.str.padLeft(String(oCalendar.getFullYear() - 1911),3,'0');
		} else {
			b[k++] = oCalendar.getFullYear();
		}
		b[k++] = tjs.str.padLeft(String(oCalendar.getMonth() + 1),2,'0');
		b[k++] = tjs.str.padLeft(String(oCalendar.getDate()),2,'0');
		var value = this.spDate ? b.join(this.spDate) : b.join('');
		tjs.lang.destroyArray(b);
		return value;
	}
});
tjs.lang.extend(tjs.editor.AbstractDateChooser,{
	initInstance:function(obj){
		obj.yearType = obj.oMap.remove('yearType') || null;
		obj.spDate = obj.oMap.remove('spDate');
		if (!tjs.lang.isString(obj.spDate) || obj.spDate.length > 1) {
			obj.spDate = '-';
		}
		obj.oTable4Date = tjs.editor.oDateTime.getTable4Date();
		obj.oElement.appendChild(obj.oTable4Date);
		var oCells = obj.oTable4Date.tHead.rows[0].cells;//
		obj._createYearEditor(oCells[0].firstChild);
		obj._createMonthEditor(oCells[2].firstChild);
		obj._createDateEditors(obj.oTable4Date);
	},
	destroyInstance:function(obj){
		obj._destroyDateEditors(obj.oTable4Date);
	}
});

tjs.lang.defineTopClass('tjs.editor.AbstractTimeChooser',
function() {
},{
	_createHoursEditor:function(oContainer) {
		this.hoursEditor = new tjs.editor.Spinner({oParent:oContainer,width:24,maxLength:2,minValue:0,maxValue:23});
		this.hoursEditor.addHandler(tjs.data.VALUE_CHANGED,this._hoursChanged.bind(this));
	},
	_createMinutesEditor:function(oContainer) {
		this.minutesEditor = new tjs.editor.Spinner({oParent:oContainer,width:24,maxLength:2,minValue:0,maxValue:59});
		this.minutesEditor.addHandler(tjs.data.VALUE_CHANGED,this._minutesChanged.bind(this));
	},
	_createSecondsEditor:function(oContainer) {
		if (this.enableSeconds) {
			this.secondsEditor = new tjs.editor.Spinner({oParent:oContainer,width:24,maxLength:2,minValue:0,maxValue:59});
			this.secondsEditor.addHandler(tjs.data.VALUE_CHANGED,this._secondsChanged.bind(this));
		}
	},
	_hoursChanged:function(source,type) {
		this.calendar.setHours(this.hoursEditor.getValue());
		this._stateChanged();
	},
	_minutesChanged:function(source,type) {
		this.calendar.setMinutes(this.minutesEditor.getValue());
		this._stateChanged();
	},
	_secondsChanged:function(source,type) {
		this.calendar.setSeconds(this.secondsEditor.getValue());
		this._stateChanged();
	},
	_setTimeValue:function(oCalendar,value) {
		var result = false,hh,mi,se,timeParts;
		if (value && tjs.lang.isString(value)) {
			if (this.spTime) {
				timeParts = value.split(this.spTime);
				if (this.enableSeconds) {
					if (timeParts.length == 3) {
						hh = Number(timeParts[0]);
						mi = Number(timeParts[1]);
						se = Number(timeParts[2]);
						result = true;
					}
				} else {
					if (timeParts.length == 2) {
						hh = Number(timeParts[0]);
						mi = Number(timeParts[1]);
						se = 0;
						result = true;
					}
				}
			} else {
				if (this.enableSeconds) {
					if (value.length == 6) {
						hh = Number(value.substr(0,2));
						mi = Number(value.substr(2,2));
						se = Number(value.substr(4,2));
						result = true;
					}
				} else {
					if (value.length == 4) {
						hh = Number(value.substr(0,2));
						mi = Number(value.substr(2,2));
						se = 0;
						result = true;
					}
				}
			}
			if (result) {
				oCalendar.setHours(hh,mi,se);
			}
		}
		return result;
	},
	_getTimeValue:function(oCalendar) {
		var b = [], k = 0;
		b[k++] = tjs.str.padLeft(String(oCalendar.getHours()),2,'0');
		b[k++] = tjs.str.padLeft(String(oCalendar.getMinutes()),2,'0');
		if (this.enableSeconds) {
			b[k++] = tjs.str.padLeft(String(oCalendar.getSeconds()),2,'0');
		}
		var value = this.spTime ? b.join(this.spTime) : b.join('');
		tjs.lang.destroyArray(b);
		return value;
	}
});
tjs.lang.extend(tjs.editor.AbstractTimeChooser,{
	initInstance:function(obj){
		obj.spTime = obj.oMap.remove('spTime');
		if (!tjs.lang.isString(obj.spTime) || obj.spTime.length > 1) {
			obj.spTime = ':';
		}
		obj.enableSeconds = !obj.oMap.remove('noSeconds');
		obj.oTable4Time = tjs.editor.oDateTime.getTable4Time();
		obj.oElement.appendChild(obj.oTable4Time);
		var oCells = obj.oTable4Time.rows[1].cells;
		obj._createHoursEditor(oCells[0].firstChild);
		obj._createMinutesEditor(oCells[1].firstChild);
		obj._createSecondsEditor(oCells[2].firstChild);
	},
	destroyInstance:function(obj){
	}
});

tjs.lang.defineClass('tjs.editor.DateChooser',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.AbstractDateChooser,tjs.editor.SimpleEditor,{
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
		tjs.dom.addClass(this.oElement,'tjs_date_chooser');

		this.calendar = this.oMap.remove('calendar') || new Date();
		tjs.editor.AbstractDateChooser.initInstance(this);

		this.value = null;
		if (this.oMap.contains('value')) {
			this.setValue(this.oMap.remove('value'),true);
		}
	},
	_destroy:function() {
		tjs.editor.AbstractDateChooser.destroyInstance(this);
	},
	layout:function(){
		var oStyle = this.oElement.style;
		oStyle.width = this.oTable4Date.offsetWidth+'px';
		oStyle.height = this.oTable4Date.offsetHeight+'px';
	},
	hasValue:function(){
		return true;
	},
	getValue:function(){
		return this._getDateValue(this.calendar);
	},
	_writeValue:function(value){
		var oCalendar = tjs.editor.oDateTime.oCalendar;
		if (!this._setDateValue(oCalendar,value)) {
			oCalendar.setTime((new Date()).getTime());
		}
		oCalendar.setHours(0,0,0,0);
		value = oCalendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.calendar.setTime(value);
			if (this.yearType == 'TW') {
				this.yearEditor.setValue(this.calendar.getFullYear()-1911);
			} else {
				this.yearEditor.setValue(this.calendar.getFullYear());
			}
			this.monthEditor.setValue(this.calendar.getMonth());
			this._redrawDates();
		}
		return changed;
	},
	_readValue:function(){
		var value = this.calendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.TimeChooser',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.AbstractTimeChooser,tjs.editor.SimpleEditor,{
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
		tjs.dom.addClass(this.oElement,'tjs_time_chooser');

		this.calendar = this.oMap.remove('calendar') || new Date();
		tjs.editor.AbstractTimeChooser.initInstance(this);

		this.value = null;
		if (this.oMap.contains('value')) {
			this.setValue(this.oMap.remove('value'),true);
		}
	},
	_destroy:function() {
		tjs.editor.AbstractTimeChooser.destroyInstance(this);
	},
	layout:function(){
		var oStyle = this.oElement.style;
		oStyle.width = this.oTable4Time.offsetWidth+'px';
		oStyle.height = this.oTable4Time.offsetHeight+'px';
	},
	hasValue:function(){
		return true;
	},
	getValue:function(value){
		return this._getTimeValue(this.calendar);
	},
	_writeValue:function(value){
		var oCalendar = tjs.editor.oDateTime.oCalendar;
		if (!this._setTimeValue(oCalendar,value)) {
			oCalendar.setTime((new Date()).getTime());
		}
		oCalendar.setFullYear(1970,0,1);
		oCalendar.setMilliseconds(0);
		value = oCalendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.calendar.setTime(value);
			this.hoursEditor.setValue(this.calendar.getHours());
			this.minutesEditor.setValue(this.calendar.getMinutes());
			if (this.secondsEditor) {
				this.secondsEditor.setValue(this.calendar.getSeconds());
			}
		}
		return changed;
	},
	_readValue:function(){
		var value = this.calendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
		}
		return changed;
	}
});

tjs.lang.defineClass('tjs.editor.TimestampChooser',tjs.widget.Widget,
function(obj) {
	tjs.widget.Widget.call(this,obj);
},tjs.editor.AbstractDateChooser,tjs.editor.AbstractTimeChooser,tjs.editor.SimpleEditor,{
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
		tjs.dom.addClass(this.oElement,'tjs_timestamp_chooser');

		this.calendar = this.oMap.remove('calendar') || new Date();
		tjs.editor.AbstractDateChooser.initInstance(this);
		tjs.editor.AbstractTimeChooser.initInstance(this);
		this.spTimestamp = this.oMap.remove('spTimestamp');
		if (!tjs.lang.isString(this.spTimestamp) || this.spTimestamp.length > 1) {
			this.spTimestamp = ' ';
		} else if (this.spTimestamp == '') {
			this.spDate = '';
			this.spTime = '';
		}

		this.value = null;
		if (this.oMap.contains('value')) {
			this.setValue(this.oMap.remove('value'),true);
		}
	},
	_destroy:function() {
		tjs.editor.AbstractTimeChooser.destroyInstance(this);
		tjs.editor.AbstractDateChooser.destroyInstance(this);
	},
	layout:function(){
		var oStyle = this.oElement.style;
		oStyle.width = Math.max(this.oTable4Date.offsetWidth,this.oTable4Time.offsetWidth)+'px';
		oStyle.height = (this.oTable4Date.offsetHeight+this.oTable4Time.offsetHeight)+'px';
	},
	hasValue:function(){
		return true;
	},
	getValue:function() {
		if (this.spTimestamp) {
			return this._getDateValue(this.calendar) + this.spTimestamp + this._getTimeValue(this.calendar);
		} else {
			return this._getDateValue(this.calendar) + this._getTimeValue(this.calendar);
		}
	},
	_writeValue:function(value){
		var oCalendar = tjs.editor.oDateTime.oCalendar;
		var result = false;
		if (value && tjs.lang.isString(value)) {
			if (this.spTimestamp) {
				var values = value.split(this.spTimestamp);
				if (values.length == 2) {
					result = this._setDateValue(oCalendar,values[0]) && this._setTimeValue(oCalendar,values[1]);
				}
			} else {
				if (this.yearType == 'TW') {
					result = this._setDateValue(oCalendar,value.substr(0,7)) && this._setTimeValue(oCalendar,value.substr(7));
				} else {
					result = this._setDateValue(oCalendar,value.substr(0,8)) && this._setTimeValue(oCalendar,value.substr(8));
				}
			}
		}
		if (!result) {
			oCalendar.setTime((new Date()).getTime());
		}
		this.calendar.setMilliseconds(0);
		value = oCalendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
			this.calendar.setTime(value);
			if (this.yearType == 'TW') {
				this.yearEditor.setValue(this.calendar.getFullYear()-1911);
			} else {
				this.yearEditor.setValue(this.calendar.getFullYear());
			}
			this.monthEditor.setValue(this.calendar.getMonth());
			this._redrawDates();
			this.hoursEditor.setValue(this.calendar.getHours());
			this.minutesEditor.setValue(this.calendar.getMinutes());
			if (this.secondsEditor) {
				this.secondsEditor.setValue(this.calendar.getSeconds());
			}
		}
		return changed;
	},
	_readValue:function(){
		var value = this.calendar.getTime();
		var changed = this.value != value;
		if (changed) {
			this.value = value;
		}
		return changed;
	}
});
