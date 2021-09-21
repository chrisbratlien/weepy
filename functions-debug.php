<?php

if (!function_exists('pp')) { //Pretty Print
  function pp($obj,$label = '') {
    if (!defined('PP_ENABLED') || !PP_ENABLED) { return false; }
    $data = json_encode(print_r($obj,true));
    ?>
    <style type="text/css">
      #bsdLogger {
      position: absolute;
      top: 90px;
      right: 20px;
      border: 1px solid #bbb;
      border-radius: 0.3rem;
      background: rgba(255,255,255,0.5);
      color: #444;
      font-size: 14px;
      height: 800px;
      overflow: auto;
      padding: 1rem;
      transition: all 500ms ease;
      width: 200px;
      z-index: 999;
      }
      #bsdLogger:hover {
        width: 90%;
        right: 5%;
      }
    </style>    
    <script type="text/javascript">
      var doStuff = function(){
        var obj = <?php echo $data; ?>;
        var logger = document.getElementById('bsdLogger');
        if (!logger) {
          logger = document.createElement('div');
          logger.id = 'bsdLogger';
          document.body.appendChild(logger);
        }
        ////console.log(obj);
        var pre = document.createElement('pre');
        var h2 = document.createElement('h2');
        pre.innerHTML = obj;
 
        h2.innerHTML = '<?php echo addslashes($label); ?>';
        logger.appendChild(h2);
        logger.appendChild(pre);      
      };
      window.addEventListener ("DOMContentLoaded", doStuff, false);
 
    </script>
    <?php
  }
}

function pr($obj,$label = '') {
  echo sprintf('%s: %s',$label,print_r($obj,true));
}



function cblog($msg,$label = '') {
  
  $stamp = date('Y-m-d H:i:s');
  $msg = sprintf('%s %s: %s',$stamp,$label, print_r($msg,true));
  $filename = dirname(__FILE__) . '/data/cblog.txt';
  $fp = fopen($filename, 'a') or exit("Can't open $filename");
  fwrite($fp,$msg . "\n");
  fclose($fp);
}