import $ from 'jquery';
// import tagsData from './tags-data';
// require('./roshen.scss');

function recalculate($tag, $img, tagData) {
  const { top, left } = $img.offset();
  const { width, height } = $img[0];
  $tag.css('display', 'block');
  $tag.css('top', `${height * tagData.pos_y /100 + top - 10}px`);
  $tag.css('left', `${width * tagData.pos_x /100 + left - 10}px`);
}

$.fn.imageTag = function($img, tagsData) {
  tagsData.forEach(tagData => {
    let $tag = $(`<a class="image-tag"><div class="image-label">${tagData.label}</div></a>`);
    $tag.attr('href', tagData.link);
    $tag.attr('target', '_blank');
    $tag.css('position', 'absolute');
    recalculate($tag, $img, tagData);

    $tag.hover(() => {
      $tag.find('.image-label').addClass('on');
    }, () => {
      $tag.find('.image-label').removeClass('on');
    });

    $tag.on('window-resized', () => {
      if ($img.is(":visible")) {
        recalculate($tag, $img, tagData);
      } else {
        $tag.css('display', 'none');
      }
    });

    $('#image-tags').append($tag);
  })
};

var wrTimeout = null;

$('document').ready(() => {
  console.info('it works');
  $('body').prepend('<div id="image-tags"></div>');
  console.info('I see tagsData as', tagsData);
  for (let i in tagsData) {
    let $i = $(`img[src$="${i}"]`);
    if ($i.length) {
      $i.imageTag($i, tagsData[i]);
    } else {
      $('div').filter(() => {
        return $(this).css("background-image").indexOf(i) > -1;
      })
    }
  }
  $(window).on('resize', () => {
    clearTimeout(wrTimeout);
    wrTimeout = setTimeout(() => {
      $('.image-tag').trigger('window-resized')
    }, 300);
  });
});
