Click Code to copy it

1. Create .env file inside (back folder)
    paste this into it:
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

2. Open two terminals or two powershells
    first terminal: 
        cd back
        npm install express
        npm run dev

    second terminal:
        cd front
        npm install
        npm run dev

3. Now We can open http://localhost:5173
