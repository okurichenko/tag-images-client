define(['./USM','jquery'],function(USM,$){'use strict';$(function(){var setActiveStates=function(e){var $hovered=$(e.currentTarget);$watchElements.removeClass('active');$hovered.addClass('active');};if(!Modernizr.touch){var $watchElements=$('.rib, .rib-group, .stg.highlight, .mag-t');if($watchElements.length>1){$watchElements.on('mouseenter',setActiveStates);}}});});