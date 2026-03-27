# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Development Stage ---
# This is what runs on your laptop
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev"]

# --- Build Stage ---
FROM base AS build
RUN npm run build

# --- Production Stage ---
# This is what runs on AWS
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
