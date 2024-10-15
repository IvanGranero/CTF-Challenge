# CTF Challenge API

This repository hosts the API for a Capture The Flag (CTF) challenge. The API provides endpoints for user authentication, challenge management, and score tracking.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication (Register, validate, login and password management)
- Challenge management (create, update, delete challenges)
- Score tracking and leaderboard

## Requirements
- Node.js
- Express
- MongoDB

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/IvanGranero/CTF-Challenge-API.git
   cd CTF-Challenge-API
   ```
   
2. Install the dependencies:
   ```bash
   npm install
   ```
   
3. Set up the environment variables. Create a .env file in the project root and add the following:
   ```bash
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/ctf
    JWT_SECRET=your_jwt_secret
   ```
   
4. Start the MongoDB server:
   ```bash
    mongod
   ```

## Usage
1. Run the Express application:
   ```bash
    npm start
   ```
2. The API will be available at http://localhost:4600/.


## API Endpoints
### Authentication
- **POST** `/api/login`: User login
- **POST** `/api/register`: User registration

### Key Submission
- **POST** `/api/submitkey`: Submit SSH key (authentication required)

### Email Verification
- **GET** `/api/verify/:id/:token`: Verify email


## Contributing
Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

