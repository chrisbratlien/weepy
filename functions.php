<?php

define('APP_PATH', dirname(__FILE__));
define('DATA_PATH', APP_PATH . '/data');


require_once('core.php');
require_once('environment.php');
require_once('functions-curl.php');
require_once('functions-router.php');
require_once('functions-routes.php');

require_once('functions-debug.php');
require_once('functions-curl.php');


function slugify_string($str) {
  $result = strtolower($str);
  $result = preg_replace('/\ /', '-', $result);
  $result = preg_replace('/\//', '-', $result);
  $result = preg_replace('/\:/', '-', $result);
  $result = preg_replace('/\./', '-', $result);
  $result = preg_replace('/\-+/', '-', $result);
  return $result;
}
