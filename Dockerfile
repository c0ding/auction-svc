FROM node:14.17.0
LABEL description="This is the build stage for parallel referral system."

WORKDIR /app
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

RUN yarn

COPY . .
RUN yarn build

EXPOSE 3000
CMD ["node", "dist/index.js"]
