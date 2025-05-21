# Astrobalendar Project Cleanup Checklist

## Overview
The Astrobalendar project is a web application designed for astrology enthusiasts, providing features such as horoscope entries, predictions, and KP astrology charts. This repository contains a comprehensive checklist to ensure the project is well-maintained, free of errors, and ready for deployment.

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **Database:** Firebase
- **Deployment:** Render (Backend), Netlify (Frontend)

## Setup Instructions
1. **Clone the Repository**
   - Use the following command to clone the repository:
     ```
     git clone https://github.com/yourusername/astrobalendar-cleanup-checklist.git
     ```

2. **Install Dependencies**
   - Navigate to the project directory and install the necessary dependencies:
     ```
     cd astrobalendar-cleanup-checklist
     npm install
     ```

3. **Environment Variables**
   - Create a `.env` file in the root directory and add the required environment variables:
     ```
     VITE_API_URL=your_api_url
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     FIREBASE_API_KEY=your_firebase_api_key
     ```

4. **Run the Application**
   - Start the development server for the frontend:
     ```
     npm run dev
     ```
   - For the backend, ensure the server is running on Render.

## Cleanup Checklist
Refer to `CHECKLIST.md` for a detailed step-by-step guide on cleaning up the project, including:
- Running audits for unused files and components
- Fixing common runtime errors
- Preparing for final deployment

## Contribution
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.