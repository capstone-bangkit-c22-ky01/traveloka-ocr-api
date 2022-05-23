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

// Function for storing the file locally before uploading it to the firebase storage
async function storeFileUpload(file) {
    const { filename } = file.hapi;
    const data = file._data;
    const ktpFolder = './ktp';

    // create the ktp folder
    if (!fs.existsSync(ktpFolder)) {
        fs.mkdirSync(ktpFolder);
    }

    // ***** MASIH PERLU DIPERBAIKI *****
    fs.writeFile(`./ktp/${filename}`, data, (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log("selesai");
    });

    // call uploadFile function
    const imagePath = `./ktp/${filename}`;
    const url = await uploadFile(imagePath, filename);
    console.log(url);
    return url;
}

// handler function
const addImageKtp = async (request, h) => {
    const { payload } = request;
    const id = nanoid(16);
    const idUser = '';
    const imageUrl = await storeFileUpload(payload.file);

    //fill database
    const query = {
        text: 'INSERT INTO ktps VALUES($1, $2, $3) RETURNING id',
        values: [id, imageUrl, idUser],
    };

    const result = await pool.query(query);
    const imageId = result.rows[0].id;

    const response = h.response({
        status: 'Succes',
        message: 'KTP image uccessfully added',
        data:{
            imageId,
        },
    });
    response.code(201);
    return response;
}