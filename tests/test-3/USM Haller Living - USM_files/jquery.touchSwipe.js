(function(factory){if(typeof define==='function'&&define.amd&&define.amd.jQuery){define(['jquery'],factory);}else if(typeof module!=='undefined'&&module.exports){factory(require("jquery"));}else{factory(jQuery);}}(function($){"use strict";var VERSION="1.6.18",LEFT="left",RIGHT="right",UP="up",DOWN="down",IN="in",OUT="out",NONE="none",AUTO="auto",SWIPE="swipe",PINCH="pinch",TAP="tap",DOUBLE_TAP="doubletap",LONG_TAP="longtap",HOLD="hold",HORIZONTAL="horizontal",VERTICAL="vertical",ALL_FINGERS="all",DOUBLE_TAP_THRESHOLD=10,PHASE_START="start",PHASE_MOVE="move",PHASE_END="end",PHASE_CANCEL="cancel",SUPPORTS_TOUCH='ontouchstart'in window,SUPPORTS_POINTER_IE10=window.navigator.msPointerEnabled&&!window.navigator.pointerEnabled&&!SUPPORTS_TOUCH,SUPPORTS_POINTER=(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&!SUPPORTS_TOUCH,PLUGIN_NS='TouchSwipe';var defaults={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:true,triggerOnTouchLeave:false,allowPageScroll:"auto",fallbackToMouseEvents:true,excludedElements:".noSwipe",preventDefaultEvents:true};$.fn.swipe=function(method){var $this=$(this),plugin=$this.data(PLUGIN_NS);if(plugin&&typeof method==='string'){if(plugin[method]){return plugin[method].apply(plugin,Array.prototype.slice.call(arguments,1));}else{$.error('Method '+method+' does not exist on jQuery.swipe');}}
else if(plugin&&typeof method==='object'){plugin['option'].apply(plugin,arguments);}
else if(!plugin&&(typeof method==='object'||!method)){return init.apply(this,arguments);}
return $this;};$.fn.swipe.version=VERSION;$.fn.swipe.defaults=defaults;$.fn.swipe.phases={PHASE_START:PHASE_START,PHASE_MOVE:PHASE_MOVE,PHASE_END:PHASE_END,PHASE_CANCEL:PHASE_CANCEL};$.fn.swipe.directions={LEFT:LEFT,RIGHT:RIGHT,UP:UP,DOWN:DOWN,IN:IN,OUT:OUT};$.fn.swipe.pageScroll={NONE:NONE,HORIZONTAL:HORIZONTAL,VERTICAL:VERTICAL,AUTO:AUTO};$.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,ALL:ALL_FINGERS};function init(options){if(options&&(options.allowPageScroll===undefined&&(options.swipe!==undefined||options.swipeStatus!==undefined))){options.allowPageScroll=NONE;}
if(options.click!==undefined&&options.tap===undefined){options.tap=options.click;}
if(!options){options={};}
options=$.extend({},$.fn.swipe.defaults,options);return this.each(function(){var $this=$(this);var plugin=$this.data(PLUGIN_NS);if(!plugin){plugin=new TouchSwipe(this,options);$this.data(PLUGIN_NS,plugin);}});}
function TouchSwipe(element,options){var options=$.extend({},options);var useTouchEvents=(SUPPORTS_TOUCH||SUPPORTS_POINTER||!options.fallbackToMouseEvents),START_EV=useTouchEvents?(SUPPORTS_POINTER?(SUPPORTS_POINTER_IE10?'MSPointerDown':'pointerdown'):'touchstart'):'mousedown',MOVE_EV=useTouchEvents?(SUPPORTS_POINTER?(SUPPORTS_POINTER_IE10?'MSPointerMove':'pointermove'):'touchmove'):'mousemove',END_EV=useTouchEvents?(SUPPORTS_POINTER?(SUPPORTS_POINTER_IE10?'MSPointerUp':'pointerup'):'touchend'):'mouseup',LEAVE_EV=useTouchEvents?(SUPPORTS_POINTER?'mouseleave':null):'mouseleave',CANCEL_EV=(SUPPORTS_POINTER?(SUPPORTS_POINTER_IE10?'MSPointerCancel':'pointercancel'):'touchcancel');var distance=0,direction=null,currentDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,pinchDirection=0,maximumsMap=null;var $element=$(element);var phase="start";var fingerCount=0;var fingerData={};var startTime=0,endTime=0,previousTouchEndTime=0,fingerCountAtRelease=0,doubleTapStartTime=0;var singleTapTimeout=null,holdTimeout=null;try{$element.bind(START_EV,touchStart);$element.bind(CANCEL_EV,touchCancel);}catch(e){$.error('events not supported '+START_EV+','+CANCEL_EV+' on jQuery.swipe');}
this.enable=function(){this.disable();$element.bind(START_EV,touchStart);$element.bind(CANCEL_EV,touchCancel);return $element;};this.disable=function(){removeListeners();return $element;};this.destroy=function(){removeListeners();$element.data(PLUGIN_NS,null);$element=null;};this.option=function(property,value){if(typeof property==='object'){options=$.extend(options,property);}else if(options[property]!==undefined){if(value===undefined){return options[property];}else{options[property]=value;}}else if(!property){return options;}else{$.error('Option '+property+' does not exist on jQuery.swipe.options');}
return null;}
function touchStart(jqEvent){if(getTouchInProgress()){return;}
if($(jqEvent.target).closest(options.excludedElements,$element).length>0){return;}
var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(event.pointerType&&event.pointerType=="mouse"&&options.fallbackToMouseEvents==false){return;};var ret,touches=event.touches,evt=touches?touches[0]:event;phase=PHASE_START;if(touches){fingerCount=touches.length;}
else if(options.preventDefaultEvents!==false){jqEvent.preventDefault();}
distance=0;direction=null;currentDirection=null;pinchDirection=null;duration=0;startTouchesDistance=0;endTouchesDistance=0;pinchZoom=1;pinchDistance=0;maximumsMap=createMaximumsData();cancelMultiFingerRelease();createFingerData(0,evt);if(!touches||(fingerCount===options.fingers||options.fingers===ALL_FINGERS)||hasPinches()){startTime=getTimeStamp();if(fingerCount==2){createFingerData(1,touches[1]);startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start);}
if(options.swipeStatus||options.pinchStatus){ret=triggerHandler(event,phase);}}else{ret=false;}
if(ret===false){phase=PHASE_CANCEL;triggerHandler(event,phase);return ret;}else{if(options.hold){holdTimeout=setTimeout($.proxy(function(){$element.trigger('hold',[event.target]);if(options.hold){ret=options.hold.call($element,event,event.target);}},this),options.longTapThreshold);}
setTouchInProgress(true);}
return null;};function touchMove(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(phase===PHASE_END||phase===PHASE_CANCEL||inMultiFingerRelease())
return;var ret,touches=event.touches,evt=touches?touches[0]:event;var currentFinger=updateFingerData(evt);endTime=getTimeStamp();if(touches){fingerCount=touches.length;}
if(options.hold){clearTimeout(holdTimeout);}
phase=PHASE_MOVE;if(fingerCount==2){if(startTouchesDistance==0){createFingerData(1,touches[1]);startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start);}else{updateFingerData(touches[1]);endTouchesDistance=calculateTouchesDistance(fingerData[0].end,fingerData[1].end);pinchDirection=calculatePinchDirection(fingerData[0].end,fingerData[1].end);}
pinchZoom=calculatePinchZoom(startTouchesDistance,endTouchesDistance);pinchDistance=Math.abs(startTouchesDistance-endTouchesDistance);}
if((fingerCount===options.fingers||options.fingers===ALL_FINGERS)||!touches||hasPinches()){direction=calculateDirection(currentFinger.start,currentFinger.end);currentDirection=calculateDirection(currentFinger.last,currentFinger.end);validateDefaultEvent(jqEvent,currentDirection);distance=calculateDistance(currentFinger.start,currentFinger.end);duration=calculateDuration();setMaxDistance(direction,distance);ret=triggerHandler(event,phase);if(!options.triggerOnTouchEnd||options.triggerOnTouchLeave){var inBounds=true;if(options.triggerOnTouchLeave){var bounds=getbounds(this);inBounds=isInBounds(currentFinger.end,bounds);}
if(!options.triggerOnTouchEnd&&inBounds){phase=getNextPhase(PHASE_MOVE);}
else if(options.triggerOnTouchLeave&&!inBounds){phase=getNextPhase(PHASE_END);}
if(phase==PHASE_CANCEL||phase==PHASE_END){triggerHandler(event,phase);}}}else{phase=PHASE_CANCEL;triggerHandler(event,phase);}
if(ret===false){phase=PHASE_CANCEL;triggerHandler(event,phase);}}
function touchEnd(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent,touches=event.touches;if(touches){if(touches.length&&!inMultiFingerRelease()){startMultiFingerRelease(event);return true;}else if(touches.length&&inMultiFingerRelease()){return true;}}
if(inMultiFingerRelease()){fingerCount=fingerCountAtRelease;}
endTime=getTimeStamp();duration=calculateDuration();if(didSwipeBackToCancel()||!validateSwipeDistance()){phase=PHASE_CANCEL;triggerHandler(event,phase);}else if(options.triggerOnTouchEnd||(options.triggerOnTouchEnd===false&&phase===PHASE_MOVE)){if(options.preventDefaultEvents!==false){jqEvent.preventDefault();}
phase=PHASE_END;triggerHandler(event,phase);}
else if(!options.triggerOnTouchEnd&&hasTap()){phase=PHASE_END;triggerHandlerForGesture(event,phase,TAP);}else if(phase===PHASE_MOVE){phase=PHASE_CANCEL;triggerHandler(event,phase);}
setTouchInProgress(false);return null;}
function touchCancel(){fingerCount=0;endTime=0;startTime=0;startTouchesDistance=0;endTouchesDistance=0;pinchZoom=1;cancelMultiFingerRelease();setTouchInProgress(false);}
function touchLeave(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(options.triggerOnTouchLeave){phase=getNextPhase(PHASE_END);triggerHandler(event,phase);}}
function removeListeners(){$element.unbind(START_EV,touchStart);$element.unbind(CANCEL_EV,touchCancel);$element.unbind(MOVE_EV,touchMove);$element.unbind(END_EV,touchEnd);if(LEAVE_EV){$element.unbind(LEAVE_EV,touchLeave);}
setTouchInProgress(false);}
function getNextPhase(currentPhase){var nextPhase=currentPhase;var validTime=validateSwipeTime();var validDistance=validateSwipeDistance();var didCancel=didSwipeBackToCancel();if(!validTime||didCancel){nextPhase=PHASE_CANCEL;}
else if(validDistance&&currentPhase==PHASE_MOVE&&(!options.triggerOnTouchEnd||options.triggerOnTouchLeave)){nextPhase=PHASE_END;}
else if(!validDistance&&currentPhase==PHASE_END&&options.triggerOnTouchLeave){nextPhase=PHASE_CANCEL;}
return nextPhase;}
function triggerHandler(event,phase){var ret,touches=event.touches;if(didSwipe()||hasSwipes()){ret=triggerHandlerForGesture(event,phase,SWIPE);}
if((didPinch()||hasPinches())&&ret!==false){ret=triggerHandlerForGesture(event,phase,PINCH);}
if(didDoubleTap()&&ret!==false){ret=triggerHandlerForGesture(event,phase,DOUBLE_TAP);}
else if(didLongTap()&&ret!==false){ret=triggerHandlerForGesture(event,phase,LONG_TAP);}
else if(didTap()&&ret!==false){ret=triggerHandlerForGesture(event,phase,TAP);}
if(phase===PHASE_CANCEL){touchCancel(event);}
if(phase===PHASE_END){if(touches){if(!touches.length){touchCancel(event);}}else{touchCancel(event);}}
return ret;}
function triggerHandlerForGesture(event,phase,gesture){var ret;if(gesture==SWIPE){$element.trigger('swipeStatus',[phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection]);if(options.swipeStatus){ret=options.swipeStatus.call($element,event,phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection);if(ret===false)return false;}
if(phase==PHASE_END&&validateSwipe()){clearTimeout(singleTapTimeout);clearTimeout(holdTimeout);$element.trigger('swipe',[direction,distance,duration,fingerCount,fingerData,currentDirection]);if(options.swipe){ret=options.swipe.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection);if(ret===false)return false;}
switch(direction){case LEFT:$element.trigger('swipeLeft',[direction,distance,duration,fingerCount,fingerData,currentDirection]);if(options.swipeLeft){ret=options.swipeLeft.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection);}
break;case RIGHT:$element.trigger('swipeRight',[direction,distance,duration,fingerCount,fingerData,currentDirection]);if(options.swipeRight){ret=options.swipeRight.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection);}
break;case UP:$element.trigger('swipeUp',[direction,distance,duration,fingerCount,fingerData,currentDirection]);if(options.swipeUp){ret=options.swipeUp.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection);}
break;case DOWN:$element.trigger('swipeDown',[direction,distance,duration,fingerCount,fingerData,currentDirection]);if(options.swipeDown){ret=options.swipeDown.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection);}
break;}}}
if(gesture==PINCH){$element.trigger('pinchStatus',[phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]);if(options.pinchStatus){ret=options.pinchStatus.call($element,event,phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData);if(ret===false)return false;}
if(phase==PHASE_END&&validatePinch()){switch(pinchDirection){case IN:$element.trigger('pinchIn',[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]);if(options.pinchIn){ret=options.pinchIn.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData);}
break;case OUT:$element.trigger('pinchOut',[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]);if(options.pinchOut){ret=options.pinchOut.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData);}
break;}}}
if(gesture==TAP){if(phase===PHASE_CANCEL||phase===PHASE_END){clearTimeout(singleTapTimeout);clearTimeout(holdTimeout);if(hasDoubleTap()&&!inDoubleTap()){doubleTapStartTime=getTimeStamp();singleTapTimeout=setTimeout($.proxy(function(){doubleTapStartTime=null;$element.trigger('tap',[event.target]);if(options.tap){ret=options.tap.call($element,event,event.target);}},this),options.doubleTapThreshold);}else{doubleTapStartTime=null;$element.trigger('tap',[event.target]);if(options.tap){ret=options.tap.call($element,event,event.target);}}}}else if(gesture==DOUBLE_TAP){if(phase===PHASE_CANCEL||phase===PHASE_END){clearTimeout(singleTapTimeout);clearTimeout(holdTimeout);doubleTapStartTime=null;$element.trigger('doubletap',[event.target]);if(options.doubleTap){ret=options.doubleTap.call($element,event,event.target);}}}else if(gesture==LONG_TAP){if(phase===PHASE_CANCEL||phase===PHASE_END){clearTimeout(singleTapTimeout);doubleTapStartTime=null;$element.trigger('longtap',[event.target]);if(options.longTap){ret=options.longTap.call($element,event,event.target);}}}
return ret;}
function validateSwipeDistance(){var valid=true;if(options.threshold!==null){valid=distance>=options.threshold;}
return valid;}
function didSwipeBackToCancel(){var cancelled=false;if(options.cancelThreshold!==null&&direction!==null){cancelled=(getMaxDistance(direction)-distance)>=options.cancelThreshold;}
return cancelled;}
function validatePinchDistance(){if(options.pinchThreshold!==null){return pinchDistance>=options.pinchThreshold;}
return true;}
function validateSwipeTime(){var result;if(options.maxTimeThreshold){if(duration>=options.maxTimeThreshold){result=false;}else{result=true;}}else{result=true;}
return result;}
function validateDefaultEvent(jqEvent,direction){if(options.preventDefaultEvents===false){return;}
if(options.allowPageScroll===NONE){jqEvent.preventDefault();}else{var auto=options.allowPageScroll===AUTO;switch(direction){case LEFT:if((options.swipeLeft&&auto)||(!auto&&options.allowPageScroll!=HORIZONTAL)){jqEvent.preventDefault();}
break;case RIGHT:if((options.swipeRight&&auto)||(!auto&&options.allowPageScroll!=HORIZONTAL)){jqEvent.preventDefault();}
break;case UP:if((options.swipeUp&&auto)||(!auto&&options.allowPageScroll!=VERTICAL)){jqEvent.preventDefault();}
break;case DOWN:if((options.swipeDown&&auto)||(!auto&&options.allowPageScroll!=VERTICAL)){jqEvent.preventDefault();}
break;case NONE:break;}}}
function validatePinch(){var hasCorrectFingerCount=validateFingers();var hasEndPoint=validateEndPoint();var hasCorrectDistance=validatePinchDistance();return hasCorrectFingerCount&&hasEndPoint&&hasCorrectDistance;}
function hasPinches(){return!!(options.pinchStatus||options.pinchIn||options.pinchOut);}
function didPinch(){return!!(validatePinch()&&hasPinches());}
function validateSwipe(){var hasValidTime=validateSwipeTime();var hasValidDistance=validateSwipeDistance();var hasCorrectFingerCount=validateFingers();var hasEndPoint=validateEndPoint();var didCancel=didSwipeBackToCancel();var valid=!didCancel&&hasEndPoint&&hasCorrectFingerCount&&hasValidDistance&&hasValidTime;return valid;}
function hasSwipes(){return!!(options.swipe||options.swipeStatus||options.swipeLeft||options.swipeRight||options.swipeUp||options.swipeDown);}
function didSwipe(){return!!(validateSwipe()&&hasSwipes());}
function validateFingers(){return((fingerCount===options.fingers||options.fingers===ALL_FINGERS)||!SUPPORTS_TOUCH);}
function validateEndPoint(){return fingerData[0].end.x!==0;}
function hasTap(){return!!(options.tap);}
function hasDoubleTap(){return!!(options.doubleTap);}
function hasLongTap(){return!!(options.longTap);}
function validateDoubleTap(){if(doubleTapStartTime==null){return false;}
var now=getTimeStamp();return(hasDoubleTap()&&((now-doubleTapStartTime)<=options.doubleTapThreshold));}
function inDoubleTap(){return validateDoubleTap();}
function validateTap(){return((fingerCount===1||!SUPPORTS_TOUCH)&&(isNaN(distance)||distance<options.threshold));}
function validateLongTap(){return((duration>options.longTapThreshold)&&(distance<DOUBLE_TAP_THRESHOLD));}
function didTap(){return!!(validateTap()&&hasTap());}
function didDoubleTap(){return!!(validateDoubleTap()&&hasDoubleTap());}
function didLongTap(){return!!(validateLongTap()&&hasLongTap());}
function startMultiFingerRelease(event){previousTouchEndTime=getTimeStamp();fingerCountAtRelease=event.touches.length+1;}
function cancelMultiFingerRelease(){previousTouchEndTime=0;fingerCountAtRelease=0;}
function inMultiFingerRelease(){var withinThreshold=false;if(previousTouchEndTime){var diff=getTimeStamp()-previousTouchEndTime
if(diff<=options.fingerReleaseThreshold){withinThreshold=true;}}
return withinThreshold;}
function getTouchInProgress(){return!!($element.data(PLUGIN_NS+'_intouch')===true);}
function setTouchInProgress(val){if(!$element){return;}
if(val===true){$element.bind(MOVE_EV,touchMove);$element.bind(END_EV,touchEnd);if(LEAVE_EV){$element.bind(LEAVE_EV,touchLeave);}}else{$element.unbind(MOVE_EV,touchMove,false);$element.unbind(END_EV,touchEnd,false);if(LEAVE_EV){$element.unbind(LEAVE_EV,touchLeave,false);}}
$element.data(PLUGIN_NS+'_intouch',val===true);}
function createFingerData(id,evt){var f={start:{x:0,y:0},last:{x:0,y:0},end:{x:0,y:0}};f.start.x=f.last.x=f.end.x=evt.pageX||evt.clientX;f.start.y=f.last.y=f.end.y=evt.pageY||evt.clientY;fingerData[id]=f;return f;}
function updateFingerData(evt){var id=evt.identifier!==undefined?evt.identifier:0;var f=getFingerData(id);if(f===null){f=createFingerData(id,evt);}
f.last.x=f.end.x;f.last.y=f.end.y;f.end.x=evt.pageX||evt.clientX;f.end.y=evt.pageY||evt.clientY;return f;}
function getFingerData(id){return fingerData[id]||null;}
function setMaxDistance(direction,distance){if(direction==NONE)return;distance=Math.max(distance,getMaxDistance(direction));maximumsMap[direction].distance=distance;}
function getMaxDistance(direction){if(maximumsMap[direction])return maximumsMap[direction].distance;return undefined;}
function createMaximumsData(){var maxData={};maxData[LEFT]=createMaximumVO(LEFT);maxData[RIGHT]=createMaximumVO(RIGHT);maxData[UP]=createMaximumVO(UP);maxData[DOWN]=createMaximumVO(DOWN);return maxData;}
function createMaximumVO(dir){return{direction:dir,distance:0}}
function calculateDuration(){return endTime-startTime;}
function calculateTouchesDistance(startPoint,endPoint){var diffX=Math.abs(startPoint.x-endPoint.x);var diffY=Math.abs(startPoint.y-endPoint.y);return Math.round(Math.sqrt(diffX*diffX+diffY*diffY));}
function calculatePinchZoom(startDistance,endDistance){var percent=(endDistance/startDistance)*1;return percent.toFixed(2);}
function calculatePinchDirection(){if(pinchZoom<1){return OUT;}else{return IN;}}
function calculateDistance(startPoint,endPoint){return Math.round(Math.sqrt(Math.pow(endPoint.x-startPoint.x,2)+Math.pow(endPoint.y-startPoint.y,2)));}
function calculateAngle(startPoint,endPoint){var x=startPoint.x-endPoint.x;var y=endPoint.y-startPoint.y;var r=Math.atan2(y,x);var angle=Math.round(r*180/Math.PI);if(angle<0){angle=360-Math.abs(angle);}
return angle;}
function calculateDirection(startPoint,endPoint){if(comparePoints(startPoint,endPoint)){return NONE;}
var angle=calculateAngle(startPoint,endPoint);if((angle<=45)&&(angle>=0)){return LEFT;}else if((angle<=360)&&(angle>=315)){return LEFT;}else if((angle>=135)&&(angle<=225)){return RIGHT;}else if((angle>45)&&(angle<135)){return DOWN;}else{return UP;}}
function getTimeStamp(){var now=new Date();return now.getTime();}
function getbounds(el){el=$(el);var offset=el.offset();var bounds={left:offset.left,right:offset.left+el.outerWidth(),top:offset.top,bottom:offset.top+el.outerHeight()}
return bounds;}
function isInBounds(point,bounds){return(point.x>bounds.left&&point.x<bounds.right&&point.y>bounds.top&&point.y<bounds.bottom);};function comparePoints(pointA,pointB){return(pointA.x==pointB.x&&pointA.y==pointB.y);}}}));