<?php 
add_filter('wp_title',function($original){
  return 'HOME';
  ///return $original;
});

get_header(); ?>
This is home.php
<?php get_footer(); 
