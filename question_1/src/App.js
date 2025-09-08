// Import necessary CSS styles for the application
import './App.css';
// Import React Router components for navigation between different pages
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// Import Material UI theme provider and theme creation function
import { ThemeProvider, createTheme } from '@mui/material/styles';
// Import Material UI components for building the user interface
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
// Import React Router Link component and hook to get current location
import { Link as RouterLink, useLocation } from 'react-router-dom';
// Import Material UI icons for the navigation and interface
import { Link as LinkIcon, Analytics } from '@mui/icons-material';
// Import the main URL shortener page component
import UrlShortenerInterface from './pages/ShortenerPage';
// Import the analytics/statistics page component
import UrlAnalyticsInterface from './pages/StatsPage';
// Import custom logging service for tracking application events
import loggingService from './utilities/LoggerService';

// Create Material UI theme configuration to define color scheme and typography
const applicationTheme = createTheme({
  // Define color palette for the application theme
  palette: {
    primary: {
      main: '#1976d2', // Blue color for primary elements
    },
    secondary: {
      main: '#dc004e', // Red color for secondary elements
    },
    background: {
      default: '#f5f5f5', // Light gray background color
    },
  },
  // Set font family for consistent typography across the app
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Navigation header component that displays the top navigation bar
const NavigationHeader = () => {
  // Get current page location to highlight active navigation button
  const currentLocation = useLocation();
  
  return (
    // Create top navigation bar with Material UI AppBar component
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* Display link icon next to the application title */}
        <LinkIcon sx={{ mr: 2 }} />
        {/* Application title that takes up remaining space on the left */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener Pro
        </Typography>
        
        {/* Container for navigation buttons aligned to the right */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Navigation button for URL shortener page */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/shorten"
            // Highlight button if currently on shortener page
            variant={currentLocation.pathname === '/shorten' ? 'outlined' : 'text'}
            startIcon={<LinkIcon />}
          >
            Shorten URL
          </Button>
          
          {/* Navigation button for analytics page */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/stats"
            // Highlight button if currently on analytics page
            variant={currentLocation.pathname === '/stats' ? 'outlined' : 'text'}
            startIcon={<Analytics />}
          >
            Analytics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Main App component that wraps the entire application
function App() {
  // Log application initialization for debugging and monitoring
  loggingService.logInformation('URL Shortener Application initialized');
  
  return (
    // Apply Material UI theme to the entire application
    <ThemeProvider theme={applicationTheme}>
      {/* Reset CSS and apply Material UI baseline styles */}
      <CssBaseline />
      {/* Enable React Router for client-side navigation */}
      <BrowserRouter>
        {/* Display navigation header at the top of every page */}
        <NavigationHeader />
        {/* Define application routes and which components to render */}
        <Routes>
          {/* Redirect root path to shortener page */}
          <Route path="/" element={<Navigate to="/shorten" replace />} />
          {/* Route for URL shortening functionality */}
          <Route path="/shorten" element={<UrlShortenerInterface />} />
          {/* Route for analytics and statistics page */}
          <Route path="/stats" element={<UrlAnalyticsInterface />} />
          {/* Redirect any unknown paths back to shortener page */}
          <Route path="*" element={<Navigate to="/shorten" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;