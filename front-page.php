<?php
add_filter('wp_title', function ($original) {
  return 'HOME';
  ///return $original;
});

get_header(); ?>
<p> &#127968; This is front-page.php</p>

<?php get_footer();
