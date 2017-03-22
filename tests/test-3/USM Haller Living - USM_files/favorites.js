define(['jquery','./USM'],function($,USM){'use strict';$(function(){var Favorites=function(el,options){var self=this;self.settings=$.extend({},$.favorites.defaults,options);self.triggerEl=el;self.myButton=self.button();self.myButton.init();};Favorites.prototype.button=function(){var self=this,mod={},$tip=$('<span class="fav-tip"><span class="fav-tip-m"></span><span class="fav-tip-a"></span></span>'),tipMsgTimer;mod.init=function(){$('body').on('click.fav','.fav-btn',mod.favorize);$(USM.events).on('FAV_UPDATEBUTTON',function(){$(self.triggerEl).each(function(){var $this=$(this);if(typeof $this.data('updateFavButton')!=='function'){$this.data('updateFavButton',mod.updateFavButton);}});});};mod.favorize=function(e){var $link=$(e.currentTarget),$fav=$link.parents('.fav'),favId=parseInt($link.attr('data-favorites-id'),10);function addFavorite(){$link.addClass('active');showMessage('add');postFavorite('add',favId);}
function delFavorite(){$link.removeClass('active');showMessage('delete');postFavorite('delete',favId);}
function postFavorite(action){$.post($link.attr('href'),{action:action,id:favId});$(USM.events).trigger('FAV_CHANGE',[action,favId]);}
function showMessage(action){var msg;if(action==='add'){msg=$link.data('msg-add');}else if(action==='delete'){msg=$link.data('msg-del');}
$tip.find('.fav-tip-m').text(msg);$tip.appendTo($fav).addClass('active');clearTimeout(tipMsgTimer);tipMsgTimer=setTimeout(function(){$tip.removeClass('active');},2000);}
if($link.hasClass('active')){delFavorite($link,favId);}else{addFavorite($link,favId);}
return false;};mod.updateFavButton=function($el,data){if(typeof data!=='object'||data.favId===undefined||data.hasFav===undefined){console.log('updateFavButton(): Error. Expected an object like this: {favId: [integer], hasFav: [0 or 1]}');return;}
var $btn=$el.find('.fav-btn'),hasFav=parseInt(data.hasFav,10);$btn.attr('data-favorites-id',data.favId);if(hasFav===1){$btn.addClass('active');}else{$btn.removeClass('active');}};return{init:mod.init,updateFavButton:mod.updateFavButton};};$.favorites=function(el,options){if(typeof options==='object'||!options){new Favorites(el,options);}};$.favorites.defaults={};$.favorites('.fav');});});