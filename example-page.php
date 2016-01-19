<?php 

add_action('wp_head',function(){
?>
<style type="text/css">

  body { font-size: 18px; }

</style>
<?php
});

get_header(); ?>

<div class="content">

Some example content here. (example-page.php)

</div>

<?php 

add_action('wp_footer',function(){
?>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
<?php 
});

get_footer(); 


