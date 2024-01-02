FROM node:18.4-alpine
WORKDIR /bot

COPY ./src /bot/src
COPY ./config.yaml /bot/
COPY ./package.json /bot/package.json
COPY ./tsconfig.json /bot/tsconfig.json
COPY ./prisma /bot/


RUN apk update
RUN apk add wget python3 build-base ffmpeg
RUN npm install

CMD ["npm", "run", "dev", "--prefix", "/bot"]
