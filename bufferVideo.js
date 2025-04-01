import fetch from 'node-fetch';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import SnapTikClient from './snapTikClient.js';
import express from "express";
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

// Tạo thư mục tạm nếu cần
const tempDir = './temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.get('/download-tiktok', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Vui lòng cung cấp URL TikTok' });
  }

  const tempPath = `${tempDir}/tiktok_video_${Date.now()}.mp4`;
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

      // Lưu tạm file để stream
      const fileStream = fs.createWriteStream(tempPath);
      await pipeline(response.body, fileStream);
      console.log(`Video tạm lưu tại: ${tempPath}`);

      // Gửi file trực tiếp tới client
      res.download(tempPath, path.basename(tempPath), (err) => {
        if (err) {
          console.error('Lỗi khi gửi file:', err);
        }
        // Xóa file sau khi gửi xong
        fs.unlink(tempPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Lỗi khi xóa file ${tempPath}:`, unlinkErr);
          } else {
            console.log(`Đã xóa file: ${tempPath}`);
          }
        });
      });
    } else {
      res.status(400).json({ error: 'Không tìm thấy video' });
    }
  } catch (error) {
    console.error('Lỗi:', error);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log(`Đã xóa file lỗi: ${tempPath}`);
    }
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});

