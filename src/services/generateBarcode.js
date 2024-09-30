const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');
const Imagehander = require('../services/Imagehander');

async function generateBarcode(text, exist, url, res) {
    if(exist) {
        Imagehander.removeImage(url, res);
    }
    try {
        const pngBuffer = await bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: text,            // Text to encode
            scale: 3,              // Scaling factor
            height: 10,            // Bar height, in millimeters
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Align the text to center
        });

        // Define the path to save the barcode image
        const filePath = path.join('public', 'barcodes', `${text}.png`);

        // Save the image to the file system
        fs.writeFileSync(filePath, pngBuffer);

        console.log(`Barcode saved to ${filePath}`);
        return filePath;
    } catch (err) {
        console.error('Error generating barcode:', err);
        throw err;
    }
}

module.exports = generateBarcode;
