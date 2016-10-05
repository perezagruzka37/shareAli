//@const
var SF_EXPRESS = ' Некоторые посылки не отслеживаются по России. Не волнуйтесь, это не помешает Вам получить посылку.' +
    ' Ваша посылка будет доставлена в Ваш почтовый ящик, или Вы получите извещение с почты и сможете забрать свою посылку на почте. Следите за сроком защиты покупателя. ';
//@const
var NO_TRACKING_INFO = 'Информации о местоположении посылки пока нет. После отправки посылки может пройти несколько дней, прежде чем она начнет отслеживаться. ' +
    '\n\n Свяжитесь с продавцом, для уточнения. Если продавец не сможет решить Ваш вопрос, и о посылке нет информации более 15 дней,' +
    ' рекомендую Вам открыть спор по причине "Нет информации об отслеживании".\n\n';
//@const сроки возврата
var REFUND_PERIOD = {//TODO
    'MIXEDCARD': 'В течение 3-20 рабочих дней деньги должны вернуться на карту, с которой Вы совершали платеж.',
    'MIXEDCARD_USD': 'В течение 3-15 рабочих дней деньги должны вернуться на карту, с которой Вы совершали платеж.',
    'QIWI Wallet':' В течение 3-5 рабочих дней деньги должны вернуться на долларовый счет Вашего QIWI-кошелька.',
    'QW_EBANK':' В течение 3-5 рабочих дней деньги должны вернуться на долларовый счет Вашего QIWI-кошелька.',
    'WM_EBANK':' В течение 7-10 рабочих дней деньги должны вернуться на счет, с которого Вы платили.',
    'YD_EBANK':' Обычно, на возврат денежных средств через Яндекс.Деньги уходит 7-10 рабочих дней. Вы получите возврат в рублях. Если Вы оплатили со своего баланса, деньги будут возвращены на него напрямую. Если Вы использовали кредитную карту, деньги будут возвращены на Вашу карту.',
    'ST_SMS':' В течение 7-10 рабочих дней деньги должны вернуться на счет мобильного телефона.',
    'CASH_IN':'В течение 7-10 рабочих дней деньги должны вернуться на счет мобильного телефона, который Вы указали при оплате.',
    //etc
};
var TRACK_STRINGS = {
    5: NO_TRACKING_INFO,
    7: SF_EXPRESS,
    1: "Еще отслеживется",
    0: "Не было запроса",
    2: "Слишком много запросов",
    4: "Не определился номер",
    3: "Ошибка отслеживания"
}
//@const
var REPLACE_FLAG = true;
// @const
var options = {
    // year: 'numeric',
    month: 'long',
    day: 'numeric',
};
function setText(text, into, replace){
    into = into||document.getElementById('shortInfo');
	// console.log (text);
    // chrome.runtime.sendMessage({messageToSave:text}); // отправка сообщения на background.js
	if (replace){
		$(into).html(text + '<br>');
	} else {
		$(into).append(text + '<br>');
	}
	return text;
}
function fastTrack (trackInfo){
    // console.info(trackInfo);
    trackingInfo = document.getElementById('trackingInfo');
    if (document.getElementById('YQNum')) document.getElementById('YQNum').value = trackInfo.trackNum;
    setText('Я проверил информацию об отслеживании посылки ' + trackInfo.trackNum + ' по заказу '+ trackInfo.orderNum
    + ' на сайте ' + trackInfo.site +'.', trackingInfo, REPLACE_FLAG);
    if (trackInfo.status < 6) {
        setText(TRACK_STRINGS[trackInfo.status], trackingInfo);
        return;
    }
    var str = trackInfo.howLong + '. По состоянию на ' + trackInfo.whenLast
        + ': "' + trackInfo.whatParcel + ' - ' + trackInfo.whereParcel + '".';
    setText(str, trackingInfo);
    if (trackInfo.status == STOPPED){
        setText (SF_EXPRESS, trackingInfo);
    }

}
function fastPrint (order, into){
    if (!order) return;
    if (!into) into = document.getElementById('shortInfo');
    usersInfo = document.getElementById('usersInfo');
    refundInfo = document.getElementById('refundInfo');
    shippingInfo = document.getElementById('shippingInfo');
    if (document.getElementById('orderN')) document.getElementById('orderN').value = order.orderNum;
    if (document.getElementById('buyerId')) document.getElementById('buyerId').value = order.buyer.id;
    setText('', usersInfo, REPLACE_FLAG);
    setText('', refundInfo, REPLACE_FLAG);
    setText('', shippingInfo, REPLACE_FLAG);
    setText(order.buyer.id+ ' ' + order.buyer.risk + ' ' + order.buyer.status, usersInfo);
    setText(order.buyer.name, usersInfo);
    setText(order.seller.id + ' ' + order.seller.name + ' ' + order.seller.status, usersInfo);
    if (order.isRef || order.refSum) {
        setText("Спасибо за ожидание.<br> Я уточнил данные по заказу " + order.orderNum + '.', refundInfo);
        var str = 'Возврат средств '
            + order.refSum + ' оформлен '+ order.refDate + '.<br>' + (REFUND_PERIOD[order.payType]||order.payType);
        setText(str, refundInfo);
        setText('Если деньги не пришли, пожалуйста, проверьте выписку из банка/от провайдера. Особенно внимательно'
         + ' посмотрите даты за два дня до оплаты и 10  рабочих дней после возврата. А именно вот эти даты: с ' 
         + order.refPer1 + ' по ' + order.refPer2 
         +'. По нашему опыту, многие наши клиенты находят возврат именно в эти даты.', refundInfo);
        setText('Чтобы узнать, на какой стадии находится Ваш возврат, перейдите, пожалуйста, по ссылке<br>'
            +' http://trade.aliexpress.com/order_detail.htm?language=ru_RU&orderId='
            + order.orderNum + '#fund-pnl', refundInfo);
        }
	if (order.trackNum){
        if (document.getElementById('YQNum')) document.getElementById('YQNum').value = order.trackNum;
        setText('Спасибо за ожидание.<br> Ваш заказ ' + order.orderNum + ' отправлен ' + order.shippingTime + '.<br> '
            + ' Вы можете проверить, где находится Ваша посылка по ссылке <br> https://gdeposylka.ru/'
            + order.trackNum + ' .', shippingInfo, REPLACE_FLAG);
        setText ('Продавец гарантирует доставку в срок ' + order.bp + ' дней, то есть до ' 
            + order.bpDate + '.', shippingInfo);
    }
    if (order.trackInfo) fastTrack (order.trackInfo);
}