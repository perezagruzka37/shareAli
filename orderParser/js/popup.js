var bgWin = chrome.extension.getBackgroundPage();
if (bgWin.recentOrder) fastPrint(bgWin.recentOrder);
if (bgWin.orders) createList (bgWin.orders);
function selectOrder (event){
    var num = event.target.value;
    if(!num)
    	return;
    console.log(num);
    document.getElementById('orderN').value = num;
    var order = bgWin.orders[num];
    if (order) {
        bgWin.recentOrder = order;
        fastPrint(order);

    } else  bgWin.search(null, num);// запрос заказа из списка
}
function parseUser(){
    bgWin.search(null, document.getElementById('buyerId').value.trim());
}
function parseOrder(num){
    bgWin.search(null, document.getElementById('orderN').value.trim()); 
}

$(function(){
    $('#progress').hide();
    $('#orderList').change(selectOrder);
    $('#parseUser').click(parseUser);
    $('#parseOrder').click(parseOrder);
    initFindPanel();
    // $('.starter24').click(parserGo24);
});
