# Traveloka OCR API

## Get Started

- Clone repository with command `git clone <alamat_repo>`
- Move to directory traveloka-ocr-api `cd traveloka-ocr-api`
- Install dependencies using command `npm install`
- Rename .env-example to .env  
  Make sure that .env has content like this:

  ```
  # server configuration (dev)
  HOST=localhost
  PORT=5000

  # node-postgres configuration (prod)
  PGUSER=
  PGHOST=
  PGPASSWORD=
  PGDATABASE=
  PGPORT=5432

  # JWT token
  ACCESS_TOKEN_KEY=
  REFRESH_TOKEN_KEY=
  ACCESS_TOKEN_AGE=

  # Google Auth
  CLIENT_ID=
  CLIENT_SECRET=
  ```

- migrate to the db `npm run migrate up`
- Running the server `npm run start-dev`

### Generate JWT Token

- Access & Refresh Token
  - In terminal/cmd type `node` then enter
  - Type this code to generate token `require('crypto').randomBytes(64).toString('hex')`
  - Copy the output and paste to the .env->ACCESS_TOkEN
  - Repeat the sintax above to generate the second token, copy output and paste to .env->REFRESH_TOKEN

### Get the Google ClientID & ClientSecret

- Follow tutorial in this link :) [LINK TUTORIAL](https://www.balbooa.com/gridbox-documentation/how-to-get-google-client-id-and-client-secret)

---

## API

### Authentication User (Use JWT)

---- **_Manual_** ----

- Register
  - method: `POST`
  - endpoint: `/users`
  - body request:
    ```json
    "name": string | required
    "email": string, email, unique | required
    "password": string | required
    "foto_profil": img | nullable
    ```
  - body response:
    ```json
    "status": "success",
    "message": "user added successfully",
    "data": {
        "user_id": "users-randomidstring"
    }
    ```
- Login
  - method: `POST`,
  - endpoint: `/authentications`
  - body request:
    ```json
    "email": string, email | required
    "password": string | required
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Authentication success",
    "data": {
        "accessToken": "eyJhbG...",
        "refreshToken": "eyJhb..."
    }
    ```
- Update Access Token
  - method: `PUT`,
  - endpoint: `/authentications`,
  - body request:
    ```json
    "refreshToken": token | required
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Access Token berhasil diperbarui",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1..."
    }
    ```
- Logout
  - method: `DELETE`,
  - endpoint: `/authentications`,
  - body request:
    ```json
    "refreshToken": token | required
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Authentications has been removed"
    ```

---- **_Google_** ----

- Login
  - method: `POST`,
  - endpoint: `/auth/google`
  - body request:
    ```json
    "email": string, email | required
    "password": string | required
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Authentication success",
    "data": {
      "token": "ya29.a0A...",
      "expiresIn": 3598,
        "profile": {
            "id": "112...",
            "name": "Maish",
            "picture": "https://lh3.googleusercontent.com/a/AA...",
            "email": "email@gmail.com",
            "email_verified": true
        }
    }
    ```

### Access Profile (Auth Requirment)

- Profile (Manual Login)
  - method: `GET`
  - endpoint: `/users`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "data": {
      "user": {
        "id": "users-randomidstring",
        "name": "user name",
        "email": "email@gmail.com",
        "password": "$2b$10$tVdv2...",
        "foto_profil": null or "http:alamat/foto-profil.png"
      }
    }
    ```
