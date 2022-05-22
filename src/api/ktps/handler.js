const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const pool = new Pool();

// Import creditions.json from firebase
const serviceAccount = require('../../../travelokaocr-firebase-adminsdk-wsqmu-dcfd42eea8.json');

// Initialize App
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Set the bucket
const storageRef = admin.storage().bucket('gs://travelokaocr.appspot.com');

// Function to upload and store the file in firebase storage
async function uploadFile(path, filename) {
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `ktpimage/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        },
    });
    return storage[0].metadata.mediaLink;
}