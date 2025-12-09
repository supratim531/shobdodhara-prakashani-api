## How to host Node.js app on Ubuntu (24.04)

### Step 1 - Install Node.js & build essentials
```
sudo apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

```
sudo apt-get install build-essential
```

### Step 2 - Clone the git repository
```
git clone https://<username>:<personal-access-token>@github.com/Young-Architects/shobdodhara-prakashani-api.git
cd shobdodhara-prakashani-api/
sudo vi .env
npm install
```

### Step 3 - Install pm2 (Globally)
Install pm2 package which is a process manager for Node.js app
```
sudo npm install -g pm2
```

### Step 4 - Install Redis Server & CLI
```
sudo apt install redis-server
redis-server --version
```

### Step 5 - Run the server using pm2 in the background
```
sudo pm2 start server.js
```

### Step 6 - Install Nginx
Nginx is a web server which we will be using as a proxy
```
sudo apt install nginx
```

Now edit the file at /etc/nginx/sites-available/default using following command
```
sudo nano /etc/nginx/sites-available/default
```

We want this file to look like this...
```
...
location / {
  proxy_pass http://localhost:5000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
...
```

### Step 7 - Test & restart Nginx
Test and restart nginx using following commands
```
sudo nginx -t
sudo systemctl restart nginx
```
