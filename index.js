const axios = require('axios');
const fs = require('fs');
const path = require('path');

const downloadPath = path.resolve(__dirname, 'downloads');
const imageUrlTemplate = 'https://dragonbound.net/static/images/ava/${avatar.filename}.png';
const delayBetweenDownloads = 250; // Tiempo de espera en milisegundos (250 segundos en este caso)
const avatarsFilePath = path.join(__dirname, 'avatars.json');

// Crea la carpeta de descargas si no existe
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath);
}

const downloadImage = async (url, fileName) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];
    const extension = contentType.split('/')[1];

    if (!extension) {
      console.log(`No se pudo determinar la extensión del archivo para la URL: ${url}`);
      return;
    }

    const filePath = path.join(downloadPath, fileName);

    await fs.promises.writeFile(filePath, response.data);
    console.log(`Imagen descargada y guardada en: ${filePath}`);
  } catch (error) {
    console.error(`Error al descargar la imagen desde la URL ${url}:`, error.message);
    saveFailedDownload(url, fileName);
  }
};

const saveFailedDownload = (url, fileName) => {
  const failedDownloads = loadFailedDownloads();
  failedDownloads.push({ url, fileName });
  fs.writeFileSync('failed_downloads.json', JSON.stringify(failedDownloads, null, 2));
  console.log(`Información de descarga fallida guardada en 'failed_downloads.json'.`);
};

const loadFailedDownloads = () => {
  try {
    const data = fs.readFileSync('failed_downloads.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const loadAvatars = () => {
  try {
    const data = fs.readFileSync(avatarsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al cargar el archivo de avatares:', error.message);
    return [];
  }
};

const startImageDownloads = async () => {
  const avatars = loadAvatars();

  for (const avatar of avatars) {
    const imageUrl = imageUrlTemplate.replace('${avatar.filename}', avatar.filename);
    const fileName = `${avatar.filename}.png`;
    await downloadImage(imageUrl, fileName);
    await sleep(delayBetweenDownloads); // Tiempo de espera entre descargas
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

startImageDownloads();