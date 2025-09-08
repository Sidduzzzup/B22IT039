// Import React hooks for managing component state and lifecycle
import React, { useState, useEffect } from 'react';
// Import Material UI components for building the analytics dashboard
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider
} from '@mui/material';
// Import Material UI icons for visual elements in the analytics page
import {
  Analytics,
  Search,
  Link as LinkIcon,
  AccessTime,
  Mouse,
  Language,
  Visibility,
  Timeline
} from '@mui/icons-material';
// Import axios library for making HTTP requests to fetch analytics data
import axios from 'axios';
// Import custom logging service for tracking user actions and errors
import loggingService from '../utilities/LoggerService';

// Main component for displaying URL analytics and statistics
const UrlAnalyticsInterface = () => {
  // State variables to manage analytics data and component behavior
  const [shortcodeQuery, setShortcodeQuery] = useState(''); // The shortcode entered by user to search for
  const [analyticsData, setAnalyticsData] = useState(null); // Complete analytics data from backend
  const [alertNotification, setAlertNotification] = useState(''); // Message to show in notification alerts
  const [notificationSeverity, setNotificationSeverity] = useState('info'); // Type of alert (success, error, warning, info)
  const [isLoadingData, setIsLoadingData] = useState(false); // Loading state for API calls
  const [displayAlert, setDisplayAlert] = useState(false); // Whether to show the alert notification
  const [clickHistoryEntries, setClickHistoryEntries] = useState([]); // Array of individual click records

  // Component lifecycle hook that runs when component mounts and unmounts
  useEffect(() => {
    // Log when analytics component is first loaded
    loggingService.logComponentMount('UrlAnalyticsInterface');
    return () => {
      // Log when component is removed from the page
      loggingService.logComponentUnmount('UrlAnalyticsInterface');
    };
  }, []);

  // Helper function to show notification messages to the user
  const showNotificationMessage = (messageContent, severityLevel) => {
    setAlertNotification(messageContent); // Set the message content
    setNotificationSeverity(severityLevel); // Set the alert type (error, success, etc.)
    setDisplayAlert(true); // Make the alert visible
    // Log the notification for debugging purposes
    loggingService.logInformation(`Analytics notification: ${messageContent}`);
  };

  // Main function that fetches analytics data from the backend
  const retrieveUrlStatistics = async () => {
    // Validate that user entered a shortcode to search for
    if (!shortcodeQuery.trim()) {
      showNotificationMessage('Please enter a shortcode to analyze', 'error');
      return; // Stop execution if no shortcode provided
    }

    // Log the start of analytics data retrieval
    loggingService.logInformation(`Fetching analytics for shortcode: ${shortcodeQuery}`);
    setIsLoadingData(true); // Show loading state
    setDisplayAlert(false); // Hide any previous alerts

    try {
      // Track API request timing for performance monitoring
      const requestStartTime = Date.now();
      loggingService.logApiRequest('GET', `/shorturls/${shortcodeQuery}`);

      // Send GET request to backend to fetch analytics data for the shortcode
      const analyticsResponse = await axios.get(`http://localhost:5000/shorturls/${shortcodeQuery}`);
      
      // Calculate how long the request took
      const requestDuration = Date.now() - requestStartTime;
      loggingService.logApiResponse(analyticsResponse.status, `/shorturls/${shortcodeQuery}`, requestDuration);

      // Check if we got valid analytics data from the server
      if (analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data); // Store the complete analytics data
        setClickHistoryEntries(analyticsResponse.data.clickHistory || []); // Extract click history array
        showNotificationMessage('Analytics data loaded successfully!', 'success');
        // Log successful data retrieval
        loggingService.logInformation(`Analytics retrieved for: ${shortcodeQuery}`);
      } else {
        // If response doesn't contain expected data, throw error
        throw new Error('No data received from server');
      }

    } catch (errorInstance) {
      // Log any errors that occurred during analytics retrieval
      loggingService.logErrorEvent(`Analytics retrieval failed: ${errorInstance.message}`);
      
      // Handle different types of errors with specific messages
      if (errorInstance.response) {
        // Server responded with an error status
        const statusCode = errorInstance.response.status;
        if (statusCode === 404) {
          // Shortcode doesn't exist in database
          showNotificationMessage('Shortcode not found. Please check the URL.', 'error');
        } else if (statusCode === 410) {
          // Short URL has expired
          showNotificationMessage('This short URL has expired.', 'warning');
        } else {
          // Other server errors
          const errorMessage = errorInstance.response.data?.message || 'Server error occurred';
          showNotificationMessage(`Error ${statusCode}: ${errorMessage}`, 'error');
        }
      } else if (errorInstance.request) {
        // Network error - no response received
        showNotificationMessage('Network connection failed. Please try again.', 'error');
      } else {
        // Other unexpected errors
        showNotificationMessage('Unexpected error occurred while fetching data.', 'error');
      }
      
      // Clear any previous analytics data on error
      setAnalyticsData(null);
      setClickHistoryEntries([]);
    } finally {
      // Always hide loading state when request completes
      setIsLoadingData(false);
    }
  };

  // Utility function to format timestamps for user-friendly display
  const formatTimestampDisplay = (timestampValue) => {
    if (!timestampValue) return 'N/A'; // Handle missing timestamps
    try {
      // Convert timestamp to Date object and format for display
      const dateObject = new Date(timestampValue);
      return dateObject.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (errorInstance) {
      // Log and handle date formatting errors
      loggingService.logErrorEvent(`Date formatting error: ${errorInstance.message}`);
      return 'Invalid Date';
    }
  };

  // Function to calculate and display time remaining until URL expires
  const calculateRemainingTime = (expirationTimestamp) => {
    if (!expirationTimestamp) return 'Unknown'; // Handle missing expiration data
    
    try {
      const currentTime = new Date(); // Get current time
      const expiryTime = new Date(expirationTimestamp); // Parse expiration time
      const timeDifference = expiryTime - currentTime; // Calculate difference in milliseconds
      
      // Check if URL has already expired
      if (timeDifference <= 0) {
        return 'Expired';
      }
      
      // Convert milliseconds to hours and minutes for display
      const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format the time remaining message
      if (hoursRemaining > 0) {
        return `${hoursRemaining}h ${minutesRemaining}m remaining`;
      } else {
        return `${minutesRemaining}m remaining`;
      }
    } catch (errorInstance) {
      // Log and handle time calculation errors
      loggingService.logErrorEvent(`Time calculation error: ${errorInstance.message}`);
      return 'Calculation Error';
    }
  };

  // Function to reset the analytics view and clear all data
  const resetAnalyticsView = () => {
    setShortcodeQuery(''); // Clear the search input
    setAnalyticsData(null); // Clear analytics data
    setClickHistoryEntries([]); // Clear click history
    setDisplayAlert(false); // Hide any alerts
    loggingService.logInformation('Analytics view reset'); // Log the reset action
  };

  return (
    // Main container that centers content and adds padding
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Paper component creates elevated card-like appearance */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header section with analytics icon and title */}
        <Box display="flex" alignItems="center" mb={3}>
          <Analytics color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
            URL Analytics Dashboard
          </Typography>
        </Box>

        {/* Alert notification that shows success/error messages */}
        {displayAlert && (
          <Alert 
            severity={notificationSeverity} 
            sx={{ mb: 3 }}
            onClose={() => setDisplayAlert(false)}
          >
            {alertNotification}
          </Alert>
        )}

        {/* Search form for entering shortcode to analyze */}
        <Box display="flex" gap={2} mb={4}>
          {/* Text field for entering the shortcode to search for */}
          <TextField
            fullWidth
            label="Enter shortcode to analyze"
            variant="outlined"
            value={shortcodeQuery}
            onChange={(event) => setShortcodeQuery(event.target.value)}
            placeholder="abc123"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          {/* Button to fetch analytics data */}
          <Button
            variant="contained"
            size="large"
            onClick={retrieveUrlStatistics}
            disabled={isLoadingData} // Disable while loading
            startIcon={isLoadingData ? <CircularProgress size={20} /> : <Visibility />}
            sx={{ minWidth: 160 }}
          >
            {isLoadingData ? 'Loading...' : 'Get Analytics'}
          </Button>

          {/* Button to clear the analytics view */}
          <Button
            variant="outlined"
            size="large"
            onClick={resetAnalyticsView}
            disabled={isLoadingData} // Disable while loading
          >
            Clear
          </Button>
        </Box>

        {/* Analytics results section that appears after successful data retrieval */}
        {analyticsData && (
          <>
            <Divider sx={{ my: 3 }} />
            
            {/* Grid layout for URL information and timing cards */}
            <Grid container spacing={3} mb={4}>
              {/* Left card showing URL information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      URL Information
                    </Typography>
                    
                    {/* Display the short URL */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Short URL
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {analyticsData.shortUrl || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Display the original long URL */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Original URL
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {analyticsData.originalUrl || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Display URL status (active or expired) */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip 
                        label={calculateRemainingTime(analyticsData.expiresAt) === 'Expired' ? 'Expired' : 'Active'}
                        color={calculateRemainingTime(analyticsData.expiresAt) === 'Expired' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right card showing timing information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Timing Information
                    </Typography>
                    
                    {/* Display when the short URL was created */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {formatTimestampDisplay(analyticsData.createdAt)}
                      </Typography>
                    </Box>

                    {/* Display when the short URL will expire */}
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Expires At
                      </Typography>
                      <Typography variant="body1">
                        {formatTimestampDisplay(analyticsData.expiresAt)}
                      </Typography>
                    </Box>

                    {/* Display time remaining until expiration */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Time Remaining
                      </Typography>
                      <Chip 
                        icon={<AccessTime />}
                        label={calculateRemainingTime(analyticsData.expiresAt)}
                        color={calculateRemainingTime(analyticsData.expiresAt) === 'Expired' ? 'error' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Card showing click statistics summary */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <Mouse sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Click Statistics
                </Typography>
                
                {/* Grid showing numerical statistics */}
                <Grid container spacing={2}>
                  {/* Total clicks counter */}
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h3" color="primary" fontWeight="bold">
                        {analyticsData.clickCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Clicks
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Recorded events counter */}
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h3" color="secondary" fontWeight="bold">
                        {clickHistoryEntries.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recorded Events
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table showing detailed click history if data exists */}
            {clickHistoryEntries.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Click History Details
                  </Typography>
                  
                  {/* Table container for click history data */}
                  <TableContainer>
                    <Table size="small">
                      {/* Table header with column names */}
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Timestamp</strong></TableCell>
                          <TableCell><strong>Referrer</strong></TableCell>
                          <TableCell><strong>Location</strong></TableCell>
                          <TableCell><strong>User Agent</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      {/* Table body with click history rows */}
                      <TableBody>
                        {clickHistoryEntries.map((clickEntry, entryIndex) => (
                          <TableRow key={entryIndex} hover>
                            {/* When the click occurred */}
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {formatTimestampDisplay(clickEntry.timestamp)}
                            </TableCell>
                            {/* Which website referred the user */}
                            <TableCell sx={{ wordBreak: 'break-all', maxWidth: 200 }}>
                              {clickEntry.referrer || 'Direct'}
                            </TableCell>
                            {/* User's geographic location */}
                            <TableCell>
                              {clickEntry.location || 'Unknown'}
                            </TableCell>
                            {/* User's browser information (truncated for display) */}
                            <TableCell sx={{ wordBreak: 'break-all', maxWidth: 300 }}>
                              {clickEntry.userAgent ? clickEntry.userAgent.substring(0, 50) + '...' : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Message displayed when no click history is available */}
            {clickHistoryEntries.length === 0 && analyticsData && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    No click history available for this shortened URL yet.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

// Export the component so it can be imported and used in other files
export default UrlAnalyticsInterface;
