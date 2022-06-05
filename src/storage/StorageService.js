// Local storage
const fs = require('fs');
const InvariantError = require('../exceptions/InvariantError');
const path = require('path');

// // firebase storage
// const firebaseAdmin = require('firebase-admin');
// const { v4: uuidv4 } = require('uuid');
// const serviceAccount = require('../../travelokaocr-firebase-adminsdk-wsqmu-dcfd42eea8.json'); // Import creditions.json from firebase

// // Initialize App
// const admin = firebaseAdmin.initializeApp({
// 	credential: firebaseAdmin.credential.cert(serviceAccount),
// });
// // Set the bucket
// const storageRef = admin.storage().bucket('gs://travelokaocr.appspot.com');

class StorageService {
	constructor(folder) {
		this._folder = folder;

		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
		}
	}
	deleteFile() {
		const pathFile = `${this._folder}`;
		// file removed from local storage
		fs.readdir(pathFile, (err, files) => {
			if (err) throw err;

			for (const file of files) {
				fs.unlink(path.join(pathFile, file), (err) => {
					if (err) throw err;
				});
			}
		});
	}

	writeFile(file, meta) {
		// image extension validation
		const ext = path.extname(meta.filename);
		const validExt = ['.jpg', '.png', '.jpeg'];
		if (validExt.indexOf(ext) == -1) {
			throw new InvariantError('Not allowed file type');
		}

		// custom name from date + filename
		const filename = +new Date() + meta.filename;
		const pathFile = `${this._folder}/${filename}`;

		const fileStream = fs.createWriteStream(pathFile);

		return new Promise((resolve, reject) => {
			fileStream.on('error', (error) => reject(error));
			file.pipe(fileStream);
			file.on('end', () => resolve(filename));
		});
	}

	uploadFile(filename) {
		const path = `${this._folder}/${filename}`;
		const storage = storageRef.upload(path, {
			public: true,
			destination: `profile/${filename}`,
			metadata: {
				metadata: {
					firebaseStorageDownloadTokens: uuidv4(),
				},
			},
		});
		//THIS WILL RETURN THE IMAGE LOCATION
		const imageLocation = `gs://travelokaocr.appspot.com/ktpimage/${filename}`;
		return imageLocation;
	}
}

module.exports = StorageService;
