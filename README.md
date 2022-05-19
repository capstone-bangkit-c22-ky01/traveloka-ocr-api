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

---

---

## API

### Authentication User (Use JWT)

---- **_Manual_** ----

- Register
  - method: `POST`
  - endpoint: `/users`
  - body request:
    ```json
    name: string | required
    email: string, email, unique | required
    password: string | required
    foto_profil: img | nullable
    ```
  - body response:
    ```json
    status: "success",
    message: "user added successfully",
    data: {
        "user_id": "users-randomidsting"
    }
    ```
- Login
  - method: `POST`,
  - endpoint: `/authentication`
  - body request:
    ```json
    email: string, email | required
    password: string | required
    ```
  - body response:
    ```json
    status: "success",
    message: "Authentication success",
    data: {
        accessToken: "eyJhbG...",
        refreshToken: "eyJhb..."
    }
    ```

---- **_Google_** ----

- Login
  - method: `POST`,
  - endpoint: `/auth/google`
  - body request:
    ```json
    email: string, email | required
    password: string | required
    ```
  - body response:
    ```json
    status: "success",
    message: "Authentication success",
    data: {
      token: "ya29.a0A...",
      expiresIn: 3598,
        profile: {
            id: "112...",
            name: "Maish",
            picture: "https://lh3.googleusercontent.com/a/AA...",
            email: "email@gmail.com",
            email_verified: true
        }
    }
    ```
