function s7ComponentEvent (objID, compClass, instName, timeStamp, eventInfo) {

    var s =omntag.s;
    var eventValues = eventInfo.split(',');
    var eventType = eventValues[0].toString();
    var eventData = (eventValues.length > 1) ? unescape(eventValues[1].toString()) : "";

    var params = new Array();
    var paramsRaw = eventInfo.split(",");
    for (var param in paramsRaw) {
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            params.push(decodeURIComponent(unescape(paramsRaw[param])));
        } else {
            params.push(decodeURIComponent(paramsRaw[param])+'');
        }
    }


    if( eventType == "LOAD" ){
        omntag.videoName = params[6];
        if(s.pageName){
            omntag.videoName = s.pageName + ":" + omntag.videoName;
        }
    }
    if(omntag.videoName)
        s.eVar105 = omntag.videoName;
    
    if( eventType == "PLAY" && !omntag.videoBegun){
        s.events = s.linkTrackEvents = "event102";
        s.linkTrackVars = "eVar105,events";
        s.tl(this,'o', 'Video Play: '+omntag.videoName);
        omntag.videoBegun = true;
    }
    else if( eventType == "MILESTONE" ){
        var percent = params[1]; 
        if(percent=="25"){
            s.events = s.linkTrackEvents = "event104";
            s.linkTrackVars = "eVar105,events";
            s.tl(this,'o', 'Video Milestone 25: '+omntag.videoName);
        }
        else if(percent=="50"){
            s.events = s.linkTrackEvents = "event105";
            s.linkTrackVars = "eVar105,events";
            s.tl(this,'o', 'Video Milestone 50: '+omntag.videoName);
        }
        else if(percent=="75"){
            s.events = s.linkTrackEvents = "event106";
            s.linkTrackVars = "eVar105,events";
            s.tl(this,'o', 'Video Milestone 75: '+omntag.videoName);
        }
        else if(percent=="100"){
            s.events = s.linkTrackEvents = "event103";
            s.linkTrackVars = "eVar105,events";
            s.tl(this,'o', 'Video Complete: '+omntag.videoName);
        }
    }
}

