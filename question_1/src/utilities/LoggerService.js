/**
 * Custom logging middleware for URL shortener application
 * Provides enhanced logging capabilities with timestamping and categorization
 * This service helps track user actions, API calls, errors, and component lifecycle events
 */

// Main class that handles all logging functionality in the application
class LoggingHandler {
  constructor() {
    // Control whether logging is enabled or disabled
    this.enableLogging = true;
    // Prefix that appears in all log messages to identify our app
    this.loggerIdentifier = '[UrlShortener]';
  }

  // Core logging method that formats and outputs messages with timestamps
  writeLogEntry(messageContent, severity = 'info') {
    // Exit early if logging is disabled
    if (!this.enableLogging) return;
    
    // Create timestamp in ISO format for consistent logging
    const timestampValue = new Date().toISOString();
    // Format the complete log message with prefix, timestamp, severity, and content
    const formattedMessage = `${this.loggerIdentifier} [${timestampValue}] [${severity.toUpperCase()}]: ${messageContent}`;
    
    // Use different console methods based on severity level for better filtering
    switch (severity) {
      case 'error':
        // Red text in most browsers, shows in error console
        console.error(formattedMessage);
        break;
      case 'warn':
        // Yellow text in most browsers, shows in warning console
        console.warn(formattedMessage);
        break;
      case 'debug':
        // Debug level logging, can be filtered out in production
        console.debug(formattedMessage);
        break;
      default:
        // Standard info logging with normal console output
        console.log(formattedMessage);
    }
  }

  // Helper method for logging general information messages
  logInformation(messageText) {
    this.writeLogEntry(messageText, 'info');
  }

  // Helper method for logging error messages with error severity
  logErrorEvent(errorMessage) {
    this.writeLogEntry(errorMessage, 'error');
  }

  // Helper method for logging warning messages
  logWarningEvent(warningMessage) {
    this.writeLogEntry(warningMessage, 'warn');
  }

  // Helper method for logging debug information (development only)
  logDebugInfo(debugMessage) {
    this.writeLogEntry(debugMessage, 'debug');
  }

  // Specialized method for logging outgoing API requests
  logApiRequest(methodType, endpointUrl, requestPayload = null) {
    // Create descriptive message about the API request being made
    const requestInfo = `${methodType} ${endpointUrl}${requestPayload ? ' with payload' : ''}`;
    this.logInformation(`API Request: ${requestInfo}`);
  }

  // Specialized method for logging API responses and performance
  logApiResponse(statusCode, endpointUrl, responseTime = null) {
    // Create descriptive message about the API response received
    const responseInfo = `${endpointUrl} returned ${statusCode}${responseTime ? ` in ${responseTime}ms` : ''}`;
    this.logInformation(`API Response: ${responseInfo}`);
  }

  // Log when React components are mounted (loaded on screen)
  logComponentMount(componentName) {
    this.logDebugInfo(`Component mounted: ${componentName}`);
  }

  // Log when React components are unmounted (removed from screen)
  logComponentUnmount(componentName) {
    this.logDebugInfo(`Component unmounted: ${componentName}`);
  }
}

// Create a single instance of the logger that will be shared across the entire app
// This singleton pattern ensures consistent logging throughout the application
const loggingService = new LoggingHandler();

// Export the logger instance so other files can import and use it
export default loggingService;
