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

### Upload Dataset .csv file to Postgres Table

- Open the [spreadshet](https://docs.google.com/spreadsheets/d/1_cEdIsZ2O3pN5ov0bUag25lZft5gdoUiZ_pj0F601w8/)
- Go to flights and airlines tab and download as .csv format files
- Open cmd as administrator (Run as Administrator)
- Login postgres as developer
- type this code to copy dataset on the table airlines  
  `\copy table_name from '~address local storage.csv~' with (DELIMITER ',', FORMAT CSV, HEADER)`  
  example : `\copy airlines from 'D:\Project\Bangkit\dataset\airlines.csv' with (DELIMITER ',', FORMAT CSV, HEADER)`
- Do the same on the table flights

---

## API

### Authentication User

---- **_Manual_ (Use JWT)** ----

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
  - method: `GET`,
  - endpoint: `/auth/google`
  - _login with pop up google account_
  - body response:
    ```json
    "status": "success",
    "message": "Authentication success",
    "data": {
        "accessToken": "eyJhbG...",
        "refreshToken": "eyJhb..."
    }
    ```
- Update access token & logout **Same as JWT Auth**

### If Access Token Has Expired

- body response:
  ```json
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token maximum age exceeded",
  "attributes": {
    "error": "Token maximum age exceeded"
  }
  ```

### Access feature with Unauthorize user

- body response:
  ```json
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Missing authentication"
  ```

### Access Profile (Auth Requirement)

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

### Flight & Booking (Auth Requirement)

- Get Flights
  - method: `GET`
  - endpoint: `/flights`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "data": {
      "flights": [
        {
          "id": "19629969",
          "airline": "Sriwijaya",
          "icon": "https://ik.imagekit.io/tvlk...",
          "depart_time": "14:20",
          "arrival_time": "20:50",
          "departure": "Jakarta",
          "destination": "Bali",
          "price": 2374000
        },
        {...}
      ]
    }
    ```
- Get Flights using Filters
  - method: `GET`
  - endpoint: `/flights?departure=jakarta&destination=bali`  
    will be filter from jakarta to bali
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "data": {
      "flights": [
        {
          "id": "19629969",
          "airline": "Sriwijaya",
          "icon": "https://ik.imagekit.io/tvlk...",
          "depart_time": "14:20",
          "arrival_time": "20:50",
          "departure": "Jakarta",
          "destination": "Bali",
          "price": 2374000
        },
        {...}
      ]
    }
    ```
- Post Booking
  - method: `POST`
  - endpoint: `/flights/booking`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body request:
    ```json
    "id": 6552627,
    ```
    \*note: id request is id flight
  - body response:
    ```json
    "status": "success",
    "message": "Booking success",
    "data": {
        "bookingId": "booking-M3dw..."
    }
    ```
- Get Booking History
  - method: `GET`
  - endpoint: `/flights/booking`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "message": "Booking success",
    "data": {
        "bookings": [
          {
            "id": "booking-Jij8v2tmajLkfcgj",
            "departure": "Jakarta",
            "destination": "Bali",
            "booking_code": 596253936,
            "price": 2374000,
            "status": "success"
          },
          {...}
        ]
    }
    ```
- Update Booking Status (success)
  - method: `GET`
  - endpoint: `/flights/booking/{id}`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "message": "Booking updated",
    "data": {
        "bookingId": "booking-Jij8..."
    }
    ```

### Insert ID Card Image (Auth Require)

- Scan ID Card

  - method: `POST`
  - endpoint: `/ktp`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body request:
    ```
    * key: file
    * value: `image/jpg` or `image/jpeg` or `image/png`
    ```
  - body response:
    ```json
     "status": "Success",
     "message": "KTP image uccessfully added",
     "data": {
        "imageId": "wPnJ9TehHkm1JaZ4"
     }
    ```

- Re-scan ID Card (Retake Image)
  - method: `PUT`
  - endpoint: `/ktp`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body request:
    ```
    * key: file
    * value: `image/jpg` or `image/jpeg` or `image/png`
    ```
  - body response:
    ```json
     "status": "Success",
     "message": "Success retake new KTP Image"
    ```

### Scan and retrieve data from Card-id (Auth Require)

- Get retrieved data from model OCR

  - method: `GET`
  - endpoint: `/ktpresult`
  - body response:
    ```json
    "status": "success",
    "data": {
        "nik": 0000000000000000,
        "name": "Artia...",
        "sex": "Female",
        "married": "Single",
        "nationality": "Indonesia",
        "title": "Ms"
    }
    ```

- Add retrieved data to database
  - method: `POST`
  - endpoint: `/ktpresult`
  - body response:
    ```json
    "status": "success",
    "message" : "Successfuly added to Database"
    ```
