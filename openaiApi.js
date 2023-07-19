/* 打 openai api 的地方 */
const axios = require('axios');

const url = 'YOUR OPENAI API URL';

async function getAiImage (payload) {
	console.log("getAiImagegetAiImagegetAiImage")
		// 打 fast api 取得圖片
		try {
			const response = await axios.post(`${url}/sdapi/v1/txt2img`, payload);
			console.log("response", response.data["images"].length);
			return response.data["images"];
		} catch (error) {
			console.error('Error:', error);
			throw error;
		}
}

module.exports = {
  getAiImage
}