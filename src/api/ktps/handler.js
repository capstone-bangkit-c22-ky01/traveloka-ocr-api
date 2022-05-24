const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const path = require('path');
const pool = new Pool();
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

// Import creditions.json from firebase
const serviceAccount = require('../../../travelokaocr-firebase-adminsdk-wsqmu-dcfd42eea8.json');

// Initialize App
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Set the bucket
const storageRef = admin.storage().bucket('gs://travelokaocr.appspot.com');

// Function to upload and store the file in firebase storage
/* Fix : 1. FIXED Di firebase ktia bisa lihat picture yang sudah di up: karena tidak dapat access token sama seperti kalau di up dari firebase console 
         2. FIXED File naming di firebase
*/
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
    //THIS RETURN A LINK TO DOWNLOAD THE PHOTO
    return storage[0].metadata.mediaLink;
    
    //THIS RETURN A LINK TO SEE THE PHOTO
    //return storage[0].getSignedUrl({ action: 'read', expires: '03-09-2491' });
}

// Function for storing the file locally before uploading it to the firebase storage
/* Fix : 1. FIXED Harus ada file yg di upload. kalau kosong error
         2. FIXED File yang di upload harus eksistensi image
         3. File koordinat juga harus dipikirin how to
*/
async function storeFileUpload(file, h) {
    // **nama file asli
    const { filename } = file.hapi;

    //** validasi image extension
    const ext = path.extname(filename);
    const validExt = [ '.pdf', '.jpg', '.png', '.jpeg' ];
    
    if (validExt.indexOf(ext) == -1) {
        console.error('Not allowed file type');
        return error;
    }
    
    // **nama file custom
    const filenameCustom = Date.now()+'ktp'+ ext;
    const data = file._data;
    const ktpFolder = './ktp';

    // create the ktp folder
    if (!fs.existsSync(ktpFolder)) {
        fs.mkdirSync(ktpFolder);
    }

    // ***** MASIH PERLU DIPERBAIKI *****
    fs.writeFile(`./ktp/${filenameCustom}`, data, (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log("selesai");
    });

    // call uploadFile function
    const imagePath = `./ktp/${filenameCustom}`;
    const url = await uploadFile(imagePath, filenameCustom);
    console.log("ini url: " + url);
    return url;
}

// handler function
const addImageKtp = async (request, h) => {
    try{
        const { payload } = request;
        const id = nanoid(16);
       // const idUser = 'users-p7Q2osxKauwbfPzX';
        const { id:idUser } = request.auth.credentials;
        // const idUser = idUr;
        const imageUrl = await storeFileUpload(payload.file);

        // Coba-coba
        console.log("ini id: " + id);
        console.log("ini url image : " + imageUrl);
        console.log("ini id user: " + idUser);
    
        //fill database
        const query = {
            text: 'INSERT INTO ktps VALUES($1, $2, $3) RETURNING id',
            values: [id, imageUrl, idUser],
        };
    
        const result = await pool.query(query);
        if(!result.rows.length) {
            throw new InvariantError('Failed to add KTP image')
        }

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
//untuk put siapkan global variabel yg bisa simpan namafilenya untuk keperluan delete

module.exports = { addImageKtp };