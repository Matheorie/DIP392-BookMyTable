# BookMyTable - Restaurant Reservation System

**Team BookMyTable of Section DIP932**

## Team Members
- **Gauthier Le Brun** (250AEB017) - Project Manager & Full-Stack Developer
- **Alban Guéret** (250AEB011) - Backend Developer & Database Architect  
- **Roméo Carecchio** (250AEB041) - Frontend Developer & UI/UX Designer
- **Mathéo Judenne** (250AEB016) - System Analyst & Quality Assurance

**GitHub Repository**: https://github.com/Matheorie/DIP392-BookMyTable

## Project Description

BookMyTable is a comprehensive restaurant reservation management system developed for Restaurant Cazingue as part of the DIP392 Applied System Software course. The application provides a complete solution for managing table reservations, including customer-facing booking functionality and administrative management tools.

### Key Features
- **Customer Portal**: Online reservation booking with availability checking
- **Admin Dashboard**: Complete reservation management with approval workflow  
- **Table Management**: Real-time table status and assignment system
- **Email Notifications**: Automated confirmation and notification emails
- **Responsive Design**: Mobile-friendly interface using Bootstrap
- **Authentication**: Secure JWT-based admin authentication

## Technologies Used

### Frontend
- **React** 18.x - Component-based UI framework
- **React Router** - Client-side routing
- **Bootstrap** 5.x - Responsive CSS framework
- **Axios** - HTTP client for API requests
- **React DatePicker** - Date/time selection components
- **Formik & Yup** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending functionality

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **ESLint** - Code linting
- **dotenv** - Environment configuration

## Team Roles & Responsibilities

| Team Member | Primary Role | Key Responsibilities |
|-------------|--------------|---------------------|
| **Gauthier Le Brun** | Project Manager & Full-Stack Developer | Project coordination, Requirements analysis, Frontend-Backend integration, Documentation |
| **Alban Guéret** | Backend Developer & Database Architect | API development, Database design, Server configuration, Authentication system |
| **Roméo Carecchio** | Frontend Developer & UI/UX Designer | React components, User interface design, Responsive layout, User experience optimization |
| **Mathéo Judenne** | System Analyst & Quality Assurance | System testing, Requirements validation, Quality control, Test case development |

## Prerequisites

Before running this application, make sure you have:
- **Node.js** (v16.0 or higher)
- **npm** (v8.0 or higher)  
- **MySQL** (v8.0 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Matheorie/DIP392-BookMyTable.git
cd DIP392-BookMyTable
```

### 2. Database Setup
1. Create a MySQL database named `bookmytable`
2. Import the database schema:
```bash
mysql -u your_username -p bookmytable < database.sql
```

### 3. Environment Configuration
1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bookmytable
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration (for notifications)
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Restaurant Cazingue <notifications@cazingue.fr>

# Default Admin Account
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=Admin123!
```

### 4. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 5. Initialize Database
```bash
node server/server.js
```
This will automatically create the default admin user on first run.

## Running the Application

### Development Mode
```bash
# Start the backend server (Port 3000)
npm run server

# In a new terminal, start the frontend (Port 3001)
npm run client

# Or run both simultaneously
npm run dev
```

### Production Mode
```bash
# Build the frontend
cd client
npm run build
cd ..

# Start the production server
npm start
```

## Usage

### Customer Access
- Visit `http://localhost:3000` to access the public reservation system
- Browse the menu, check availability, and make reservations
- Manage existing reservations using the confirmation code

### Admin Access
- Visit `http://localhost:3000/admin/login` for administrative access
- **Default Credentials:**
  - Username: `admin`
  - Password: `Admin123!`
- Manage reservations, tables, and system settings

## Testing

### Database Testing
The project includes a comprehensive database testing script:
```bash
node db-test.js run-all-tests
```

### Available Test Commands
```bash
# Show all available commands
node db-test.js help

# Test specific functionality
node db-test.js tables
node db-test.js reservations
node db-test.js availability [date] [persons]
node db-test.js create  # Interactive reservation creation
```

## Restaurant Business Rules

### Operating Hours
- **Lunch Service**: Monday-Friday, 12:00-15:00
- **Dinner Service**: Thursday only, 19:00-00:30
- **Closed**: Weekends (Saturday-Sunday)

### Reservation Policies
- Minimum 1 hour advance booking required
- Maximum 30 days advance booking
- Cancellations must be made 2+ hours in advance
- All reservations require management approval
- Maximum party size: 20 people

## Project Structure

```
DIP392-BookMyTable/
├── client/                     # React frontend
│   ├── public/                # Static assets
│   ├── src/                   
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── assets/           # Images and styles
│   │   └── utils/            # Utility functions
├── server/                    # Express backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   └── utils/                # Utility functions
├── database.sql              # Database schema
├── db-test.js               # Database testing script
└── README.md                # This file
```

## API Documentation

### Public Endpoints
- `GET /api/reservations/availability` - Check availability
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/code/:code` - Get reservation by code
- `PUT /api/reservations/code/:code` - Update reservation
- `DELETE /api/reservations/code/:code` - Cancel reservation

### Admin Endpoints (Authentication Required)
- `GET /api/reservations/admin` - List all reservations
- `POST /api/reservations/admin/:id/approve` - Approve reservation
- `GET /api/tables` - Manage tables
- `GET /api/tables/status/:date` - Table status by date

## Contributing

This project was developed as part of the **DIP392 Applied System Software** course by **Team BookMyTable** for **Restaurant Cazingue**.

### Development Approach
Our team followed an **Agile methodology** with iterative development cycles:

1. **Requirements Gathering**: Direct collaboration with Restaurant Cazingue to understand their specific needs
2. **System Design**: Collaborative design sessions with database schema and API planning
3. **Development Sprints**: Parallel development with regular integration and testing
4. **Quality Assurance**: Comprehensive testing including database testing and user acceptance testing
5. **Documentation**: Detailed technical documentation and user guides

### Team Collaboration
- **Git Workflow**: Feature branches with pull request reviews
- **Code Standards**: Consistent coding conventions and comprehensive commenting
- **Testing Strategy**: Database testing scripts and manual testing protocols
- **Documentation**: Comprehensive README and inline code documentation

## Presentation Video Link

https://drive.google.com/file/d/1fr1qtyezFvFEd45fqoKL7ecXNNmcTJap/view?usp=sharing

## Academic Context

This project represents a **real-world software development experience** where our team:
- Worked with an actual client (Restaurant Cazingue)
- Applied software engineering principles in practice
- Followed a complete Software Development Life Cycle (SDLC)
- Delivered a production-ready application within academic constraints

**Course**: DIP392 - Applied System Software  
**Institution**: RTU - Riga Technical University  
**Academic Year**: 2024-2025

## License

This project is developed for educational purposes as part of the DIP392 course.

---

*This project was developed as part of the **DIP392 Applied System Software** course, implementing a real-world software solution for **Restaurant Cazingue** through collaborative team development.*
