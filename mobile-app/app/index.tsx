import React, { useState } from "react";
import {
  Alert,
  Button,
  Clipboard,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system"; // Thay RNFS bằng Expo FileSystem
import * as Permissions from "expo-permissions"; // Xin quyền trên iOS
import * as MediaLibrary from "expo-media-library"; // Lưu vào thư viện ảnh/video
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"


const Index = () => {
  const [url, setUrl] = useState(""); // State lưu đường link người dùng nhập
  const [loading, setLoading] = useState(false); // State theo dõi trạng thái đang tải
  // Hàm xin quyền lưu vào thư viện media
  const requestPermission = async () => {
    if (Platform.OS === "ios") {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      return status === "granted";
    } else {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === "granted";
    }
  };
  // Hàm tải video
  const downloadVideo = async () => {
    if (!url) {
      Alert.alert("Vui lòng nhập đường link");
      return;
    }
    try {
      setLoading(true);
      const apiUrl = `http://${process.env.EXPO_PUBLIC_SERVER_URL}/download-tiktok?url=${url}`;
      // const apiUrl = `http://192.168.43.159:3000/download-tiktok?url=${url}`;
      const { data } = await axios.get(apiUrl);
      if (!data || !data.videoUrl) {
        setLoading(false);
        return;
      }
      // Xin quyền lưu trữ
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert("Không có quyền truy cập thư viện!");
        setLoading(false); // Tắt chế độ tải
        return;
      }
      // Đường dẫn tạm thời để lưu file
      const fileName = `tiktok_video_${Date.now()}.mp4`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      // Tải file từ URL về thiết bị
      const downloadResult = await FileSystem.downloadAsync(
        data.videoUrl, // URL video từ API
        fileUri, // Đường dẫn lưu tạm
      );
      if (downloadResult.status === 200) {
        // Lưu file vào thư viện ảnh/video
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync("TikTok Videos", asset, false);
        Alert.alert("Thành công", "Video đã được lưu vào thư viện!");
      } else {
      }
      setLoading(false); // Tắt chế độ tải
      setUrl("");
    } catch (error: any) {
      console.error(error);
      setLoading(false); // Tắt chế độ tải
      Alert.alert("Có lỗi xảy ra!");
    }
  };
  // Hàm để lấy nội dung từ clipboard
  const pasteFromClipboard = async () => {
    const clipboardContent = await Clipboard.getString();
    setUrl(clipboardContent); // Đặt nội dung clipboard vào TextInput
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        style={{
          height: 50,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 8,
          paddingLeft: 20,
          paddingRight: 20,
          fontSize: 16,
          backgroundColor: "#f5f5f5",
          width: "90%",
          marginBottom: 20,
          shadowColor: "#000", // Shadow for iOS
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5, // Shadow for Android
        }}
        placeholder="Nhập đường link video TikTok"
        value={url}
        onChangeText={setUrl}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Button
          title={loading ? "Đang tải..." : "Tải video TikTok"}
          onPress={downloadVideo}
          disabled={loading}
        />
        <TouchableOpacity onPress={pasteFromClipboard} disabled={loading}>
          <View
            style={{
              backgroundColor: "#4CAF50",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 3,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Paste</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "90%",
          marginTop: 20,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 14, color: "#666" }}>Powerful by Fluentez 🔥</Text>

        <TouchableOpacity
          onPress={() => Linking.openURL("https://github.com/DVHcoding")}
        >
          <Ionicons name="logo-github" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Index;
