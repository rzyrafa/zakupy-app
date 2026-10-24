import * as SecureStore from 'expo-secure-store';

const DEEPSEEK_KEY = 'deepseek_api_key';

export function getDeepSeekKey() {
  return SecureStore.getItemAsync(DEEPSEEK_KEY);
}

export function setDeepSeekKey(key: string) {
  return SecureStore.setItemAsync(DEEPSEEK_KEY, key);
}

export function deleteDeepSeekKey() {
  return SecureStore.deleteItemAsync(DEEPSEEK_KEY);
}
