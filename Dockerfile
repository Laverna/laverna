FROM node:8.11.3 AS build
#ARG VERSION=0.7.51
USER node
WORKDIR /home/node
#RUN wget https://github.com/Laverna/laverna/archive/${VERSION}.tar.gz && \
#  tar xzf ${VERSION}.tar.gz && \
#  cd laverna-${VERSION}
RUN git clone https://github.com/oleg-fiksel/laverna.git
RUN cd laverna && \
  npm install bower && \
  npm install gulp
RUN cd laverna && \
  npm install && \
  ./node_modules/bower/bin/bower install && \
  ./node_modules/gulp/bin/gulp.js build

FROM nginx:1.15.2-alpine
COPY --from=build /home/node/laverna/dist /usr/share/nginx/html
