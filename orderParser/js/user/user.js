
function User (query, callbackFun, name, userId){
	console.error('User', query, callbackFun, name, userId)
	this.url = 'http://minerva.aliexpress.com/member/viewDetail.htm?loginId=' + query;
	var debugNames = 'cn1001820244 ru1056072702 ru1086535459 ru1143996448mvil';
    if (~debugNames.indexOf(query))    this.url = '/res/'+query+'.html'; //@debug
	this.name = name;
	this.id = this.query = query;
	this.userId = userId;
	this.status = '';
	this.joinTime;
	this.level;
	this.risk;
	this.systemMemo = '';
	this.setListener = function(func){callbackFun = func}
	this.avatar1 = 'http://atmgateway-client.alibaba.com/atmgateway/get_portrait.htm?memberId=enaliint' + this.id;
	// this.avatar2 = 'http://wwc.alicdn.com/avatar/getAvatar.do?userId=' + this.userId;
	var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url , true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200){
            console.error('user xhr.status != 200 --' + xhr.status + ': ' + xhr.statusText);
            // callbackFun (COMPLETE.ERROR.USER, 'xhr.status != 200 -- --' + xhr.status + ': ' + xhr.statusText);   	
            return;
        }
        var data = xhr.responseText;
        if (data) parse (data, self);
        else {
            console.error('user xhr.responseText null --' + xhr.readyState + ': ' + xhr.statusText);
            // callbackFun (COMPLETE.ERROR.USER, 'NULL DATA --' + xhr.readyState + ': ' + xhr.statusText);   	
        }
    }
	function parse (data, self, calbackFun) {
		var virtualElem = document.createElement('div');
		virtualElem.innerHTML = data;
		var tableMinerva = virtualElem.getElementsByTagName('table')[1];
		if (!self.name)
			self.name = tableMinerva.rows[0].cells[3].innerHTML.match(/.*(?=\()|.*/)[0];
		self.id = tableMinerva.rows[0].cells[1].children[0].innerHTML;
		self.status = tableMinerva.rows[1].cells[3].innerHTML;
		self.joinTime = tableMinerva.rows[2].cells[1].innerHTML.match(/.{10}/)[0];
		self.type = virtualElem.getElementsByTagName('font')[0].innerHTML.split(',')[0];
		self.userId = tableMinerva.rows[0].cells[1].children[0].href.split('=')[1].substr(0,9);
		if (self.type == 'Buyer'){
			self.level = virtualElem.getElementsByTagName('font')[0].innerHTML.match(/A[01234]/)[0];
			self.systemMemo = tableMinerva.rows[8].cells[1].innerHTML;
	 		self.risk =virtualElem.getElementsByTagName('font')[0].innerHTML.match(/L[12345]/);
			if (self.risk) self.risk = self.risk [0];
			else self.risk = "null";
		}
		callbackFun(COMPLETE.USER, self);
	}

}