/**
 * Decode a JWT token without verification
 * This is useful for debugging token issues
 */
export const decodeJwt = (token: string) => {
  try {
    // Split the token into its three parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    if (!payload) {
      throw new Error("Invalid token: payload is missing");
    }

    // Base64Url decode
    const decoded = Buffer.from(payload, "base64").toString("utf8");

    // Parse the JSON
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};
