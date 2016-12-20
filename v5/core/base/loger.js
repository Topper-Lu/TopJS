tjs.loger = {
	printData:function(data) {
		if (data) {
			var buf = [],k = 0,x;
			for (x in data) {
				buf[k++] = x;
			}
			var content = buf.join(',');
			buf.length = 0;
			this.log(content);
		}
	},
	log:function(message) {
		console.log(message);
	}
};

