FROM nginx:latest

WORKDIR /usr/share/nginx/html

COPY package*.json ./

RUN apt-get update && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get update && apt-get install -y nodejs

RUN npm install

COPY . .

EXPOSE 80

EXPOSE 443