import fetch from 'node-fetch';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import SnapTikClient from './snapTikClient.js';
import express from "express";
import path from 'path';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Phục vụ file tĩnh từ thư mục 'downloads'
app.use('/downloads', express.static(path.join(process.cwd(), 'downloads')));

// Tạo thư mục downloads nếu chưa tồn tại
const downloadDir = './downloads';
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

app.get('/download-tiktok', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Vui lòng cung cấp URL TikTok' });
  }

  const outputPath = `${downloadDir}/tiktok_video_${Date.now()}.mp4`;
  const client = new SnapTikClient();

  try {
    const result = await client.process(url);

    if (result.type === 'video' && result.data.sources.length > 0) {
      const videoUrl = result.data.sources[0].url;

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': 'video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8',
      };

      const response = await fetch(videoUrl, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Lưu file vào thư mục downloads
      const fileStream = fs.createWriteStream(outputPath);
      await pipeline(response.body, fileStream);
      console.log(`Video đã được lưu tại: ${outputPath}`);

      // Tạo URL công khai cho file
      const publicUrl = `http://${process.env.HOST}:${port}/downloads/${path.basename(outputPath)}`;

      res.status(200).json({
        success: true,
        message: "Video đã sẵn sàng",
        videoUrl: publicUrl,
      });

      // Xóa file sau 1 phút (60 giây)
      setTimeout(() => {
        fs.unlink(outputPath, (err) => {
          if (err) {
            console.error(`Lỗi khi xóa file ${outputPath}:`, err);
          } else {
            console.log(`Đã xóa file sau 1 phút: ${outputPath}`);
          }
        });
      }, 60 * 1000); // 60 giây = 60000 ms
    } else {
      res.status(400).json({ error: 'Không tìm thấy video' });
    }
  } catch (error) {
    console.error('Lỗi:', error);
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`Đã xóa file lỗi: ${outputPath}`);
    }
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});



