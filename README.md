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
- Node.js and npm  
- Internet connection (required for OpenRouter and Hugging Face API calls)

---

## Project Setup in IntelliJ IDEA

Because this repository contains two separate modules (backend + frontend), IntelliJ must be configured manually after cloning.

### 1. Open the project
- In IntelliJ, select **File → Open**  
- Choose the **project root folder** (the folder that contains `/backend` and `/frontend`)

---

### 2. Import the Backend Module (Maven)
1. Open the Project Tool Window  
2. Switch the view to **Project Files**  
3. Navigate to:
   ```
   backend/pom.xml
   ```
4. Right-click → **Add as Maven Project**

---

### 3. Import the Frontend Module (Node/Vite)
1. Navigate to:
   ```
   frontend/package.json
   ```
2. Right-click → **Add as npm Module**  
   (or: File → Project Structure → Modules → + → Import Module → select `package.json`)

---

## Setting Environment Variables (Windows PowerShell)

### Backend requires two API keys:
- HF_API_TOKEN (Hugging Face)
- OPENROUTER_API_KEY (OpenRouter)

### Set them in PowerShell:
```powershell
setx HF_API_TOKEN "your_huggingface_token_here"
setx OPENROUTER_API_KEY "your_openrouter_api_key_here"
```

### Verify they were saved:
```powershell
echo $env:HF_API_TOKEN
echo $env:OPENROUTER_API_KEY
```

---

## Running the Backend (Spring Boot)

```powershell
cd backend
mvn spring-boot:run
```

Backend runs at:
```
http://localhost:8080
```

---

## Running the Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

Vite will show a local URL such as:
```
http://localhost:5173
```


## Challenges
- Hugging Face’s summarization models produced inconsistent results, requiring a switch to OpenRouter for summaries  
- Response formatting differences between models required custom parsing logic  
- Ensuring sentiment classification behaved consistently across long and short feedback entries  
- UI adjustments to avoid layout overflow in summary pages

## Issues
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
