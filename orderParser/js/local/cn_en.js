function getEn(arg) {
	// body...
	return cnToEnStrings[arg]||arg;
}
function replaceEn(arg) {
	// body...
	if (!arg) return '';
	for (key in cnToEnStrings) {
	  /* ... делать что-то с obj[key] ... */
	arg = arg.replace(key, cnToEnStrings[key]);
	}
	return arg;
}
function getDate (data, add){
	if (!add){//
		if (typeof data == 'string') return new Date(data +' GMT-0700').toLocaleString('ru', options);
		if (getClass(data) == 'HTMLTableCellElement'){
			data.innerHTML =  new Date(data.innerHTML +' GMT-0700').toLocaleString('ru', options);
			return data;
		}
		// if (typeof data == 'object') return new Date(data.valueOf() +' GMT-0700').toLocaleString('ru', options);
	}
	return data;
}
function getClass(obj) {
  return {}.toString.call(obj).slice(8, -1);
}
//@static final string
var options =     {                 month: 'long', day: 'numeric',};
var optionsFull = {year: 'numeric', month: 'long', day: 'numeric',};
var cnToEnStrings = {
	"--- 请选择 ---": "SELECT",
	//name="orderStatus"
					                               "下单成功":"PLACE_ORDER_SUCCESS",
                                                    "待卖家验款":"WAIT_SELLER_EXAMINE_MONEY",
                                                    "等待卖家发货":"WAIT_SELLER_SEND_GOODS",
                                                    "等待卖家全部发货":"SELLER_PART_SEND_GOODS",
                                                    "等待买家收货":"WAIT_BUYER_ACCEPT_GOODS",
                                                    "取消订单中":"IN_CANCEL",
                                                    "资金处理中":"FUND_PROCESSING",
                                                    "风控Hold24小时中":"RISK_CONTROL",
                                                    "交易结束":"FINISH",
                                                    "交易归档":"ARCHIVE",
	//name="issueStatus"
                                                    "无纠纷":"NO_ISSUE",
                                                    "纠纷中":"IN_ISSUE",
                                                    "纠纷结束":"END_ISSUE",
	//name="freezeStatus"
                                                    "未冻结":"NO_FROZEN",
                                                    "冻结中":"IN_FROZEN",
	//name="orderBizType"
                                                    "AE普通订单":"AE_COMMON",
                                                    "FOB订单":"AE_FOB",
                                                    "团购":"AE_GROUP",
                                                    "SAFEPAY订单":"SAFEPAY",
                                                    "QC订单":"QC",
                                                    "海运订单":"SC_SHIP",
                                                    "AE直冲业务":"AE_RECHARGE",
                                                    "AE_COUPON订单":"AE_COUPON",
                                                    "AE家装团购":"AE_GROUPV1",
	// SHIPPING_STATUS                             
													"无":"Не отправлен",
                                                    "等待卖家发货":"Ждет отправки",
                                                    "卖家已发货":"Продавец отправил",
                                                    "买家确认收货":"Покупатель подвердил получение",
    // Time Out
    												"到期":"Maturity	",
                                                    "买家收货超时":"Buyers receipt timeout",
    // refund
    			//refund state
					"退款成功": "Refund successfully",
				//refund type
					"售前退款": "Pre Refund",
					"售后退款": "Sale & Refund",
					"": "",
	// operating
				// dispute
					"等待卖家验货超时": "Timeout waiting for the seller inspection",
					"买家发货": "Buyers shipping",
					"纠纷超时": "Timeout dispute",
					"纠纷--卖家提出仲裁": "Disputes - Seller arbitration",
					"纠纷--取消退货": "Disputes - Cancel Returns",
					"纠纷-买家同意退款和退货": "Disputes - The buyer agreed to refund and return",
					"纠纷--卖家同意退款和退货": "Disputes - Seller agrees refund and return",
					"拒绝纠纷": "Dispute rejected",
					"修改纠纷": "Modify dispute",
					"创建纠纷": "Create Dispute",
				// delivery
					"卖家发货超时": "Seller shipped timeout",
					"延长买家验货时间": "Buyer prolonged inspection time",
					"买家确认收货": "Buyer to confirm receipt",
					"提前放款订单结束": "Advance loan Order End",
					"系统确认物流妥投": "The system confirms Logistics Tuotou",
					"卖家全部发货": "Seller delivery All",
							// Lending
									"放款成功": "Lenders success hiddenAttr",
									"系统接受提前放款消息": "System accepts in advance lenders message hiddenAttr",
									"付款清算成功": "Payment Clearing Success hiddenAttr",
									"提前放款订单审核不通过": "Advance-lenders order does not pass the audit hiddenAttr",
									"系统进行放款": "Lending system hiddenAttr",
									"系统发送提前放款请求": "The system sends advance loan request hiddenAttr",
		"买家付款超时": "Buyers pay overtime",
		"退款成功": "Refund successfully",
		"卖家接受 取消订单": "Seller Accepts cancel orders",
		"取消订单关闭交易": "Cancel an order to close the transaction",
		"买家提起 取消订单": "Buyer to cancel",
		"支付审核通过": "Payment approval",
		"在线付款成功": "Online payment",
		"创建交易": "Create Trading",
}











