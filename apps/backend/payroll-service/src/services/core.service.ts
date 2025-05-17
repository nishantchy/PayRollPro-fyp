const axios = require("axios");
import config from "../config/config";
import logger from "../utils/logger";

console.log("Core service config:", {
  url: config.coreServiceUrl,
  apiKey: config.coreServiceApiKey
    ? config.coreServiceApiKey.substring(0, 4) + "..."
    : "missing",
});

const coreServiceClient = axios.create({
  baseURL: config.coreServiceUrl,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": config.coreServiceApiKey,
  },
});

export const getUserById = async (userId: string) => {
  try {
    // Use the service API endpoint directly since we know it works
    const serviceEndpoint = `/api/service/users/${userId}`;

    logger.info(
      `Fetching user with ID: ${userId} from service API: ${config.coreServiceUrl}${serviceEndpoint}`
    );

    const response = await coreServiceClient.get(serviceEndpoint);

    // Deep inspect the response structure to find the email field
    logger.info("Service API response structure:");
    logger.info(JSON.stringify(response.data, null, 2));

    // Check if we have a valid response
    if (response.data && response.data.success && response.data.data) {
      const userData = response.data.data;
      logger.info("User data fields available:");
      logger.info(Object.keys(userData).join(", "));

      // Process the name field - API returns "name" not first_name/last_name
      if (userData.name && !userData.first_name) {
        const nameParts = userData.name.split(" ");
        userData.first_name = nameParts[0] || "Employee";
        userData.last_name = nameParts.slice(1).join(" ") || "";
        logger.info(
          `Extracted name from 'name' field: ${userData.first_name} ${userData.last_name}`
        );
      }

      logger.info(`User email from API: ${userData.email || "NO EMAIL FOUND"}`);
      return userData;
    }

    throw new Error("Invalid response format from core service");
  } catch (error: any) {
    logger.error("Error fetching user data:", error.message);
    logger.error("Status code:", error.response?.status);
    logger.error("Response data:", error.response?.data);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed when connecting to core service");
    } else if (error.response?.status === 404) {
      throw new Error(`User with ID ${userId} not found`);
    }

    throw error;
  }
};

export const getOrganizationById = async (organizationId: string) => {
  try {
    logger.info(`Fetching organization with ID: ${organizationId}`);
    const response = await coreServiceClient.get(
      `/api/service/organization/${organizationId}`
    );
    logger.debug("Organization response:", response.data);

    // Make sure we return the actual organization data from the response
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid response format from core service");
  } catch (error: any) {
    logger.error(
      "Error fetching organization from core service:",
      error.message
    );
    logger.error("Status:", error.response?.status);
    logger.error("Response data:", error.response?.data);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed when connecting to core service");
    } else if (error.response?.status === 404) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    throw error;
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    logger.info(`Fetching customer with ID: ${customerId}`);
    const response = await coreServiceClient.get(
      `/api/service/customer/${customerId}`
    );
    logger.debug("Customer response:", response.data);

    // Make sure we return the actual customer data from the response
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid response format from core service");
  } catch (error: any) {
    logger.error("Error fetching customer from core service:", error.message);
    logger.error("Status:", error.response?.status);
    logger.error("Response data:", error.response?.data);

    if (error.response?.status === 401) {
      throw new Error("Authentication failed when connecting to core service");
    } else if (error.response?.status === 404) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    throw error;
  }
};

export const validateUserBelongsToOrg = async (
  userId: string,
  organizationId: string
) => {
  try {
    logger.info(
      `Validating user ${userId} belongs to organization ${organizationId}`
    );
    const response = await coreServiceClient.get(
      `/api/service/organization/${organizationId}/users/${userId}`
    );
    logger.debug("Validation response:", response.data);

    // Return whether the validation was successful
    return response.data && response.data.success;
  } catch (error: any) {
    logger.error(
      "Error validating user organization membership:",
      error.message
    );
    logger.error("Status:", error.response?.status);
    logger.error("Response data:", error.response?.data);

    // If we get a 404, it means the user doesn't belong to the org
    if (error.response?.status === 404) {
      return false;
    }

    throw error;
  }
};

export default {
  getUserById,
  getOrganizationById,
  getCustomerById,
  validateUserBelongsToOrg,
};
