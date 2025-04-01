/* *
 * Use ffmpeg
 * */
import SnapTikClient from './snapTikClient.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

async function downloadAndConvertTikTokVideo() {
  const client = new SnapTikClient();
  const url = 'https://vt.tiktok.com/ZSrMyJoBd/';

  try {
    // Lấy URL video từ TikTok
    const result = await client.process(url);

    if (result.type === 'video' && result.data.sources.length > 0) {
      const videoUrl = result.data.sources[0].url;
      console.log('Video URL:', videoUrl);

      // Tạo tên file tạm thời và file đầu ra
      const tempFileName = `tiktok_temp_${Date.now()}.mp4`;
      const finalFileName = `tiktok_video_${Date.now()}.mp4`;
      const tempOutputPath = path.resolve('./', tempFileName);
      const finalOutputPath = path.resolve('./', finalFileName);

      // Bước 1: Tải video gốc
      console.log('Đang tải video...');
      const downloadCommand = `ffmpeg -i "${videoUrl}" -c copy -bsf:a aac_adtstoasc "${tempOutputPath}"`;
      await execPromise(downloadCommand);

      if (fs.existsSync(tempOutputPath)) {
        console.log(`Video gốc đã tải về: ${tempOutputPath}`);

        // Bước 2: Chuyển đổi sang H.264
        console.log('Đang chuyển đổi sang định dạng H.264 MP4...');
        const convertCommand = `ffmpeg -i "${tempOutputPath}" -c:v libx264 -preset medium -c:a aac -b:a 128k "${finalOutputPath}"`;
        const { stdout, stderr } = await execPromise(convertCommand);

        if (fs.existsSync(finalOutputPath)) {
          // Xóa file tạm sau khi chuyển đổi thành công
          fs.unlinkSync(tempOutputPath);

          console.log(`Video đã được chuyển đổi thành công: ${finalOutputPath}`);
          const stats = fs.statSync(finalOutputPath);
          console.log(`Kích thước file: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
          return finalOutputPath;
        } else {
          console.error('Không tìm thấy file sau khi chuyển đổi.');
          if (stderr) console.error('Lỗi chuyển đổi:', stderr);
        }
      } else {
        console.error('Không tìm thấy file tạm sau khi tải xuống.');
      }
    } else {
      console.log('Không thể lấy URL video từ SnapTikClient.');
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Thực thi hàm tải và chuyển đổi video
downloadAndConvertTikTokVideo();
