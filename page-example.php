<?php

add_action('wp_head', function () {
?>
  <style type="text/css">
    body {
      font-size: 18px;
    }
  </style>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
<?php
});

get_header(); ?>

<div class="content">
  <h2>page-example.php</h2>

  <p> Some example content <i class="fa fa-heart"></i> Blah blah.</p>

</div><!-- content -->

<?php

add_action('wp_footer', function () {
?>
<?php
});

get_footer();
