const express = require('express');
const axios = require('axios');
const { json } = require('body-parser');
const cors=require('cors');
const app = express();
app.use(express.json());
app.use(cors({origin:"*"}));
app.use(express.urlencoded({ extended: true }));
app.post("/", (req, res) => {
    const autho=Auth();
    res.json(autho);
});
const registerUser = async () => {
    try {
        const response = await axios.post('http://20.244.56.144/test/register', {
            companyName: "KITSW",
            ownerName: "kone siddartha",
            rollNo: "b22it039",
            ownerEmail: "b22it039@kitsw.ac.in",
            accessCode: "qqQzZk"
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error registering user:', error);
    }
};
//registerUser();
  const Auth = async () => {
    try {
        const response = await axios.post('http://20.244.56.144/test/auth', {
            "companyName": "KITSW",
            "clientID": "7ae7ecb0-4d08-422e-8b95-2985015fe6cf",
            "clientSecret": "BpckTzQGZjdUmjWa",
            "ownerName": "kone siddartha",
            "ownerEmail": "b22it039@kitsw.ac.in",
            "rollNo": "b22it039"
        });
        console.log(response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

const getProducts = async (req, res) => {
    try {
      const token = await Auth(); 
      const { companyName, categoryName } = req.params; 
  
      const response = await axios.get(
        `http://20.244.56.144/test/companies/${companyName}/categories/${categoryName}/products`,
        {
          headers: {
            "Authorization": `Bearer ${token}`, 
          },
          params: {
            "top": req.query.top,           
            "minPrice": req.query.minPrice,  
            "maxPrice": req.query.maxPrice   
          }
        }
      );
  
      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error fetching products');
    }
  };
  
  app.get('/api/products/:companyName/:categoryName', getProducts);

// In-memory storage for shortened URLs (in production, use a database)
const urlDatabase = new Map();
const analyticsDatabase = new Map();

// Helper function to generate random shortcode
const generateShortcode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// URL Shortener Routes
app.post('/shorturls', (req, res) => {
  try {
    const { originalUrl, validityMinutes = 30, customCode } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    // Generate or use custom shortcode
    let shortcode = customCode || generateShortcode();
    
    // Check if shortcode already exists
    if (urlDatabase.has(shortcode)) {
      if (customCode) {
        return res.status(409).json({ message: 'Custom shortcode already exists' });
      } else {
        shortcode = generateShortcode();
      }
    }
    
    // Calculate expiration time
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + (validityMinutes * 60 * 1000));
    
    // Store URL data
    const urlEntry = {
      shortcode,
      originalUrl,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clickCount: 0
    };
    
    urlDatabase.set(shortcode, urlEntry);
    analyticsDatabase.set(shortcode, { clickHistory: [] });
    
    const shortUrl = `http://localhost:5000/s/${shortcode}`;
    
    res.json({
      shortUrl,
      originalUrl,
      shortcode,
      createdAt: urlEntry.createdAt,
      expiresAt: urlEntry.expiresAt
    });
    
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get URL analytics
app.get('/shorturls/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    
    const urlEntry = urlDatabase.get(shortcode);
    if (!urlEntry) {
      return res.status(404).json({ message: 'Short URL not found' });
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(urlEntry.expiresAt);
    if (now > expiresAt) {
      return res.status(410).json({ message: 'Short URL has expired' });
    }
    
    const analytics = analyticsDatabase.get(shortcode) || { clickHistory: [] };
    
    res.json({
      shortcode,
      shortUrl: `http://localhost:5000/s/${shortcode}`,
      originalUrl: urlEntry.originalUrl,
      createdAt: urlEntry.createdAt,
      expiresAt: urlEntry.expiresAt,
      clickCount: urlEntry.clickCount,
      clickHistory: analytics.clickHistory
    });
    
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Redirect endpoint
app.get('/s/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    
    const urlEntry = urlDatabase.get(shortcode);
    if (!urlEntry) {
      return res.status(404).send('Short URL not found');
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(urlEntry.expiresAt);
    if (now > expiresAt) {
      return res.status(410).send('Short URL has expired');
    }
    
    // Update click count
    urlEntry.clickCount += 1;
    
    // Record click analytics
    const analytics = analyticsDatabase.get(shortcode) || { clickHistory: [] };
    analytics.clickHistory.push({
      timestamp: now.toISOString(),
      referrer: req.get('Referer') || null,
      location: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || null
    });
    analyticsDatabase.set(shortcode, analytics);
    
    // Redirect to original URL
    res.redirect(urlEntry.originalUrl);
    
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(5000, (req, res) => {
    console.log("Listening at port 5000")
})