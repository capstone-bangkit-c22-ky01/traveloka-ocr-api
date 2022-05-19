# Traveloka OCR API

### Get Started

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

- Running the server `npm run start-dev`
