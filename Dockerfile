FROM node:20-alpine

<<<<<<< HEAD
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend ./
COPY frontend /app/frontend
=======
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY backend ./backend
COPY frontend ./frontend
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
EXPOSE 3000
CMD ["npm", "start"]
