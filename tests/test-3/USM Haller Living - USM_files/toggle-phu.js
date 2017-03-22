define(['jquery','jquery.smoothScrollTo'],function($){'use strict';$(function(){var pluginName='tglProductHero',triggerEl='.phu-tgl',defaults={};function Plugin(element,options){this.$element=$(element);this.$tglItems=this.$element.find('.phu-group');this.settings=$.extend({},defaults,options);this._defaults=defaults;this._name=pluginName;this.init();}
Plugin.prototype.init=function(){var $tglBtn=this.$element.find('.phu-group-tgl');$tglBtn.on('click',$.proxy(this.toggleUnit,this));this.$tglItems.first().addClass('active');this.$element.removeClass('phu-tgl-unloaded');};Plugin.prototype.toggleUnit=function(e){var self=this,elOffset=this.$element.offset().top,elHeight=this.$element.height(),scrollTop=$(window).scrollTop(),diff=Math.abs(elOffset-scrollTop),toggleClass=function(){self.$tglItems.toggleClass('active');};if(diff>elHeight*0.2){this.$element.smoothScrollTo({},toggleClass);}else{toggleClass();}
e.preventDefault();};$.fn[pluginName]=function(options){this.each(function(){if(!$.data(this,'plugin_'+pluginName)){$.data(this,'plugin_'+pluginName,new Plugin(this,options));}});return this;};$(triggerEl)[pluginName]();});});