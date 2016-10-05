var bgWin = chrome.extension.getBackgroundPage();
var functionScript = this;
function createList(orders){
    document.getElementById('orderList').innerHTML = '';
    var actOrd = document.getElementById("orderN").value;
    for (var key in orders){
        var str = key + ' ' + orders[key].buyer.name;
        if (key == actOrd) $('#orderList').append('<option selected value=' + key + '>' + str + '</option>');
        else $('#orderList').append('<option value=' + key + '>' + str + '</option>');
    }
}
function initFindPanel () {
    //add listeners
    // findPanel.oncontextmenu = 
    var findPanel = document.getElementById('findPanel');
    if (findPanel){
        findPanel.onclick = function(event) {
        var el= event.target;
            if ((el.tagName!='IMG')&&(el.type!='button')) return;
            var action = event.target.getAttribute('data-action');
            var site = event.target.getAttribute('data-site');
            if (action&&site) functionScript[action](site);
            else if (action) functionScript[action]();
            else console.warn('element', el, 'has no action');
        }
}
}

function translate() {
    window.open('https://translate.yandex.ru/?text='+document.getElementById('bar').value, '_yaTranslate');
}
function doOrder() {
    var orderId= document.getElementById("orderN").value;
    if(!orderId){
        window.open('http://minerva.aliexpress.com/order/query_order.htm', "_order");
        return;
    }
    window.open('http://minerva.aliexpress.com/order/order_detail.htm?orderId='+orderId, '_blank');
}
function woHistList() {
    var orderId= document.getElementById("orderN").value;
    if(!orderId){
        window.open('http://minerva.aliexpress.com/workorder/commonCaseList.htm', "_blank");
        return;
    }
    window.open('http://minerva.aliexpress.com/workorder/workorderHistoryList.htm?orderId='+orderId, "_blank");
}

function doFeedBack() {
    var buyer= bgWin.buyers[(document.getElementById("buyerId").value)];
    if(buyer){
        window.open('http://feedback.aliexpress.com/display/detail.htm?ownerMemberId='+buyer.userId+'&memberType=buyer', "_feedback");
    }
}
function findCase() {
    var orderId = document.getElementById("orderN").value;
    if(orderId===""){
        window.open('http://minerva.aliexpress.com/complaint/caseQuery.htm', "_case");
        return;
    }
    window.open('http://minerva.aliexpress.com/complaint/relateOrder.htm?orderId='+orderId, "_case");
}
function findCases() {
    var aLoginId = document.getElementById("buyerId").value;
    if(aLoginId===""){
        window.open('http://minerva.aliexpress.com/complaint/caseQuery.htm', "_case");
        return;
    }
    window.open('http://minerva.aliexpress.com/complaint/relateOrderByLoginId.htm?aLoginId='+aLoginId, "_case");
}

function findUser() {
    var loginId= document.getElementById("buyerId").value;
    if(!loginId){
        window.open('https://crm.alibaba-inc.com/alps/buyer/intl/customerQuery.vm?searchMode=primeSearch', "_crmPrimeSearch");
        return;
    }
    window.open('http://minerva.aliexpress.com/member/view_detail.htm?loginId='+loginId, '_blank');
}
function findReport() {
    window.open('http://minerva.aliexpress.com/report/caseQuery.htm', '_blank' );
    //window.open('http://minerva.aliexpress.com/workorder/workorderHistoryList.htm', "_wo");
    var str='买家交易安全 > Abuse Buyer protection rules\nBuyer is very DSAT about disabling of account, wants to reactivate it.';
    setText(str);
    // window.open('#blockLabel'); //TODO
    return str;
}
function findReactWO() {
    window.open('http://minerva.aliexpress.com/workorder/commonCaseList.htm?bizType=1000042002&submitType=account', '_blank');
}
function crmCompany() {
    window.open('https://crm.alibaba-inc.com/alps/buyer/intl/buyerview.vm?customerId=1997168537&memberId=cn1511757242&companyId=231689240&tm=true&searchKey=cn1511757242', "_blank");
}

var findParcel = function(site) {
    var num = document.getElementById("YQNum").value;
    window.open(site+num, '_blank');
}
