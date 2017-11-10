/**
 * Created by jespe on 2017-11-09.
 */
chrome.tabs.onUpdated.addListener( checkAllSuffixes);
chrome.tabs.onCreated.addListener(checkAllSuffixes);
// chrome.tabs.onMoved.addListener(tabMoved);
chrome.tabs.onAttached.addListener(tabMoved);


function checkAllSuffixes(){

    chrome.tabs.getSelected(null,function (tab) {
        chrome.storage.local.get(/* String or Array */"windowSuffixes", function (item) {
            if (item.windowSuffixes != undefined) {
                for (var i = 0; i <= item.windowSuffixes; i++) {
                    chrome.storage.local.get(/* String or Array */"windowSuffix_"+i, function (items) {
                        //  items = [ { "phasersTo": "awesome" } ] "windowSuffix_"+item.windowSuffixes
                        for (var property in items) {
                            if (items.hasOwnProperty(property)) {
                                // do stuff
                                var suffix = items[property];
                                if (suffix != undefined && tab.title.indexOf(suffix) === -1) {
                                    addSuffixIfApplicable(suffix,tab);
                                }
                            }
                        }

                    });//get windowsuffix_X
                }// for
            }//if suffixes
        });//get windowsuffixes
    });
}


function addSuffixIfApplicable(suffix,tab){
    chrome.windows.getCurrent(function (win) {
        chrome.tabs.getAllInWindow(win.id, function (tabsInWindow) {
            // Should output an array of tab objects to your dev console.
            for (var i = 0; i < tabsInWindow.length; i++) {
                var curTab = tabsInWindow[i];
                if (tab.title.indexOf(suffix) == -1 && curTab.title.indexOf(suffix) !== -1) {
                    var code = "document.title = '" + tab.title + suffix + "'"
                    chrome.tabs.executeScript(tab.id, {code: code});
                    tab.title = tab.title + suffix;
                    break;
                }
            }
        });
    });
}

function tabMoved(tabId, moveInfo){
    chrome.storage.local.get(function(result){
        var suffixIndex = result.windowSuffixes;
        if (suffixIndex != undefined){
            for (var i = 0; i <= suffixIndex; i++) {
                var suffix = result["windowSuffix_"+i];
                if (suffix != undefined ){
                    removeSuffixIfApplicable(tabId,suffix);
                }
            }
        }
    })
}

function removeSuffixIfApplicable(tabId,suffix){
    chrome.tabs.get(tabId, function(tab){
        if(tab.title.indexOf(suffix) != -1){
            var newTitle = tab.title.replace(suffix,"");
            var code = "document.title = '" + newTitle + "'"
            chrome.tabs.executeScript(tabId, {code: code});
        }
        checkAllSuffixes();
        // setTimeout(function(){ checkAllSuffixes(); }, 500);

    });
}