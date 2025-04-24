
/**
 * Network utility functions for file operations
 */

/**
 * Checks if a string is a valid URL
 */
export const isValidUrl = (string: string | null): boolean => {
  if (!string) return false;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Creates a network path with authentication if provided
 */
export const createAuthenticatedPath = (
  basePath: string, 
  username?: string, 
  password?: string
): string => {
  if (!isValidUrl(basePath)) return basePath;
  
  try {
    const url = new URL(basePath);
    
    // Add credentials if provided
    if (username) {
      url.username = encodeURIComponent(username);
      if (password) {
        url.password = encodeURIComponent(password);
      }
    }
    
    return url.toString();
  } catch (error) {
    console.error("Error creating authenticated path:", error);
    return basePath;
  }
};

/**
 * Handles network file operations with better error handling
 */
export const syncWithNetwork = async (
  url: string,
  data?: any,
  method: string = 'GET'
): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (!isValidUrl(url)) {
    return { 
      success: false, 
      error: "O caminho fornecido não é uma URL válida" 
    };
  }

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'PUT' || method === 'POST')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Erro na resposta do servidor: ${response.status} ${response.statusText}` 
      };
    }

    if (method === 'GET') {
      const responseData = await response.json();
      return { success: true, data: responseData };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na operação de rede:", error);
    return { 
      success: false, 
      error: `Falha na conexão com ${url}: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Ensures a file exists on the network path, creating it if it doesn't
 */
export const ensureNetworkFileExists = async (
  url: string,
  defaultContent: any
): Promise<boolean> => {
  try {
    // Check if file exists by trying to GET it
    const checkResult = await syncWithNetwork(url);
    
    if (!checkResult.success) {
      // File doesn't exist, create it
      const createResult = await syncWithNetwork(url, defaultContent, 'PUT');
      return createResult.success;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar arquivo na rede:", error);
    return false;
  }
};

