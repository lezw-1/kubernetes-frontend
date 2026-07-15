FROM node:24-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ARG VITE_IAM_SUBPATH=/iam
ENV VITE_IAM_SUBPATH=$VITE_IAM_SUBPATH
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
