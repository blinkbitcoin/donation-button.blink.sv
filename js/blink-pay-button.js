/**
 * Blink Pay Button Widget
 * A simple widget for accepting Bitcoin Lightning donations via Blink wallet
 * Version: 1.5.0 - Generate the invoice QR code client-side via an inlined,
 *                  MIT-licensed qrcode-generator instead of api.qrserver.com.
 *                  Removes the third-party request (privacy + availability) and
 *                  the only external CORS dependency. Drops the unused
 *                  generateQRWithLogo() dead code. DOM/contract unchanged: the QR
 *                  is still an <img> in #blink-pay-qr (now a local data URI).
 *          1.4.0 - Optional embedder lifecycle callbacks (onSuccess/onError/
 *                  onTimeout). Additive only; existing public API unchanged.
 *                  Callbacks are invoked via a try/catch-wrapped fireCallback so a
 *                  throwing embedder handler can never break the widget. onError
 *                  also covers exchange-rate lookup failures (not just invoice/
 *                  processing errors); input-validation errors stay UI-only.
 *          1.3.3 - Make payment-poll cancellation race-safe: a generation token
 *                  ensures a poll loop cannot resume after stop/reset when its
 *                  request was already in flight (would otherwise poll unbounded).
 *          1.3.2 - Friendly "username not found" message: a non-existent Blink
 *                  username now shows a clear donor-facing error instead of the
 *                  raw "LNURL endpoint returned 404" technical message.
 *          1.3.1 - Bound payment-status polling to the invoice expiry so the
 *                  pollers stop instead of hammering the API forever when a donor
 *                  never pays. Adds isInvoiceExpired/stopPaymentPolling cleanup.
 *          1.3.0 - Self-custodial (Spark) receive via Lightning address (LNURL-pay
 *                  custodial-first fallback + LUD-21 verify). Custodial flow unchanged.
 */
