# DanceConnect-FYP

## Overview
DanceConnect is a final year project built using the MERN stack. It is a web-based platform designed to help the dance community discover, host, and book dance classes in one central place. The project aims to reduce reliance on social media and word of mouth by giving users a more organised way to find and manage dance classes.

## Main Features
The platform currently allows users to:

- Browse upcoming dance classes
- Search and filter classes by title, style, location, level, and price
- Create an account and log in securely
- Create and publish new dance classes
- Edit and delete their own classes
- Book classes created by other users
- Unbook classes they no longer wish to attend
- View upcoming bookings
- View past booked classes
- Manage personal profile details

## Current Functionality
- Authentication using JWT
- Protected routes for logged-in users
- Form validation and user feedback
- Capacity tracking through `spotsRemaining`
- Prevention of duplicate bookings
- Prevention of booking own classes
- Prevention of booking past classes
- Real-time UI updates after booking, unbooking, creating, editing, and deleting classes
- MongoDB Atlas database integration

## Tech Stack
- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT
- **Testing:** Cypress, Jest, Supertest

## Running the Project Locally

### Prerequisites
Before running the project locally, make sure you have the following installed:

- Node.js
- npm
- A MongoDB Atlas database connection string

### 1. Clone the repository
```bash
git clone https://github.com/Appolinarina/DanceConnect-FYP.git
cd DanceConnect-FYP
```


### 2. Install Dependencies
   
Backend:
```bash
cd backend
npm install
```

Frontend (in a new terminal):
```bash
cd frontend
npm install
```


### 3. Add environment variables
Inside backend/ folder, create file called .env and add:
```bash
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<database>?retryWrites=true&w=majority
SECRET=your_jwt_secret
```

Replace `<username>`, `<password>`, `<your-cluster-url>`, and `<database>` with your own MongoDB Atlas values.



### 4. Run the application

Backend
From the backend folder:
```bash
npm run dev
```

Frontend
From the frontend folder:
```bash
npm start
```

Frontend runs on http://localhost:3000

Backend runs on http://localhost:4000


## Notes

The frontend uses a proxy setup during local development to communicate with the backend.

MongoDB Atlas is required for database access.

A valid .env file must be added inside the backend folder before running the project.


## Deployment
The project has also been deployed so that it can be accessed in a live environment.

- **Frontend:** deployed on Render as a static site
- **Backend:** deployed on Render as a web service
- **Database:** hosted on MongoDB Atlas

### Deployment Notes
- The backend uses environment variables on Render for values such as `MONGO_URI`, `SECRET`, and any frontend URL configuration.
- The frontend is configured to communicate with the deployed backend instead of the local development server.
- MongoDB Atlas network access must allow the deployed backend to connect securely to the database.
- Since the frontend is a React single-page application, routing must be configured correctly on the hosting platform so that direct navigation to client-side routes does not return a 404 page.

## Live Demo
The project has been deployed and can be accessed online:

- **Frontend:** [DanceConnect](https://danceconnect-frontend.onrender.com)

## Future Improvements
Possible future improvements include:
- In-app payments
- Booking approval by class organisers
- Messaging or class chat features
- More profile and class card personalisation
- Improved SEO through a possible migration to Next.js

## Author
Polina Pereyaslavets

Final Year Project – TU Dublin
