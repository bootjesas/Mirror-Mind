import fs from 'fs';

export default function handler(req, res) {
  const { image } = req.body;
  // Strip de data URL header van de image data
  const imageData = image.replace(/^data:image\/\w+;base64,/, '');
  // Decodeer de image data naar een buffer
  const buffer = Buffer.from(imageData, 'base64');
  // Schrijf de buffer naar een bestand in de public folder
  fs.writeFile('public/captured-image.png', buffer, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: 'Image saved successfully.' });
    }
  });
}
