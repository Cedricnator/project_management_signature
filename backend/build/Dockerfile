FROM node:23-slim AS base

FROM base AS prod

RUN useradd -Umrd /app app && \
    chown -R app:app /app
WORKDIR /app
USER app

COPY --chown=app:app package.json package-lock.json ./
COPY --chown=app:app . .

ENV NODE_ENV=test
RUN npm install --save-dev jest
# RUN npm test

ENV NODE_ENV=production
RUN npm run build

FROM base AS build

WORKDIR /app

COPY --chown=app:app --from=prod /app/node_modules /app/node_modules
COPY --chown=app:app --from=prod /app/dist /app/dist

ENV TZ=America/Santiago

EXPOSE 3000

ENV NODE_ENV production
CMD [ "node", "/app/dist/main.js" ]