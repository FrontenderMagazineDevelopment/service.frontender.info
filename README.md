# SERVICE.FRONTENDER.INFO

Set of micro-services for Fronteder Magazine

## Installation

    npm install
    npm run build
    npm run server

## NGINX configuration

    upstream servicefrontenderinfo {
            server 127.0.0.1:3003;
    }

    server {
            listen *:80;
            listen [::]:80;

            server_name service.frontender.info;
            proxy_set_header Host service.frontender.info;
            location / {
                    rewrite ^(.*)$ https://service.frontender.info$1 permanent;
            }
    }

    server {
            listen 443 ssl;
            listen [::]:443 ssl;

            ssl on;
            ssl_certificate         /path/domain.crt;
            ssl_certificate_key     /path/domain.key;

            brotli              on;
            brotli_comp_level   6;
            brotli_types        text/plain text/css text/xml application/x-javascript;

            error_log /path/service.frontender.info.error.log; #p
            access_log /path/service.frontender.info.access.log; #p

            server_name service.frontender.info;

            add_header Strict-Transport-Security max-age=500;

            location / {
                    proxy_pass  http://servicefrontenderinfo;
                    proxy_redirect off;
                    proxy_set_header Host $host ;
                    proxy_set_header X-Real-IP $remote_addr ;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for ;
                    proxy_set_header X-Forwarded-Proto https;
            }
    }

# API

You will get JSON as an answer

    {
        success: true | false # if operation was successfull
        payload: mixed # any additional data
    }

## GitHub

### /github/check/:login

Checking if there are such github user, if there is — payload will contain user data

## Trello

### /trello/check/:login

Checking if there are such trello user, if there is — payload will contain user data

## Twitter

### /twitter/check/:login

Checking if there are such twitter user, if there is — payload will contain user data

## URL

### /url/check/:url

Check if url answering

## Autofill

### /autofill/:keywords

Search for users, :keywords — URL-encoded JSON-encoded array with names, nicknames, emails and other user information.