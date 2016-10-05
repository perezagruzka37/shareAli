// @const
var COMPLETE = {
    UNKNOWN: 0, MAIN: 1, USER: 2, RENEW: 3, TRACK: 4,
    ERROR: {
            MAIN: -1, USER: -2, RENEW: -3, TRACK: -4,
    }
};
//@const
var REPLACE_FLAG = true;
//@debug
function Order (number, callbackFun) {//@debug
    var url = 'http://minerva.aliexpress.com/order/order_detail.htm?orderId=' + number;
    var debugNames = '30152581990926 70254055338496 72384981882120 74407533716308 74887687341354 75379685363009 75978977633632 76182647441400'
    +' 77164101930042 77915577458533 78061366994162 78082166277052 78367493526062 78486918838770 78547231464543 78584210204735'
    if (~debugNames.indexOf(number))    url = '/res/'+number+'.html'; //@debug
    //@main
    this.url = url;
    this.orderNum = number;
    // this.seller, this.buyer, this.buyerName, this.url = url, this.buyerId;
    // this.level = this.buyerDisabled = this.sellerDisabled = '';
    // //@shipping
    // this.shippingTime, this.shipComp, this.trackNum = '', this.bp;
    // //@TrackingInfo
    // this.trackInfo;
    //@payment
    this.payment = {};
    // this.isPay, this.payType, this.payDate = '';
    //@refund
    // this.isRef, this.refDate = '', this.refPeriod, this.refPer1, this.refPer2;
    //@
    this.child =[];
    //@service
    // this.orderData;
    var self = this;
    Object.defineProperties(this,{
     "refSum": { get: function() { return this.payment.refSum;}},
     "timeOut": { get: function() { return replaceEn(this.maturity)}},
     "messageUrl": { get: function() { 
        return 'http://minerva.aliexpress.com/message/orderMessage.htm?orderId=' + this.orderNum;
        // + '&sellerAdminSeq=' + this.sellerAdminSeq + '&buyerAliId=' + buyerAliId;
    }},
     "ticketUrl": { get: function() { 
        return 'https://crm.alibaba-inc.com/alps/buyer/intl/customerQuery.vm?searchMode=primeSearch'
    }},
    }
    );
    orderStateChanched = callbackFun || function (state, ord){
        console.warn ('no listener', state, ord);
    };
    this.setListener = function (func){
        orderStateChanched = func;
    };
    console.log ('constructor ' + this.orderNum);
    var b = $.ajax(url);
    b.done(function (d) {
        self.parseOrder(d);
        // console.log('callbackFun', COMPLETE.MAIN, self);
    });
    b.fail(function (e, g, f) {
        console.error ('....error in XHR.....', self, e, g, f);
        // console.error(COMPLETE.ERROR.MAIN, '....error in XHR.....' + self + e + g + f);
    })
    this.renew = function(){
        console.info ('renew order', self);
        var b = $.ajax(this.url);
        b.done(function (d) {
            self.parseOrder(d);
        });
        b.fail(function (e, g, f) {
            console.error ('....error in XHR.....', self, e, g, f);
        })
    }
    this.parseOrder = function(data) {
        var siteData = $(data);
        var virtualElem = document.createElement('div');
        virtualElem.innerHTML = data;
        //main info
        var mainTable = virtualElem.getElementsByTagName('table')[0];
        // this.seller = mainTable.rows[2].cells[1].innerHTML;//@debug
        // this.buyer = mainTable.rows[2].cells[3].innerHTML;//@debug
        var sellerId = mainTable.rows[2].cells[1].firstElementChild.textContent;
        this.seller = new User (sellerId, function (state, seller) {
           orderStateChanched('seller', self);
        }, mainTable.rows[2].cells[1].lastChild.textContent.trim().slice(1, -1));
            self.buyerId = mainTable.rows[2].cells[3].firstElementChild.textContent;
            self.buyerName  = mainTable.rows[2].cells[3].lastChild.textContent.trim().slice(1, -1);
        orderStateChanched('users', self);
        self.trading    = new Date(mainTable.rows[1].cells[3].textContent +' GMT-0700').toLocaleString('ru', optionsFull);
        self.payType    = mainTable.rows[3].cells[1].textContent;
        self.stocking   = mainTable.rows[3].cells[3].textContent;
        self.maturity    = mainTable.rows[4].cells[1].textContent;
        //sellerAdminSeq, buyerAliId
        var messUrl = virtualElem.getElementsByClassName('btn_wrap')[1].children[1].outerHTML;
        messUrl = messUrl.split('sellerAdminSeq=')[1];
        self.seller.userId = messUrl.substring(0, 9);
        self.buyerAliId = messUrl.split('=')[1].substring(0, 9);
        //child
        var subTable = virtualElem.getElementsByTagName('table')[1].rows;
        for (var i = 1; i < subTable.length; i++) {
            var row = subTable[i];
            self.child[i-1] = {
                num: row.cells[0].textContent,
                nam: row.cells[1].firstElementChild.lastElementChild,
                price: row.cells[2].textContent,
                count: row.cells[3].textContent,
                sum: row.cells[4].textContent,
                mustShipComp: row.cells[5].textContent,
                bp: row.cells[6].textContent,
                issueStat: row.cells[7].textContent.trim(),
                orderStat: row.cells[8].textContent,
                shipping: row.cells[9].textContent,
                frozen: row.cells[10].textContent,
                refSum: '',
                refState: '',
                refDate: '',
                get orderStatus() {return getEn(this.orderStat)},
                get issueStatus() {
                    return '<a href="http://minerva.aliexpress.com/order/viewIssueDetail.htm?orderId='
                    + this.num + '&buyerAliId=' + self.buyerAliId + '" target="_blank">'
                    + getEn(this.issueStat) + '</a>'
                },
                get freezeStatus() {return getEn(this.frozen)},
                get shippingStatus() {return getEn(this.shipping)},
                get name() {
                    this.nam.href = "https://www.aliexpress.com/snapshot/" + this.nam.href.split("snapshot/")[1];
                    return this.nam.outerHTML;
                },
            }
            var snapXhr = new XMLHttpRequest();
            var thisChild = self.child[i-1];
            thisChild.snapHref = "https://www.aliexpress.com/snapshot/" + thisChild.nam.href.split("snapshot/")[1];
            snapXhr.open('GET', thisChild.snapHref, true);
            snapXhr.send(null);
            snapXhr.onreadystatechange = function() {
                if (snapXhr.readyState != 4) return;
                if (snapXhr.status != 200){
                    console.error ('....error in XHR..snapshot...', this);
                    return;
                }
                var data = snapXhr.responseText;
                if (data) {
                    var virt = document.createElement('div');
                    virt.innerHTML = data;//switch-site-tip-text h2
                    // //www.aliexpress.com/item/2015-Newest-Fashion-Jean-Vest-Wo…-Breasted-Hole-Short-Jacket-Outwear-Sleeveless-Denim-Coat/32396740256.html
                    thisChild.productUrl = 'https://' + virt.getElementsByTagName('h2')[0].firstElementChild.href.split('//')[1];
                    thisChild.picSrc = (virt.getElementsByClassName('color')[0] 
                        || virt.getElementsByClassName('image-nav-item')[0].firstElementChild.firstElementChild).src;
                    console.error(thisChild, thisChild.productUrl, thisChild.picSrc);
                    orderStateChanched ('snapshot', self);
                }
            }

            if (self.child[i-1].bp>self.bp) self.bp = self.child[i-1].bp;
        }
        var tableShift = (self.child.length-1)?self.child.length:0;
        var payTable = virtualElem.getElementsByTagName('table')[2];
        this.payment = {
            sum: payTable.rows[2].cells[1].textContent,
            couponAE: payTable.rows[2].cells[5].textContent,
            couponSeller: payTable.rows[3].cells[5].textContent,
            refTyp: payTable.rows[6].cells[1].textContent,
            refStat: payTable.rows[6].cells[3].textContent,
            refSum: payTable.rows[5].cells[1].textContent,
            shipping: virtualElem.getElementsByTagName('table')[3+tableShift].rows[1].cells[3].textContent,
            get refType() {return getEn(this.refTyp)},
            get refState() {return getEn(this.refStat)},

        };
        if (~this.payment.refSum.indexOf(')('))
            this.payment.refSum = this.payment.refSum.substring(0, this.payment.refSum.indexOf(')(')+1);
        if (!~this.payment.refSum.indexOf('(')) this.payType+='_USD';
        if (self.child.length-1)
            for (var i = 0; i < self.child.length; i++) {
                var subTable = virtualElem.getElementsByTagName('table')[3+i];
                self.child[i].refSum = subTable.rows[3].cells[1].textContent;
                if (~self.child[i].refSum.indexOf(')('))
                    self.child[i].refSum = self.child[i].refSum.substring(0, self.child[i].refSum.indexOf(')(')+1);
                self.child[i].refState = subTable.rows[5].cells[3].textContent;
            }
        var addrTable = virtualElem.getElementsByClassName('j-content')[2].getElementsByTagName('table')[0];
        this.address = [
            addrTable.rows[1].cells[1].textContent,
            addrTable.rows[1].cells[3].textContent,
            addrTable.rows[1].cells[5].textContent,
            addrTable.rows[2].cells[1].textContent,
            addrTable.rows[2].cells[3].textContent,
            addrTable.rows[2].cells[5].textContent,
        ];
        this.shipping = [];
        var shipTable = virtualElem.getElementsByClassName('current-content')[1].getElementsByTagName('table')[0];
        this.isShipped = shipTable.rows.length-1;
        if (this.isShipped){
            this.trackNum = shipTable.rows[1].cells[2].textContent;
            orderStateChanched('trackNum', self);
        }
        var onlyOneNum = 1;
        for (var i = 1; i < shipTable.rows.length; i++) {
            this.shipping[i-1] = {};
            this.shipping[i-1].date = getDate(shipTable.rows[i].cells[0].textContent);
            this.shipping[i-1].comp = shipTable.rows[i].cells[1].textContent;
            this.shipping[i-1].num = shipTable.rows[i].cells[2].textContent;
            this.shipping[i-1].delState = shipTable.rows[i].cells[4].textContent;
            this.shipping[i-1].delivered = shipTable.rows[i].cells[7].textContent;
            if (this.shipping[i-1].delivered)
                this.shipping[i-1].delivered = getDate(this.shipping[i-1].delivered);
            if (this.shipping[i-1].num[i-1] != this.trackNum) onlyOneNum = 0;
        }
        if (this.isShipped && onlyOneNum) this.shipping.length = 1;
        this.histTable = virtualElem.getElementsByClassName('current-content')[2].getElementsByTagName('table')[0].tBodies[0].innerHTML;
        // this.histTable= replaceEn(histTable.innerHTML);
 

        this.isPay = siteData.find('td:contains("ipayMsg")')[0];
        if (this.isPay){
            this.payDate = new Date(this.isPay.previousElementSibling.textContent +' GMT-0700');
            this.refPer1 = new Date(this.payDate);
            this.refPer1.setDate(this.refPer1.getDate() - 2);
            this.payDate = this.payDate.toLocaleString('ru', options);
            this.refPer1 = this.refPer1.toLocaleString('ru', options);
        }
        this.isRef = siteData.find('td:contains("refund")')[0];
        if (this.isRef||this.payment.refSum) {
            //console.log('..........start refund...............');
            if (this.isRef) {
                this.refDate = new Date(this.isRef.previousElementSibling.previousElementSibling.textContent +' GMT-0700');
            }
            this.refPer2 = new Date(this.refDate||new Date());
            if (this.isRef) 
                this.refDate = this.refDate.toLocaleString('ru', options)
            this.refPer2.setDate(this.refPer2.getDate() + 10);
            this.refPer2 = this.refPer2.toLocaleString('ru', options); 
        }
        var shipRow = siteData.find('.current-content')[1].firstElementChild.tBodies[0].rows[0];
        var generalState = siteData.find('.current-content')[0].firstElementChild.tBodies[0].rows[0];
        this.bp = + $(generalState.cells[6]).text();
        this.mustShipComp = $(generalState.cells[5]).text();
        if (shipRow){
            var shDate = new Date($(shipRow.cells[0]).text()+' GMT-0700');
            this.shippingTime = shDate.toLocaleString('ru', options);
            this.bpDate = new Date(shDate);
            this.bpDate.setDate(this.bpDate.getDate() + this.bp);
            this.bpDate = this.bpDate.toLocaleString('ru', options);
            this.shipComp = $(shipRow.cells[1]).text();
            this.trackNum = $(shipRow.cells[2]).text();
            // this.trackInfo = new TrackingInfo (this.trackNum, function (isComplete){
            //     orderStateChanched('complete', self);
            // });//@debug
        }
        orderStateChanched ('complete', self);
    }
}
