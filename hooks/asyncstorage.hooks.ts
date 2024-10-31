import AsyncStorage from "@react-native-async-storage/async-storage";

export async function checkLocalStorage(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // Value found, parse if needed
      console.log("Stored value:", JSON.parse(value));
    } else {
      // No value found for the key
      console.log("No value found for this key");
    }
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
  }
}

// Example usage
// checkLocalStorage("notification_prefereces");

export async function getAllKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("Keys in AsyncStorage:", keys);
  } catch (error) {
    console.error("Error fetching keys from AsyncStorage:", error);
  }
}

// Example usage
// getAllKeys();

export async function clearStorage() {
  try {
    await AsyncStorage.clear();
    console.log("Storage cleared");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
}

// Example usage
//clearStorage() 

