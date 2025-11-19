import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

const cacheDir = FileSystem.cacheDirectory + 'images/';

export const getCachedImage = async (uri) => {
  const filename = uri.split('/').pop();
  const path = cacheDir + filename;

  const info = await FileSystem.getInfoAsync(path);
  
  if (info.exists) {
    return path;
  }

  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  await FileSystem.downloadAsync(uri, path);
  
  return path;
};

export const preloadImages = (images) => {
  return Promise.all(
    images.map(image => Image.prefetch(image))
  );
};
