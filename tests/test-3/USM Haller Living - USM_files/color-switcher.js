define(['jquery'],function($){'use strict';$(function(){var pluginName='colorSwitcher',triggerEl='.csw',defaults={};function Plugin(element,options){this.element=element;this.$wrapper=$(element);this.$target=this.$wrapper.find('.csw-target');this.$targetText=this.$wrapper.find('.csw-target-text');this.$colorWrapper=this.$wrapper.find('.csw-items');this.$colorLinks=this.$colorWrapper.find('.csw-link');this.$activeColor=this.$colorLinks.filter('.active');this.settings=$.extend({},defaults,options);this.api={fadeIn:this.fadeIn,fadeOut:this.fadeOut,showColor:this.showColorWidthId};this._defaults=defaults;this._name=pluginName;this.init();}
Plugin.prototype.init=function(){var self=this;if(!this.$activeColor.length){this.$activeColor=this.$colorLinks.first();}
this.showColor(this.$activeColor);this.$colorWrapper.on('click','.csw-link',function(e){if(e.preventDefault){e.preventDefault();}
self.showColor($(this));});this.$wrapper.addClass('loaded');};Plugin.prototype.showColor=function($colorItem){var $colorTarget=$colorItem.data('target');$colorItem.addClass('active').siblings().removeClass('active');if(this.$targetText.length){var colorName=$colorItem.find('img').first().attr('alt');if($colorItem.attr('href')!=''){this.$targetText.text(colorName);}else{this.$targetText.text('');}}
if($colorItem.data('loaded')===true){$colorTarget.addClass('active').siblings().removeClass('active');}else{this.preloadColor($colorItem);}
this.$wrapper.trigger('updated.csw',{el:$colorItem,cswId:$colorItem.data('cswId')});};Plugin.prototype.showColorWidthId=function(id){var $color=this.$colorLinks.filter('[data-csw-id='+id+']');this.showColor($color);};Plugin.prototype.preloadColor=function($colorItem){var $imgContainer=$('<div/>').addClass('csw-target-container preloading');var $img=$('<img>').addClass('csw-target-img').appendTo($imgContainer);var $imgSecond;var url=$colorItem.attr('href');var urlSecond=$colorItem.data('csw-second');if(urlSecond){$imgSecond=$img.clone().addClass('csw-target-img-second active').attr('src',urlSecond).appendTo($imgContainer);}
$img.load(function(){$imgContainer.removeClass('preloading').addClass('active');$colorItem.data('loaded',true).data('target',$imgContainer);});$img.attr('src',url);this.$target.children().removeClass('active');this.$target.append($imgContainer);};Plugin.prototype.fadeOut=function(){this.$target.addClass('csw-hidden');};Plugin.prototype.fadeIn=function(){this.$target.removeClass('csw-hidden');};$.fn[pluginName]=function(options){var args=arguments;this.each(function(){if(!options||typeof options==='object'){if(!$.data(this,'plugin_'+pluginName)){$.data(this,'plugin_'+pluginName,new Plugin(this,options));}}else if(typeof options==='string'){var instance=$(this).data('plugin_'+pluginName);if(instance.api&&instance.api[options]){instance.api[options].apply(instance,Array.prototype.slice.call(args,1));}}});return this;};$(triggerEl)[pluginName]();});});