tjs.ds = {
	classname:'tjs.ds'
};

tjs.lang.defineTopClass('tjs.ds.DisjointSet',
function() {
	this.sets = {};
	this.nodes = {};
	this.cnt = 0;
},{
	destroy:function(){
		tjs.lang.destroyObject(this,true);
	},
	makeSet:function(id){
		if (!this.nodes[id]) {
			var o = {id:id,rank:0};
			o.parent = o;
			this.nodes[id] = o;
			this.sets[id] = [id];
			this.cnt++;
		}
	},
	_findRoot:function(id){
		var o = this.nodes[id];
		if (o) {
			var p = o.parent;
			if (p != p.parent) {
				do {
					p = p.parent;
				} while (p != p.parent);
				o.parent = p;
			}
			return p;
		} else {
			return null;
		}
	},
	unionSet:function(id1,id2){
		var x = this._findRoot(id1);
		var y = this._findRoot(id2);
		if (x && y && x != y) {
			var d, s;
			if (x.rank > y.rank) {
				y.parent = x;
				d = this.sets[x.id];
				s = this.sets[y.id];
				delete this.sets[y.id];
			} else {
				x.parent = y;
				d = this.sets[y.id];
				s = this.sets[x.id];
				delete this.sets[x.id];
				if (x.rank == y.rank) {
					y.rank++;
				}
			}
			this.cnt--;
			for (var i = 0, isize = s.length; i < isize; i++) {
				d.push(s[i]);
			}
			s.length = 0;
		}
	},
	findSet:function(id){
		var o = this._findRoot(id);
		return o ? o.id : null;
	}
});
