# TikTok Video Downloader
<div>
  <img src="https://learnlangs24h.s3.ap-southeast-2.amazonaws.com/uploads/hn2TE09zWii42WI3Qv92V.webp"    alt="Tiktok Downloader"/>
</div>

A simple application that allows users to download TikTok videos using a web server and a mobile app built with React Native. The server fetches the video from TikTok and serves it to the mobile app, which allows users to save the video to their device.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Technologies Used](#technologies-used)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Mobile App](#mobile-app)
- [Contributing](#contributing)
- [License](#license)

## Features

- Download TikTok videos by providing the video URL.
- Save downloaded videos to the device's media library.
- User-friendly interface for easy interaction.
- Automatically cleans up downloaded files after a specified time.

## Technologies Used

- **Server**: Node.js, Express, Node-fetch, dotenv
- **Mobile App**: React Native, Expo, Axios
- **Database**: None (files are stored temporarily on the server)
- **Version Control**: Git

## Installation

### Server

1. Clone the repository:
    ```bash
    git clone https://github.com/DVHcoding/tiktok-video-downloader.git
    cd tiktok-video-downloader/server
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the `server` directory and add the following:
    ```plaintext
    PORT=3000
    HOST=http://localhost:3000
    ```

4. Start the server:
    ```bash
    npm start
    ```

### Mobile App

1. Navigate to the mobile app directory:
    ```bash
    cd tiktok-video-downloader/mobile-app
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the Expo project:
    ```bash
    expo start
    ```

## Usage

1. Open the mobile app on your device or emulator.
2. Enter the TikTok video URL in the input field.
3. Press the "Download TikTok Video" button to initiate the download.
4. The video will be saved to your device's media library.

## API Endpoints

### `GET /download-tiktok`

- **Query Parameters**:
  - `url`: The TikTok video URL to download.
  
- **Response**:
  - On success:
    ```json
    {
      "success": true,
      "message": "Video đã sẵn sàng",
      "videoUrl": "http://yourserver/downloads/tiktok_video_1234567890.mp4"
    }
    ```
  
  - On error:
    ```json
    {
      "error": "Vui lòng cung cấp URL TikTok"
    }
    ```

## Mobile App

The mobile app is built using React Native and Expo. It allows users to input a TikTok video URL, request the video download, and save it to their device. The app also includes a feature to paste the URL from the clipboard.

### Key Components

- **TextInput**: For entering the TikTok video URL.
- **Button**: To trigger the download process.
- **Alert**: To notify users of success or error messages.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
