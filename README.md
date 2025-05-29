# MiC Data Platform

Modular Integrated Construction (MiC) project data management platform with multi-role user permission management.

## Features

### User Roles and Permissions

This platform supports 9 different user roles, each with specific permissions:

| User Role | Read | Search | Modify | Analyze | Add Comments | Data Input |
|-----------|------|--------|--------|---------|--------------|------------|
| Designer | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Developer | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Policy Maker | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Contractor | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manufacturer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subcontractor | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supplier | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Operator | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| System Administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Main Features

- **User Authentication System**: Secure login and registration functionality
- **Role-based Permission Management**: Role-based access control
- **Project Data Management**: View and manage MiC project information
- **Module Data Management**: Detailed module information and attributes
- **Data Search**: Advanced search and filtering capabilities
- **Data Analysis**: Project statistics and analysis reports
- **Comment System**: Add comments to projects and modules
- **Data Input**: Add new project and module data

## Technical Architecture

### Backend
- **Node.js** + **Express.js**: Server framework
- **MongoDB** + **Mongoose**: Database and ODM
- **JWT**: User authentication
- **bcryptjs**: Password encryption

### Frontend
- **React 18**: User interface framework
- **React Router DOM**: Routing management
- **Context API**: State management
- **CSS3**: Styling

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or cloud service)
- npm or yarn

### Installation Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd mic-data-platform
```

2. **Install dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. **Environment configuration**
Create a `.env` file (refer to `.env.example`):
```env
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017/mic_data_platform
NODE_ENV=development
PORT=5001
```

4. **Start the database**
Ensure MongoDB service is running

5. **Run the project**
```bash
# Development mode (start both server and client)
npm run dev

# Or start separately
npm run server  # Start server
npm run client  # Start client
```

## Usage Instructions

### Register New User

1. Visit `http://localhost:3000/register`
2. Fill in required information:
   - Username (3-50 characters)
   - Email address
   - Password (at least 6 characters)
   - Full name
   - Organization/Company
   - User role
   - Phone number (optional)
3. Select appropriate user role
4. Submit registration

### Login to System

1. Visit `http://localhost:3000/login`
2. Enter username/email and password
3. After successful login, you will be redirected to the dashboard

### Using the Dashboard

After login, you will see your personal dashboard, including:

- **Overview**: User information, permission list, quick actions
- **Project Data**: View project list and detailed information (requires read permission)
- **Data Search**: Search projects and modules (requires search permission)
- **Data Analysis**: View statistics and analysis reports (requires analysis permission)
- **Data Management**: Edit existing data (requires modify permission)
- **Data Input**: Add new data (requires data input permission)
- **Profile**: View and edit personal information

## API Endpoints

### Authentication Related
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user information
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/roles` - Get available roles list
- `POST /api/auth/logout` - User logout

### Data Related
- `GET /api/projects` - Get project list
- `GET /api/projects/:id` - Get specific project
- `GET /api/modules` - Get module list
- `GET /api/modules/:id` - Get specific module
- `PUT /api/modules/:id` - Update module information
- `POST /api/modules` - Add new module
- `POST /api/modules/:id/comments` - Add comment
- `GET /api/search/modules` - Search modules

## Development Guide

### Project Structure
```
mic-data-platform/
├── server.js                 # Server entry file
├── package.json              # Server dependencies
├── src/
│   ├── models/               # Data models
│   │   └── User.js          # User model
│   ├── middleware/           # Middleware
│   │   └── auth.js          # Authentication middleware
│   ├── routes/               # Routes
│   │   └── auth.js          # Authentication routes
│   └── data/                 # Mock data
│       └── mockData.js      # Project and module data
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/        # Authentication related components
│   │   │   └── common/      # Common components
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/           # Page components
│   │   └── App.js           # Main application component
│   └── package.json         # Client dependencies
└── README.md                # Project documentation
```

### Adding New Features

1. **Backend API**: Add new routes in `src/routes/`
2. **Frontend Components**: Add new components in `client/src/components/`
3. **Permission Control**: Use `ProtectedRoute` and `PermissionGate` components
4. **State Management**: Manage user state through `AuthContext`

## Security Considerations

- Passwords are encrypted using bcryptjs
- JWT tokens for user authentication
- Role-based access control
- API endpoint permission verification
- Input data validation and sanitization

## Deployment

### GitHub 部署指南

詳細的 GitHub 部署步驟請參考 [DEPLOYMENT.md](DEPLOYMENT.md) 文件。

#### 快速開始

1. **安裝 Git 並配置**
```bash
git config --global user.name "您的姓名"
git config --global user.email "您的email@example.com"
```

2. **初始化 Git 倉庫**
```bash
git init
git add .
git commit -m "Initial commit: MiC Data Platform"
```

3. **連接到 GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/mic-data-platform.git
git branch -M main
git push -u origin main
```

4. **在其他設備克隆**
```bash
git clone https://github.com/YOUR_USERNAME/mic-data-platform.git
cd mic-data-platform
npm install && cd client && npm install
```

### CI/CD 自動化

專案已配置 GitHub Actions 進行自動化測試和部署：

- **自動測試**：每次推送和 Pull Request 時自動運行
- **代碼檢查**：ESLint 和安全性掃描
- **多版本測試**：Node.js 16.x 和 18.x
- **分支部署**：`develop` 分支部署到測試環境，`main` 分支部署到生產環境

### Production Environment Deployment

1. **Build frontend**
```bash
cd client
npm run build
cd ..
```

2. **Set environment variables**
```env
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
MONGODB_URI=your_production_mongodb_uri
PORT=5001
```

3. **Start production server**
```bash
npm start
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### Version 1.0.0
- Initial release
- User authentication system
- Role-based permission management
- Project and module data management
- Basic search and analysis features 