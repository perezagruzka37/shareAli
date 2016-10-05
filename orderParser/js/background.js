var recentOrder;
var recentBuyer;
var orders = {};
var buyers = {};
chrome.windows.getAll(null, function (winArr){
  console.log(winArr);
});
function putOrder (ord){
  orders[ord.orderNum] = ord;
    if (ord.buyerId){
        if (!buyers[ord.buyerId]) {
          ord.buyer = recentBuyer = buyers[ord.buyerId] = new User(ord.buyerId, orderCompleted, ord.buyerName);
        }
    }
    recentOrder = ord;
}
function putUser (user){
    if (!buyers[user.id]) recentBuyer = buyers[user.id] = user;
}
function sendData(tabId, data){
  chrome.tabs.sendMessage(tabId, data);
  chrome.tabs.update(tabId, {highlighted:true});
}
function orderCompleted(completeLevel, obj){
      if ((completeLevel=='complete') || (completeLevel==COMPLETE.RENEW)){
        chrome.tabs.query({title:obj.buyerName + '*'}, function(tabArr) {
          if (tabArr[0])  sendData (tabArr[0].id, {orderNum:obj.orderNum});
          else 
            chrome.tabs.create({url:'orderPage.html?loginId='+obj.buyerId+'&orderId='+obj.orderNum, active:false});
        });
      } else if (completeLevel==COMPLETE.USER){
        setTimeout(chrome.tabs.query, 1000, {title:obj.name + '*'}, function(tabArr) {
          if (tabArr[0])  sendData (tabArr[0].id, {buyerId:obj.id});
          else chrome.tabs.create({url:'orderPage.html?loginId='+obj.id, active:false});
        });
      } else if (completeLevel==COMPLETE.TRACK){
        chrome.tabs.query({title:obj.buyerName + '*'}, function(tabArr) {
          if (tabArr[0])  sendData (tabArr[0].id, {orderNum:obj.orderNum});
        });
      } else {
        // alert ('callback in background in parsing '+ completeLevel,  obj);
        console.warn ('callback in background in parsing ', completeLevel, obj);
    }
}
function search (info, text) {
  if (info){
    text = info.selectionText.trim();
  }
  var orderNum = extractNum(text);
  var order = orders[orderNum];
  if (order){
    // recentOrder = order;
    recentOrder = order;
    recentBuyer = buyers[orderNum];
    orderCompleted('complete', order);
    order.renew();
    return;
  }
  if (orderNum.length == 14){
    orders[orderNum] = new Order (orderNum, orderCompleted);
    return;
  }
  if (orderNum.length == 13){
    alert ('MARS ORDER NOT YET SUPPORTED! ' + orderNum);
    return;
  }
  if (buyers[text]){
    orderCompleted(COMPLETE.USER , buyers[text])
  } else {
    buyers[text] = new User(text, orderCompleted);
  }
  // alert ('NOT YET SUPPORTED! ' + orderNum);
};
function extractNum(str){
  if(!str) {
    alert('!num' + str);
    return false;
  }
  var num = str.match(/[567]\d{13}/);
  if (num) {
    num = num.toString();
    return num;
  }

  var marsNum = str.match(/\D[13]\d{12}|^[13]\d{12}/); //TODO MARS ORDER
  // alert ('marsNum = <' + marsNum + '>');
  if (marsNum) return marsNum.toString();

  return str;
}
chrome.contextMenus.create({
    'title': 'Парсить заказ ' + '%s',
    'contexts':['selection'],
    'onclick': search
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if (request.started && recentOrder){
  			console.log('background gives recentOrder', recentOrder.orderNum);
  			sendResponse({oldOrder:recentOrder});
         // отправка сообщения на parseOrder.js
  	}
  	if (request.newOrder){
	  	recentOrder = request.newOrder;
      if (!orders[recentOrder.orderNum]){
          console.log('background takes recentOrder', recentOrder);
      }
      orders[recentOrder.orderNum]=recentOrder;
	  	console.log('background takes recentOrder', recentOrder);
      return;
  	}
    if (request.getOrderByNum){
      var order = orders[request.getOrderByNum];
      console.log('background takes request.getOrderByNum', order);
      if (order){
        recentOrder = order;
        sendResponse({order:order});
      }
    }
  });
