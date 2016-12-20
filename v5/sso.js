tjs.lang.defineTopClass('tjs.sso.LoginClient',
function(url) {
	this.url = url;
	this._InitHandler_ = this._InitHandler.bind(this);
	this._loginHandler_ = this._loginHandler.bind(this);
	this.secureRandom = null;
},{
	destroy: function() {
		if (this.oDialog4Login) {
			this.oDialog4Login.finalize();
		}
		tjs.lang.destroyObject(this);
	},
	login: function() {
		tjs.net.httpPOST4Json(this.url,'cmd=login_init',this._InitHandler_);
	},
	_InitHandler: function(response) {
		if (response.message) {
			alert(response.message);
		}
		if (response.result) {
			this.secureRandom = response.secureRandom;
		}
		tjs.lang.destroyObject(response);
		if (this.secureRandom) {
			if (!this.oDialog4Login) {
				this._createLoginEditors();
			}
			this.oDialog4Login.show();
		}
	},
	_loginHandler: function(response) {
		if (response.message) {
			alert(response.message);
		}
		tjs.lang.destroyObject(response);
		window.location.href = window.location.href;
	},
	_createLoginEditors: function() {
		this.oDialog4Login = new tjs.widget.Dialog({
			'caption':tjs.config.oResource.get('login'),
			content:{cls:'padding_5'},
			textCmds:['confirm','cancel'],
			contW:300,
			contH:100
		});
		this.oDialog4Login.addHandler(['confirm','cancel','close',tjs.widget.AFTER_SHOW,tjs.widget.AFTER_HIDE],this._cmdHandler.bind(this));
		var oContainer = this.oDialog4Login.getContent();
		var b = [], k = 0;
		b[k++] = '<table width="300" class="data" border="0" cellpadding="0" cellspacing="0">';
		b[k++] = '<colgroup>';
		b[k++] = '<col width="100">';
		b[k++] = '<col width="200">';
		b[k++] = '</colgroup>';
		b[k++] = '<tbody>';
		b[k++] = '<tr>';
		b[k++] = '<th><div class="label">';
		b[k++] = tjs.config.oResource.get('userid');
		b[k++] = '</div></th>';
		b[k++] = '<td><div class="container"></div></td>';
		b[k++] = '</tr>';
		b[k++] = '<tr>';
		b[k++] = '<th><div class="label">';
		b[k++] = tjs.config.oResource.get('password');
		b[k++] = '</div></th>';
		b[k++] = '<td><div class="container"></div></td>';
		b[k++] = '</tr>';
		b[k++] = '</tbody>';
		b[k++] = '</table>';
		oContainer.innerHTML = b.join('');
		tjs.lang.destroyArray(b);
		var oTable = tjs.dom.getFirstChildByTagName(oContainer,'table');
		var fHandler = this._keyupHandler.bind(this);
		this.oIdEditor = new tjs.editor.Text({oParent:oTable.rows[0].cells[1].firstChild,width:180,maxlength:32});
		this.oIdEditor.addHandler('keyup',fHandler);
		this.oPwEditor = new tjs.editor.Password({oParent:oTable.rows[1].cells[1].firstChild,width:180,maxlength:32});
		this.oPwEditor.addHandler('keyup',fHandler);
		this.oDialog4Login.setContentSize(oTable.offsetWidth, oTable.offsetHeight);
	},
	_keyupHandler: function(source,type,oEvent) {
		if (oEvent.keyCode == 0x0D) {
			var oTarget = oEvent.target || oEvent.srcElement;
			if (oTarget == this.oIdEditor.oText) {
				this.oPwEditor.oPasswd.focus();
			} else if (oTarget == this.oPwEditor.oPasswd) {
				this.oDialog4Login.fire('confirm');
			}
		}
	},
	_cmdHandler: function(source,type) {
		switch (type) {
		case 'confirm':
			if (this._validateEditors()) {
				var userid = this.oIdEditor.getValue();
				var password = this.oPwEditor.getValue();
				this.oDialog4Login.hide();
				this._doLogin(userid,password);
			}
			break;
		case 'cancel':
		case 'close':
			this.oDialog4Login.hide();
			break;
		case tjs.widget.AFTER_SHOW:
			this.oIdEditor.oText.focus();
			break;
		case tjs.widget.AFTER_HIDE:
			this.oIdEditor.setValue(null);
			this.oPwEditor.setValue(null);
			break;
		}
	},
	_validateEditors: function() {
		if (!this.oIdEditor.hasValue()) {
			window.alert(tjs.config.oResource.get('please_input')+tjs.config.oResource.get('userid'));
			return false;
		}
		var userid = this.oIdEditor.getValue();
		if (userid.length < 5) {
			window.alert('帳號無效！');
			return false;
		}
		if (!this.oPwEditor.hasValue()) {
			window.alert(tjs.config.oResource.get('please_input')+tjs.config.oResource.get('password'));
			return false;
		}
		return true;
	},
	_doLogin: function(userid,password) {
		var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, password);
		hmac.update(userid);
		hmac.update(this.secureRandom);
		var hash = hmac.finalize();
		this.secureRandom = null;
		var b = [], k = 0;
		b[k++] = 'cmd=login';
		b[k++] = 'userid='+encodeURIComponent(userid);
		b[k++] = 'hash='+encodeURIComponent(hash);
		var content = b.join('&');
		tjs.lang.destroyArray(b);
		tjs.net.httpPOST4Json(this.url,content,this._loginHandler_);
	}
});
//
tjs.lang.defineTopClass('tjs.sso.LogoutClient',
function(url) {
	this.url = url;
},{
	destroy: function() {
		tjs.lang.destroyObject(this);
	},
	logout: function() {
		tjs.net.httpPOST4Json(this.url,'cmd=logout',this._logoutHandler.bind(this));
	},
	_logoutHandler: function(response) {
		if (response.message) {
			alert(response.message);
		}
		tjs.lang.destroyObject(response);
		window.location.href = window.location.href;
	}
});
