# Weepy

Weepy is a small PHP framework that can host your website on its own, yet also convert into a WordPress theme later on. Weepy implements these functions familiar to a WordPress theme developer:

add_action  
do_action  
add_filter  
apply_filters

get_header  
get_footer

body_class

Familiar files:

functions.php  
header.php  
footer.php

## Getting Started (local development)

1. Copy .htaccess.sample to .htaccess and edit the `RewriteBase` line to be / or /yoursubfolder if you're hosting in a subfolder.

`cp .htaccess.sample .htaccess`

2. Copy .env.sample to .env and customize `APACHE_PORT` and `TIMEZONE`
   `cp .env.sample .env`

The `APACHE_PORT` is only needed if you use the included `docker-compose.yml`

3. Start the container

```
docker-compose up
```

In production, you may need another way to set environment variables. This depends on where you host the app.

For example, with Azure App services, you can go to https://portal.azure.com, browse to your App Service > Settings > Configuration > Application Settings

Or, you could also add a line to your `functions.php`:

```
require_once('local.php');
```

and inside `local.php` put your environment settings:

```
<?php
putenv('TIMEZONE=US/Central');
```

## Routing

For an endpoint `/xyz`, the router defined in `functions-router.php` will look for either:
`./xyz.php` or `./page-xyz.php`.

For an endpoint `/abc/xyz`, it will look for either:
`./abc/xyz.php` or `./abc/page-xyz.php`.

Or, try `add_route()`

### add_route()

See examples in [functions-routes.php](./functions-routes.php)

## functions-curl

Before including this, first grab a `cacert.pem` and put into the `data` folder:

```
cd data
wget https://curl.se/ca/cacert.pem
```

## References

https://www.w3schools.com/charsets/ref_emoji.asp
