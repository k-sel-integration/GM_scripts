// ==UserScript==
// @name        KSS_addon
// @namespace   https://github.com/k-sel-integration
// @grant       GM_xmlhttpRequest
// @grant       GM_openInTab
// ==/UserScript==


//Config  variables
var serverUrl = "http://127.0.0.1:7373/?";
var requestId = "FS_REQUEST";
var responseId = "FS_RESPONSE";
var checkRequestInterval = 2000;
var interfacePrefix = ""; //empty by default

//Scripts to call from console or SeleniumIde
var KS_interface = document.createElement("SCRIPT");
KS_interface.type = 'text/javascript'
KS_interface.innerHTML = 'function ' + interfacePrefix + 'requestFS(){' +
    'var n = arguments.length;' +
    'if(n%2==1) {alert("що за хуйня"); return;}' +
    'n/=2;' +
    'var r=document.createElement("div");' +
    'for(var i=0;i<n; ++i) r.setAttribute(arguments[2*i], arguments[2*i+1]);' +
    'r.id = "' + requestId + '";' +
    'document.body.insertBefore(r, document.body.firstChild);' +
    '}' +
    'function ' + interfacePrefix + 'clearFSPage(){' +
    'var response=document.getElementById("' + responseId + '");' +
    'if(response!=null) response.parentNode.removeChild(response); ' +
    'else if (arguments.length>0) throw "KSS ERROR! For more information see the near tab"' +
    '}' +
    'function ' + interfacePrefix + 'clearNextFile(){' +
    interfacePrefix + 'requestFS("cmd", "clear");' +
    '}' +
    'function ' + interfacePrefix + 'setNextFile(){' +
    'var mind = (arguments.length>1)?arguments[1]:1;' +
    'var maxd = (arguments.length>2)?arguments[2]:mind;' +
    interfacePrefix + 'requestFS("cmd", "set","way", arguments[0], "mind", mind, "maxd", maxd);' +
    '}' +
    'function ' + interfacePrefix + 'setNextFileMult(){' +
    'var mind = (arguments.length>1)?arguments[1]:1;' +
    'var maxd = (arguments.length>2)?arguments[2]:mind;' +
    interfacePrefix + 'requestFS("cmd", "set","way", arguments[0], "mind", mind, "maxd", maxd, "mult", 1);' +
    '}';
document.body.insertBefore(KS_interface, document.body.firstChild);



//GM daemon
var state = 1; //flag to prevent double call to server


setInterval(function() {
    if (state == 0) return;
    var element = document.getElementById(requestId);
    if (element != null) {
        state = 0;
        var qParams = "";
        for (var i = 0, atts = element.attributes, n = atts.length; i < n; i++) {
            if (atts[i].nodeName == "id") continue;
            qParams += atts[i].nodeName;
            qParams += "=";
            qParams += atts[i].value;
            qParams += "&";
        }
        qParams = qParams.substring(0, qParams.length - 1);
        element.parentNode.removeChild(element);
        var lastQuery = serverUrl + qParams;
        try {
            var reqState = GM_xmlhttpRequest({
                method: "GET",
                url: lastQuery,
                onload: function(res) {
                    if (res.response == "OK") {

                        var response = document.createElement("div");
                        response.id = responseId;
                        document.body.insertBefore(response, document.body.firstChild);
                        state = 1;
                    } else {
                        GM_openInTab(lastQuery);
                        state = 1;
                    }

                },
                onerror: function(res) {
                    GM_openInTab(lastQuery);
                    state = 1;
                }
            });

        } catch (e) {
            console.log(e);
            state = 1;
        }

    }

}, checkRequestInterval);