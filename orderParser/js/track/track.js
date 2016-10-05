// @const
var NO_TRACK = 5, STOPPED = 7, TRY_AGAIN = 1, NORMAL = 6, NO_TRACK_YET = 0, OVERFLOW = 2, DONT_NOW = 4, ERROR = 3;
var TRACKING_URLS = ['https://gdeposylka.ru/', 'https://gdetoedet.ru/track/']
var scr = this;
function TrackingInfo (trackNum, orderNum, callbackFun){
    if (!trackNum) return;
    this.trackNum = trackNum;
    if (orderNum) this.orderNum = orderNum;
    self = this;
    this.trackInfo = [NO_TRACK_YET, , new Date(0)];
    this.setListener = function (func) {
        callbackFun = func;
    }
    Object.defineProperties(this,{
     "status": { get: function() { return this.trackInfo[0] || NO_TRACK_YET;}},
     "howLong": { get: function() { return this.trackInfo[1];}},
     "whenLast": { get: function() { return this.trackInfo[2].toLocaleDateString('ru', options);}},
     "whatParcel": { get: function() { return this.trackInfo[3];}},
     "whereParcel": { get: function() { return this.trackInfo[4];}},
     "site": { get: function() { return this.trackInfo[5] || 'без имени';}},
    }
    );
    var counterGde = 0;
    for (var i = 0; i < TRACKING_URLS.length; i++) {
        var xhrGde = new XMLHttpRequest();
    // alert(TRACKING_URLS[i])

        xhrGde.open('GET', TRACKING_URLS[i] + trackNum, true);
        xhrGde.send(null);
        xhrGde.onreadystatechange = function() {
            if (this.readyState != 4 || !this.responseURL) return;
            var trSite = this.responseURL.split('//')[1].split('.')[0];
            if (this.status != 200){
                self[trSite] = [ERROR];
                callbackFun(COMPLETE.TRACK.ERROR);
                return;
            }
            if (this.responseText) {
                var deliv = scr [trSite] (this.responseText);
                self[trSite] = deliv;
                deliv[5] = trSite;
                if (deliv[0] == TRY_AGAIN){
                    var req = this;
                    if (counterGde++ < 10) setTimeout(function(){
                        console.info (req.responseURL);
                                                req.open ('GET', req.responseURL, true);
                                                req.send (null);
                                            }, 2000);
                    else deliv = self[trSite] = [OVERFLOW];
                }
                if ((deliv[0]>self.status) || (deliv[2]>self.trackInfo[2])){
                    self.trackInfo = deliv;
                }
                callbackFun(COMPLETE.TRACK);
            }
        }
    }
}

function gdeposylka(data) {
    var siteData = $(data);
    var state, howLong, whenLast, whatParcel, whereParcel;
    if (siteData.find('#tracking-updaing-now')[0]) return [TRY_AGAIN];
    state = siteData.find('div.status > div.alert > span')[0];
    console.warn ('state', state);
    if (~$(siteData.find('div.alert-warning')).text().indexOf('не знаем ни одной службы')) return [DONT_NOW];
    if (~$(state).text().indexOf('не знаем ни одной службы'))                              return [DONT_NOW];
    if (~$(state).text().indexOf('Ожидаем информацию о посылке'))                          return [NO_TRACK];
    howLong = state.firstElementChild.innerText.trim();
    whenLast = new Date(siteData.find('time')[0].getAttribute('datetime'));
    whatParcel = siteData.find('.checkpoint-status')[0];
    whereParcel = $(whatParcel.nextElementSibling).text().trim();
    whatParcel = $(whatParcel).text().trim();
    if (~howLong.indexOf('Отслеживание посылки остановлено')){
        return [STOPPED, howLong, whenLast, whatParcel, whereParcel];
    }
    return [NORMAL, howLong, whenLast, whatParcel, whereParcel];
}
function gdetoedet(data) {
    var siteData = $(data);
    var state, howLong, whenLast, whatParcel, whereParcel;
    self.example = $(siteData.find('.example-head')[0].firstElementChild.firstElementChild).text();
    state = $(siteData.find('div.m-t-10')[4]).text();
    if (~state.indexOf('Ваша отправление отслеживается')) return [TRY_AGAIN];
    howLong = siteData.find('h2')[0];
    if (!howLong)           return [NO_TRACK];
    howLong = $(howLong).text().replace(/\s+/g, " ").trim();
    whenLast = new Date(parseInt(siteData.find('.time-ago')[0].firstElementChild.getAttribute('data-time'))-1000);
    whatParcel = siteData.find('.status')[0].firstElementChild;
    whereParcel = $(whatParcel.nextElementSibling).text().trim();
    whatParcel = $(whatParcel).text().trim();
    if (~howLong.indexOf('более не отслеживается')){
        return [STOPPED, howLong, whenLast, whatParcel, whereParcel];
    }
    return [NORMAL, howLong, whenLast, whatParcel, whereParcel];
}
