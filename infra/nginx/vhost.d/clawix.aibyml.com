# Route API and all top-level API paths to the clawix-api container
location ~ ^/(api|auth|admin|health|notifications|memory|groups|providers)(/.*)?$ {
    resolver 127.0.0.11 valid=30s;
    set $api http://clawix-api:3001;
    proxy_pass $api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
    proxy_connect_timeout 60s;
}

# WebSocket upgrade (real-time chat + notifications)
location ~ ^/ws(/.*)?$ {
    resolver 127.0.0.11 valid=30s;
    set $api http://clawix-api:3001;
    proxy_pass $api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 3600s;
}
