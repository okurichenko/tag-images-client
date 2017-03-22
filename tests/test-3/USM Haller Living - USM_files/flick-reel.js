define(['jquery','./USM','polyfill.requestAnimationFrame'],function($,USM){'use strict';$(function(){var FlickReel=function(el,options){var self=this;self.settings=$.extend({},$.fn.FlickReel.defaults,options);if(self.settings.mobileAnimation===false&&$(window).width()<USM.config.BP_SMARTPHONE_MAX){return;}
self.$el=$(el);self.$reel=self.$el.find('.frl-imgs');self.$img=self.$reel.find('.frl-img').first();self.$ctrls=$('<div/>').addClass('frl-ctrl');self.$bar=$('<div/>').addClass('frl-ctrl-bar');self.$preload=$('<div/>').addClass('frl-ctrl-preload');self.$drag=$('<div/>').addClass('frl-ctrl-drag').hide();if(self.settings.dragText){self.$dragText=$('<span/>').addClass('frl-ctrl-drag-t').text(self.settings.dragText).appendTo(self.$drag);}
self.ev.setEvents();self.myEvents=$({});self.myReel=self.reel();if(self.settings.preloadOnLoad){self.myReel.init();}
self.myDefaultCtrl=self.defaultCtrl();self.myDefaultCtrl.init();if(self.settings.slider){self.mySlider=self.slider();self.myEvents.one('REEL_ISLOADED',self.mySlider.init);self.settings.noAutoplay=self.$el.hasClass('no-autoplay');if(self.settings.noAutoplay==false){self.myEvents.one('REEL_ISLOADED',function(){$('.isMorphing .frl-ctrl').prepend('<div id="frl-btn" class="frl-pause-btn"></div>');$('#frl-btn').click(self.myReel.toggle);self.myReel.goTo(self.myReel.keyframes.last);});}
if(!self.settings.preloadOnLoad){self.mySlider.deactivate();self.$ctrls.one('click',self.myReel.init);}}
if(self.settings.keyframeCtrl){if(self.$img.data('keyframe-spec')){self.myKeyframeSpec=self.keyframeSpec();self.myKeyframeSpec.init();}
self.myKeyframeCtrl=self.keyframeCtrl();self.myKeyframeCtrl.init();}};FlickReel.prototype.ev={down:'mousedown.fr',up:'mouseup.fr',move:'mousemove.fr',setEvents:function(){if(Modernizr.touch){this.down='touchstart.fr';this.up='touchend.fr';this.move='touchmove.fr';}},getPosX:function(e){if(Modernizr.touch){return e.originalEvent.touches[0].pageX;}else{return e.pageX;}}};FlickReel.prototype.reel=function(){var self=this,mod={},file={},pathPattern=self.$img.attr('src'),keyframes=self.$img.data('keyframes').toString().split(','),frameLength=keyframes.length,frameFirst=parseInt(keyframes[0],10),frameLast=parseInt(keyframes[frameLength-1],10),frameStart=parseInt(self.$img.data('start'),10),frameCurrent=0,frameLastCurrent=0,frameGoTo=0,frameLastGoTo=0,frames=new Array(frameLast+1),loadList=[],loadedImgs=0,$loadedImgSet=$(),isLoaded=false,isLoading=false,multiplier=self.settings.reelMultiplier,start=null,speed=100;file.path=pathPattern.split('/');file.name=file.path.pop();file.path=file.path.join('/')+'/';file.name=file.name.split('.');file.ext='.'+file.name[1];file.name=file.name[0];for(var i=0;i<=frameLast;i++){loadList.push(i);}
for(var j=frameLength;j--;){loadList.splice(keyframes[j],1);}
loadList=keyframes.concat(loadList);mod.init=function(){mod.preload();};mod.reelToRenderTree=function(){$('.frl-imgs').removeClass('on-render-tree');self.$reel.addClass('on-render-tree');};mod.createPath=function(frame){var newFile,digits=frame.toString().length;newFile=file.name.slice(0,file.name.length-digits);newFile+=frame+file.ext;newFile=file.path+newFile;return newFile;};mod.preload=function(){if(isLoading){return;}
isLoading=true;self.myEvents.on('imageLoaded.frl',mod.preloadHasLoadedImg);for(var i=0;i<loadList.length;i++){$loadedImgSet=$loadedImgSet.add(mod.prepareImg(i));}
self.$img.replaceWith($loadedImgSet);self.$reel.addClass('loaded');mod.showFrame(frameCurrent);$loadedImgSet.load(function(){loadedImgs++;self.myEvents.trigger('imageLoaded.frl');}).error(function(){var index=$(this).data('frame');var src=mod.createPath(index-1);frames[index].attr('src',src);loadedImgs++;self.myEvents.trigger('imageLoaded.frl');});};mod.preloadHasLoadedImg=function(){if(loadedImgs>frameLast){mod.initReel();}else{var percent=Math.floor(100/frameLast*loadedImgs);self.$preload.width(self.$bar.width()/100*percent);if(loadedImgs<(frameLength+1)&&self.myKeyframeCtrl){self.myKeyframeCtrl.showLink(loadedImgs);}}};mod.prepareImg=function(i){var index=parseInt(loadList[i],10),src=mod.createPath(index),$img=$('<img/>');$img.attr('src',src).addClass('frl-img').data('frame',index);frames[index]=$img;return $img;};mod.initReel=function(){if(self.settings.slider){self.$drag.fadeIn();}else{self.$drag.remove();}
if(!self.settings.slider){self.$bar.addClass('hide');}
self.$preload.fadeOut('fast');isLoaded=true;self.myEvents.trigger('REEL_ISLOADED');if(frameStart){mod.goToFrame(frameStart);}};mod.setFrameCurrent=function(frame){frameCurrent=frame<frameFirst?frameFirst:frame;frameCurrent=frame>frameLast?frameLast:frame;};mod.getValidFrame=function(frame){frame=parseInt(frame,10);frame=frame<frameFirst?frameFirst:frame;frame=frame>frameLast?frameLast:frame;return frame;};mod.render=function(){if($('#frl-btn').hasClass('frl-pause-btn')&&self.settings.noAutoplay==false){if(frameCurrent===frameGoTo){if(frameGoTo===frameLast)frameGoTo=frameFirst;else if(frameGoTo===frameFirst)frameGoTo=frameLast;}}
if(self.myKeyframeSpec&&self.settings.noAutoplay==false){var switchPos=frameCurrent;if(frameGoTo>frameCurrent){switchPos=switchPos+frames.length/10;}else{switchPos=switchPos-frames.length/10;}
var keyframeIndex=$.inArray(parseInt(switchPos).toString(),keyframes);if(keyframeIndex>-1){self.myKeyframeSpec.showItem(keyframeIndex);}}
var timestamp=Date.now();if(!start)start=timestamp;var progress=timestamp-start;if(progress>speed){start=timestamp;window.requestAnimationFrame(function(){var
distance=Math.abs(frameGoTo-frameCurrent),multiply=0;if(self.settings.slider){multiply=!self.mySlider.isDragging()?Math.floor(distance*multiplier):0;}
frameLastCurrent=frameCurrent;if(!self.$reel.hasClass('on-render-tree')){mod.reelToRenderTree();}
if(frameCurrent<frameGoTo){frameCurrent+=1;}else if(frameCurrent>frameGoTo){frameCurrent-=1;}
if(self.settings.slider){self.mySlider.updateSliderPos();}
mod.showFrame(frameCurrent);mod.render();});}else{window.requestAnimationFrame(mod.render);}};mod.showFrame=function(){frames[frameLastCurrent].removeClass('active');frames[frameCurrent].addClass('active');};mod.showKeyframe=function(keyframe){var frame=mod.getValidFrame(keyframes[keyframe]);mod.jumpToFrame(frame);};mod.goToFrame=function(frame){frameGoTo=mod.getValidFrame(frame);if(isLoaded){mod.render();}else{mod.jumpToFrame(frameGoTo);}
if(self.settings.keyframeCtrl){self.myKeyframeCtrl.setActive();}};mod.goToKeyframe=function(keyframe){var frame=mod.getValidFrame(keyframes[keyframe]);mod.goToFrame(frame);};mod.goToClosestKeyframe=function(){var closestDist=frameLast,closestFrame;for(var i=frameLength;i--;){var key=parseInt(keyframes[i],10),dist=Math.abs(key-frameCurrent);if(dist<closestDist){closestDist=dist;closestFrame=key;}}
closestFrame=mod.getValidFrame(closestFrame);mod.goToFrame(closestFrame);};mod.jumpToFrame=function(frame){frameLastCurrent=frameCurrent;frameCurrent=frame;frameGoTo=mod.getValidFrame(frame);mod.showFrame();};mod.toggle=function(){$("#frl-btn").toggleClass("frl-play-btn").toggleClass("frl-pause-btn");if(frameGoTo===frameCurrent){mod.goToFrame(frameLastGoTo);}else{frameLastGoTo=frameGoTo;frameGoTo=frameCurrent;}};return{init:mod.init,goTo:mod.goToFrame,goToKeyframe:mod.goToKeyframe,goToClosestKeyframe:mod.goToClosestKeyframe,showKeyframe:mod.showKeyframe,preload:mod.preload,show:mod.jumpToFrame,toggle:mod.toggle,keyframes:{last:frameLast,current:function(){return frameCurrent;},next:function(){return $.inArray(frameGoTo.toString(),keyframes);},all:keyframes},isLoaded:function(){return isLoaded;},getStatus:function(){if(isLoaded){return'loaded';}else if(isLoading){return'loading';}else{return'inactive';}}};};FlickReel.prototype.slider=function(){var self=this,mod={},posXStart=0,posXLast=0,sliderX=0,sliderXMin=0,sliderXMax=0,delayTime=0,delayInt=20,frameLast=self.myReel.keyframes.last,frameCurrent=self.myReel.keyframes.current(),dragging=false,cssTransform=Modernizr.prefixed('transform');mod.init=function(){sliderXMax=self.$bar.width()-self.$drag.width();mod.activate();mod.updateSliderPos();};mod.activate=function(){if(self.myReel.isLoaded()){self.$ctrls.removeClass('inactive');self.$drag.on(self.ev.down,mod.dragStart);}};mod.deactivate=function(){self.$ctrls.addClass('inactive');self.$drag.off(self.ev.down);};mod.dragStart=function(e){posXStart=self.ev.getPosX(e);dragging=true;$(document).on(self.ev.move,mod.dragMove).one(self.ev.up,mod.dragEnd);mod.setSliderXMax();e.preventDefault();};mod.dragMove=function(e){var posX=self.ev.getPosX(e),posDist=posX-posXStart;if(delayTime<new Date().getTime()-delayInt){sliderX=posXLast+posDist;mod.moveSlider(sliderX);self.myReel.goTo(Math.floor(frameLast/100*(Math.floor(100/sliderXMax*sliderX))));delayTime=new Date().getTime();}};mod.dragEnd=function(){posXLast=sliderX;dragging=false;if(self.settings.slider&&self.settings.sliderSnapToKeyframe){self.myReel.goToClosestKeyframe();}
if(self.settings.keyframeCtrl){self.myKeyframeCtrl.setActive();}
$(document).off(self.ev.move);};mod.moveSlider=function(x){sliderX=x;sliderX=x<sliderXMin?sliderXMin:sliderX;sliderX=x>sliderXMax?sliderXMax:sliderX;mod.moveEl(self.$drag,sliderX);};mod.moveSliderByPercent=function(perc){sliderX=posXLast=sliderXMax/100*perc;mod.moveSlider(sliderX);};mod.moveEl=function($el,x,y){y=y?y:0;if(Modernizr.csstransforms3d){$el.css(cssTransform,'translate3d('+x+'px, '+y+'px, 0)');}else{$el.css({'left':x+'px','top':y+'px'});}};mod.updateSliderPos=function(){frameCurrent=self.myReel.keyframes.current();if(!dragging){mod.moveSliderByPercent(100/frameLast*frameCurrent);}};mod.setSliderXMax=function(){sliderXMax=self.$bar.width()-self.$drag.width();};return{init:mod.init,activate:mod.activate,deactivate:mod.deactivate,moveTo:mod.moveSlider,moveToPercent:mod.moveSliderByPercent,setSliderXMax:mod.setSliderXMax,updateSliderPos:mod.updateSliderPos,isDragging:function(){return dragging;}};};FlickReel.prototype.defaultCtrl=function(){var self=this,mod={};mod.init=function(){var $ctrls=self.$el.find('.frl-ctrl');if($ctrls.length){self.$ctrls=$ctrls.detach();}
self.$bar.appendTo(self.$ctrls);self.$preload.appendTo(self.$bar);self.$drag.appendTo(self.$bar);self.$ctrls.appendTo(self.$el);};return{init:mod.init};};FlickReel.prototype.keyframeCtrl=function(){var self=this,mod={},keyframes=self.myReel.keyframes.all;mod.init=function(){mod.buildKeyframeCtrl();mod.setCtrlActive();};mod.buildKeyframeCtrl=function(){var length=keyframes.length,$ctrlWrapper=$('<div/>').addClass('frl-ctrl-keyframes');self.$bar.addClass('keys-'+length);for(var i=0;i<length;i++){$('<a/>').addClass('ctrl-link').data('frame',keyframes[i]).text(i+1).appendTo($ctrlWrapper);}
self.$bar.append($ctrlWrapper);$ctrlWrapper.on(self.ev.down,'.ctrl-link',function(e){var $this=$(this),frame=$this.data('frame');self.myReel.goTo(frame);self.mySlider.setSliderXMax();e.preventDefault();});};mod.setCtrlActive=function(){var currentKeyframe=self.myReel.keyframes.next();self.$ctrls.find('.ctrl-link').removeClass('active').eq(currentKeyframe).addClass('active');if(self.myKeyframeSpec){self.myKeyframeSpec.showItem(currentKeyframe);}};mod.showLink=function(i){i=i?i:1;self.$bar.find('.frl-ctrl-keyframes').find('a.ctrl-link:nth-child('+i+')').addClass('loaded');};return{init:mod.init,showLink:mod.showLink,setActive:mod.setCtrlActive};};FlickReel.prototype.keyframeSpec=function(){var self=this,mod={},specIDs=self.$img.data('keyframe-spec').split(',');mod.init=function(){mod.showItem(0);};mod.showItem=function(i){$('#'+specIDs[i]).addClass('active').siblings().removeClass('active');};return{init:mod.init,showItem:mod.showItem};};$.fn.FlickReel=function(options){return this.each(function(){var self=$(this);if($('#swp').length){if(!self.parents('.swp-item').hasClass('active')&&options.preloadOnLoad!==false){return;}}
if(typeof options==='object'||!options){if(!self.data('flickReel')){self.data('flickReel',new FlickReel(self,options));}}});};$.fn.FlickReel.defaults={slider:true,sliderSnapToKeyframe:false,keyframeCtrl:false,preloadOnLoad:true,reelMultiplier:0.03,dragText:false,mobileAnimation:true};$('.frl.is360').FlickReel({preloadOnLoad:false});$('.frl.isMorphing').FlickReel({keyframeCtrl:true,sliderSnapToKeyframe:true});$('.frl.isAnimation').FlickReel({slider:false});});});