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

- Profile

- Profile
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
        "foto_profil": null or "/users/images/users-asd.../foto-profil.png"
      }
    }
    ```
- Edit Profile
  - method: `PUT`
  - endpoint: `/users`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - header: multipart/form-data
  - body request :
    ```json
    "name": "Budi",
    "email": "budi@gmail.com"
    "foto_profile": "download.jpg" | file,
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Success updated profile",
    "data": {
        "imageUri": "http://localhost:5000/users/images/users-bzY7GwfQnsZk84tM/1654058695056download.jpg"
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
- Get All Booking History
  - method: `GET`
  - endpoint: `/flights/booking`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    - `pending`
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
              "status": "pending",
            },
            {...}
          ]
      }
      ```
    - `success`
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
              "status": "success",
            },
            {...}
          ]
      }
      ```
    - `canceled` = after 2 minutes pendings will become canceled
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
              "status": "canceled",
            },
            {...}
          ]
      }
      ```
- Get Detail Booking History

  - method: `GET`
  - endpoint: `/flights/booking/{id}`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:  
    Status same as get all booking
    ```json
    "status": "success",
    "message": "Booking success",
    "data": {
        "id": "booking--O25hiweBPPwF188",
        "depart_time": "7:45",
        "arrival_time": "9:00",
        "departure": "Makassar",
        "destination": "Balikpapan",
        "status": "success",
        "price": 819200,
        "booking_code": 632467104,
        "passenger_name": "SURIAMAN",
        "passenger_title": "Mr",
        "airline": "Batik",
        "icon": "https://ik.imagekit.io/tvlk/image/imageResource/2019/12/13/1576208649600-12471f9b7ffa159361f7bbbfb63065ee.png"
    }
    ```

- Update Booking Status (success)
  - method: `PUT`
  - endpoint: `/flights/booking/{id}`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body request:
    ```json
    {
    	"title": "Mr", (required)
    	"name": "SURIAMAN" (required)
    }
    ```
  - body response:
    ```json
    "status": "success",
    "message": "Booking updated",
    "data": {
        "bookingId": "booking-Jij8..."
    }
    ```
- Delete All Booking
  - method: `DELETE`
  - endpoint: `/flights/booking`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "message": "Bookings has been deleted",
    ```
- Delete All Booking but bookings history doesn't exist
  - method: `DELETE`
  - endpoint: `/flights/booking`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:  
    status code = `400`
    ```json
    "status": "fail",
    "message": "Booking data does not exist",
    ```
- Delete Booking by Id Booking
  - method: `DELETE`
  - endpoint: `/flights/booking/{id}`
  - authorization:
    - type: `Bearer Token`,
    - token: `accessToken`
  - body response:
    ```json
    "status": "success",
    "message": "A booking history has been deleted",
    ```

### Insert ID Card Image (also Retake) (Auth Require)

- method: `POST`
- endpoint: `/ktp`
- authorization:
  - type: `Bearer Token`,
  - token: `accessToken`
- header: multipart/form-data
- body request:
  ```
  * file: `image/jpg` or `image/jpeg` or `image/png`   |file
  * data: { "class": {
              "NIK": {
                "Xmin": 117,
                "Ymin": 89,
                "Xmax": 392,
                "Ymax": 135
              },
              "name": {...},
              "sex": {...},
              "married": {...},
              "nationality": {...}
            }
          }
  ```
- body response:
  ```json
   "status": "Success",
   "message": "KTP image successfully added",
   "data": {
      "imageId": "wPnJ9TehHkm1JaZ4"
   }
  ```

### Retrieve data from Card-id (Auth Require)

- Get retrieved data from database

  - method: `GET`
  - endpoint: `/ktpresult`
  - body response:
    ```json
    "status": "success",
    "data": {
        "title": "Ms",
        "name": "Artia...",
        "nationality": "Indonesia",
        "nik": "111111111111111",
        "sex": "Female",
        "married": "Single"
    }
    ```

- Update retrieved data to database
  - method: `PUT`
  - endpoint: `/ktpresult`
  - body request:
    ```json
    {
    	"title": "Ms",
    	"name": "Artia...",
    	"nationality": "Indonesia",
    	"nik": "111111111111111",
    	"sex": "Female",
    	"married": "Single"
    }
    ```
    \*note: body request is from GET /ktpresult output + data that edited by user manually
  - body response:
    ```json
    "status": "success",
    "data": [
        {
          "title": "Ms",
          "name": "Artia...",
          "nationality": "Indonesia",
          "nik": "111111111111111",
          "sex": "Female",
          "married": "Single"
        }
    ]
    ```
