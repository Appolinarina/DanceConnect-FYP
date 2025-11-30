# DanceConnect-FYP

## Overview
A final year project using MERN stack to help the dance community to discover, host and book dance classes in one central platform

# The platform allows users to:
- Browse all available dance classes
- View class details (style, level, location, date/time, capacity, price)
- Create and publish new dance classes
- Delete personal created classes


## Current Features
- View class listings
- Create new class using interactive form
- Automatic timestamping of created classes
- Real-time UI updates
- Delete existing classes
- Form validation and feedback

## Running Project Locally
1. Clone Repository
```bash
git clone https://github.com/Appolinarina/DanceConnect-FYP.git
cd DanceConnect-FYP
```

2. Install Dependencies

Frontend
```bash
cd frontend
npm install
```

Backend
```bash
cd backend
npm install
```

3. Add environment variables
Inside backend/ create file called .env
```bash
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<database>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, `<your-cluster-url>`, and `<database>` with your own values.

4. Run applications

Backend
```bash
npm run start
```

Frontend
```bash
npm run 
```

Frontend runs on http://localhost:3000

Backend runs on http://localhost:4000
