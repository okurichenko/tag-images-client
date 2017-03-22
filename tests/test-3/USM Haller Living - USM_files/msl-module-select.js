define(['jquery','jquery.jscrollpane','jquery.mousewheel','jquery.smoothScrollTo'],function($){'use strict';$(function(){var pluginName='moduleSelect',triggerEl='.msl',defaults={};function Plugin(element,options){this.$el=$(element);this.$moduleList=this.$el.find('.msl_list-items');this.$dropzone=this.$el.find('.msl_info-dropzone');this.settings=$.extend({},defaults,options);this.api={};this._defaults=defaults;this._name=pluginName;this.init();}
Plugin.prototype.init=function(){this.$moduleList.on('click.msl','.msl_list-link',$.proxy(this.handleClick,this));var isIE10=navigator.appVersion.indexOf("MSIE 10")!==-1;if(isIE10){$('.accessories_wrap').on('mousedown',function(e){var $this=$(this);$this.addClass('hide-overlay');var el=document.elementFromPoint(e.clientX,e.clientY);$this.removeClass('hide-overlay');$(el).closest('a').trigger('click');});}
var update_tab=function(cat_id){$(".product_part").hide();$(".product_part."+cat_id).show();};$("#prod_cat_tabs .prod_cat_tab").click(function(){update_tab($(this).attr('id'));$(".prod_cat_tab").removeClass("active");$(this).addClass("active");});if($("#prod_cat_tabs").length){update_tab($("#prod_cat_tabs .prod_cat_tab.active").attr('id'));}};Plugin.prototype.handleClick=function(e){var $this=$(e.currentTarget);var url=$this.attr('href');this.updateDropzone(url);this.$moduleList.find('.msl_list-link').removeClass('active');$this.addClass('active');e.preventDefault();};Plugin.prototype.updateDropzone=function(url){var dropzoneHeight=this.$dropzone.height();this.$dropzone.addClass('loading').height(dropzoneHeight);this.$dropzone.load(url,function(response){var $this=$(this);$this.html(response).removeAttr('style').removeClass('loading');$this.find('.csw').colorSwitcher();$this.parent().find('.acc').removeData('plugin_accordion').accordion();});};$.fn[pluginName]=function(options){var args=arguments;this.each(function(){if(!options||typeof options==='object'){if(!$.data(this,'plugin_'+pluginName)){$.data(this,'plugin_'+pluginName,new Plugin(this,options));}}else if(typeof options==='string'){var instance=$(this).data('plugin_'+pluginName);if(instance.api&&instance.api[options]){instance.api[options].apply(instance,Array.prototype.slice.call(args,1));}}});return this;};$(triggerEl)[pluginName]();});});