// alert('hello');
//@const
var PHOTO_PATH ='http://atmgateway-client.alibaba.com/atmgateway/get_portrait.htm?memberId=enaliint';
var tabId;
var bgWin;
var buyer = {};
var orders = {};
// var buyerName;
var TRACK_STATES = ['Еще нет', 'Отслеживаю', 'Много запросов', 'Ошибка', 'Неизвестный номер', 'Нет отслеживания',
'Отслеживание', 'Остановлено'];
var bgWin = chrome.extension.getBackgroundPage();
var orderNode, childNode;
function setUrl(){

}
// window.onbeforeunload = function() {
//   return "Данные не сохранены. Точно перейти?";
// };
function parseUrlQuery() {
    var data = {};
    if(location.search) {
        var pair = (location.search.substr(1)).split('&');
        for(var i = 0; i < pair.length; i ++) {
            var param = pair[i].split('=');
            if (!data[param[0]]) data[param[0]] = [];
            data[param[0]].push(param[1]);
        }
    }
    return data;
}
function trackCompleted(ord, trIn) {
    if (!trIn) return;
    fastTrack(trIn);
    var curOrder;
    if (ord && (curOrder = document.getElementById('n'+ord.orderNum))){
        var shipping = curOrder.getElementsByClassName('shipping')[0].children;
        if (trIn.status < NORMAL) shipping[4].innerHTML = TRACK_STATES[trIn.status];
        else shipping[4].innerHTML = trIn.howLong + '<br>' + trIn.whenLast + '<br>'
         + trIn.whatParcel + ': ' + trIn.whereParcel;
    }
}
function sellerCompleted(ord) {
    fastPrint (ord);
    var curOrder;
    if (ord && (curOrder = document.getElementById('n'+ord.orderNum))){
    var contragents = curOrder.getElementsByClassName('contragents')[0].children;
        contragents[2].innerHTML = ord.seller.id + '<br>' + ord.seller.name + '<br>' + ord.seller.status;
    }
}
function snapshotCompleted(ord) {
    for (var i = 0; i < ord.child.length; i++) {
        var child = ord.child[i];
        var childRow = document.getElementById('child' + child.num);
        var childCells = childRow.children;
        childCells[1].firstElementChild.href = child.productUrl;
        childCells[1].firstElementChild.firstElementChild.src = child.picSrc;
     }
}
function buyerCompleted(ord) {
    fastPrint (ord);
    userCompleted(2, ord.buyer);
    var curOrder;
    if (ord && (curOrder = document.getElementById('n'+ord.orderNum))){
    var contragents = curOrder.getElementsByClassName('contragents')[0].children;
        contragents[0].innerHTML = ord.buyer.id + '<br>' + ord.buyer.name + '<br>' + ord.buyer.risk 
        + '<br>' + ord.buyer.status + '<br>' + ord.buyer.systemMemo;
    }
}
function orderCompleted (state, ord){
    ord.setListener(orderCompleted);
    switch (state){
        case 'users': break;
        case 'snapshot': snapshotCompleted(ord);
        case 'seller':
            sellerCompleted(ord);
            break;
        case 'trackNum': break;
        case 'complete':
        bgWin.orders[ord.orderNum] = orders[ord.orderNum] = ord;
        bgWin.recentOrder = ord;
        if (ord.buyerId){
            if (!bgWin.buyers[ord.buyerId]) {
              ord.buyer = bgWin.recentBuyer = bgWin.buyers[ord.buyerId] = new User(ord.buyerId, function (argument) {
                  buyerCompleted (ord);
              }, ord.buyerName);
            } else ord.buyer = bgWin.buyers[ord.buyerId];
        }
        var query = location.search;
        var toReplaceQuery = false;
        // console.error(query)
        if (!query){
            query = '?';
            toReplaceQuery = true;
        }
        if (!~query.indexOf('loginId')){
            toReplaceQuery = true;
            if (buyer.id) query += '&loginId=' + buyer.id;
            else if (ord.buyerId) query += '&loginId=' + ord.buyerId;
        }
        if (!~query.indexOf(ord.orderNum)){
            toReplaceQuery = true;
            query += '&orderId=' + ord.orderNum;
        }
        // console.error(query, toReplaceQuery)
        if (toReplaceQuery) history.pushState(null, null, query);//location.search = query;        
        if (!buyer.userId) buyer.userId = ord.buyerAliId;
        if (!document.title) document.title = ord.buyerName;
        if (!~document.title.indexOf(ord.orderNum)) document.title += '\n' + ord.orderNum;
        // console.error(ord.trackNum, ord.trackInfo)
        if (ord.trackNum){
            if (!ord.trackInfo)
                ord.trackInfo = new TrackingInfo (ord.trackNum, ord.orderNum, function (state) {
                    trackCompleted(ord, ord.trackInfo);
                });
            else {
                trackCompleted(ord, ord.trackInfo);
                ord.trackInfo.setListener(function (state) {
                    trackCompleted(ord, ord.trackInfo);
            });
            }
        }
        fastPrint (ord);
        printOrder(ord);
        break;
        default:
        console.error('no such state', state, ord);
    }
}
function userCompleted (state, user){
    // user.setListener(userCompleted);
    if (state>0){
        bgWin.buyers[user.id] = buyer = user;
        var toReplaceQuery = false;
        var query = location.search;
        // console.error(query)
        if (!query){ 
                    toReplaceQuery = true;
                    query = '?loginId=' + buyer.id;
                }
        if (!~query.indexOf(buyer.id)){
            toReplaceQuery = true;
            query += '&loginId=' + buyer.id;
        }
        if (toReplaceQuery) history.pushState(null, null, query);//location.search = query;{page:1}, "Hello"

        if (!document.title) document.title = buyer.name;
        if (!~document.title.indexOf(buyer.name)) document.title = buyer.name;
        var userTags = document.getElementById('user').children;
        userTags[0].firstElementChild.src = PHOTO_PATH + buyer.id;
        if (buyer.userId)
            userTags[0].lastElementChild.src = 'http://wwc.alicdn.com/avatar/getAvatar.do?userId=' + buyer.userId;
        userTags[1].firstElementChild.innerHTML = buyer.id;
        userTags[2].firstElementChild.innerHTML = buyer.name;
        userTags[3].firstElementChild.innerHTML = buyer.risk;
        userTags[4].firstElementChild.innerHTML = buyer.level;
        userTags[5].firstElementChild.innerHTML = buyer.joinTime;
        userTags[6].firstElementChild.innerHTML = buyer.status;
        userTags[7].firstElementChild.innerHTML = buyer.systemMemo;
        if (buyer.searchStr && buyer.searchStr!=buyer.id)
            userTags[8].firstElementChild.innerHTML = buyer.searchStr;
        // if (!buyer.id && Object.getOwnPropertyNames(orders)[0] && Object.getOwnPropertyNames(orders)[0].buyerAliId)
        //     userTags[0].lastElementChild.src = 'http://wwc.alicdn.com/avatar/getAvatar.do?userId=' 
        //     + Object.getOwnPropertyNames(orders)[0].buyerAliId;
    }
}



chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.info('message', message);
    // document.getElementsByTagName('body')[0]. appendChild('message');
    if (message.orderNum){
            orderCompleted('complete', bgWin.orders[message.orderNum]);
    }
    else if (message.buyerId){
             userCompleted(2, bgWin.buyers[message.buyerId]);
    }
});
function parseTrack(trN) {
    var trackInfo = new TrackingInfo (trN, null, function (state) {
        trackCompleted(null, trackInfo);
    });
}
function parseUser(loginId){
    if (loginId){
        if (bgWin && bgWin.buyers[loginId]) userCompleted(2, bgWin.buyers[loginId]);
        else (new User(loginId)).setListener(userCompleted);
    } else console.error ('no user');
}
function parseOrder(num){
    if (!num) console.error ('no number');
    else if (bgWin && bgWin.orders[num]) orderCompleted('complete', bgWin.orders[num]);
    else (new Order(num)).setListener (orderCompleted);
}
window.onfocus = function () {
    if (bgWin.orders) createList (bgWin.orders);
}
document.addEventListener("DOMContentLoaded", function (){
    orderNode = document.getElementById('orderNode');
    childNode = document.getElementById('childNode');
    var ordersNums =  parseUrlQuery()['orderId'];
    if (ordersNums)
        for (var i = ordersNums.length - 1; i >= 0; i--) {
            parseOrder(ordersNums[i]); 
        }
    if (bgWin.orders) createList (bgWin.orders);
    if (parseUrlQuery()['loginId']) parseUser(parseUrlQuery()['loginId'][0]);
    document.getElementById('parseOrder').onclick = function() {
        parseOrder(document.getElementById('orderN').value.trim());
    }
    document.getElementById('parseUser').onclick = function() {
        parseUser(document.getElementById('buyerId').value.trim());
    }
    document.getElementById('parseTrack').onclick = function() {
        parseTrack(document.getElementById('YQNum').value.trim());
    }
    $('#orderList').change(function (event) {
        bgWin.search(null, event.target.value);
    });
    initFindPanel();
});
