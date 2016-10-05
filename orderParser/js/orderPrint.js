function printOrder(ord){
    var ordersDiv = document.getElementById('orders');
    var curOrder = document.getElementById('n'+ord.orderNum);
    if (!curOrder){
        curOrder = orderNode.cloneNode(true);
        curOrder.id = 'n'+ord.orderNum;//.insertBefore(newLi, list.firstChild);
        curOrder.hidden = false;
    }
    curOrder = ordersDiv.insertBefore(curOrder, ordersDiv.firstChild);
    curOrder = curOrder.tBodies[0];
    // if ((ord.child.length-1) && ord.isRef)
    //     curOrder.rows[7].celss[6].innerHTML = 'Возврат';
    var mainInfo = curOrder.getElementsByClassName('mainInfo')[0].children;
        mainInfo[0].innerHTML = ord.orderNum;
        mainInfo[1].innerHTML = ord.trading;
        // mainInfo[2].innerHTML = ord.bp;
        mainInfo[2].innerHTML = ord.stocking;
        mainInfo[3].innerHTML = ord.timeOut;
    var contragents = curOrder.getElementsByClassName('contragents')[0].children;
        contragents[0].innerHTML = ord.buyer.id + '<br>' + ord.buyer.name + '<br>' + ord.buyer.risk 
        + '<br>' + ord.buyer.status + '<br>' + ord.buyer.systemMemo;
        contragents[1].firstElementChild.firstElementChild.src = PHOTO_PATH + ord.buyerId;
        contragents[1].firstElementChild.href = ord.messageUrl;
        contragents[2].innerHTML = ord.seller.id + '<br>' + ord.seller.name + '<br>' + ord.seller.status;
        contragents[3].firstElementChild.firstElementChild.src = PHOTO_PATH + ord.seller.id;
        // contragents[4].firstElementChild.src = 'http://wwc.alicdn.com/avatar/getAvatar.do?userId=' + ord.seller.userId;
    var payInfo = curOrder.getElementsByClassName('payInfo')[0].children;
        payInfo[0].innerHTML = ord.payment.sum + '<br>' + ord.payDate + '<br>' + ord.payType;
        payInfo[1].innerHTML = ord.payment.refSum + '<br>' + ord.refDate + '<br>' 
        + ord.payment.refState + '<br>' + ord.payment.refType;
        payInfo[2].innerHTML = ord.payment.couponAE;
        payInfo[3].innerHTML = ord.payment.couponSeller;
        payInfo[4].innerHTML = ord.payment.shipping;
        // payInfo[4].innerHTML = ord.discountSeller;
    var shipping = curOrder.getElementsByClassName('shipping')[0].children;
        shipping[1].innerHTML = ord.address[0] + '<br>' + ord.address[1] + ' ' + ord.address[2] + ' '
        + ord.address[3] + ' ' + ord.address[4] + '<br>' + ord.address[5];
        if (ord.isShipped){
            shipping[0].innerHTML = '';
            for (var i = 0; i < ord.shipping.length; i++)
                shipping[0].innerHTML += ord.shipping[i].num + '<br>';
            shipping[2].innerHTML = ord.shipping[0].date + '<br>' + ord.shipping[0].comp;
            shipping[3].innerHTML = ord.shipping[0].delivered + '<br>' + ord.shipping[0].delState;
            var trIn = ord.trackInfo;
            if (trIn){
                        if (trIn.status < NORMAL) shipping[4].innerHTML = TRACK_STATES[trIn.status];
                        else {
                        shipping[4].innerHTML = trIn.howLong + '<br>' + trIn.whenLast + '<br>'
                         + trIn.whatParcel + ': ' + trIn.whereParcel;
                        }
                    }
        }

        for (var i = 0; i < ord.child.length; i++) {
            var child = ord.child[i];
            var childRow = curOrder.appendChild(document.getElementById('child' + child.num) || childNode.cloneNode(true));
            childRow.id = 'child' + child.num;
            childRow.hidden = false;
            var childCells = childRow.children;
            childCells[0].innerHTML = child.num;
            childCells[1].firstElementChild.href = child.productUrl;
            childCells[1].firstElementChild.firstElementChild.src = child.picSrc;
            childCells[2].innerHTML = child.name;
            childCells[3].innerHTML = child.price + '<br> X ' + child.count + '<br>' + child.sum;
            childCells[4].innerHTML = child.bp + '<br>' + child.shippingStatus + '<br>' + child.mustShipComp;
            childCells[5].innerHTML = child.orderStatus + '<br>' + child.issueStatus + '<br>'
             + child.freezeStatus.replace('NO_FROZEN', '');
            childCells[6].innerHTML = child.refSum + '<br>' + child.refDate + '<br>' + child.refState;
         }
    histTable = curOrder.nextElementSibling;
    histTable.innerHTML = ord.histTable;
    for (var i = 0; i < histTable.rows.length; i++) {
        histTable.rows[i].cells[0].innerHTML = getEn(histTable.rows[i].cells[0].innerHTML);
        if (~histTable.rows[i].cells[0].innerHTML.indexOf('hiddenAttr')) histTable.rows[i].hidden='true';
        histTable.rows[i].cells[1].innerHTML = getDate(histTable.rows[i].cells[1].innerHTML);
        histTable.rows[i].cells[3].innerHTML = histTable.rows[i].cells[3].innerHTML.substr(0, 160);
        histTable.rows[i].cells[3].setAttribute('colspan', '3');
    }
}
