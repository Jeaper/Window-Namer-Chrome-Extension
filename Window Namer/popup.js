/**
 * Created by jespe on 2017-11-09.
 */
console.log(document);

document.addEventListener('DOMContentLoaded', init, false);

function init(){

    var urls = document.getElementById("urls");

    var submitButton = document.getElementById("submitButton")
    submitButton.addEventListener("click",saveSuffix);

    var loadButton = document.getElementById("applyButton")
    loadButton.addEventListener("click",applyName);

    var clearWindowButton = document.getElementById("clearWindowButton")
    clearWindowButton.addEventListener("click",clearWindow);

    var clearStorageButton = document.getElementById("clearStorageButton")
    clearStorageButton.addEventListener("click",clearStored);
    chrome.storage.local.get(function(item){
        if (item.windowSuffixes != undefined) {

            chrome.storage.local.get(/* String or Array */"windowSuffix_"+item.windowSuffixes, function (items) {
                //  items = [ { "phasersTo": "awesome" } ]
                console.log(items);
                var Suffix = "Type Your Window Suffix Here";
                if (items != undefined && items["windowSuffix_"+item.windowSuffixes] != undefined) {
                    Suffix = items.windowSuffix;
                }
                document.getElementById("Suffix").value = Suffix;
            });
        }
        else{
            var Suffix = "Type Your Window Suffix Here"
            document.getElementById("Suffix").value = Suffix;
        }
    });
}


function applyName() {
    clearWindow();
    chrome.storage.local.get(/* String or Array */"windowSuffixes", function(item){

            chrome.storage.local.get(/* String or Array */"windowSuffix_"+item.windowSuffixes, function (items) {
                //  items = [ { "phasersTo": "awesome" } ]
                console.log(items);
                chrome.windows.getCurrent(function (win) {
                    chrome.tabs.getAllInWindow(win.id, function (tabs) {
                        // Should output an array of tab objects to your dev console.
                        for (var i = 0; i < tabs.length; i++) {
                            var tab = tabs[i];
                            if (tab.title.indexOf(items["windowSuffix_"+item.windowSuffixes]) == -1) {
                                var code = "document.title = '" + tab.title + items["windowSuffix_"+item.windowSuffixes] + "'"
                                chrome.tabs.executeScript(tab.id, {code: code});
                            }
                        }
                        console.debug(tabs);
                    });
                });
            });
        });


}

function saveSuffix() {
    console.log("save")
    chrome.storage.local.get(/* String or Array */"windowSuffixes", function(item) {
        if (item.windowSuffixes == undefined) {
            saveSuffixByIndex(0)
        }
        else{
            saveSuffixByIndex(item.windowSuffixes +1);
        }
    });
}

function saveSuffixByIndex(suffixIndex){
    chrome.storage.local.set({"windowSuffixes": suffixIndex}, function () {
        var name ="windowSuffix_"+suffixIndex;
        chrome.storage.local.set({
            [name]: document.getElementById("Suffix").value
        }, function () {
            //  Data's been saved boys and girls, go on home
            console.log("saved it!");
        });
    });
}

function clearStored() {
    clearWindow();
    clearWindow();
    clearWindow();
    chrome.storage.local.clear();
    console.log("Cleared storage!")
}


function clearWindow(){

    chrome.storage.local.get(function(result){
        var suffixIndex = result.windowSuffixes;
        if (suffixIndex != undefined){
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.getAllInWindow(win.id, function (tabs) {
                    for (var i = 0; i <= suffixIndex; i++) {
                        var suffix = result["windowSuffix_" + i];
                        if (suffix != undefined) {
                            for (var i = 0; i < tabs.length; i++) {
                                var tab = tabs[i];
                                removeSuffixIfApplicable(tab.id, suffix);
                            }
                        }
                    }
                });
            });
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
    });
}