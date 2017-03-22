function ready(fn){if(document.readyState!='loading'){fn();}else if(document.addEventListener){document.addEventListener('DOMContentLoaded',fn);}else{document.attachEvent('onreadystatechange',function(){if(document.readyState!='loading')
fn();});}}
ready(function(){function post(action,value,player_id,playerOrigin){var data={method:action};if(value){data.value=value;}
var message=JSON.stringify(data);var player=document.getElementById(player_id);player.contentWindow.postMessage(data,playerOrigin);}
if(window.addEventListener){window.addEventListener('message',onMessageReceived,false);}else{window.attachEvent('onmessage',onMessageReceived,false);}
function onMessageReceived(event){if(!(/^https?:\/\/player.vimeo.com/).test(event.origin)){return false;}
var data=JSON.parse(event.data);if(!data.player_id){return;}
var vimeo_id=data.player_id.split('-')[1];switch(data.event){case'ready':post('addEventListener','play',data.player_id,event.origin);post('addEventListener','finish',data.player_id,event.origin);break;case'play':case'finish':__gaTracker('send','event','video',data.event,vimeo_id,{'page':window.USM.analytics_url});break;}}});