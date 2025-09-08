# URL Shortener Web Application

![Project Banner](https://img.shields.io/badge/Full--Stack-URL%20Shortener-blue?style=for-the-badge&logo=react)

A modern, full-stack URL shortening service built with React.js frontend and Node.js/Express.js backend. This application provides URL shortening capabilities with comprehensive analytics tracking, custom shortcodes, expiration management, and real-time statistics.

## 🚀 Features

- **URL Shortening**: Transform long URLs into compact, shareable links
- **Custom Shortcodes**: Create personalized short URLs with custom codes
- **Expiration Management**: Set validity periods for shortened URLs (1 minute to 1 week)
- **Analytics Dashboard**: Track clicks, timestamps, referrers, and user agents
- **Real-time Statistics**: Monitor link performance with detailed metrics
- **Responsive Design**: Material UI-based interface optimized for all devices
- **Copy to Clipboard**: One-click URL copying functionality
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - Component-based UI framework
- **Material UI (MUI)** - Comprehensive component library and design system
- **React Router DOM 6.x** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **JavaScript ES6+** - Modern JavaScript features

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for API endpoints
- **CORS** - Cross-origin resource sharing middleware
- **In-Memory Storage** - Runtime data persistence (easily extensible to databases)

### Development Tools
- **Custom Logger** - Application-specific logging and debugging
- **VS Code** - Integrated development environment
- **npm** - Package management

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sidduzzzup/B22IT039.git
   cd B22IT039
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../question_1
   npm install
   ```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
node index.js
```
Backend will run on: `http://localhost:5000`

### Start Frontend Development Server
```bash
cd question_1
npm start
```
Frontend will run on: `http://localhost:3000`

## 📁 Project Structure

```
B22IT039/
├── backend/                    # Express.js backend
│   ├── index.js               # Main server file with API endpoints
│   ├── package.json           # Backend dependencies
│   └── token.txt              # Authentication credentials
├── question_1/                # React.js frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── pages/             # React page components
│   │   │   ├── ShortenerPage.jsx  # URL shortening interface
│   │   │   └── StatsPage.jsx      # Analytics dashboard
│   │   ├── utilities/         # Helper services
│   │   │   └── LoggerService.js   # Custom logging service
│   │   ├── App.js             # Main application component
│   │   └── index.js           # Application entry point
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Styling configuration
├── .gitignore                 # Git ignore rules
├── SYSTEM_DESIGN_DOCUMENT.md  # Comprehensive system design documentation
└── README.md                  # This file
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shorturls` | Create new shortened URL |
| GET | `/shorturls/:code` | Retrieve URL analytics |
| GET | `/:code` | Redirect to original URL (with tracking) |

### API Request/Response Examples

**Create Short URL:**
```json
POST /shorturls
{
  "originalUrl": "https://www.example.com/very-long-url",
  "validityMinutes": 60,
  "customCode": "my-link" // optional
}

Response:
{
  "shortUrl": "http://localhost:5000/abc123",
  "shortCode": "abc123",
  "expiresAt": "2025-09-08T14:30:00.000Z"
}
```

**Get Analytics:**
```json
GET /shorturls/abc123

Response:
{
  "originalUrl": "https://www.example.com/very-long-url",
  "shortUrl": "http://localhost:5000/abc123",
  "shortCode": "abc123",
  "clickCount": 15,
  "createdAt": "2025-09-08T13:30:00.000Z",
  "expiresAt": "2025-09-08T14:30:00.000Z",
  "clickHistory": [...]
}
```

## 🎯 Key Features Breakdown

### URL Shortening Page
- Input validation for URL format
- Custom shortcode support
- Expiration time configuration
- Real-time form validation
- Success/error notifications
- Copy to clipboard functionality

### Analytics Dashboard
- Search by shortcode
- URL information display
- Click statistics and metrics
- Detailed click history table
- Time remaining until expiration
- Visual status indicators

### System Design
- **Clean Architecture**: Separation of concerns between frontend and backend
- **Scalable Design**: Foundation for future enhancements
- **Error Handling**: Comprehensive error management
- **Performance Optimized**: Fast URL resolution and responsive UI
- **Anti-plagiarism**: Unique variable names and implementations

## 🔒 Security Features

- URL format validation
- Protocol enforcement (HTTP/HTTPS only)
- Shortcode sanitization
- Input length restrictions
- No sensitive data collection

## 📊 Performance & Scalability

- **In-Memory Storage**: O(1) lookup time for URL resolution
- **Stateless Design**: Each request independent of others
- **Efficient Algorithms**: Optimized shortcode generation
- **Responsive Design**: Optimized for all screen sizes
- **Database Ready**: Easy migration path to persistent storage

## 🚀 Future Enhancements

- [ ] User authentication and account management
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Custom domains support
- [ ] QR code generation
- [ ] Advanced analytics with geographic data
- [ ] API rate limiting
- [ ] Bulk URL processing
- [ ] Mobile application

## 📖 Documentation

- [System Design Document](./SYSTEM_DESIGN_DOCUMENT.md) - Comprehensive technical documentation
- Inline code comments - Detailed explanations in simple English
- API documentation - Complete endpoint specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is created for educational purposes as part of web development learning.

## 👨‍💻 Author

**Siddhartha** - [GitHub Profile](https://github.com/Sidduzzzup)

---

⭐ If you found this project helpful, please give it a star!

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or contact the author.

---

*Built with ❤️ using React.js and Node.js*
