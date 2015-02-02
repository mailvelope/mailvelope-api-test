
$(document).ready(function() {
  $.get('../data/key.asc', function(key) {
    var intro = '\n - Import the key below into Mailvelope before the test\n';
    intro += ' - Add localhost to watchlist with API flag activated\n\n';
    intro += key;
    $('#intro').val(intro);
    $('a.btn').removeClass('disabled');
  });
}); 
