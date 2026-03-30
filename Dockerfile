# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# ---- Stage 2: Serve ----
FROM node:20-alpine AS runner

WORKDIR /app

# Installer vite pour le serveur preview
COPY package.json package-lock.json* ./
RUN npm install

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./vite.config.js

EXPOSE 3000

# Lancer le serveur preview de Vite
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
