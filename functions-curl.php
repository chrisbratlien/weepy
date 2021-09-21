<?php

function curl_get($url, array $get = array(), array $options = array())
{

  //pr($url,'url');
  //exit;

    $defaults = array(
        CURLOPT_URL => $url. (strpos($url, '?') === FALSE ? '?' : ''). http_build_query($get),
        CURLOPT_HEADER => TRUE,
        CURLOPT_RETURNTRANSFER => TRUE,
        CURLOPT_TIMEOUT => 120, 
        CURLOPT_FOLLOWLOCATION => TRUE,
       CURLOPT_CAINFO => dirname(__FILE__) . '/data/cacert.pem',           
    );

    $ch = curl_init();
    curl_setopt_array($ch, ($options + $defaults));
   
    $response = curl_exec($ch);
    
    // Then, after your curl_exec call:
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $header = substr($response, 0, $header_size);
    $body = substr($response, $header_size);
    $error = false;
    if (!$response) {
      $error = curl_error($ch);
      trigger_error($error);
    }
    curl_close($ch);


    $headers_array = preg_split('/\r|\n/', $header);
    $headers_array = array_filter($headers_array, function($header){
      return !empty($header);
    });
    return [$http_status, $headers_array, $body, $error];
}


function get_cached_or_fetch(array $opts = []) {

  $defaults = [
    'cached_filename' => false, //required
    'timeout_seconds' =>  3600,
    'url' => false, //required
    'headers' => []
  ];
  $opts = (object) array_merge($defaults,$opts);
  //NOTE: opts now converted from an array to an object!
  if (file_exists($opts->cached_filename)) {
    $last_modified = filemtime($opts->cached_filename);
    $now = time();
    $diff_seconds = $now - $last_modified;
    if ($diff_seconds < $opts->timeout_seconds) {
      //cached file is younger than the timeout. We're allowed to reuse cached data.
      $body = file_get_contents($opts->cached_filename);

      $headers_array = [];
      $header_file = $opts->cached_filename . '-headers';
      if (file_exists($header_file)) {
        //$headers = file_get_contents($opts->cached_filename . '-headers');
        $headers_array = file($header_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $headers_array = array_filter($headers_array, function($header){
          return !empty($header);
        });  
      }
      return [200, $headers_array, $body, false];
      //return [$headers_array, $body];
    }
  }
  //CACHE didn't exist or was too old... do a fresh fetch/curl

  $curl_get_options = [];
  if (!empty($opts->headers)) {
    $curl_get_options = array_replace($curl_get_options,[
      CURLOPT_HTTPHEADER => $opts->headers
    ]);
  }

  list($status, $headers_array, $body, $error) = curl_get($opts->url,[],$curl_get_options);

  file_put_contents($opts->cached_filename,$body);
  
  $headers_string = join("\n",$headers_array);
  file_put_contents($opts->cached_filename . '-headers',$headers_string);
  /**
  cblog([
    'status' => $status,
    'headers' => $headers_array,
    'body' => $body,
    'error' => $error
  ],'[verbose curl_get]');
  **/
  return [$status, $headers_array, $body, $error];
}
