import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_LENGTH = 32; // For AES-256, this is always 32 bytes

/**
 * Generate encryption key from user data
 * Format: first 4 letters of name + user_id
 */
export const generateEncryptionKey = (name: string, userId: string): string => {
  const namePrefix = name.substring(0, 4).toLowerCase();
  return `${namePrefix}${userId}`;
};

/**
 * Generate a secure key from user data
 * This creates a 32-byte key suitable for AES-256
 */
export const generateSecureKey = (name: string, userId: string): string => {
  const baseKey = generateEncryptionKey(name, userId);
  return crypto
    .createHash("sha256")
    .update(baseKey)
    .digest("hex")
    .substring(0, KEY_LENGTH);
};

/**
 * Encrypt data using AES-256-CBC
 */
export const encryptData = (data: Buffer, key: string): Buffer => {
  try {
    // Ensure key is exactly 32 bytes
    const keyBuffer = crypto
      .createHash("sha256")
      .update(key)
      .digest()
      .slice(0, KEY_LENGTH);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher using the key and iv
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    // Encrypt the data
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    // Return iv + encrypted data
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Decrypt data using AES-256-CBC
 */
export const decryptData = (encryptedData: Buffer, key: string): Buffer => {
  try {
    // Ensure key is exactly 32 bytes
    const keyBuffer = crypto
      .createHash("sha256")
      .update(key)
      .digest()
      .slice(0, KEY_LENGTH);

    // Extract iv from the first 16 bytes
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

    // Decrypt the data
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
