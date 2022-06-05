const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const path = require('path');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');
const requestt = require('request-promise');
const axios = require('axios');
// const fetch = require('node-fetch');

const pool = new Pool();


// Import creditions.json from firebase
const serviceAccount = require('../../../traveloka-ocr-firebase-adminsdk-5avyv-0bad59c40a.json');

// Initialize App
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Set the bucket
const storageRef = admin.storage().bucket('gs://traveloka-ocr.appspot.com');

let allName;

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
    const imageLocation = `gs://traveloka-ocr.appspot.com/ktpimage/${filename}`;
    return imageLocation
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
    } catch(error) {
        throw new InvariantError('Failed to delete the file locally');
    }

    // delete image from firebase storage
    try {
        await storageRef.file(`ktpimage/${imageName}`).delete();
        await storageRef.file(`ktpimage/${jsonName}`).delete();
    } catch(error) {
        // console.error(err);
        throw new InvariantError('Failed to delete the files in the server');
    }
}

// Function for getting and writing coordinates into file.json
async function writeCoordinates(dataClassString, imageUrl){

    const dataClassObject = JSON.parse(dataClassString);
    dataClassObject.image = imageUrl;
    const newDataClassString = JSON.stringify(dataClassObject, null, 4);

    const filenameCustom = allName +'ktp.json';

    fs.writeFileSync(`./ktp/${filenameCustom}`, newDataClassString);

    const jsonPath = `./ktp/${filenameCustom}`;
    uploadFile(jsonPath, filenameCustom);
}

// handler function POST ktp
const addImageKtp = async (request, h) => {
    try{
        const { payload } = request;
        const id = nanoid(16);
        const { id:idUser } = request.auth.credentials;
        
        allName = Date.now();

        const queryCheckRow = {
            text: 'SELECT image_url FROM ktps WHERE id_user = $1',
            values: [idUser],
        };
        const checkRow = await pool.query(queryCheckRow);

        // Checking the ktps tabel rows
        if(Object.keys(checkRow.rows).length !== 0){

            const queryGet = {
                text: 'SELECT image_url FROM ktps WHERE id_user = $1',
                values: [idUser],
            };
    
            const getKtpUrl = await pool.query(queryGet);
            const imageName = (getKtpUrl.rows[0].image_url).substr(40);
            const jsonName = (getKtpUrl.rows[0].image_url).slice(40,56) + ".json";
    
            deletePrevFile(imageName, jsonName);

            // If Delete
            const queryDelete = {
                text: 'DELETE from ktps WHERE id_user = $1',
                values: [idUser],
            };
            await pool.query(queryDelete);
            console.log("Udah dihapus row-nya");
        };

        const imageUrl = await storeFileUpload(payload.file);
        
        // fill the database
        const query = {
            text: 'INSERT INTO ktps VALUES($1, $2, $3) RETURNING id',
            values: [id, imageUrl, idUser],
        };
        
        const result = await pool.query(query);
        if(!result.rows.length) {
            throw new InvariantError('Failed to add KTP image to Database')
        }
        
        // console.log((fileku.hapi).filename);        
        const forpyFilename = ((payload.file).hapi).filename;
        const ext = path.extname(forpyFilename);

        const filenameCustom = allName +'ktp'+ ext;

        const pyFilename = `testing/${filenameCustom}`;

        writeCoordinates(payload.data, pyFilename);
        // writeCoordinates(payload.data, imageUrl);

        // //PAKE REQUEST------------------------------
        // var options = {
        //     method: 'POST',
        //     uri:'http://localhost:5000/',
        //     body: filenameCustom, // 1654161993498ktp.png
        //     json: true,
        // };

        // console.log("Atas---------------");
        // var sendrequest = await requestt(options)
        // .then(function (parsedBody) {
        //     console.log("INI PARSE---------------");
        //     console.log(parsedBody);
        // })
        // .catch(function (err) {
        //     console.log(err);
        // });
        // console.log("Bawah---------------");
        // // ----------------------------------------------------------------

        // PAKAI AXIOSSSSSSSSSSSSSSSSSSSSSSS----------------
        console.log("DIluarnya axios ataas");
        // axios.post('http://localhost:5000/', {filenameCustom}, { timeout : 2 })
        await axios.post('https://ocr-model-eoyzxrvqla-et.a.run.app/', {filenameCustom})
            .then((res) =>{
                console.log("Baris pertama")
                console.log(`Status: ${res.status}`);
                console.log("-----------------------STATUS DIATAS. BODY DIBAWAH---------------------")
                console.log('Body: ', res.data);
                // console.log('nik: ', res.data.nik);
                // const kr_nik = res.data.nik;
                // const kr_name = res.data.name;
                // const kr_married = res.data.married;
                // const 
                const id_ktpresult = nanoid(16);
                const title = "mr";

                const queryKtpR = {
                	text: 'INSERT INTO ktpresults VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                	values: [id_ktpresult, title, res.data.name, res.data.nationality, res.data.nik, res.data.sex, res.data.married, id],
                };
                pool.query(queryKtpR);

            }).catch((error) =>{
                console.log(error.response); 
                console.log("ini eror")
            });
        console.log("DIluarnya axios bawah");
        // -----------------------------------------------------------------------

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
        const imageName = (getKtpUrl.rows[0].image_url).substr(40);
        const jsonName = (getKtpUrl.rows[0].image_url).slice(40,56) + ".json";

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