const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const { PNG } = require('pngjs');
const fs = require('fs');
const cors = require('cors');

const app = express();
const url = "YOUR OPENAI API URL";

app.use(express.json());
app.use(cors());

/**
 * 取得 ai 生成的照片
 * request: query, keyword: 想產的圖片關鍵字, imgCount: 圖片數量
 */
app.get('/getAiImage', (req, res) => {
  const { keyword, imgCount } = req.query;
  const prompt = keyword ? keyword : 'puppy dog';
	const batch_size = imgCount ? imgCount : 1;

  const payload = {
    prompt,
		batch_size
  };

	// 打 fast api 取得圖片
  axios
    .post(`${url}/sdapi/v1/txt2img`, payload)
    .then(response => {
      const r = response.data;
			let images = [];
      const promises = r.images.map((i, index) => {
				// 回傳的圖片格式是 base64
        const base64Data = i.split(',')[0];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        return loadImage(imageBuffer).then(image => {
          const canvas = createCanvas(image.width, image.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);

          const outputPath = `${index}.png`;
          const outputStream = fs.createWriteStream(outputPath);
          outputStream.on('finish', () => {
            console.log(`${outputPath} saved.`);
          });
          canvas.createPNGStream().pipe(outputStream);
					images.push(canvas.toDataURL('image/png'))
        });
      });

      Promise.all(promises)
        .then(pngInfos => {
          res.json(images);
        })
        .catch(error => {
          console.error('Error:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

const port = 5000;
app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});