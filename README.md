# SERVICE.FRONTENDER.INFO

Set of micro-services for Fronteder Magazine

## Installation

    npm install
    npm run build
    npm run server

## NGINX configuration

    upstream servicefrontenderinfo {
        server 127.0.0.1:3053;
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
        ssl_certificate /etc/letsencrypt/live/article.frontender.info/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/article.frontender.info/privkey.pem;
        ssl_trusted_certificate /etc/letsencrypt/live/article.frontender.info/fullchain.pem;
        include ssl.conf;

        brotli			on;
        brotli_comp_level	7;
        brotli_types		text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

        gzip                    on;
        gzip_comp_level         7;
        gzip_disable            "msie6";
        gzip_types              text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

        error_log /websites/service.frontender.info/service.frontender.info.error.log; #p
        access_log /websites/service.frontender.info/service.frontender.info.access.log; #p

        server_name service.frontender.info;

        proxy_set_header Host schedule.frontender.info;

        location / {
            proxy_pass  http://servicefrontenderinfo;
            proxy_redirect off;
            proxy_set_header Host $host ;
            proxy_set_header X-Real-IP $remote_addr ;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for ;
        }
    }

# API

## GitHub

### /github/check/:login

Checking if there are such github user, if there is — payload will contain user data

## Trello

### /trello/check/:login

Checking if there are such trello user, if there is — payload will contain user data

## Twitter

### /twitter/check/:login

Checking if there are such twitter user, if there is — payload will contain user data

## Autofill

### /autofill/:keywords

Search for users, :keywords — URL-encoded JSON-encoded array with names, nicknames, emails and other user information.
