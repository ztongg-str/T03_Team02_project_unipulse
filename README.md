# Getting Started

## 1. Create the `.env` file

Inside the `back` folder, create a file named `.env` and paste the following:

```env
DB_HOST=mysql-unipulse-ztongdb-123.i.aivencloud.com
DB_PORT=22842
DB_USER=avnadmin
DB_PASSWORD=AVNS_9DsHHyNy_PF-QAksKUK
DB_NAME=unipulse_db
PORT=4000
JWT_SECRET=unipulse_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
NODE_ENV=development
```

---

## 2. Start the Backend

Open a terminal and run:

```bash
cd back
npm install express
npm run dev
```

---

## 3. Start the Frontend

Open a **second terminal** and run:

```bash
cd front
npm install
npm run dev
```

---

## 4. Open the Application

Once both servers are running, open your browser and visit:

```text
http://localhost:5173
```
