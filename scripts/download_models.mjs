import fs from 'fs';
import path from 'path';
import https from 'https';

const modelsUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const outputDir = path.join(process.cwd(), 'public', 'models');

const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const downloadFile = (file) => {
    const url = modelsUrl + file;
    const filePath = path.join(outputDir, file);

    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${file}: ${response.statusCode}`));
                return;
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded: ${file}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            reject(err.message);
        });
    });
};

async function downloadAll() {
    console.log('Starting model downloads...');
    for (const file of files) {
        try {
            await downloadFile(file);
        } catch (e) {
            console.error(`Error downloading ${file}:`, e);
        }
    }
    console.log('All downloads finished.');
}

downloadAll();
