import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const imagesDir = () => new Directory(Paths.document, 'recipe-images');

/** Otwiera galerię albo aparat. Zwraca tymczasowe URI zdjęcia lub null, gdy anulowano. */
export async function pickImage(source: 'library' | 'camera'): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  };

  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Brak dostępu', 'Zezwól aplikacji na użycie aparatu w ustawieniach telefonu.');
      return null;
    }
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  return result.canceled ? null : result.assets[0].uri;
}

export function isPersistedImage(uri: string) {
  return uri.startsWith(imagesDir().uri);
}

/** Kopiuje zdjęcie z cache pickera do stałego katalogu aplikacji i zwraca nowe URI. */
export async function persistImage(uri: string): Promise<string> {
  if (isPersistedImage(uri)) return uri;

  const dir = imagesDir();
  dir.create({ intermediates: true, idempotent: true });

  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const target = new File(dir, `${Date.now()}.${ext}`);
  await new File(uri).copy(target);
  return target.uri;
}

export function deleteImage(uri: string | null | undefined) {
  if (!uri || !isPersistedImage(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // brak pliku nie jest problemem
  }
}
