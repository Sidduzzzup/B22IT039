// Import React hooks for managing component state and lifecycle
import React, { useState, useEffect } from 'react';
// Import Material UI components for building the user interface
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
// Import Material UI icons for visual elements
import {
  Link as LinkIcon,
  ContentCopy,
  Schedule,
  Send
} from '@mui/icons-material';
// Import axios library for making HTTP requests to the backend
import axios from 'axios';
// Import custom logging service for tracking user actions and errors
import loggingService from '../utilities/LoggerService';

// Main component for URL shortening functionality
const UrlShortenerInterface = () => {
  // State variables to manage form inputs and component behavior
  const [originalUrlInput, setOriginalUrlInput] = useState(''); // Stores the long URL entered by user
  const [customShortcodeValue, setCustomShortcodeValue] = useState(''); // Optional custom shortcode
  const [validityDurationMinutes, setValidityDurationMinutes] = useState(30); // How long the short URL should be valid
  const [generatedShortLink, setGeneratedShortLink] = useState(''); // The generated short URL result
  const [linkExpirationTime, setLinkExpirationTime] = useState(''); // When the short URL will expire
  const [alertMessage, setAlertMessage] = useState(''); // Message to show in notification alerts
  const [alertSeverity, setAlertSeverity] = useState('info'); // Type of alert (success, error, warning, info)
  const [isProcessingRequest, setIsProcessingRequest] = useState(false); // Loading state for API calls
  const [showAlertBox, setShowAlertBox] = useState(false); // Whether to display the alert notification
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false); // Track if URL was copied successfully

  // Component lifecycle hook that runs when component mounts and unmounts
  useEffect(() => {
    // Log when component is first loaded
    loggingService.logComponentMount('UrlShortenerInterface');
    return () => {
      // Log when component is removed from the page
      loggingService.logComponentUnmount('UrlShortenerInterface');
    };
  }, []);

  // Function to check if a URL has proper format with http or https protocol
  const validateUrlFormat = (urlString) => {
    try {
      // Try to create a URL object to validate the format
      const urlPattern = new URL(urlString);
      // Return true only if URL starts with http:// or https://
      return urlPattern.protocol === 'http:' || urlPattern.protocol === 'https:';
    } catch (errorInstance) {
      // If URL parsing fails, return false
      return false;
    }
  };

  // Helper function to show notification messages to the user
  const displayNotificationMessage = (messageText, severityLevel) => {
    setAlertMessage(messageText); // Set the message content
    setAlertSeverity(severityLevel); // Set the alert type (error, success, etc.)
    setShowAlertBox(true); // Make the alert visible
    // Log the notification for debugging purposes
    loggingService.logInformation(`Notification displayed: ${messageText}`);
  };

  // Main function that handles the URL shortening process
  const processUrlShorteningRequest = async () => {
    // Log the start of the shortening process
    loggingService.logInformation('Starting URL shortening process');
    
    // Validate that user entered a URL
    if (!originalUrlInput.trim()) {
      displayNotificationMessage('Please enter a valid URL to shorten', 'error');
      return; // Stop execution if no URL provided
    }

    // Check if the URL format is valid
    if (!validateUrlFormat(originalUrlInput)) {
      displayNotificationMessage('Invalid URL format. Please include http:// or https://', 'error');
      return; // Stop execution if URL format is invalid
    }

    // Ensure validity duration is at least 1 minute
    if (validityDurationMinutes < 1) {
      displayNotificationMessage('Validity duration must be at least 1 minute', 'error');
      return; // Stop execution if duration is too short
    }

    // Show loading state and hide any previous alerts
    setIsProcessingRequest(true);
    setShowAlertBox(false);

    try {
      // Prepare data to send to the backend API
      const requestPayload = {
        originalUrl: originalUrlInput.trim(), // Clean up whitespace from URL
        validityMinutes: validityDurationMinutes, // How long URL should be valid
        // Only include custom shortcode if user provided one
        ...(customShortcodeValue.trim() && { customCode: customShortcodeValue.trim() })
      };

      // Log the API request details
      loggingService.logApiRequest('POST', '/shorturls', requestPayload);
      const requestStartTime = Date.now(); // Track request timing

      // Send POST request to backend to create short URL
      const apiResponse = await axios.post('http://localhost:5000/shorturls', requestPayload);
      
      // Calculate how long the request took
      const requestDuration = Date.now() - requestStartTime;
      loggingService.logApiResponse(apiResponse.status, '/shorturls', requestDuration);

      // Check if we got a valid response with short URL
      if (apiResponse.data && apiResponse.data.shortUrl) {
        setGeneratedShortLink(apiResponse.data.shortUrl); // Store the generated short URL
        
        // Calculate when the short URL will expire
        const currentTime = new Date();
        const expirationTime = new Date(currentTime.getTime() + (validityDurationMinutes * 60000));
        setLinkExpirationTime(expirationTime.toLocaleString()); // Format expiration time for display
        
        // Show success message to user
        displayNotificationMessage('URL shortened successfully!', 'success');
        // Log successful URL creation
        loggingService.logInformation(`URL shortened: ${originalUrlInput} -> ${apiResponse.data.shortUrl}`);
      } else {
        // If response doesn't contain expected data, throw error
        throw new Error('Invalid response format from server');
      }

    } catch (errorInstance) {
      // Log any errors that occurred during the process
      loggingService.logErrorEvent(`URL shortening failed: ${errorInstance.message}`);
      
      // Handle different types of errors
      if (errorInstance.response) {
        // Server responded with an error status
        const statusCode = errorInstance.response.status;
        const errorMessage = errorInstance.response.data?.message || 'Server error occurred';
        displayNotificationMessage(`Error ${statusCode}: ${errorMessage}`, 'error');
      } else if (errorInstance.request) {
        // Network error - no response received
        displayNotificationMessage('Network error. Please check your connection.', 'error');
      } else {
        // Other unexpected errors
        displayNotificationMessage('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      // Always hide loading state when request completes
      setIsProcessingRequest(false);
    }
  };

  // Function to copy the generated short URL to user's clipboard
  const copyLinkToClipboard = async () => {
    try {
      // Use browser's clipboard API to copy the short URL
      await navigator.clipboard.writeText(generatedShortLink);
      setIsCopiedToClipboard(true); // Show that copy was successful
      displayNotificationMessage('Short URL copied to clipboard!', 'info');
      
      // Reset the "copied" indicator after 2 seconds
      setTimeout(() => {
        setIsCopiedToClipboard(false);
      }, 2000);
      
      // Log successful clipboard operation
      loggingService.logInformation('Short URL copied to clipboard');
    } catch (errorInstance) {
      // Log and show error if clipboard operation fails
      loggingService.logErrorEvent(`Failed to copy to clipboard: ${errorInstance.message}`);
      displayNotificationMessage('Failed to copy to clipboard', 'error');
    }
  };

  // Function to reset all form fields to their default values
  const clearFormInputs = () => {
    setOriginalUrlInput(''); // Clear the URL input field
    setCustomShortcodeValue(''); // Clear custom shortcode field
    setValidityDurationMinutes(30); // Reset validity to default 30 minutes
    setGeneratedShortLink(''); // Clear any generated short URL
    setLinkExpirationTime(''); // Clear expiration time
    setShowAlertBox(false); // Hide any alert messages
    loggingService.logInformation('Form inputs cleared'); // Log the form reset
  };

  return (
    // Main container that centers content and adds padding
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Paper component creates elevated card-like appearance */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header section with icon and title */}
        <Box display="flex" alignItems="center" mb={3}>
          <LinkIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
            URL Shortener Service
          </Typography>
        </Box>

        {/* Alert notification that shows success/error messages */}
        {showAlertBox && (
          <Alert 
            severity={alertSeverity} 
            sx={{ mb: 3 }}
            onClose={() => setShowAlertBox(false)}
          >
            {alertMessage}
          </Alert>
        )}

        {/* Main form for URL shortening */}
        <Box component="form" sx={{ mb: 4 }}>
          {/* Text field for entering the long URL to be shortened */}
          <TextField
            fullWidth
            label="Enter URL to shorten"
            variant="outlined"
            value={originalUrlInput}
            onChange={(event) => setOriginalUrlInput(event.target.value)}
            placeholder="https://example.com/very-long-url"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Row with custom shortcode and validity duration inputs */}
          <Box display="flex" gap={2} mb={3}>
            {/* Optional custom shortcode input field */}
            <TextField
              label="Custom shortcode (optional)"
              variant="outlined"
              value={customShortcodeValue}
              onChange={(event) => setCustomShortcodeValue(event.target.value)}
              placeholder="my-link"
              sx={{ flex: 1 }}
            />

            {/* Number input for setting how long the short URL should be valid */}
            <TextField
              label="Validity (minutes)"
              type="number"
              variant="outlined"
              value={validityDurationMinutes}
              onChange={(event) => setValidityDurationMinutes(parseInt(event.target.value) || 30)}
              inputProps={{ min: 1, max: 10080 }} // 1 minute to 1 week maximum
              sx={{ width: 200 }}
              InputProps={{
                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          {/* Action buttons for submitting form or clearing inputs */}
          <Box display="flex" gap={2}>
            {/* Main button to create the short URL */}
            <Button
              variant="contained"
              size="large"
              onClick={processUrlShorteningRequest}
              disabled={isProcessingRequest} // Disable while processing
              startIcon={isProcessingRequest ? <CircularProgress size={20} /> : <Send />}
              sx={{ minWidth: 160 }}
            >
              {isProcessingRequest ? 'Processing...' : 'Shorten URL'}
            </Button>

            {/* Button to reset the form */}
            <Button
              variant="outlined"
              size="large"
              onClick={clearFormInputs}
              disabled={isProcessingRequest} // Disable while processing
            >
              Clear Form
            </Button>
          </Box>
        </Box>

        {/* Results section that appears after successful URL shortening */}
        {generatedShortLink && (
          <>
            <Divider sx={{ my: 3 }} />
            {/* Card to display the generated short URL and expiration info */}
            <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Shortened URL Generated
                </Typography>
                
                {/* Row with the short URL and copy button */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {/* Read-only text field showing the generated short URL */}
                  <TextField
                    fullWidth
                    value={generatedShortLink}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace' } // Monospace font for URLs
                    }}
                  />
                  
                  {/* Copy to clipboard button with tooltip */}
                  <Tooltip title={isCopiedToClipboard ? 'Copied!' : 'Copy to clipboard'}>
                    <IconButton 
                      onClick={copyLinkToClipboard}
                      color={isCopiedToClipboard ? 'success' : 'primary'}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Chip showing when the short URL will expire */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    icon={<Schedule />}
                    label={`Expires: ${linkExpirationTime}`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Paper>
    </Container>
  );
};

// Export the component so it can be imported and used in other files
export default UrlShortenerInterface;
