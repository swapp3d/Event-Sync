# EventSync

## Overview
EventSync is a full‑stack application that allows users to create events, collect feedback, and automatically generate sentiment summaries.  
The system consists of a Spring Boot backend and a React (Vite + TypeScript) frontend.  
It uses Hugging Face for sentiment scoring and OpenRouter for AI‑generated event summaries.

## How It Works
1. Users create events through the frontend interface.  
2. Users submit feedback for those events.  
3. The backend stores all data in a local H2 database.  
4. Hugging Face analyzes each feedback entry and returns positive, neutral, and negative sentiment scores.  
5. After feedback submission, OpenRouter generates a combined summary for the selected event.  
6. The frontend displays summaries, sentiment counts, and all feedback entries.

## Features
- Event creation with validation and multi‑form support  
- Feedback submission with word‑limit tracking, sentiment scoring, and multi‑form blocks  
- AI‑generated summaries  
- Summary page with filtering options  
- Local H2 database storage  
- Futuristic UI, glass‑inspired design, and smooth interactions

## Technologies Used
### Backend
- Java 17  
- Spring Boot  
- H2 Database (in‑memory/file mode)  
- Hugging Face (sentiment scores)  
- OpenRouter (summary generation)

### Frontend
- React + Vite + TypeScript  
- CSS custom UI  
- Client‑side routing  
- Fetch‑based API communication

## Installation and Running
### Requirements
- Java 17  
- Node.js + npm  
- Internet connection for AI API calls  

### Backend
1. Navigate to the backend folder  
2. Configure your `.env` or environment variables:  
   - `HF_API_TOKEN`  
   - `OPENROUTER_API_KEY`  
3. Run:  
   ```
   mvn spring-boot:run
   ```
4. The backend starts at:  
   `http://localhost:8080`

### Frontend
1. Navigate to the `frontend` folder  
2. Install dependencies:  
   ```
   npm install
   ```
3. Start the dev server:  
   ```
   npm run dev
   ```
4. Open the app in your browser (Vite shows the local URL)

## Challenges
- Hugging Face’s summarization models produced inconsistent results, requiring a switch to OpenRouter for summaries  
- Response formatting differences between models required custom parsing logic  
- Ensuring sentiment classification behaved consistently across long and short feedback entries  
- UI adjustments to avoid layout overflow in summary pages

##Issues
- Wrong identification of the feedback's neutrality, which is often mistook by Hugging Face sentiment model for positive 

## Future Improvements
- Containerization with Docker  
- Deployment to cloud (Render, Railway, or AWS)  
- Authentication and user accounts
- Improved neutral score calculation
- Improved analytics with charts  
- Multi‑event dashboards  
- Support for exporting summaries (PDF/CSV)

## Demo
- Google Drive: https://drive.google.com/file/d/1wrxrCqA1hMbR0mMj2HBiNxcVsSCv6Csu/view?usp=drive_link

## Contact
- Email: hlibtwork7@gmail.com 
- LinkedIn: www.linkedin.com/in/hlib-tretiak-473088348 
