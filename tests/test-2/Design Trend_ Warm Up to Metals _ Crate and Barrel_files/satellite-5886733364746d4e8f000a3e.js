_satellite.pushAsyncScript(function(event, target, $variables){
  //add Talkable library
var tbs = document.createElement( 'script' );
tbs.async = true; tbs.setAttribute( 'src', 'https://d2jjzw81hqbuqv.cloudfront.net/integration/clients/crate-barrel.min.js' );
document.body.appendChild( tbs );
//set data
window._talkableq = window._talkableq || [];
window._talkableq.unshift(['init', { site_id: 'crate-barrel' }]);
_talkableq.push(['authenticate_customer', {
  email: _satellite.getVar('Email Logged In'), // Pass if available
  first_name: '', // Pass if available
  last_name: '' // Pass if available
}]);
//send data
window._talkableq.push(['register_affiliate', {}]);
});