(function() {
    //-------------------------------------------------------------------------
    // Vendored: qrcode-generator v1.4.4 — QR Code Generator for JavaScript
    // Copyright (c) 2009 Kazuhiko Arase — MIT License
    //   http://www.opensource.org/licenses/mit-license.php
    // Source: https://github.com/kazuhikoarase/qrcode-generator
    // Inlined (minified, UMD footer stripped) so the single-file embed can
    // render QR codes locally — no third-party request (formerly api.qrserver.com).
    // The word "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
    //-------------------------------------------------------------------------
    var qrcode=function(){var t=function(t,r){var e=t,n=c[r],o=null,i=0,a=null,u=[],f={},g=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=y(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),g=i-1;g>0;g-=2)for(6==g&&(g-=1);;){for(var c=0;c<2;c+=1)if(null==o[n][g-c]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,g-c)&&(l=!l),o[n][g-c]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},y=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,g=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,g),i[u]=new Array(f);for(var c=0;c<i[u].length;c+=1)i[u][c]=255&t.getBuffer()[c+e];e+=f;var l=B.getErrorCorrectPolynomial(g),h=C(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),c=0;c<a[u].length;c+=1){var s=c+h.getLength()-a[u].length;a[u][c]=s>=0?h.getAt(s):0}}var v=0;for(c=0;c<r.length;c+=1)v+=r[c].totalCount;var d=new Array(v),w=0;for(c=0;c<n;c+=1)for(u=0;u<r.length;u+=1)c<i[u].length&&(d[w]=i[u][c],w+=1);for(c=0;c<o;c+=1)for(u=0;u<r.length;u+=1)c<a[u].length&&(d[w]=a[u][c],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var c=0;for(i=0;i<r.length;i++)c+=r[i].dataCount;if(o.getLengthInBits()<=8*c)break}e=t}g(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){g(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,g,c=f.getModuleCount()*t+2*r,l="";for(g="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+c+'px" height="'+c+'px"',l+=' viewBox="0 0 '+c+" "+c+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+p([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+p(n.id)+'">'+p(n.text)+"</title>":"",l+=e.text?'<description id="'+p(e.id)+'">'+p(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+g);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1})},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=p(e),o+='"'),o+="/>"};var p=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,g=a-t,c={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<g&&u<=r&&r<g&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<g&&u<=r+1&&r+1<g&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=g?l[i]:c[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,g=a-r,c=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<g&&u<=e&&e<g&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?c:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(n*r,o*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,g=8,c={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,y=6,p=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case y:return function(t,r){return(t*r%2+t*r%3)%2==0};case p:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=C([1],0),e=0;e<t;e+=1)r=r.multiply(C([1,k.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case g:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case g:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case g:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var g=0;t.isDark(n,o)&&(g+=1),t.isDark(n+1,o)&&(g+=1),t.isDark(n,o+1)&&(g+=1),t.isDark(n+1,o+1)&&(g+=1),0!=g&&4!=g||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var c=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(c+=1);return e+=Math.abs(100*c/r/r-50)/5*10},o),k=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function C(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=k.gexp(k.glog(n.getAt(e))+k.glog(t.getAt(o)));return C(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=k.glog(n.getAt(0))-k.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=k.gexp(k.glog(t.getAt(o))+r);return C(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case c.L:return t[4*(r-1)+0];case c.M:return t[4*(r-1)+1];case c.Q:return t[4*(r-1)+2];case c.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],g=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(g,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=g,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(){var t=n("友");if(2!=t.length||38726!=(t[0]<<8|t[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,g,c,l=D(),h=(f=l,g=0,c=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;g+r>=8;)f.writeByte(255&(t<<g|c)),r-=8-g,t>>>=8-g,c=0,g=0;c|=t<<g,g+=r},flush:function(){g>0&&f.writeByte(c)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),g=0;g<f.length;g+=1)u.writeByte(f[g]);return u.flush(),"data:image/gif;base64,"+u};return t}();

    // Translation objects for multi-language support
    const translations = {
        en: {
            buttonText: 'Donate Bitcoin',
            copyInvoice: 'Copy Invoice',
            payInWallet: 'Pay in wallet',
            copied: 'Copied!',
            paymentSuccessful: 'Payment Successful. Thank you for donating.',
            loading: 'Loading...',
            invoiceCopied: 'Invoice copied to clipboard',
            failedToCopy: 'Failed to copy invoice',
            pleaseEnterValidAmount: 'Please enter a valid amount',
            amountMustBeAtLeast: 'Amount must be at least',
            failedToFetchExchangeRate: 'Failed to fetch exchange rate for',
            pleaseTryAgain: 'Please try again.',
            anErrorOccurred: 'An error occurred while processing your donation',
            usernameNotFound: 'This Blink username could not be found. Please check the username.',
            qrCodeAlt: 'Lightning Invoice QR Code'
        },
        es: {
            buttonText: 'Donar Bitcoin',
            copyInvoice: 'Copiar Factura',
            payInWallet: 'Pagar en billetera',
            copied: '¡Copiado!',
            paymentSuccessful: 'Pago Exitoso. Gracias por donar.',
            loading: 'Cargando...',
            invoiceCopied: 'Factura copiada al portapapeles',
            failedToCopy: 'Error al copiar la factura',
            pleaseEnterValidAmount: 'Por favor ingrese una cantidad válida',
            amountMustBeAtLeast: 'La cantidad debe ser al menos',
            failedToFetchExchangeRate: 'Error al obtener el tipo de cambio para',
            pleaseTryAgain: 'Por favor intente de nuevo.',
            anErrorOccurred: 'Ocurrió un error al procesar su donación',
            qrCodeAlt: 'Código QR de Factura Lightning'
        },
        fr: {
            buttonText: 'Faire un Don Bitcoin',
            copyInvoice: 'Copier la Facture',
            payInWallet: 'Payer dans le portefeuille',
            copied: 'Copié !',
            paymentSuccessful: 'Paiement Réussi. Merci pour votre don.',
            loading: 'Chargement...',
            invoiceCopied: 'Facture copiée dans le presse-papiers',
            failedToCopy: 'Échec de la copie de la facture',
            pleaseEnterValidAmount: 'Veuillez entrer un montant valide',
            amountMustBeAtLeast: 'Le montant doit être au moins',
            failedToFetchExchangeRate: 'Échec de récupération du taux de change pour',
            pleaseTryAgain: 'Veuillez réessayer.',
            anErrorOccurred: 'Une erreur s\'est produite lors du traitement de votre don',
            qrCodeAlt: 'Code QR de Facture Lightning'
        },
        de: {
            buttonText: 'Bitcoin Spenden',
            copyInvoice: 'Rechnung Kopieren',
            payInWallet: 'In Wallet bezahlen',
            copied: 'Kopiert!',
            paymentSuccessful: 'Zahlung Erfolgreich. Vielen Dank für Ihre Spende.',
            loading: 'Lädt...',
            invoiceCopied: 'Rechnung in die Zwischenablage kopiert',
            failedToCopy: 'Fehler beim Kopieren der Rechnung',
            pleaseEnterValidAmount: 'Bitte geben Sie einen gültigen Betrag ein',
            amountMustBeAtLeast: 'Der Betrag muss mindestens',
            failedToFetchExchangeRate: 'Fehler beim Abrufen des Wechselkurses für',
            pleaseTryAgain: 'Bitte versuchen Sie es erneut.',
            anErrorOccurred: 'Bei der Verarbeitung Ihrer Spende ist ein Fehler aufgetreten',
            qrCodeAlt: 'Lightning Rechnung QR-Code'
        },
        pt: {
            buttonText: 'Doar Bitcoin',
            copyInvoice: 'Copiar Fatura',
            payInWallet: 'Pagar na carteira',
            copied: 'Copiado!',
            paymentSuccessful: 'Pagamento Bem-sucedido. Obrigado por doar.',
            loading: 'Carregando...',
            invoiceCopied: 'Fatura copiada para a área de transferência',
            failedToCopy: 'Falha ao copiar a fatura',
            pleaseEnterValidAmount: 'Por favor, insira um valor válido',
            amountMustBeAtLeast: 'O valor deve ser pelo menos',
            failedToFetchExchangeRate: 'Falha ao buscar taxa de câmbio para',
            pleaseTryAgain: 'Por favor, tente novamente.',
            anErrorOccurred: 'Ocorreu um erro ao processar sua doação',
            qrCodeAlt: 'Código QR da Fatura Lightning'
        },
        it: {
            buttonText: 'Dona Bitcoin',
            copyInvoice: 'Copia Fattura',
            payInWallet: 'Paga nel portafoglio',
            copied: 'Copiato!',
            paymentSuccessful: 'Pagamento Riuscito. Grazie per aver donato.',
            loading: 'Caricamento...',
            invoiceCopied: 'Fattura copiata negli appunti',
            failedToCopy: 'Impossibile copiare la fattura',
            pleaseEnterValidAmount: 'Per favore inserisci un importo valido',
            amountMustBeAtLeast: 'L\'importo deve essere almeno',
            failedToFetchExchangeRate: 'Impossibile recuperare il tasso di cambio per',
            pleaseTryAgain: 'Per favore riprova.',
            anErrorOccurred: 'Si è verificato un errore durante l\'elaborazione della tua donazione',
            qrCodeAlt: 'Codice QR Fattura Lightning'
        },
        ja: {
            buttonText: 'ビットコインを寄付',
            copyInvoice: '請求書をコピー',
            payInWallet: 'ウォレットで支払う',
            copied: 'コピーしました！',
            paymentSuccessful: '決済成功。ご寄付ありがとうございます。',
            loading: '読み込み中...',
            invoiceCopied: '請求書をクリップボードにコピーしました',
            failedToCopy: '請求書のコピーに失敗しました',
            pleaseEnterValidAmount: '有効な金額を入力してください',
            amountMustBeAtLeast: '金額は最低',
            failedToFetchExchangeRate: '為替レートの取得に失敗しました',
            pleaseTryAgain: '再度お試しください。',
            anErrorOccurred: '寄付の処理中にエラーが発生しました',
            qrCodeAlt: 'Lightning請求書QRコード'
        },
        zh: {
            buttonText: '捐赠比特币',
            copyInvoice: '复制发票',
            payInWallet: '在钱包中支付',
            copied: '已复制！',
            paymentSuccessful: '支付成功。感谢您的捐赠。',
            loading: '加载中...',
            invoiceCopied: '发票已复制到剪贴板',
            failedToCopy: '复制发票失败',
            pleaseEnterValidAmount: '请输入有效金额',
            amountMustBeAtLeast: '金额必须至少为',
            failedToFetchExchangeRate: '获取汇率失败',
            pleaseTryAgain: '请再试一次。',
            anErrorOccurred: '处理您的捐赠时发生错误',
            qrCodeAlt: 'Lightning发票二维码'
        },
        ru: {
            buttonText: 'Пожертвовать Биткоин',
            copyInvoice: 'Копировать Счёт',
            payInWallet: 'Оплатить в кошельке',
            copied: 'Скопировано!',
            paymentSuccessful: 'Платёж Успешен. Спасибо за пожертвование.',
            loading: 'Загрузка...',
            invoiceCopied: 'Счёт скопирован в буфер обмена',
            failedToCopy: 'Не удалось скопировать счёт',
            pleaseEnterValidAmount: 'Пожалуйста, введите корректную сумму',
            amountMustBeAtLeast: 'Сумма должна быть не менее',
            failedToFetchExchangeRate: 'Не удалось получить курс валют для',
            pleaseTryAgain: 'Пожалуйста, попробуйте снова.',
            anErrorOccurred: 'Произошла ошибка при обработке вашего пожертвования',
            qrCodeAlt: 'QR-код Lightning счёта'
        },
        ar: {
            buttonText: 'تبرع بالبيتكوين',
            copyInvoice: 'نسخ الفاتورة',
            payInWallet: 'ادفع في المحفظة',
            copied: 'تم النسخ!',
            paymentSuccessful: 'تم الدفع بنجاح. شكراً لك على التبرع.',
            loading: 'جاري التحميل...',
            invoiceCopied: 'تم نسخ الفاتورة إلى الحافظة',
            failedToCopy: 'فشل في نسخ الفاتورة',
            pleaseEnterValidAmount: 'يرجى إدخال مبلغ صالح',
            amountMustBeAtLeast: 'يجب أن يكون المبلغ على الأقل',
            failedToFetchExchangeRate: 'فشل في جلب سعر الصرف لـ',
            pleaseTryAgain: 'يرجى المحاولة مرة أخرى.',
            anErrorOccurred: 'حدث خطأ أثناء معالجة تبرعك',
            qrCodeAlt: 'رمز QR لفاتورة Lightning'
        },
        tr: {
            buttonText: 'Bitcoin Bağışla',
            copyInvoice: 'Faturayı Kopyala',
            payInWallet: 'Cüzdanda öde',
            copied: 'Kopyalandı!',
            paymentSuccessful: 'Ödeme Başarılı. Bağışınız için teşekkürler.',
            loading: 'Yükleniyor...',
            invoiceCopied: 'Fatura panoya kopyalandı',
            failedToCopy: 'Fatura kopyalanamadı',
            pleaseEnterValidAmount: 'Lütfen geçerli bir miktar girin',
            amountMustBeAtLeast: 'Miktar en az olmalıdır',
            failedToFetchExchangeRate: 'Döviz kuru alınamadı',
            pleaseTryAgain: 'Lütfen tekrar deneyin.',
            anErrorOccurred: 'Bağışınız işlenirken bir hata oluştu',
            qrCodeAlt: 'Lightning Fatura QR Kodu'
        },
        // European Languages
        nl: {
            buttonText: 'Doneer Bitcoin',
            copyInvoice: 'Factuur Kopiëren',
            payInWallet: 'Betaal in wallet',
            copied: 'Gekopieerd!',
            paymentSuccessful: 'Betaling Succesvol. Bedankt voor je donatie.',
            loading: 'Laden...',
            invoiceCopied: 'Factuur gekopieerd naar klembord',
            failedToCopy: 'Factuur kopiëren mislukt',
            pleaseEnterValidAmount: 'Voer een geldig bedrag in',
            amountMustBeAtLeast: 'Bedrag moet minstens zijn',
            failedToFetchExchangeRate: 'Wisselkoers ophalen mislukt voor',
            pleaseTryAgain: 'Probeer opnieuw.',
            anErrorOccurred: 'Er is een fout opgetreden bij het verwerken van je donatie',
            qrCodeAlt: 'Lightning Factuur QR Code'
        },
        da: {
            buttonText: 'Doner Bitcoin',
            copyInvoice: 'Kopier Faktura',
            payInWallet: 'Betal i pung',
            copied: 'Kopieret!',
            paymentSuccessful: 'Betaling Succesfuld. Tak for din donation.',
            loading: 'Indlæser...',
            invoiceCopied: 'Faktura kopieret til udklipsholder',
            failedToCopy: 'Kunne ikke kopiere faktura',
            pleaseEnterValidAmount: 'Indtast venligst et gyldigt beløb',
            amountMustBeAtLeast: 'Beløb skal være mindst',
            failedToFetchExchangeRate: 'Kunne ikke hente valutakurs for',
            pleaseTryAgain: 'Prøv venligst igen.',
            anErrorOccurred: 'Der opstod en fejl under behandling af din donation',
            qrCodeAlt: 'Lightning Faktura QR Kode'
        },
        sv: {
            buttonText: 'Donera Bitcoin',
            copyInvoice: 'Kopiera Faktura',
            payInWallet: 'Betala i plånbok',
            copied: 'Kopierad!',
            paymentSuccessful: 'Betalning Lyckades. Tack för din donation.',
            loading: 'Laddar...',
            invoiceCopied: 'Faktura kopierad till urklipp',
            failedToCopy: 'Kunde inte kopiera faktura',
            pleaseEnterValidAmount: 'Vänligen ange ett giltigt belopp',
            amountMustBeAtLeast: 'Beloppet måste vara minst',
            failedToFetchExchangeRate: 'Kunde inte hämta växelkurs för',
            pleaseTryAgain: 'Vänligen försök igen.',
            anErrorOccurred: 'Ett fel uppstod vid behandling av din donation',
            qrCodeAlt: 'Lightning Faktura QR Kod'
        },
        el: {
            buttonText: 'Δωρίστε Bitcoin',
            copyInvoice: 'Αντιγραφή Τιμολογίου',
            payInWallet: 'Πληρωμή σε πορτοφόλι',
            copied: 'Αντιγράφηκε!',
            paymentSuccessful: 'Πληρωμή Επιτυχής. Ευχαριστούμε για τη δωρεά σας.',
            loading: 'Φόρτωση...',
            invoiceCopied: 'Τιμολόγιο αντιγράφηκε στο πρόχειρο',
            failedToCopy: 'Αποτυχία αντιγραφής τιμολογίου',
            pleaseEnterValidAmount: 'Παρακαλώ εισάγετε έγκυρο ποσό',
            amountMustBeAtLeast: 'Το ποσό πρέπει να είναι τουλάχιστον',
            failedToFetchExchangeRate: 'Αποτυχία λήψης συναλλαγματικής ισοτιμίας για',
            pleaseTryAgain: 'Παρακαλώ δοκιμάστε ξανά.',
            anErrorOccurred: 'Προέκυψε σφάλμα κατά την επεξεργασία της δωρεάς σας',
            qrCodeAlt: 'Lightning Τιμολόγιο QR Κώδικας'
        },
        ro: {
            buttonText: 'Donează Bitcoin',
            copyInvoice: 'Copiază Factura',
            payInWallet: 'Plătește în portofel',
            copied: 'Copiat!',
            paymentSuccessful: 'Plată Reușită. Mulțumim pentru donația ta.',
            loading: 'Se încarcă...',
            invoiceCopied: 'Factură copiată în clipboard',
            failedToCopy: 'Nu s-a putut copia factura',
            pleaseEnterValidAmount: 'Te rugăm să introduci o sumă validă',
            amountMustBeAtLeast: 'Suma trebuie să fie cel puțin',
            failedToFetchExchangeRate: 'Nu s-a putut obține cursul de schimb pentru',
            pleaseTryAgain: 'Te rugăm să încerci din nou.',
            anErrorOccurred: 'A apărut o eroare în procesarea donației tale',
            qrCodeAlt: 'Lightning Factură QR Cod'
        },
        hu: {
            buttonText: 'Bitcoin Adományozás',
            copyInvoice: 'Számla Másolása',
            payInWallet: 'Fizetés tárcában',
            copied: 'Másolva!',
            paymentSuccessful: 'Fizetés Sikeres. Köszönjük az adományát.',
            loading: 'Betöltés...',
            invoiceCopied: 'Számla vágólapra másolva',
            failedToCopy: 'Számla másolása sikertelen',
            pleaseEnterValidAmount: 'Kérjük, adjon meg érvényes összeget',
            amountMustBeAtLeast: 'Az összegnek legalább ennyinek kell lennie',
            failedToFetchExchangeRate: 'Árfolyam lekérése sikertelen:',
            pleaseTryAgain: 'Kérjük, próbálja újra.',
            anErrorOccurred: 'Hiba történt az adományának feldolgozása során',
            qrCodeAlt: 'Lightning Számla QR Kód'
        },
        hr: {
            buttonText: 'Doniraj Bitcoin',
            copyInvoice: 'Kopiraj Račun',
            payInWallet: 'Plati u novčaniku',
            copied: 'Kopirano!',
            paymentSuccessful: 'Plaćanje Uspješno. Hvala na donaciji.',
            loading: 'Učitavanje...',
            invoiceCopied: 'Račun kopiran u međuspremnik',
            failedToCopy: 'Neuspješno kopiranje računa',
            pleaseEnterValidAmount: 'Molimo unesite valjan iznos',
            amountMustBeAtLeast: 'Iznos mora biti najmanje',
            failedToFetchExchangeRate: 'Neuspješno dohvaćanje tečaja za',
            pleaseTryAgain: 'Molimo pokušajte ponovo.',
            anErrorOccurred: 'Došlo je do greške tijekom obrade vaše donacije',
            qrCodeAlt: 'Lightning Račun QR Kod'
        },
        sr: {
            buttonText: 'Дониraj Bitcoin',
            copyInvoice: 'Копираj Рачун',
            payInWallet: 'Плати у новчанику',
            copied: 'Копирано!',
            paymentSuccessful: 'Плаћање Успешно. Хвала на донацији.',
            loading: 'Учитавање...',
            invoiceCopied: 'Рачун копиран у клипборд',
            failedToCopy: 'Неуспешно копирање рачуна',
            pleaseEnterValidAmount: 'Молимо унесите важећи износ',
            amountMustBeAtLeast: 'Износ мора бити најмање',
            failedToFetchExchangeRate: 'Неуспешно добијање курса за',
            pleaseTryAgain: 'Молимо покушајте поново.',
            anErrorOccurred: 'Дошло је до грешке током обраде ваше донације',
            qrCodeAlt: 'Lightning Рачун QR Код'
        },
        bs: {
            buttonText: 'Doniraj Bitcoin',
            copyInvoice: 'Kopiraj Račun',
            payInWallet: 'Plati u novčaniku',
            copied: 'Kopirano!',
            paymentSuccessful: 'Plaćanje Uspješno. Hvala na donaciji.',
            loading: 'Učitavanje...',
            invoiceCopied: 'Račun kopiran u clipboard',
            failedToCopy: 'Neuspješno kopiranje računa',
            pleaseEnterValidAmount: 'Molimo unesite valjan iznos',
            amountMustBeAtLeast: 'Iznos mora biti najmanje',
            failedToFetchExchangeRate: 'Neuspješno dohvatanje kursa za',
            pleaseTryAgain: 'Molimo pokušajte ponovo.',
            anErrorOccurred: 'Došlo je do greške tokom obrade vaše donacije',
            qrCodeAlt: 'Lightning Račun QR Kod'
        },
        cs: {
            buttonText: 'Darovat Bitcoin',
            copyInvoice: 'Kopírovat Fakturu',
            payInWallet: 'Platit v peněžence',
            copied: 'Zkopírováno!',
            paymentSuccessful: 'Platba Úspěšná. Děkujeme za váš dar.',
            loading: 'Načítání...',
            invoiceCopied: 'Faktura zkopírována do schránky',
            failedToCopy: 'Nepodařilo se zkopírovat fakturu',
            pleaseEnterValidAmount: 'Prosím zadejte platnou částku',
            amountMustBeAtLeast: 'Částka musí být nejméně',
            failedToFetchExchangeRate: 'Nepodařilo se získat směnný kurz pro',
            pleaseTryAgain: 'Prosím zkuste to znovu.',
            anErrorOccurred: 'Při zpracování vašeho daru došlo k chybě',
            qrCodeAlt: 'Lightning Faktura QR Kód'
        },
        pl: {
            buttonText: 'Przekaż Bitcoin',
            copyInvoice: 'Kopiuj Fakturę',
            payInWallet: 'Zapłać w portfelu',
            copied: 'Skopiowane!',
            paymentSuccessful: 'Płatność Udana. Dziękujemy za darowiznę.',
            loading: 'Ładowanie...',
            invoiceCopied: 'Faktura skopiowana do schowka',
            failedToCopy: 'Nie udało się skopiować faktury',
            pleaseEnterValidAmount: 'Proszę podać prawidłową kwotę',
            amountMustBeAtLeast: 'Kwota musi wynosić co najmniej',
            failedToFetchExchangeRate: 'Nie udało się pobrać kursu wymiany dla',
            pleaseTryAgain: 'Proszę spróbować ponownie.',
            anErrorOccurred: 'Wystąpił błąd podczas przetwarzania darowizny',
            qrCodeAlt: 'Lightning Faktura QR Kod'
        },
        lt: {
            buttonText: 'Paaukoti Bitcoin',
            copyInvoice: 'Kopijuoti Sąskaitą',
            payInWallet: 'Mokėti piniginėje',
            copied: 'Nukopijuota!',
            paymentSuccessful: 'Mokėjimas Sėkmingas. Ačiū už auką.',
            loading: 'Kraunasi...',
            invoiceCopied: 'Sąskaita nukopijuota į iškarpinę',
            failedToCopy: 'Nepavyko nukopijuoti sąskaitos',
            pleaseEnterValidAmount: 'Prašome įvesti galiojančią sumą',
            amountMustBeAtLeast: 'Suma turi būti bent',
            failedToFetchExchangeRate: 'Nepavyko gauti valiutos kurso',
            pleaseTryAgain: 'Prašome bandyti dar kartą.',
            anErrorOccurred: 'Apdorojant jūsų auką įvyko klaida',
            qrCodeAlt: 'Lightning Sąskaitos QR Kodas'
        },
        fi: {
            buttonText: 'Lahjoita Bitcoin',
            copyInvoice: 'Kopioi Lasku',
            payInWallet: 'Maksa lompakossa',
            copied: 'Kopioitu!',
            paymentSuccessful: 'Maksu Onnistui. Kiitos lahjoituksestasi.',
            loading: 'Ladataan...',
            invoiceCopied: 'Lasku kopioitu leikepöydälle',
            failedToCopy: 'Laskun kopiointi epäonnistui',
            pleaseEnterValidAmount: 'Anna kelvollinen summa',
            amountMustBeAtLeast: 'Summan on oltava vähintään',
            failedToFetchExchangeRate: 'Vaihtokurssin haku epäonnistui',
            pleaseTryAgain: 'Yritä uudelleen.',
            anErrorOccurred: 'Lahjoituksen käsittelyssä tapahtui virhe',
            qrCodeAlt: 'Lightning Lasku QR Koodi'
        },
        sq: {
            buttonText: 'Dhuro Bitcoin',
            copyInvoice: 'Kopjo Faturën',
            payInWallet: 'Paguaj në portofol',
            copied: 'U kopjua!',
            paymentSuccessful: 'Pagesa e Suksesshme. Faleminderit për dhurimin.',
            loading: 'Po ngarkohet...',
            invoiceCopied: 'Fatura u kopjua në clipboard',
            failedToCopy: 'Dështoi kopjimi i faturës',
            pleaseEnterValidAmount: 'Ju lutemi shkruani një shumë të vlefshme',
            amountMustBeAtLeast: 'Shuma duhet të jetë të paktën',
            failedToFetchExchangeRate: 'Dështoi marrja e kursit të këmbimit për',
            pleaseTryAgain: 'Ju lutemi provoni përsëri.',
            anErrorOccurred: 'Ndodhi një gabim gjatë përpunimit të dhurimit tuaj',
            qrCodeAlt: 'Lightning Faturë QR Kod'
        },
        // African Languages
        sw: {
            buttonText: 'Changia Bitcoin',
            copyInvoice: 'Nakili Bili',
            payInWallet: 'Lipa kwenye pochi',
            copied: 'Imenakiliwa!',
            paymentSuccessful: 'Malipo Yamefanikiwa. Asante kwa mchango wako.',
            loading: 'Inapakia...',
            invoiceCopied: 'Bili imenakiliwa kwenye clipboard',
            failedToCopy: 'Imeshindwa kunakili bili',
            pleaseEnterValidAmount: 'Tafadhali weka kiasi halali',
            amountMustBeAtLeast: 'Kiasi lazima kiwe angalau',
            failedToFetchExchangeRate: 'Imeshindwa kupata kiwango cha ubadilishaji kwa',
            pleaseTryAgain: 'Tafadhali jaribu tena.',
            anErrorOccurred: 'Hitilafu imetokea wakati wa kuchakata mchango wako',
            qrCodeAlt: 'Lightning Bili QR Msimbo'
        },
        af: {
            buttonText: 'Skenk Bitcoin',
            copyInvoice: 'Kopieer Faktuur',
            payInWallet: 'Betaal in beursie',
            copied: 'Gekopieer!',
            paymentSuccessful: 'Betaling Geslaagd. Dankie vir jou skenking.',
            loading: 'Laai...',
            invoiceCopied: 'Faktuur na knipbord gekopieer',
            failedToCopy: 'Kon nie faktuur kopieer nie',
            pleaseEnterValidAmount: 'Voer asseblief \'n geldige bedrag in',
            amountMustBeAtLeast: 'Bedrag moet ten minste wees',
            failedToFetchExchangeRate: 'Kon nie wisselkoers kry vir',
            pleaseTryAgain: 'Probeer asseblief weer.',
            anErrorOccurred: 'Daar het \'n fout voorgekom tydens verwerking van jou skenking',
            qrCodeAlt: 'Lightning Faktuur QR Kode'
        },
        xh: {
            buttonText: 'Nikela Bitcoin',
            copyInvoice: 'Khuphela Ityala',
            payInWallet: 'Hlawula kwisikhwama',
            copied: 'Kukhutshelwe!',
            paymentSuccessful: 'Intlawulo Iphumelele. Enkosi ngomnikelo wakho.',
            loading: 'Kulayishwa...',
            invoiceCopied: 'Ityala likhutshelwe kwi-clipboard',
            failedToCopy: 'Akuphumelelanga ukukhuphela ityala',
            pleaseEnterValidAmount: 'Nceda ufake imali esemthethweni',
            amountMustBeAtLeast: 'Imali kufuneka ibe yintoni ubuncinci',
            failedToFetchExchangeRate: 'Akuphumelelanga ukufumana ireyithi yotshintshiselwano',
            pleaseTryAgain: 'Nceda uzame kwakhona.',
            anErrorOccurred: 'Kwenzeke impazamo ngexesha lokusetyenzwa komnikelo wakho',
            qrCodeAlt: 'Lightning Ityala QR Ikhowudi'
        },
        zu: {
            buttonText: 'Nikela Bitcoin',
            copyInvoice: 'Kopisha I-invoice',
            payInWallet: 'Khokha ku-wallet',
            copied: 'Kukopishelwe!',
            paymentSuccessful: 'Inkokhelo Iphumelele. Siyabonga ngomnikelo wakho.',
            loading: 'Kulayishwa...',
            invoiceCopied: 'I-invoice ikopishelwe ku-clipboard',
            failedToCopy: 'Yehluleka ukukopisha i-invoice',
            pleaseEnterValidAmount: 'Sicela ufake inani elivumelekile',
            amountMustBeAtLeast: 'Inani kumele libe okungenani',
            failedToFetchExchangeRate: 'Yehluleka ukuthola izinga lokushintshana',
            pleaseTryAgain: 'Sicela uzame futhi.',
            anErrorOccurred: 'Kube khona iphutha ngesikhathi sokucubungula umnikelo wakho',
            qrCodeAlt: 'Lightning I-invoice QR Ikhodi'
        },
        // Asian Languages
        id: {
            buttonText: 'Donasi Bitcoin',
            copyInvoice: 'Salin Invoice',
            payInWallet: 'Bayar di dompet',
            copied: 'Tersalin!',
            paymentSuccessful: 'Pembayaran Berhasil. Terima kasih atas donasi Anda.',
            loading: 'Memuat...',
            invoiceCopied: 'Invoice tersalin ke clipboard',
            failedToCopy: 'Gagal menyalin invoice',
            pleaseEnterValidAmount: 'Harap masukkan jumlah yang valid',
            amountMustBeAtLeast: 'Jumlah harus setidaknya',
            failedToFetchExchangeRate: 'Gagal mengambil nilai tukar untuk',
            pleaseTryAgain: 'Silakan coba lagi.',
            anErrorOccurred: 'Terjadi kesalahan saat memproses donasi Anda',
            qrCodeAlt: 'Lightning Invoice QR Code'
        },
        th: {
            buttonText: 'บริจาค Bitcoin',
            copyInvoice: 'คัดลอกใบแจ้งหนี้',
            payInWallet: 'จ่ายในกระเป๋าเงิน',
            copied: 'คัดลอกแล้ว!',
            paymentSuccessful: 'การชำระเงินสำเร็จ ขอบคุณสำหรับการบริจาค',
            loading: 'กำลังโหลด...',
            invoiceCopied: 'ใบแจ้งหนี้ถูกคัดลอกไปยังคลิปบอร์ด',
            failedToCopy: 'ไม่สามารถคัดลอกใบแจ้งหนี้ได้',
            pleaseEnterValidAmount: 'กรุณาใส่จำนวนเงินที่ถูกต้อง',
            amountMustBeAtLeast: 'จำนวนเงินต้องเป็นอย่างน้อย',
            failedToFetchExchangeRate: 'ไม่สามารถดึงอัตราแลกเปลี่ยนสำหรับ',
            pleaseTryAgain: 'กรุณาลองใหม่อีกครั้ง',
            anErrorOccurred: 'เกิดข้อผิดพลาดขณะประมวลผลการบริจาคของคุณ',
            qrCodeAlt: 'Lightning ใบแจ้งหนี้ QR Code'
        },
        vi: {
            buttonText: 'Quyên góp Bitcoin',
            copyInvoice: 'Sao chép Hóa đơn',
            payInWallet: 'Thanh toán trong ví',
            copied: 'Đã sao chép!',
            paymentSuccessful: 'Thanh toán Thành công. Cảm ơn bạn đã quyên góp.',
            loading: 'Đang tải...',
            invoiceCopied: 'Hóa đơn đã được sao chép vào clipboard',
            failedToCopy: 'Không thể sao chép hóa đơn',
            pleaseEnterValidAmount: 'Vui lòng nhập số tiền hợp lệ',
            amountMustBeAtLeast: 'Số tiền phải ít nhất',
            failedToFetchExchangeRate: 'Không thể lấy tỷ giá hối đoái cho',
            pleaseTryAgain: 'Vui lòng thử lại.',
            anErrorOccurred: 'Đã xảy ra lỗi khi xử lý khoản quyên góp của bạn',
            qrCodeAlt: 'Lightning Hóa đơn QR Code'
        },
        hi: {
            buttonText: 'Bitcoin दान करें',
            copyInvoice: 'इनवॉयस कॉपी करें',
            payInWallet: 'वॉलेट में भुगतान करें',
            copied: 'कॉपी हो गया!',
            paymentSuccessful: 'भुगतान सफल। आपके दान के लिए धन्यवाद।',
            loading: 'लोड हो रहा है...',
            invoiceCopied: 'इनवॉयस क्लिपबोर्ड में कॉपी हो गया',
            failedToCopy: 'इनवॉयस कॉपी करने में असफल',
            pleaseEnterValidAmount: 'कृपया एक वैध राशि दर्ज करें',
            amountMustBeAtLeast: 'राशि कम से कम होनी चाहिए',
            failedToFetchExchangeRate: 'विनिमय दर प्राप्त करने में असफल',
            pleaseTryAgain: 'कृपया फिर से कोशिश करें।',
            anErrorOccurred: 'आपके दान को संसाधित करते समय एक त्रुटि हुई',
            qrCodeAlt: 'Lightning इनवॉयस QR कोड'
        },
        bn: {
            buttonText: 'Bitcoin দান করুন',
            copyInvoice: 'ইনভয়েস কপি করুন',
            payInWallet: 'ওয়ালেটে পেমেন্ট করুন',
            copied: 'কপি হয়েছে!',
            paymentSuccessful: 'পেমেন্ট সফল। আপনার দানের জন্য ধন্যবাদ।',
            loading: 'লোড হচ্ছে...',
            invoiceCopied: 'ইনভয়েস ক্লিপবোর্ডে কপি হয়েছে',
            failedToCopy: 'ইনভয়েস কপি করতে ব্যর্থ',
            pleaseEnterValidAmount: 'অনুগ্রহ করে একটি বৈধ পরিমাণ লিখুন',
            amountMustBeAtLeast: 'পরিমাণ কমপক্ষে হতে হবে',
            failedToFetchExchangeRate: 'বিনিময় হার আনতে ব্যর্থ',
            pleaseTryAgain: 'অনুগ্রহ করে আবার চেষ্টা করুন।',
            anErrorOccurred: 'আপনার দান প্রক্রিয়াকরণের সময় একটি ত্রুটি ঘটেছে',
            qrCodeAlt: 'Lightning ইনভয়েস QR কোড'
        },
        fa: {
            buttonText: 'بیت‌کوین اهدا کنید',
            copyInvoice: 'کپی فاکتور',
            payInWallet: 'پرداخت در کیف پول',
            copied: 'کپی شد!',
            paymentSuccessful: 'پرداخت موفق. از اهدای شما متشکریم.',
            loading: 'در حال بارگذاری...',
            invoiceCopied: 'فاکتور در کلیپ‌بورد کپی شد',
            failedToCopy: 'کپی فاکتور ناموفق',
            pleaseEnterValidAmount: 'لطفاً مبلغ معتبری وارد کنید',
            amountMustBeAtLeast: 'مبلغ باید حداقل باشد',
            failedToFetchExchangeRate: 'دریافت نرخ ارز ناموفق برای',
            pleaseTryAgain: 'لطفاً دوباره تلاش کنید.',
            anErrorOccurred: 'خطایی در پردازش اهدای شما رخ داد',
            qrCodeAlt: 'کد QR فاکتور Lightning'
        },
        ps: {
            buttonText: 'بیټ کوین ورکړه',
            copyInvoice: 'فکتور کاپي کړئ',
            payInWallet: 'په والټ کې ورکړئ',
            copied: 'کاپي شو!',
            paymentSuccessful: 'تادیه بریالۍ وه. ستاسو د ورکړې لپاره مننه.',
            loading: 'بارېږي...',
            invoiceCopied: 'فکتور په کلپ بورډ کې کاپي شو',
            failedToCopy: 'د فکتور کاپي کول ناکامه شول',
            pleaseEnterValidAmount: 'مهرباني وکړئ سمه اندازه داخل کړئ',
            amountMustBeAtLeast: 'اندازه باید لږ تر لږه وي',
            failedToFetchExchangeRate: 'د تبادلې نرخ ترلاسه کول ناکامه شو',
            pleaseTryAgain: 'مهرباني وکړئ بیا هڅه وکړئ.',
            anErrorOccurred: 'ستاسو د ورکړې پروسس کولو کې ستونزه رامنځته شوه',
            qrCodeAlt: 'Lightning فکتور QR کوډ'
        }
    };

    // Widget configuration
    const BlinkPayButton = {
        // Initialize the widget with the given username and container
        init: function(config) {
            this.username = config.username || '';
            this.containerId = config.containerId || 'blink-pay-button-container';
            this.language = config.language || 'en';
            this.buttonText = config.buttonText || this.t('buttonText');
            this.buttonClass = config.buttonClass || 'blink-pay-button';
            this.themeMode = config.themeMode || 'light'; // light or dark
            this.themeColor = config.themeColor || '#FB5607'; // Sunset Orange as default
            this.minAmount = config.minAmount || 1;
            this.defaultAmount = config.defaultAmount || 1000;
            this.buttonWidth = config.buttonWidth || null; // Custom button width in pixels
            this.container = document.getElementById(this.containerId);
            this.debug = config.debug || false;

            // Optional embedder lifecycle callbacks. Non-functions are ignored so a
            // bad value can never throw. Invoked via fireCallback() (try/catch-wrapped)
            // so a throwing embedder handler can't break the widget.
            this.onSuccess = typeof config.onSuccess === 'function' ? config.onSuccess : null;
            this.onError = typeof config.onError === 'function' ? config.onError : null;
            this.onTimeout = typeof config.onTimeout === 'function' ? config.onTimeout : null;
            this.logs = [];
            this.selectedCurrency = 'sats'; // Default currency
            this.exchangeRates = {}; // Cache for exchange rates (currency -> rate)
            
            // Configure supported currencies - can be customized by widget creator
            this.supportedCurrencies = config.supportedCurrencies || [
                { code: 'sats', name: 'sats', isCrypto: true },
                { code: 'USD', name: 'USD', isCrypto: false },
            ];
            
            if (!this.username) {
                console.error('Blink Pay Button: username is required');
                return;
            }
            
            if (!this.container) {
                console.error(`Blink Pay Button: container element with ID "${this.containerId}" not found`);
                return;
            }
            
            this.render();
            this.attachEventListeners();
            this.log('Widget initialized for username: ' + this.username);
        },
        
        // Translation helper function
        t: function(key, params = {}) {
            const lang = translations[this.language] || translations['en'];
            let text = lang[key] || translations['en'][key] || key;
            
            // Simple parameter substitution
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
            
            return text;
        },
        
        // Add a log entry
        log: function(message, data) {
            if (!this.debug) return;
            
            const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.sss
            const logEntry = {
                timestamp,
                message,
                data
            };
            
            this.logs.push(logEntry);
            console.log(`[BlinkPay ${timestamp}]`, message, data || '');
        },

        // Safely invoke an optional embedder callback (onSuccess/onError/onTimeout).
        // Any error thrown by the embedder's handler is caught and logged so it can
        // never break the widget's own flow.
        fireCallback: function(name, payload) {
            const cb = this[name];
            if (typeof cb !== 'function') return;
            try {
                cb(payload);
            } catch (err) {
                this.log(`Embedder ${name} callback threw`, err);
            }
        },

        // Generate a QR code for the given data entirely client-side and return it
        // as a base64 GIF data URI (no third-party request — formerly api.qrserver.com).
        // Uses the inlined, MIT-licensed qrcode-generator (see top of file). Type 0
        // auto-fits the version; ECC 'M' is a good scannability/size balance for
        // Lightning invoices. Returns null on failure so callers can fall back.
        buildQrDataUrl: function(data) {
            try {
                const qr = qrcode(0, 'M');
                qr.addData(data);
                qr.make();
                // cellSize 5 + 10px quiet-zone margin renders near the previous ~200px.
                return qr.createDataURL(5, 10);
            } catch (err) {
                this.log('Failed to generate QR code locally', err);
                return null;
            }
        },

        // Render the widget in the container
        render: function() {
            // Blink logos for both light and dark modes with absolute URLs
                    const blinkLogoLight = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink-light.svg';
        const blinkLogoDark = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/blink-dark.svg';
        const checkmarkSvg = 'https://blinkbitcoin.github.io/donation-button.blink.sv/img/successcheckmark.svg';
            
            // Define CSS colors based on the Blink brand
            const colors = {
                sunset: '#FB5607',
                lightning: '#FFB32C',
                gradient: 'linear-gradient(45deg, #fe9f0c, #fc5805)',
                dark: '#222222',
                light: '#FFFFFF',
                darkBg: '#333333',
                lightBg: '#F8F9FA'
            };
            
            // Choose colors based on theme
            const mainColor = this.themeColor || colors.sunset;
            const isDark = this.themeMode === 'dark';
            const textColor = isDark ? colors.light : colors.dark;
            const bgColor = isDark ? colors.darkBg : colors.lightBg;
            const borderColor = isDark ? '#444444' : '#E0E0E0';
            const inputBgColor = isDark ? '#444444' : colors.light;
            const secondaryBgColor = isDark ? '#444444' : '#F1F1F1';
            const logo = isDark ? blinkLogoDark : blinkLogoLight;
            
            const styles = `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');
                
                /* CSS Variables for theming */
                .blink-pay-widget {
                    --blink-bg-color: ${bgColor};
                    --blink-text-color: ${textColor};
                    --blink-border-color: ${borderColor};
                    --blink-input-bg-color: ${inputBgColor};
                    --blink-secondary-bg-color: ${secondaryBgColor};
                    --blink-button-width: ${this.buttonWidth ? this.buttonWidth + 'px' : '310px'};
                    --blink-widget-width: ${this.buttonWidth ? this.buttonWidth + 'px' : '370px'};
                    --blink-font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                /* CSS Reset for Blink Pay Widget - only critical resets need !important */
                .blink-pay-widget, .blink-pay-widget * {
                    margin: 0;
                    padding: 0;
                    border: 0;
                    font-size: 100%;
                    font: inherit;
                    vertical-align: baseline;
                    -webkit-box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                }
                
                /* Custom widget width support */
                .blink-pay-widget[data-button-width] {
                    --blink-button-width: ${this.buttonWidth ? this.buttonWidth + 'px' : '310px'};
                    --blink-widget-width: ${this.buttonWidth ? this.buttonWidth + 'px' : '370px'};
                }
                
                .blink-pay-widget {
                    line-height: 1;
                }
                
                .blink-pay-widget ol, .blink-pay-widget ul {
                    list-style: none;
                }
                
                .blink-pay-widget table {
                    border-collapse: collapse;
                    border-spacing: 0;
                }
                
                .blink-pay-widget input, .blink-pay-widget select {
                    background: none;
                    border: none;
                    outline: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                
                .blink-pay-widget {
                    font-family: var(--blink-font-family);
                    width: var(--blink-widget-width, 370px);
                    height: 265px;
                    margin: 0 auto;
                    padding: 20px;
                    border-radius: 12px;
                    background-color: var(--blink-bg-color);
                    color: var(--blink-text-color);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--blink-border-color);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    min-width: 280px;
                    max-width: 100%;
                    line-height: normal;
                    text-align: left;
                    overflow: hidden;
                }
                
                /* Ensure widget never exceeds its container */
                .blink-pay-widget {
                    max-width: 100%;
                    width: min(var(--blink-widget-width, 370px), 100%);
                }
                
                .blink-pay-widget * {
                    box-sizing: border-box;
                }
                
                .blink-pay-widget input, 
                .blink-pay-widget select, 
                .blink-pay-widget button {
                    font-family: var(--blink-font-family);
                }
                
                /* Top third - Header */
                .blink-pay-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 32px; /* Top third */
                    margin-bottom: 15px;
                    width: 100%;
                    box-sizing: border-box;
                    margin-top: 0;
                    margin-left: 0;
                    margin-right: 0;
                    padding: 0;
                }
                .blink-pay-logo {
                    width: 100px;
                    height: 30.365px;
                    transition: transform 0.2s;
                }
                .blink-pay-logo:hover {
                    transform: scale(1.05);
                }
                .blink-pay-username {
                    font-size: 12px;
                    color: var(--blink-text-color);
                    opacity: 0.8;
                    text-align: right;
                }
                
                /* Middle third - Content */
                .blink-pay-content {
                    height: 140px; /* Middle third */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    width: 100%;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                .blink-pay-input-group {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    border: 1px solid var(--blink-border-color);
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: var(--blink-input-bg-color);
                    box-sizing: border-box;
                    margin: 0;
                    position: relative;
                    align-items: stretch;
                }
                .blink-pay-widget .blink-pay-input-group input,
                .blink-pay-input-group input[type="number"] {
                    flex: 1 1 auto;
                    padding: 10px 12px;
                    border: none;
                    background-color: var(--blink-input-bg-color);
                    color: var(--blink-text-color);
                    font-size: 16px;
                    font-family: var(--blink-font-family);
                    width: auto;
                    min-width: 120px;
                    height: auto;
                    line-height: normal;
                    box-sizing: border-box;
                    margin: 0;
                    outline: none;
                    border-radius: 0;
                    -webkit-appearance: none;
                    -moz-appearance: textfield;
                }
                
                .blink-pay-widget .blink-pay-input-group input:focus,
                .blink-pay-input-group input[type="number"]:focus {
                    outline: none;
                    box-shadow: none;
                }
                .blink-pay-widget .blink-pay-currency-select,
                .blink-pay-input-group .blink-pay-currency-select {
                    border: none;
                    background-color: var(--blink-secondary-bg-color);
                    color: var(--blink-text-color);
                    font-size: 16px;
                    font-weight: 500;
                    padding: 10px 12px;
                    cursor: pointer;
                    font-family: var(--blink-font-family);
                    min-width: 70px;
                    width: auto;
                    flex-shrink: 0;
                    height: auto;
                    line-height: normal;
                    box-sizing: border-box;
                    margin: 0;
                    border-radius: 0;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                
                .blink-pay-widget .blink-pay-currency-select:focus,
                .blink-pay-input-group .blink-pay-currency-select:focus {
                    outline: none;
                    box-shadow: none;
                }
                .blink-pay-qr {
                    display: none;
                    width: 100%;
                    height: 120px;
                    justify-content: center;
                    align-items: center;
                    padding-top: 5px;
                    margin-bottom: 25px;
                    box-sizing: border-box;
                    flex-direction: column;
                }
                
                .blink-pay-qr.blink-pay-show {
                    display: flex;
                }
                
                .blink-pay-qr img {
                    width: 110px;
                    height: 110px;
                    background-color: white;
                    border-radius: 8px;
                    padding: 5px;
                    box-sizing: border-box;
                }
                
                .blink-pay-success {
                    display: none;
                    width: 100%;
                    height: 120px;
                    justify-content: center;
                    align-items: flex-start;
                    padding-top: 5px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                }
                .blink-pay-success.blink-pay-show {
                    display: flex !important;
                }
                .blink-pay-success img {
                    width: 80px !important;
                    height: 80px !important;
                }
                
                /* Bottom third - Button & Footer */
                .blink-pay-footer {
                    height: 38px; /* Bottom third */
                    display: flex;
                    flex-direction: column;
                    margin-top: auto;
                }
                .blink-pay-widget .${this.buttonClass},
                .${this.buttonClass} {
                    width: 100%;
                    max-width: var(--blink-button-width, 310px);
                    padding: 10px 12px;
                    background: ${colors.gradient};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.2s;
                    font-family: var(--blink-font-family);
                    margin-bottom: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    height: 44px;
                    max-height: 44px;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    margin-top: 0;
                    margin-left: auto;
                    margin-right: auto;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                
                /* Additional responsive override classes for JavaScript control */
                .blink-pay-button.responsive-mobile {
                    max-width: 250px !important;
                    font-size: 12px !important;
                    padding: 8px 10px !important;
                    white-space: normal !important;
                    line-height: 1.3 !important;
                    min-height: 40px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
                
                .blink-pay-button.responsive-tablet {
                    max-width: 280px !important;
                    font-size: 13px !important;
                    white-space: normal !important;
                    line-height: 1.3 !important;
                    min-height: 38px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
                
                .blink-pay-button.responsive-desktop {
                    max-width: 310px !important;
                    font-size: 14px !important;
                    padding: 10px 12px !important;
                    white-space: nowrap !important;
                    line-height: 1.2 !important;
                }
                
                /* Responsive design for different screen sizes */
                @media (max-width: 768px) {
                    .blink-pay-widget .${this.buttonClass},
                    .${this.buttonClass} {
                        max-width: 280px !important;
                        font-size: 13px !important;
                        white-space: normal !important;
                        line-height: 1.3 !important;
                        min-height: 38px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .blink-pay-widget .${this.buttonClass},
                    .${this.buttonClass} {
                        max-width: 250px !important;
                        font-size: 12px !important;
                        padding: 8px 10px !important;
                        white-space: normal !important;
                        line-height: 1.3 !important;
                        min-height: 40px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                }
                
                /* Elementor container compatibility */
                .elementor-widget-container .blink-pay-widget .${this.buttonClass},
                .elementor-widget-container .${this.buttonClass} {
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                /* Allow custom width override via CSS custom properties */
                .blink-pay-widget[data-button-width] .${this.buttonClass},
                [data-button-width] .${this.buttonClass} {
                    max-width: var(--blink-button-width, 310px) !important;
                }
                
                /* Container-based responsive behavior */
                /* For containers smaller than 300px, use mobile-style button */
                .blink-pay-widget:has(.${this.buttonClass}) {
                    container-type: inline-size;
                }
                
                @container (max-width: 300px) {
                    .blink-pay-widget .${this.buttonClass} {
                        max-width: 250px !important;
                        font-size: 12px !important;
                        padding: 8px 10px !important;
                        white-space: normal !important;
                        line-height: 1.3 !important;
                        min-height: 40px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                }
                
                @container (max-width: 400px) {
                    .blink-pay-widget .${this.buttonClass} {
                        max-width: 280px !important;
                        font-size: 13px !important;
                        white-space: normal !important;
                        line-height: 1.3 !important;
                        min-height: 38px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                }
                .blink-pay-widget .${this.buttonClass}.success,
                .${this.buttonClass}.success {
                    background: #00a700 !important;
                }
                .blink-pay-widget .${this.buttonClass}:hover,
                .${this.buttonClass}:hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1px) !important;
                }
                .blink-pay-status {
                    padding: 8px;
                    border-radius: 8px;
                    display: none;
                    text-align: center;
                    font-weight: 500;
                    font-size: 14px;
                    min-height: 20px;
                }
                .blink-pay-status.success {
                    background-color: ${isDark ? '#2E7D32' : '#E8F5E9'};
                    color: ${isDark ? '#FFFFFF' : '#2E7D32'};
                    display: block;
                }
                .blink-pay-status.error {
                    background-color: ${isDark ? '#C62828' : '#FFEBEE'};
                    color: ${isDark ? '#FFFFFF' : '#C62828'};
                    display: block;
                }
                .blink-pay-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: blink-pay-spin 1s ease-in-out infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes blink-pay-spin {
                    to { transform: rotate(360deg); }
                }
                .blink-pay-hidden {
                    display: none;
                }
            `;
            
            // Generate currency options dynamically
            const currencyOptions = this.supportedCurrencies.map(currency => 
                `<option value="${currency.code.toLowerCase()}">${currency.name}</option>`
            ).join('');
            
            // Build analytics tracking URL for Blink logo
            const analyticsUrl = this.buildBlinkAnalyticsUrl();
            
            const html = `
                <div class="blink-pay-widget"${this.buttonWidth ? ` data-button-width="${this.buttonWidth}"` : ''}>
                    <!-- Top third -->
                    <div class="blink-pay-header">
                        <a href="${analyticsUrl}" target="_blank" rel="noopener noreferrer">
                            <img src="${logo}" alt="Blink" class="blink-pay-logo">
                        </a>
                        <div class="blink-pay-username">${this.username}</div>
                    </div>
                    
                    <!-- Middle third -->
                    <div class="blink-pay-content">
                        <div class="blink-pay-input-group">
                            <input type="number" id="blink-pay-amount" min="${this.minAmount}" value="${this.defaultAmount}" placeholder="Amount">
                            <select id="blink-pay-currency" class="blink-pay-currency-select">
                                ${currencyOptions}
                            </select>
                        </div>
                        
                        <div id="blink-pay-qr" class="blink-pay-qr"></div>
                        <div id="blink-pay-success" class="blink-pay-success">
                            <img src="${checkmarkSvg}" alt="Success">
                        </div>
                    </div>
                    
                    <!-- Bottom third -->
                    <div class="blink-pay-footer">
                        <button class="${this.buttonClass}" id="blink-pay-button">${this.buttonText}</button>
                        <div id="blink-pay-status" class="blink-pay-status"></div>
                    </div>
                </div>
            `;
            
            // Add styles to head
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
            
            // Set HTML content
            this.container.innerHTML = html;
            
            // Apply font sizing to the initial button text
            setTimeout(() => {
                const initialButton = document.getElementById('blink-pay-button');
                if (initialButton) {
                    this.adjustButtonFontSize(initialButton, this.buttonText);
                    this.adjustButtonResponsiveness(initialButton);
                    
                    // Set up resize observer for dynamic container size changes
                    this.setupResizeObserver(initialButton);
                }
            }, 10);
        },
        
        // Attach event listeners
        attachEventListeners: function() {
            const donateButton = document.getElementById('blink-pay-button');
            if (donateButton) {
                donateButton.addEventListener('click', this.handleDonate.bind(this));
            }
            
            const currencySelect = document.getElementById('blink-pay-currency');
            if (currencySelect) {
                currencySelect.addEventListener('change', this.handleCurrencyChange.bind(this));
            }
        },
        
        // Handle currency change
        handleCurrencyChange: async function(event) {
            this.selectedCurrency = event.target.value;
            this.log(`Currency changed to: ${this.selectedCurrency}`);
            
            // Find currency configuration
            const currency = this.supportedCurrencies.find(c => c.code.toLowerCase() === this.selectedCurrency);
            
            // Update amount input based on currency
            const amountInput = document.getElementById('blink-pay-amount');
            if (currency && currency.isCrypto) {
                // Crypto currency (sats) - integer values
                amountInput.min = this.minAmount;
                amountInput.step = 1;
                amountInput.value = this.defaultAmount;
                amountInput.placeholder = "Amount";
            } else {
                // Fiat currency - decimal values
                amountInput.min = 0.01;
                amountInput.step = 0.01;
                amountInput.value = 10;
                amountInput.placeholder = `Amount in ${currency ? currency.name : this.selectedCurrency.toUpperCase()}`;
                
                // Fetch exchange rate for fiat currencies
                if (!this.exchangeRates[this.selectedCurrency]) {
                    await this.fetchExchangeRate(this.selectedCurrency);
                }
            }
        },
        
        // Fetch exchange rate for a specific currency
        fetchExchangeRate: async function(currencyCode) {
            this.log(`Fetching exchange rate for ${currencyCode}`);
            
            try {
                const query = `
                    query realtimePrice($currency: DisplayCurrency!) {
                        realtimePrice(currency: $currency) {
                            btcSatPrice {
                                base
                                offset
                            }
                            usdCentPrice {
                                base
                                offset
                            }
                        }
                    }
                `;
                
                const variables = {
                    currency: currencyCode.toUpperCase()
                };
                
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`Exchange rate response for ${currencyCode}`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || `Error fetching exchange rate for ${currencyCode}`);
                }
                
                const btcSatPrice = data.data.realtimePrice.btcSatPrice;
                const usdCentPrice = data.data.realtimePrice.usdCentPrice;
                
                // Calculate rates based on API response
                // btcSatPrice: price of 1 sat in the queried currency  
                // usdCentPrice: price of 1 USD cent in the queried currency
                const satPriceInCurrency = btcSatPrice.base / Math.pow(10, btcSatPrice.offset);
                const usdCentPriceInCurrency = usdCentPrice.base / Math.pow(10, usdCentPrice.offset);
                
                // Cache both rates
                this.exchangeRates[currencyCode] = {
                    satPriceInCurrency: satPriceInCurrency,
                    usdCentPriceInCurrency: usdCentPriceInCurrency
                };
                
                this.log(`Exchange rates for ${currencyCode}:`, {
                    satPriceInCurrency: satPriceInCurrency,
                    usdCentPriceInCurrency: usdCentPriceInCurrency
                });
                
                return this.exchangeRates[currencyCode];
                
            } catch (error) {
                this.log(`Error fetching exchange rate for ${currencyCode}: ${error.message}`, error);
                console.error('Error fetching exchange rate:', error);
                this.showStatus('error', `${this.t('failedToFetchExchangeRate')} ${currencyCode}. ${this.t('pleaseTryAgain')}`);
                throw error;
            }
        },
        
        // Convert amount to satoshis
        convertToSatoshis: function(amount, fromCurrency) {
            if (fromCurrency === 'sats') {
                return amount; // Already in sats
            }
            
            // For fiat currencies, use cached exchange rate
            const exchangeRates = this.exchangeRates[fromCurrency];
            if (!exchangeRates || !exchangeRates.satPriceInCurrency) {
                throw new Error(`Exchange rate not available for ${fromCurrency.toUpperCase()}`);
            }
            
            // The API returns price of 1 sat in minor units of the currency
            // Convert major currency units to minor units, then to sats
            const amountInMinorUnits = amount * 100; // Convert to cents/minor units
            const satsAmount = Math.round(amountInMinorUnits / exchangeRates.satPriceInCurrency);
            this.log(`Converting ${amount} ${fromCurrency.toUpperCase()} to ${satsAmount} sats (1 sat = ${exchangeRates.satPriceInCurrency} ${fromCurrency.toUpperCase()} minor units)`);
            return satsAmount;
        },
        
        // Convert amount to USD cents
        convertToUsdCents: function(amount, fromCurrency) {
            if (fromCurrency === 'sats') {
                // For sats to USD cents, we need USD exchange rate
                const usdRates = this.exchangeRates['USD'];
                if (!usdRates || !usdRates.satPriceInCurrency) {
                    throw new Error('USD exchange rate not available');
                }
                
                // satPriceInCurrency is in USD minor units (cents) per sat
                // So sats * satPriceInCurrency gives us USD cents directly
                const usdCentsAmount = Math.round(amount * usdRates.satPriceInCurrency);
                this.log(`Converting ${amount} sats to ${usdCentsAmount} USD cents (1 sat = ${usdRates.satPriceInCurrency} USD cents)`);
                return usdCentsAmount;
            }
            
            // For fiat currencies, use cached exchange rate
            const exchangeRates = this.exchangeRates[fromCurrency];
            if (!exchangeRates || !exchangeRates.usdCentPriceInCurrency) {
                throw new Error(`Exchange rate not available for ${fromCurrency.toUpperCase()}`);
            }
            
            // Convert major currency units to minor units, then to USD cents
            const amountInMinorUnits = amount * 100; // Convert to cents/minor units
            const usdCentsAmount = Math.round(amountInMinorUnits / exchangeRates.usdCentPriceInCurrency);
            this.log(`Converting ${amount} ${fromCurrency.toUpperCase()} to ${usdCentsAmount} USD cents (1 USD cent = ${exchangeRates.usdCentPriceInCurrency} ${fromCurrency.toUpperCase()} minor units)`);
            return usdCentsAmount;
        },
        
        // Handle the donation process
        handleDonate: async function() {
            try {
                this.log('Donate button clicked');
                
                const amountInput = document.getElementById('blink-pay-amount');
                const amount = parseFloat(amountInput.value);
                
                if (isNaN(amount) || amount <= 0) {
                    this.showStatus('error', this.t('pleaseEnterValidAmount'));
                    return;
                }
                
                // Validate amount
                if (this.selectedCurrency === 'sats') {
                    if (amount < this.minAmount) {
                        this.showStatus('error', `${this.t('amountMustBeAtLeast')} ${this.minAmount} sats`);
                        return;
                    }
                } else {
                    if (amount < 0.01) {
                        this.showStatus('error', `${this.t('amountMustBeAtLeast')} 0.01 ${this.selectedCurrency.toUpperCase()}`);
                        return;
                    }
                    
                    // Ensure we have exchange rates for the selected currency
                    let exchangeRates = this.exchangeRates[this.selectedCurrency];
                    if (!exchangeRates) {
                        try {
                            await this.fetchExchangeRate(this.selectedCurrency);
                            exchangeRates = this.exchangeRates[this.selectedCurrency];
                        } catch (error) {
                            // Error UI already shown in fetchExchangeRate. This is a
                            // failed donation attempt (not input validation), so notify
                            // the embedder before bailing out.
                            this.fireCallback('onError', { error, message: error.message });
                            return;
                        }
                    }
                }
                
                // Stash the donation context for embedder callbacks. The selected
                // currency/amount are not otherwise in scope at settlement time.
                this.lastDonation = { amount, currency: this.selectedCurrency };

                // Clear any previous status messages and start loading
                this.showStatus('', '');
                this.setButtonLoading(true);
                
                try {
                    this.log(`Processing donation: ${amount} ${this.selectedCurrency}`);
                    
                    // Step 1: Get wallet information (custodial-first).
                    this.log('About to call getAccountDefaultWallet');
                    if (typeof this.getAccountDefaultWallet !== 'function') {
                        throw new Error('getAccountDefaultWallet is not a function - this context may be lost');
                    }
                    const walletInfo = await this.getAccountDefaultWallet(this.username);

                    // SELF-CUSTODIAL (Spark) FALLBACK:
                    // A self-custodial Blink (Spark) user has no custodial wallet, so
                    // accountDefaultWallet returns no id. Fall back to the Lightning
                    // address (LNURL-pay) path: invoice directly on `username@blink.sv`
                    // and detect settlement via LUD-21 verify. Funds land in the user's
                    // current default account (handled server-side by the LNURL server).
                    if (!walletInfo || !walletInfo.id) {
                        this.log('No custodial wallet; trying self-custodial (Spark) LN-address path');
                        await this.handleSelfCustodialDonate(amount);
                        return;
                    }
                    this.log(`Retrieved wallet info:`, walletInfo);
                    
                    // Step 2: Convert amount to the correct unit based on wallet currency
                    let convertedAmount;
                    if (walletInfo.currency === 'BTC') {
                        // Convert to satoshis for BTC wallets
                        convertedAmount = this.convertToSatoshis(amount, this.selectedCurrency);
                        this.log(`Converted to ${convertedAmount} satoshis for BTC wallet`);
                    } else if (walletInfo.currency === 'USD') {
                        // Convert to USD cents for USD wallets
                        // First ensure we have USD rates if converting from sats
                        if (this.selectedCurrency === 'sats' && !this.exchangeRates['USD']) {
                            await this.fetchExchangeRate('USD');
                        }
                        convertedAmount = this.convertToUsdCents(amount, this.selectedCurrency);
                        this.log(`Converted to ${convertedAmount} USD cents for USD wallet`);
                    } else {
                        throw new Error(`Unsupported wallet currency: ${walletInfo.currency}`);
                    }
                    
                    // Step 3: Create invoice using appropriate currency
                    this.log('About to call createInvoice');
                    if (typeof this.createInvoice !== 'function') {
                        throw new Error('createInvoice is not a function - this context may be lost');
                    }
                    const invoiceResult = await this.createInvoice(walletInfo.id, convertedAmount, walletInfo.currency);
                    if (!invoiceResult || !invoiceResult.paymentRequest) {
                        throw new Error('Could not create invoice');
                    }
                    this.log(`Created invoice`, { paymentRequest: invoiceResult.paymentRequest.substring(0, 30) + '...', expiryMinutes: invoiceResult.expiryMinutes });
                    
                    // Step 3: Show QR code and set up payment monitoring
                    this.displayInvoice(invoiceResult.paymentRequest, invoiceResult.expiryMinutes);
                    this.subscribeToPaymentStatus(invoiceResult.paymentRequest);
                    
                } catch (error) {
                    this.log(`Error in donation process: ${error.message}`, error);
                    console.error('Blink Pay Button Error:', error);
                    this.showStatus('error', error.message || this.t('anErrorOccurred'));
                    this.setButtonLoading(false);
                    this.fireCallback('onError', { error, message: error.message });
                }
            } catch (topLevelError) {
                console.error('Top-level error in handleDonate:', topLevelError);
                console.error('Error stack:', topLevelError.stack);
                console.error('Widget context:', this);
                this.showStatus('error', `Debug error: ${topLevelError.message}`);
                this.setButtonLoading(false);
                this.fireCallback('onError', { error: topLevelError, message: topLevelError.message });
            }
        },
        
        // Resolve the BlinkLnurl helper module. When the widget is embedded as a
        // single <script> (the common case), js/blink-lnurl.js is not separately
        // loaded, so we fall back to an inline, behaviour-identical copy of the
        // few helpers we need. The canonical, unit-tested implementation lives in
        // js/blink-lnurl.js (see tests/).
        getLnurl: function() {
            if (typeof window !== 'undefined' && window.BlinkLnurl) {
                return window.BlinkLnurl;
            }
            if (this._inlineLnurl) return this._inlineLnurl;

            const ALLOWED_BLINK_DOMAINS = ['blink.sv'];
            const self = this;
            const inline = {
                ALLOWED_BLINK_DOMAINS: ALLOWED_BLINK_DOMAINS,
                isBlinkLightningAddress: function(address) {
                    if (!address || typeof address !== 'string') return false;
                    const domain = address.includes('@') ? address.split('@')[1] : address;
                    return ALLOWED_BLINK_DOMAINS.includes((domain || '').trim().toLowerCase());
                },
                normalizeBlinkLightningAddress: function(input) {
                    if (!input || typeof input !== 'string') throw new Error('Username is required');
                    let value = input.trim();
                    if (value.toLowerCase().startsWith('lightning:')) {
                        value = value.slice('lightning:'.length).trim();
                    }
                    if (value.includes('@')) {
                        const parts = value.split('@');
                        if (parts.length !== 2 || !parts[0] || !parts[1]) {
                            throw new Error('Invalid Lightning address format: ' + input);
                        }
                        const domain = parts[1].toLowerCase();
                        if (!ALLOWED_BLINK_DOMAINS.includes(domain)) {
                            throw new Error("'" + input + "' is not a Blink address. Only " + ALLOWED_BLINK_DOMAINS[0] + ' addresses are supported.');
                        }
                        return parts[0] + '@' + domain;
                    }
                    return value + '@' + ALLOWED_BLINK_DOMAINS[0];
                },
                getInvoiceFromLightningAddress: async function(lightningAddress, amountSats, memo) {
                    if (!inline.isBlinkLightningAddress(lightningAddress)) {
                        throw new Error("'" + lightningAddress + "' is not a Blink address.");
                    }
                    const parts = lightningAddress.split('@');
                    const lnurlEndpoint = 'https://' + parts[1].toLowerCase() + '/.well-known/lnurlp/' + parts[0];
                    const metaResp = await fetch(lnurlEndpoint, { headers: { Accept: 'application/json' } });
                    if (!metaResp.ok) throw new Error('LNURL endpoint returned ' + metaResp.status);
                    const meta = await metaResp.json();
                    if (meta.tag !== 'payRequest' || !meta.callback) throw new Error('Invalid LNURL pay response');
                    if (typeof meta.minSendable !== 'number' || typeof meta.maxSendable !== 'number') {
                        throw new Error('LNURL response missing min/max sendable amounts');
                    }
                    const amountMsats = Math.round(amountSats) * 1000;
                    if (amountMsats < meta.minSendable) {
                        throw new Error('Amount ' + amountSats + ' sats is below minimum ' + Math.ceil(meta.minSendable / 1000) + ' sats');
                    }
                    if (amountMsats > meta.maxSendable) {
                        throw new Error('Amount ' + amountSats + ' sats exceeds maximum ' + Math.floor(meta.maxSendable / 1000) + ' sats');
                    }
                    let comment = memo || '';
                    const commentAllowed = meta.commentAllowed || 0;
                    if (commentAllowed > 0 && comment.length > commentAllowed) comment = comment.substring(0, commentAllowed);
                    else if (commentAllowed === 0) comment = '';
                    const url = new URL(meta.callback);
                    url.searchParams.set('amount', String(amountMsats));
                    if (comment) url.searchParams.set('comment', comment);
                    const cbResp = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
                    if (!cbResp.ok) throw new Error('LNURL callback returned ' + cbResp.status);
                    const cb = await cbResp.json();
                    if (cb.status === 'ERROR') throw new Error('LNURL error: ' + (cb.reason || 'Unknown error'));
                    if (!cb.pr) throw new Error('LNURL callback did not return a payment request');
                    return { paymentRequest: cb.pr, verifyUrl: cb.verify };
                },
                verifyLnurlPayment: async function(verifyUrl) {
                    const resp = await fetch(verifyUrl, { headers: { Accept: 'application/json' } });
                    if (!resp.ok) throw new Error('LNURL verify returned ' + resp.status);
                    const data = await resp.json();
                    if (data.status === 'ERROR') throw new Error('LNURL verify error: ' + (data.reason || 'Unknown error'));
                    return { settled: data.settled === true, preimage: data.preimage == null ? undefined : data.preimage, pr: data.pr };
                },
            };
            void self;
            this._inlineLnurl = inline;
            return inline;
        },

        // Self-custodial (Spark) donation path: invoice on the merchant's Blink
        // Lightning address via LNURL-pay, then detect settlement via LUD-21
        // verify polling. Always denominated in sats (Spark is BTC-only).
        handleSelfCustodialDonate: async function(amount) {
            const lnurl = this.getLnurl();

            // Build the bare blink.sv Lightning address (rejects non-Blink domains).
            // Bare address => funds land in the user's current default account
            // (server-side default-wallet routing).
            const lightningAddress = lnurl.normalizeBlinkLightningAddress(this.username);

            // Spark/Blink receive in sats; convert the selected display currency.
            const satsAmount = this.convertToSatoshis(amount, this.selectedCurrency);
            this.log('Self-custodial: requesting LN-address invoice', { lightningAddress, satsAmount });

            const memo = `${this.username} donation button`;
            let invoice;
            try {
                invoice = await lnurl.getInvoiceFromLightningAddress(
                    lightningAddress,
                    satsAmount,
                    memo
                );
            } catch (error) {
                // Custodial lookup already found no wallet; if the LNURL
                // .well-known lookup also 404s, the username simply does not
                // exist on blink.sv. Surface a clear donor-facing message instead
                // of the raw "LNURL endpoint returned 404" technical error.
                if (this.isUsernameNotFoundError(error)) {
                    throw new Error(this.t('usernameNotFound'));
                }
                throw error;
            }
            if (!invoice || !invoice.paymentRequest) {
                throw new Error('Could not create invoice');
            }
            this.log('Self-custodial invoice created (direct, no escrow)', {
                paymentRequest: invoice.paymentRequest.substring(0, 30) + '...',
                hasVerify: Boolean(invoice.verifyUrl),
            });

            // LN-address invoices default to a 15-minute expiry on the Blink LNURL server.
            const expiryMinutes = 15;
            this.displayInvoice(invoice.paymentRequest, expiryMinutes);

            if (invoice.verifyUrl) {
                this.pollVerifyStatus(invoice.verifyUrl);
            } else {
                // No verify URL advertised: fall back to the Blink GraphQL poll,
                // which still works for invoices the Blink backend can observe.
                this.log('No LUD-21 verify URL; falling back to GraphQL payment polling');
                this.pollPaymentStatus(invoice.paymentRequest);
            }
        },

        // Classify an LNURL error as "username does not exist": the .well-known
        // lookup for an unknown user returns HTTP 404. Used to show a friendly
        // donor-facing message instead of the raw LNURL technical error.
        isUsernameNotFoundError: function(error) {
            const message = (error && error.message) || '';
            return /\b404\b/.test(message) || /not found/i.test(message);
        },

        // Poll a LUD-21 verify URL until the invoice is settled (Spark path).
        // Bounded in practice by the invoice expiry countdown shown to the donor.
        pollVerifyStatus: function(verifyUrl) {
            const lnurl = this.getLnurl();
            this.log('Starting LUD-21 verify polling');
            // Capture this loop's generation; starting a new poll supersedes any
            // previous in-flight loop.
            const myGen = this.nextPollGeneration();
            const check = async () => {
                this.paymentPollTimeout = null;
                // Stop once the invoice has expired (bounded by displayInvoice's
                // deadline) so we don't poll forever when the donor never pays.
                if (this.isInvoiceExpired()) {
                    this.log('Invoice expired; stopping LUD-21 verify polling');
                    return;
                }
                try {
                    const result = await lnurl.verifyLnurlPayment(verifyUrl);
                    // The request may have resolved after a stop/reset or a newer
                    // poll started; if so, do not act or reschedule.
                    if (this.pollGeneration !== myGen) {
                        this.log('LUD-21 verify poll superseded; stopping');
                        return;
                    }
                    if (result && result.settled === true) {
                        this.log('Payment confirmed via LUD-21 verify! 🎉');
                        this.handlePaymentSuccess();
                        return; // stop polling
                    }
                    this.paymentPollTimeout = setTimeout(check, 2000);
                } catch (error) {
                    this.log(`Error polling verify status: ${error.message}`, error);
                    if (this.pollGeneration !== myGen) return; // superseded
                    this.paymentPollTimeout = setTimeout(check, 5000); // back off on error
                }
            };
            check();
        },

        // True once the current invoice's polling deadline has passed. Returns
        // false when no invoice deadline is set (defensive: never stop early).
        isInvoiceExpired: function() {
            return typeof this.invoiceExpiresAt === 'number' && Date.now() >= this.invoiceExpiresAt;
        },

        // Begin a new payment-poll "generation" and return its token. Each poll
        // loop captures this; a loop only schedules its next tick while its token
        // is still current. Starting a new poll or stopping bumps the counter,
        // which immediately invalidates (cancels) any other in-flight loop.
        //
        // This is the authoritative cancellation mechanism: clearTimeout alone is
        // racy because a poll request resolving mid-flight re-arms the timer after
        // stopPaymentPolling() has already run (the timeout was null at that point).
        nextPollGeneration: function() {
            this.pollGeneration = (this.pollGeneration || 0) + 1;
            return this.pollGeneration;
        },

        // Stop any in-flight payment-status poll and clear the invoice deadline.
        // Bumping the generation cancels a loop even if its request is already
        // awaiting (it will see a stale token after the await and not reschedule).
        stopPaymentPolling: function() {
            this.nextPollGeneration();
            if (this.paymentPollTimeout) {
                clearTimeout(this.paymentPollTimeout);
                this.paymentPollTimeout = null;
            }
            this.invoiceExpiresAt = null;
        },

        // Get the default wallet information for a username
        getAccountDefaultWallet: async function(username) {
            const query = `
                query Query($username: Username!) {
                    accountDefaultWallet(username: $username) {
                        id
                        currency
                    }
                }
            `;
            
            const variables = {
                username: username
            };
            
            try {
                this.log(`Fetching from API: accountDefaultWallet`, { variables });
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`API response for accountDefaultWallet`, data);
                
                // A self-custodial (Spark) username has no custodial wallet, so the
                // API returns an error (or a null wallet) here. Treat that as "no
                // custodial wallet" and return { id: null } so the caller falls back
                // to the self-custodial Lightning-address (LNURL-pay) path instead of
                // failing the donation.
                if (data.errors || !data.data || !data.data.accountDefaultWallet?.id) {
                    this.log('No custodial default wallet for username (likely self-custodial/Spark)');
                    return { id: null, currency: null };
                }
                
                return {
                    id: data.data.accountDefaultWallet.id,
                    currency: data.data.accountDefaultWallet.currency
                };
                
            } catch (error) {
                // Network/transport error. Return no-wallet so the self-custodial
                // fallback can still attempt the LNURL path.
                this.log(`API error for accountDefaultWallet: ${error.message}`, error);
                console.error('Error getting wallet information:', error);
                return { id: null, currency: null };
            }
        },
        
        // Create a lightning invoice
        createInvoice: async function(walletId, amount, currency) {
            let mutation, mutationName, variables, expiryMinutes;
            
            if (currency === 'BTC') {
                // Use BTC mutation - 15 minutes expiry
                expiryMinutes = 15;
                mutation = `
                mutation Mutation($input: LnInvoiceCreateOnBehalfOfRecipientInput!) {
                    lnInvoiceCreateOnBehalfOfRecipient(input: $input) {
                        invoice {
                            paymentRequest
                                satoshis
                        }
                    }
                }
            `;
            
                variables = {
                input: {
                    recipientWalletId: walletId,
                    amount: amount.toString(),
                    memo: `${this.username} donation button`,
                    expiresIn: "15"
                }
            };
            
                mutationName = 'lnInvoiceCreateOnBehalfOfRecipient';
            } else if (currency === 'USD') {
                // Use USD mutation - 5 minutes expiry
                expiryMinutes = 5;
                mutation = `
                    mutation LnUsdInvoiceCreateOnBehalfOfRecipient($input: LnUsdInvoiceCreateOnBehalfOfRecipientInput!) {
                        lnUsdInvoiceCreateOnBehalfOfRecipient(input: $input) {
                            invoice {
                                paymentRequest
                                satoshis
                            }
                        }
                    }
                `;
                
                variables = {
                    input: {
                        amount: amount.toString(),
                        recipientWalletId: walletId,
                        memo: `${this.username} donation button`,
                        expiresIn: "5"
                    }
                };
                
                mutationName = 'lnUsdInvoiceCreateOnBehalfOfRecipient';
            } else {
                throw new Error(`Unsupported currency: ${currency}`);
            }
            
            try {
                this.log(`Fetching from API: ${mutationName}`, { variables });
                const response = await fetch('https://api.blink.sv/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: mutation,
                        variables
                    })
                });
                
                const data = await response.json();
                this.log(`API response for ${mutationName}`, data);
                
                if (data.errors) {
                    throw new Error(data.errors[0].message || 'Error creating invoice');
                }
                
                return {
                    paymentRequest: data.data[mutationName].invoice.paymentRequest,
                    expiryMinutes: expiryMinutes
                };
                
            } catch (error) {
                this.log(`API error for ${mutationName}: ${error.message}`, error);
                console.error('Error creating invoice:', error);
                throw error;
            }
        },
        
        // Display the invoice and QR code
        displayInvoice: function(paymentRequest, expiryMinutes) {
            // Stash for embedder callbacks (onSuccess/onTimeout payloads).
            this.currentPaymentRequest = paymentRequest;
            // Reset the per-invoice guards so onTimeout/onSuccess can each fire once
            // for this invoice (and again for a subsequent donation in the session).
            this.timeoutFired = false;
            this.successFired = false;

            const qrContainer = document.getElementById('blink-pay-qr');
            const successContainer = document.getElementById('blink-pay-success');
            const amountInput = document.getElementById('blink-pay-amount');
            
            // Hide success container if visible
            successContainer.classList.remove('blink-pay-show');
            successContainer.style.visibility = 'hidden';
            
            // Hide input field more robustly
            const inputGroup = amountInput.parentElement;
            inputGroup.style.display = 'none';
            inputGroup.style.visibility = 'hidden';
            inputGroup.style.opacity = '0';
            inputGroup.style.height = '0';
            inputGroup.style.overflow = 'hidden';
            
            // Create countdown timer
            const countdownElement = document.createElement('div');
            countdownElement.id = 'blink-pay-countdown';
            countdownElement.style.cssText = `
                text-align: center !important;
                font-size: 11px !important;
                font-family: 'IBM Plex Sans', sans-serif !important;
                color: #666666 !important;
                margin-bottom: 5px !important;
                font-weight: 400 !important;
                opacity: 0.8 !important;
                line-height: 1.2 !important;
                flex-shrink: 0 !important;
            `;
            
            // Initialize countdown
            let totalSeconds = expiryMinutes * 60;
            let countdownInterval;

            // Record an absolute deadline so the payment-status pollers can stop
            // themselves once the invoice has expired (a small grace period lets a
            // payment landing right at expiry still be detected). Without this the
            // pollers would hammer the API forever on a long-lived embed where the
            // donor never pays. See pollVerifyStatus / pollPaymentStatus.
            const POLL_GRACE_MS = 5000;
            this.invoiceExpiresAt = Date.now() + totalSeconds * 1000 + POLL_GRACE_MS;
            
            const updateCountdown = () => {
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                countdownElement.textContent = formattedTime;
                
                if (totalSeconds <= 0) {
                    clearInterval(countdownInterval);
                    countdownElement.style.color = '#c62828 !important';
                    countdownElement.textContent = '0:00';
                    this.log('Invoice expired');
                    // Notify the embedder once that the invoice timed out unpaid.
                    if (!this.timeoutFired) {
                        this.timeoutFired = true;
                        this.fireCallback('onTimeout', { paymentRequest: this.currentPaymentRequest });
                    }
                } else {
                    totalSeconds--;
                }
            };
            
            // Start countdown
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
            
            // Store interval for cleanup
            this.countdownInterval = countdownInterval;
            
            // Shared copy-to-clipboard handler used by both the QR image and the
            // text fallback's Copy button, so the donor can always copy the invoice.
            const copyPaymentRequest = () => {
                navigator.clipboard.writeText(paymentRequest).then(() => {
                    this.showStatus('success', this.t('invoiceCopied'));
                    this.showQrNotification(this.t('invoiceCopied'));
                    setTimeout(() => {
                        this.showStatus('', '');
                    }, 2000);
                }).catch(err => {
                    console.error('Could not copy invoice: ', err);
                    this.showStatus('error', this.t('failedToCopy'));
                    this.showQrNotification(this.t('failedToCopy'), true);
                    setTimeout(() => {
                        this.showStatus('', '');
                    }, 3000);
                });
            };

            // Generate the QR code locally (no third-party request). If generation
            // fails (buildQrDataUrl returns null), fall back to a visible error plus
            // the invoice as selectable text and a Copy button, so the donor can
            // still pay without a scannable QR.
            this.log('Generating QR code client-side');
            const qrDataUrl = this.buildQrDataUrl(paymentRequest);

            qrContainer.innerHTML = '';
            qrContainer.appendChild(countdownElement);

            if (qrDataUrl) {
                const qrImage = document.createElement('img');
                qrImage.src = qrDataUrl;
                qrImage.alt = this.t('qrCodeAlt');

                // Add click-to-copy functionality to QR code
                qrImage.style.cursor = 'pointer';
                qrImage.style.transition = 'opacity 0.2s ease';
                qrImage.title = 'Click to copy payment request';

                qrImage.addEventListener('click', () => {
                    // Visual feedback on click
                    qrImage.style.opacity = '0.7';
                    setTimeout(() => {
                        qrImage.style.opacity = '1';
                    }, 200);
                    copyPaymentRequest();
                });

                qrContainer.appendChild(qrImage);
            } else {
                // QR generation failed — render a usable text fallback.
                this.log('QR generation failed; rendering text fallback');
                const fallback = document.createElement('div');
                fallback.id = 'blink-pay-qr-fallback';
                fallback.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:8px; max-width:100%;';

                const errorLine = document.createElement('div');
                errorLine.textContent = this.t('anErrorOccurred');
                errorLine.style.cssText = 'color:#c62828; font-size:12px; text-align:center;';

                // The invoice as selectable text so it can be copied manually even
                // if the clipboard API is unavailable.
                const invoiceText = document.createElement('textarea');
                invoiceText.readOnly = true;
                invoiceText.value = paymentRequest;
                invoiceText.setAttribute('aria-label', this.t('qrCodeAlt'));
                invoiceText.style.cssText = 'width:200px; max-width:100%; height:64px; font-size:10px; word-break:break-all; user-select:all; resize:none; padding:6px; box-sizing:border-box;';

                const copyButton = document.createElement('button');
                copyButton.type = 'button';
                copyButton.textContent = this.t('copyInvoice');
                copyButton.style.cssText = 'cursor:pointer; padding:6px 12px; font-size:12px;';
                copyButton.addEventListener('click', () => {
                    invoiceText.select();
                    copyPaymentRequest();
                });

                fallback.appendChild(errorLine);
                fallback.appendChild(invoiceText);
                fallback.appendChild(copyButton);
                qrContainer.appendChild(fallback);
            }

            qrContainer.classList.add('blink-pay-show');
            qrContainer.style.visibility = 'visible';
            qrContainer.style.opacity = '1';
            
            // Update the button for lightning deeplink functionality
            const donateButton = document.getElementById('blink-pay-button');
            this.updateButtonText(donateButton, this.t('payInWallet'));
            
            // Remove all existing event listeners by cloning and replacing the button
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener for opening lightning deeplink
            newButton.addEventListener('click', async () => {
                const lightningUrl = `lightning:${paymentRequest}`;
                
                // Check if WebLN is available (desktop browser extensions like Alby)
                if (typeof window.webln !== 'undefined') {
                    try {
                        // Enable WebLN if not already enabled
                        if (!window.webln.enabled) {
                            await window.webln.enable();
                        }
                        
                        // Use WebLN to send payment
                        this.log(`Using WebLN to send payment`);
                        await window.webln.sendPayment(paymentRequest);
                        this.log(`WebLN payment request sent successfully`);
                        
                        // Show feedback that payment was initiated
                        this.showStatus('success', 'Payment request sent to wallet');
                        setTimeout(() => {
                            this.showStatus('', '');
                        }, 3000);
                        
                        return; // Exit early if WebLN worked
                    } catch (weblnError) {
                        console.error('WebLN payment failed: ', weblnError);
                        this.log(`WebLN error: ${weblnError.message}`);
                        // Fall through to other methods
                    }
                }
                
                // Detect mobile devices for lightning: URL scheme
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                if (isMobile) {
                    try {
                        // Use lightning: URL scheme on mobile
                        window.open(lightningUrl, '_self');
                        this.log(`Opened lightning deeplink on mobile: ${lightningUrl.substring(0, 30)}...`);
                        return;
                    } catch (err) {
                        console.error('Could not open lightning deeplink on mobile: ', err);
                        // Fall through to clipboard fallback
                    }
                }
                
                // Fallback: copy to clipboard if WebLN and mobile deeplinks both fail
                try {
                    await navigator.clipboard.writeText(paymentRequest);
                    this.showStatus('success', this.t('invoiceCopied'));
                    this.log(`Fallback: Copied payment request to clipboard`);
                    
                    // Auto-hide the status message after 2 seconds
                    setTimeout(() => {
                        this.showStatus('', '');
                    }, 2000);
                } catch (copyErr) {
                    console.error('Could not copy invoice as fallback: ', copyErr);
                    this.showStatus('error', this.t('failedToCopy'));
                    
                    // Auto-hide error after 3 seconds
                    setTimeout(() => {
                        this.showStatus('', '');
                    }, 3000);
                }
            });
            
            this.setButtonLoading(false);
        },
        // Subscribe to payment status updates
        subscribeToPaymentStatus: function(paymentRequest) {
            // WebSocket-based approach for real-time payment status updates
            this.log(`Attempting to connect to WebSocket at wss://ws.blink.sv/graphql`);
            const wsClient = new WebSocket('wss://ws.blink.sv/graphql', 'graphql-transport-ws');
            
            // Connection initialization message
            const initMessage = {
                type: 'connection_init',
                payload: {}
            };
            
            // Message to send when connection is established
            const subscriptionMsg = {
                id: '1',
                type: 'subscribe',
                payload: {
                    query: `
                        subscription LnInvoicePaymentStatusByPaymentRequest($input: LnInvoicePaymentStatusByPaymentRequestInput!) {
                            lnInvoicePaymentStatusByPaymentRequest(input: $input) {
                                paymentRequest
                                status
                            }
                        }
                    `,
                    variables: {
                        input: {
                            paymentRequest: paymentRequest
                        }
                    }
                }
            };
            
            // Initialize WebSocket connection
            wsClient.onopen = () => {
                this.log(`WebSocket connection opened`, { readyState: wsClient.readyState });
                
                // First send the connection initialization message
                this.log(`Sending connection initialization message`, initMessage);
                wsClient.send(JSON.stringify(initMessage));
                
                // Then send the subscription after a short delay
                setTimeout(() => {
                    this.log(`Sending subscription message`, subscriptionMsg);
                    wsClient.send(JSON.stringify(subscriptionMsg));
                }, 500);
            };
            
            // Handle WebSocket messages
            wsClient.onmessage = (event) => {
                try {
                    this.log(`Received WebSocket message:`, event.data);
                    const data = JSON.parse(event.data);
                    
                    // Check for connection acknowledgment
                    if (data.type === 'connection_ack') {
                        this.log(`Connection acknowledged, subscription ready`);
                    }
                    
                    // Check for subscription response
                    if (data.type === 'data' && data.payload && data.payload.data) {
                        const paymentStatus = data.payload.data.lnInvoicePaymentStatusByPaymentRequest;
                        this.log(`Received payment status update`, paymentStatus);
                        
                        if (paymentStatus && paymentStatus.status === 'PAID') {
                            this.log(`Payment confirmed via WebSocket! 🎉`);
                            this.handlePaymentSuccess();
                            wsClient.close();
                        }
                    }
                } catch (error) {
                    this.log(`Error processing WebSocket message: ${error.message}`, error);
                    console.error('Error processing WebSocket message:', error);
                }
            };
            
            // Handle WebSocket errors
            wsClient.onerror = (error) => {
                this.log(`WebSocket error`, error);
                console.error('WebSocket error:', error);
                
                // Fall back to polling as backup if WebSocket fails
                this.log(`Falling back to polling due to WebSocket error`);
                this.pollPaymentStatus(paymentRequest);
            };
            
            // Handle WebSocket closure
            wsClient.onclose = (event) => {
                this.log(`WebSocket connection closed`, { code: event.code, reason: event.reason });
                console.log('WebSocket connection closed');
            };
            
            // Add a timeout to fall back to polling if no updates received
            setTimeout(() => {
                if (wsClient.readyState === WebSocket.OPEN) {
                    this.log(`No WebSocket updates received after timeout, falling back to polling`);
                    this.pollPaymentStatus(paymentRequest);
                }
            }, 10000);
        },
        
        // Polling fallback for payment status
        pollPaymentStatus: function(paymentRequest) {
            this.log(`Starting payment status polling for invoice`);
            // Capture this loop's generation; starting a new poll supersedes any
            // previous in-flight loop.
            const myGen = this.nextPollGeneration();
            const checkPaymentStatus = async () => {
                this.paymentPollTimeout = null;
                // Stop once the invoice has expired so we don't poll forever.
                if (this.isInvoiceExpired()) {
                    this.log('Invoice expired; stopping payment status polling');
                    return;
                }
                try {
                    const query = `
                        query CheckPaymentStatus($input: LnInvoicePaymentStatusInput!) {
                            lnInvoicePaymentStatus(input: $input) {
                                status
                            }
                        }
                    `;
                    
                    const variables = {
                        input: {
                            paymentRequest: paymentRequest
                        }
                    };
                    
                    this.log(`Polling API for payment status`);
                    const response = await fetch('https://api.blink.sv/graphql', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            query,
                            variables
                        })
                    });
                    
                    const data = await response.json();
                    this.log(`Poll response received`, data);

                    // The request may have resolved after a stop/reset or a newer
                    // poll started; if so, do not act or reschedule.
                    if (this.pollGeneration !== myGen) {
                        this.log('Payment status poll superseded; stopping');
                        return;
                    }

                    if (data.data && data.data.lnInvoicePaymentStatus) {
                        const status = data.data.lnInvoicePaymentStatus.status;
                        this.log(`Payment status: ${status}`);
                        
                        if (status === 'PAID') {
                            this.log(`Payment confirmed via polling! 🎉`);
                            this.handlePaymentSuccess();
                            return; // Stop polling
                        }
                    }
                    
                    // Continue polling if not yet paid
                    this.log(`Payment not confirmed yet, polling again in 2 seconds`);
                    this.paymentPollTimeout = setTimeout(checkPaymentStatus, 2000);
                    
                } catch (error) {
                    this.log(`Error polling for payment status: ${error.message}`, error);
                    console.error('Error checking payment status:', error);
                    if (this.pollGeneration !== myGen) return; // superseded
                    this.paymentPollTimeout = setTimeout(checkPaymentStatus, 5000); // Retry with longer interval on error
                }
            };
            
            // Start polling
            checkPaymentStatus();
        },
        
        // Handle successful payment
        handlePaymentSuccess: function() {
            this.log(`Handling successful payment`);
            
            // Clean up countdown interval
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.log('Countdown timer cleared');
            }

            // Stop any in-flight payment-status polling.
            this.stopPaymentPolling();
            
            // Show success icon
            const successContainer = document.getElementById('blink-pay-success');
            const qrContainer = document.getElementById('blink-pay-qr');
            const amountInput = document.getElementById('blink-pay-amount');
            
            // Hide QR code completely
            qrContainer.classList.remove('blink-pay-show');
            qrContainer.style.visibility = 'hidden';
            qrContainer.style.opacity = '0';
            
            // Hide amount input completely
            const inputGroup = amountInput.parentElement;
            inputGroup.style.display = 'none';
            inputGroup.style.visibility = 'hidden';
            inputGroup.style.opacity = '0';
            inputGroup.style.height = '0';
            inputGroup.style.overflow = 'hidden';
            
            // Show success icon
            successContainer.classList.add('blink-pay-show');
            successContainer.style.visibility = 'visible';
            successContainer.style.opacity = '1';
            
            // Reset the donation form
            const donateButton = document.getElementById('blink-pay-button');
            
            // Update button text and style
            this.updateButtonText(donateButton, this.t('paymentSuccessful'));
            donateButton.classList.add('success');
            
            // Clear status as the message is now in the button
            this.showStatus('', '');
            
            // Remove all event listeners
            const newButton = donateButton.cloneNode(true);
            donateButton.parentNode.replaceChild(newButton, donateButton);
            
            // Add new event listener to reset the widget
            newButton.addEventListener('click', () => {
                // Stop any stale polling/countdown from the completed invoice.
                this.stopPaymentPolling();
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
                // Reset the widget back to initial state
                successContainer.classList.remove('blink-pay-show');
                successContainer.style.visibility = 'hidden';
                successContainer.style.opacity = '0';
                this.updateButtonText(newButton, this.t('buttonText'));
                newButton.classList.remove('success');
                
                // Show input field again
                const inputGroup = amountInput.parentElement;
                inputGroup.style.display = 'flex';
                inputGroup.style.visibility = 'visible';
                inputGroup.style.opacity = '1';
                inputGroup.style.height = 'auto';
                inputGroup.style.overflow = 'visible';
                
                // Remove all event listeners again
                const resetButton = newButton.cloneNode(true);
                newButton.parentNode.replaceChild(resetButton, newButton);
                
                // Add the donate event listener back
                resetButton.addEventListener('click', this.handleDonate.bind(this));
                
                // Clear the status
                this.showStatus('', '');
            });

            // Notify the embedder of the successful donation. Guarded so the three
            // settlement detectors (WebSocket / LUD-21 verify / GraphQL poll) can't
            // double-fire if more than one observes the same payment.
            if (!this.successFired) {
                this.successFired = true;
                const donation = this.lastDonation || {};
                this.fireCallback('onSuccess', {
                    username: this.username,
                    amount: donation.amount,
                    currency: donation.currency,
                    paymentRequest: this.currentPaymentRequest
                });
            }
        },
        
        // Set the loading state of the button
        setButtonLoading: function(isLoading) {
            const button = document.getElementById('blink-pay-button');
            if (isLoading) {
                button.innerHTML = `<span class="blink-pay-spinner"></span> ${this.t('loading')}`;
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        },
        
        // Show a status message
        showStatus: function(type, message) {
            const statusEl = document.getElementById('blink-pay-status');
            if (!statusEl) return;
            
            statusEl.className = 'blink-pay-status';
            if (type && message) {
                statusEl.textContent = message;
                statusEl.classList.add(type);
                statusEl.style.display = 'block';
                this.log(`Status message: [${type}] ${message}`);
            } else {
                statusEl.textContent = '';
                statusEl.style.display = 'none';
            }
        },
        
        // Show notification above QR code
        showQrNotification: function(message, isError = false) {
            const qrContainer = document.getElementById('blink-pay-qr');
            if (!qrContainer) return;
            
            // Remove any existing notification
            const existingNotification = document.getElementById('blink-pay-qr-notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.id = 'blink-pay-qr-notification';
            notification.textContent = message;
            
            // Style the notification
            const bgColor = isError ? '#ffebee' : '#e8f5e8';
            const textColor = isError ? '#c62828' : '#2e7d32';
            const borderColor = isError ? '#ffcdd2' : '#c8e6c8';
            
            notification.style.cssText = `
                position: absolute !important;
                top: -35px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background-color: ${bgColor} !important;
                color: ${textColor} !important;
                border: 1px solid ${borderColor} !important;
                border-radius: 6px !important;
                padding: 6px 12px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                font-family: 'IBM Plex Sans', sans-serif !important;
                white-space: nowrap !important;
                z-index: 1000 !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                pointer-events: none !important;
                margin: 0 !important;
            `;
            
            // Make QR container relative for positioning
            qrContainer.style.position = 'relative';
            
            // Add notification to QR container
            qrContainer.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // Auto-hide after 2.5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 2500);
            
            this.log(`QR notification shown: ${message}`);
        },
        
        // Utility to adjust color brightness
        adjustColor: function(hex, percent) {
            let r = parseInt(hex.substring(1, 3), 16);
            let g = parseInt(hex.substring(3, 5), 16);
            let b = parseInt(hex.substring(5, 7), 16);
            
            r = Math.max(0, Math.min(255, r + percent));
            g = Math.max(0, Math.min(255, g + percent));
            b = Math.max(0, Math.min(255, b + percent));
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        },
        
        // Dynamically adjust button font size based on text length
        adjustButtonFontSize: function(button, text) {
            if (!button || !text) return;
            
            // Create a temporary span to measure text width
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.fontFamily = button.style.fontFamily || 'IBM Plex Sans';
            tempSpan.style.fontWeight = button.style.fontWeight || '600';
            tempSpan.textContent = text;
            document.body.appendChild(tempSpan);
            
            // Get button's available width (subtract padding)
            const buttonWidth = button.clientWidth - 24; // 12px padding on each side
            
            // Start with maximum font size and reduce until it fits (2pts smaller than before)
            let fontSize = 14;
            tempSpan.style.fontSize = fontSize + 'px';
            
            // Reduce font size until text fits
            while (tempSpan.offsetWidth > buttonWidth && fontSize > 6) {
                fontSize -= 0.5;
                tempSpan.style.fontSize = fontSize + 'px';
            }
            
            // Apply the calculated font size
            button.style.fontSize = fontSize + 'px';
            
            // Clean up
            document.body.removeChild(tempSpan);
            
            this.log(`Adjusted font size to ${fontSize}px for text: "${text}"`);
        },
        
        // Update button text with dynamic font sizing and responsive text
        updateButtonText: function(button, text) {
            if (!button || !text) return;
            
            // Check if this is a success message and if we're in a very small container
            let displayText = text;
            if (text === this.t('paymentSuccessful')) {
                const widgetContainer = button.closest('.blink-pay-widget');
                if (widgetContainer) {
                    const parentContainer = widgetContainer.parentElement;
                    const containerWidth = parentContainer ? parentContainer.offsetWidth : widgetContainer.offsetWidth;
                    if (containerWidth <= 250) {
                        // Use shorter text for very small containers
                        displayText = 'Payment Successful!';
                        this.log(`updateButtonText: Using short success message for container width ${containerWidth}px`);
                    }
                }
            }
            
            button.textContent = displayText;
            
            // Use a small delay to ensure the button has rendered
            setTimeout(() => {
                this.adjustButtonFontSize(button, displayText);
            }, 10);
        },
        
        // Adjust widget and button responsiveness based on container size
        adjustButtonResponsiveness: function(button) {
            if (!button) {
                this.log('adjustButtonResponsiveness: No button provided');
                return;
            }
            
            this.log('adjustButtonResponsiveness: Function called for button:', button);
            
            // Get the widget container
            const widgetContainer = button.closest('.blink-pay-widget');
            if (!widgetContainer) {
                this.log('adjustButtonResponsiveness: No widget container found');
                return;
            }
            
            // Get the parent container width (the one that actually constrains the widget)
            const parentContainer = widgetContainer.parentElement;
            const containerWidth = parentContainer ? parentContainer.offsetWidth : widgetContainer.offsetWidth;
            this.log(`adjustButtonResponsiveness: Parent container width = ${containerWidth}px, Widget width = ${widgetContainer.offsetWidth}px`);
            
            // Update CSS variable for widget width based on custom width or container constraints
            let widgetWidth;
            if (this.buttonWidth) {
                // Use custom width, but don't exceed container width
                widgetWidth = Math.min(this.buttonWidth, containerWidth);
                widgetContainer.style.setProperty('--blink-widget-width', widgetWidth + 'px', 'important');
                this.log(`adjustButtonResponsiveness: Set widget width CSS variable to ${widgetWidth}px (custom: ${this.buttonWidth}px, container: ${containerWidth}px)`);
            } else {
                // Use responsive width based on container size
                if (containerWidth <= 250) {
                    widgetWidth = containerWidth; // Use exact container width for very small containers
                } else if (containerWidth <= 300) {
                    widgetWidth = 280;
                } else if (containerWidth <= 400) {
                    widgetWidth = 350;
                } else {
                    widgetWidth = 370;
                }
                widgetWidth = Math.min(widgetWidth, containerWidth);
                widgetContainer.style.setProperty('--blink-widget-width', widgetWidth + 'px', 'important');
                this.log(`adjustButtonResponsiveness: Set responsive widget width CSS variable to ${widgetWidth}px`);
            }
            
            // Remove any existing responsive classes
            button.classList.remove('responsive-mobile', 'responsive-tablet', 'responsive-desktop');
            this.log('adjustButtonResponsiveness: Removed existing responsive classes');
            
            // Apply responsive styles based on container size using CSS classes
            if (containerWidth <= 250) {
                // Very small container - use exact container width
                button.classList.add('responsive-mobile');
                button.style.setProperty('max-width', (containerWidth - 40) + 'px', 'important'); // Leave some padding
                this.log(`adjustButtonResponsiveness: Added responsive-mobile class for very small container ${containerWidth}px`);
            } else if (containerWidth <= 300) {
                // Mobile-style button for very small containers
                button.classList.add('responsive-mobile');
                this.log('adjustButtonResponsiveness: Added responsive-mobile class');
                if (this.buttonWidth) {
                    button.style.setProperty('max-width', this.buttonWidth + 'px', 'important');
                    this.log(`adjustButtonResponsiveness: Set custom max-width to ${this.buttonWidth}px`);
                }
            } else if (containerWidth <= 400) {
                // Tablet-style button for small containers
                button.classList.add('responsive-tablet');
                this.log('adjustButtonResponsiveness: Added responsive-tablet class');
                if (this.buttonWidth) {
                    button.style.setProperty('max-width', this.buttonWidth + 'px', 'important');
                    this.log(`adjustButtonResponsiveness: Set custom max-width to ${this.buttonWidth}px`);
                }
            } else {
                // Desktop-style button for larger containers
                button.classList.add('responsive-desktop');
                this.log('adjustButtonResponsiveness: Added responsive-desktop class');
                if (this.buttonWidth) {
                    button.style.setProperty('max-width', this.buttonWidth + 'px', 'important');
                    this.log(`adjustButtonResponsiveness: Set custom max-width to ${this.buttonWidth}px`);
                }
            }
            
            this.log(`adjustButtonResponsiveness: Final button classes: ${button.className}`);
            this.log(`adjustButtonResponsiveness: Final button max-width: ${getComputedStyle(button).maxWidth}`);
            this.log(`adjustButtonResponsiveness: Final widget width: ${widgetContainer.offsetWidth}px`);
        },
        
        // Set up resize observer for dynamic container size changes
        setupResizeObserver: function(button) {
            if (!button || !window.ResizeObserver) return;
            
            const widgetContainer = button.closest('.blink-pay-widget');
            if (!widgetContainer) return;
            
            // Watch both the widget container and its parent
            const parentContainer = widgetContainer.parentElement;
            
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    this.adjustButtonResponsiveness(button);
                }
            });
            
            resizeObserver.observe(widgetContainer);
            if (parentContainer) {
                resizeObserver.observe(parentContainer);
            }
            this.log('Resize observer set up for dynamic container size changes');
        },
        
        // Build analytics tracking URL for Blink logo
        buildBlinkAnalyticsUrl: function() {
            const baseUrl = 'https://get.blink.sv';
            const params = new URLSearchParams();
            
            // Add username parameter
            if (this.username) {
                params.append('username', this.username);
            }
            
            // Add referral source
            params.append('referral', 'embedded_donation_button');
            
            // Add the current page URL where the widget is embedded
            try {
                const currentUrl = window.location.href;
                params.append('embed_url', currentUrl);
            } catch (e) {
                // Fallback if window.location is not available
                this.log('Could not get current URL for analytics', e);
            }
            
            // Add widget version for tracking
            params.append('widget_version', '1.5.0');
            
            return `${baseUrl}?${params.toString()}`;
        }
    };
    
    // Expose to global scope
    window.BlinkPayButton = BlinkPayButton;
})(); 