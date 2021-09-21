<?php

function generate_ascending_sorter(callable $test_func) {
  $result = function ($a, $b) use ($test_func) {
    if ($test_func($a) < $test_func($b)) {
      return -1;
    }
    if ($test_func($a) > $test_func($b)) {
      return 1;
    }
    return 0;
  };
  return $result;
}
function generate_descending_sorter(callable $test_func) {
  $result = function ($a, $b) use ($test_func) {
    if ($test_func($a) < $test_func($b)) {
      return 1;
    }
    if ($test_func($a) > $test_func($b)) {
      return -1;
    }
    return 0;
  };
  return $result;
}



$routes = [];
function add_route($endpoint, callable $handler) {
  global $routes;
  ///var_dump($routes);
  ///pp($routes,'routes');
  array_push($routes, [
    'endpoint' => $endpoint,
    'handler' => $handler
  ]);
};

function route($uri) {
  global  $routes;
  session_start();

  $uri = clean_uri($uri);
  $base_uri = base_uri();
  $path = substr($uri, strlen($base_uri));

  if (empty($uri) || $uri == $base_uri) {
    foreach (['home', 'front-page'] as $file) {
      $homepage_template = sprintf('%s/%s.php', APP_PATH, $file);
      if (file_exists($homepage_template)) {
        add_filter('body_class', function ($classes) use ($file) {
          array_push($classes, $file);
          return $classes;
        });
        return require_once($homepage_template);
      }
    }
  }
  ///pp($path,'path');

  //see if we match an add_route()
  $noslash_path = ltrim($path, '/');
  $slash_path = '/' . $noslash_path;


  /* Sort by decreasing length to give higher preference to more specific (longer) route endpoints.  */
  usort($routes, generate_descending_sorter(function ($route) {
    return strlen($route['endpoint']);
  }));

  foreach ($routes as $route) {

    $endpoint = $route['endpoint'];
    $handler = $route['handler'];

    if ($slash_path == $endpoint) {
      //got an easy match with no params.
      return call_user_func_array($handler, []);
    }

    //check for arguments
    preg_match('/{.*}/', $endpoint, $matches);
    if (empty($matches)) {
      continue; //skip. No args found. The only way this could have matched was the easy way.
    }

    $them_all = $matches[0];
    ///pp([$count,$route,$matches,$them_all,$path,$endpoint],'matches,them_all,path,endpoint');
    $vars = preg_split('/{|}|\//', $them_all);
    $vars = array_filter($vars, function ($elem) {
      return !empty($elem);
    });
    $tmp = $endpoint;

    $attempt = preg_replace('/{.*}/U', '(.*)', $endpoint);
    $attempt = preg_replace('/\//', '\/', $attempt);
    $attempt = '/' . $attempt . '/';
    $recipe = $attempt;
    preg_match($recipe, $slash_path, $match_args);
    array_shift($match_args);
    if (!empty($match_args)) {
      return call_user_func_array($handler, $match_args);
    }
  }

  $tests = [];
  array_push($tests, sprintf('%s/%s/index.php', dirname(__FILE__), $noslash_path));
  array_push($tests, sprintf('%s/page-%s.php', dirname(__FILE__), $noslash_path));
  array_push($tests, sprintf('%s/%s.php', dirname(__FILE__), $noslash_path));
  array_push($tests, sprintf('%s/%s', dirname(__FILE__), $noslash_path));

  foreach ($tests as $test) {
    if (file_exists($test)) {
      return include_once($test);
    }
  }
  return error_404();
}
