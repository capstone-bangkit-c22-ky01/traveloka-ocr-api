const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const path = require('path');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

const pool = new Pool();

// Import creditions.json from firebase
const serviceAccount = require('../../../travelokaocr-firebase-adminsdk-wsqmu-dcfd42eea8.json');

// Initialize App
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Set the bucket
const storageRef = admin.storage().bucket('gs://travelokaocr.appspot.com');

// Contain recent filename
let allName;
// let recentImageName;
// let recentJsonName;

// Function to upload and store the file in firebase storage
async function uploadFile(path, filename) {
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `ktpimage/${filename}`,
        metadata: {
            metadata:{
                firebaseStorageDownloadTokens: uuidv4(),
            }
        },
    });
    //THIS WILL RETURN THE IMAGE LOCATION
    const imageLocation = `gs://travelokaocr.appspot.com/ktpimage/${filename}`;
    return imageLocation
    
    //THIS RETURN A LINK TO DOWNLOAD THE PHOTO
    // return storage[0].metadata.mediaLink;
    
    //THIS RETURN A LINK TO SEE THE PHOTO
    //return storage[0].getSignedUrl({ action: 'read', expires: '03-09-2491' });
}

// Function for storing the file locally before uploading it to the firebase storage
async function storeFileUpload(file) {
    // **nama file asli
    const { filename } = file.hapi;

    //** image extension validation
    const ext = path.extname(filename);
    const validExt = [ '.jpg', '.png', '.jpeg' ];
    
    if (validExt.indexOf(ext) == -1) {
        throw new InvariantError('Not allowed file type');
    }
    
    // **file custom name
    const filenameCustom = allName +'ktp'+ ext;
    // recentImageName = filenameCustom;
;
    const data = file._data;
    const ktpFolder = './ktp';

    // create the ktp folder if doesnt exist
    if (!fs.existsSync(ktpFolder)) {
        fs.mkdirSync(ktpFolder);
    }

    fs.writeFile(`./ktp/${filenameCustom}`, data, (err) => {
        if(err) {
            return error;
        }
    });

    // call uploadFile function
    const imagePath = `./ktp/${filenameCustom}`;
    return await uploadFile(imagePath, filenameCustom);
}

// Function for deleting the previous files
async function deletePrevFile(imageName, jsonName) {
    const path1 = `./ktp/${imageName}`;
    const path2 = `./ktp/${jsonName}`;
    // file removed from local storage
    try {
        fs.unlinkSync(path1);
        fs.unlinkSync(path2);
        console.log("Delete Local sukses");
    } catch(error) {
        console.log(error);
        throw new InvariantError('Eror hapus lokal file');
    }

    // delete image from firebase storage
    try {
        await storageRef.file(`ktpimage/${imageName}`).delete();
        await storageRef.file(`ktpimage/${jsonName}`).delete();
        console.log("Delete firebase sukses");
    } catch(error) {
        console.error(err);
        throw new InvariantError('Eror hapus firebase file');
    }
}

// Function for getting and writing coordinates into file.json
async function writeCoordinates(dataClassString, imageUrl){

    // mengubah string dataClass menjadi object
    const dataClassObject = JSON.parse(dataClassString);

    // Menambahkan data lokasi gambar
    dataClassObject.image = imageUrl;

    // Mengubah dataobject menjadi datastring json
    const newDataClassString = JSON.stringify(dataClassObject, null, 2);

    // Write newdatastring to file.json

    const filenameCustom = allName +'ktp.json';
    // recentJsonName = filenameCustom;

    fs.writeFileSync(`./ktp/${filenameCustom}`, newDataClassString);

    const jsonPath = `./ktp/${filenameCustom}`;
    uploadFile(jsonPath, filenameCustom);

    // cek aja
    return console.log('File Stringg.json berhasil dibuat');
}

// handler function POST ktp
const addImageKtp = async (request, h) => {
    try{
        const { payload } = request;
        const id = nanoid(16);
        const { id:idUser } = request.auth.credentials;
        
        allName = Date.now();
        
        const imageUrl = await storeFileUpload(payload.file);
        
        // fill the database
        const query = {
            text: 'INSERT INTO ktps VALUES($1, $2, $3) RETURNING id',
            values: [id, imageUrl, idUser],
        };
        
        const result = await pool.query(query);
        if(!result.rows.length) {
            throw new InvariantError('Failed to add KTP image')
        }
        
        writeCoordinates(payload.data, imageUrl);
        
        const imageId = result.rows[0].id;
        const response = h.response({
            status: 'Success',
            message: 'KTP image uccessfully added',
            data:{
                imageId,
            },
        });
        response.code(201);
        return response;
    } catch(error){
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'failed',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        // Server error
        const response = h.response({
            status: 'error',
            message: 'Sorry, there was a failure on our server.',
        });
        response.code(500);
        console.error(error);
        return response;
    }
};

// handler PUT ktp
const replaceImageKtp = async (request, h) => {

    try{
        const { payload } = request;
        const { id:idUser } = request.auth.credentials;

        allName = Date.now();

        const queryGet = {
            text: 'SELECT image_url FROM ktps WHERE id_user = $1',
            values: [idUser],
        };

        const getKtpUrl = await pool.query(queryGet);
        const imageName = (getKtpUrl.rows[0].image_url).substr(39);
        const jsonName = (getKtpUrl.rows[0].image_url).slice(39,55) + ".json";

        deletePrevFile(imageName, jsonName);

        const imageUrl = await storeFileUpload(payload.file);
    
        const query = {
            text: 'UPDATE ktps SET image_url = $1 WHERE id_user =$2 RETURNING id',
            values: [imageUrl, idUser],
        };
    
        const result = await pool.query(query);
        if(!result.rows.length) {
            throw new InvariantError('Failed to add new KTP image')
        }

        writeCoordinates(payload.data, imageUrl);

        const response = h.response({
            status: 'Success',
            message: 'Success retake new KTP Image',
        });
        response.code(201);
        return response;
    } catch(error){
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'failed',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        // Server error
        const response = h.response({
            status: 'error',
            message: 'Sorry, there was a failure on our server.',
        });
        response.code(500);
        console.error(error);
        return response;
    }
};



module.exports = { addImageKtp, replaceImageKtp };