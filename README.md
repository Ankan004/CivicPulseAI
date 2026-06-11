# 🚀 CivicPulseAI - AI-Powered Civic Complaint Management Platform

## 📌 Overview

CivicPulseAI is an AI-powered Smart City Complaint Management Platform designed to streamline civic issue reporting, municipal decision-making, and public service monitoring.

The platform enables citizens to report civic issues such as road damage, water leakage, waste accumulation, drainage problems, electricity faults, and streetlight failures. Using Machine Learning, Natural Language Processing, Computer Vision, and Generative AI, complaints are automatically classified, prioritized, analyzed, and visualized for authorities.

## 🌐 Live Demo
https://civic-pulse-ai-ashy.vercel.app


## ✨ Key Features

### 👨‍💼 Citizen Portal

* Register and Login securely using JWT Authentication
* Submit complaints with location and image evidence
* Real-time complaint tracking
* View personal complaint history
* AI-assisted complaint categorization

### 🏛️ Admin Dashboard

* View and manage all complaints
* Update complaint status
* Monitor complaint analytics
* Track high-risk zones
* Export complaint data

### 🤖 AI-Powered Complaint Analysis

* Automatic complaint classification
* Severity prediction
* Priority prediction
* Duplicate complaint detection using Sentence Transformers
* Geolocation-based similarity checking

### 📷 Gemini Vision Integration

* Analyze uploaded complaint images
* Detect civic issue category
* Predict severity and priority
* Generate contextual descriptions
* AI-assisted image verification

### 🧠 Gemini Municipal AI Assistant

Provides:

* Risk Area Identification
* Complaint Trend Analysis
* Category Insights
* Municipality Recommendations
* Smart City Decision Support
* Administrative Summaries

### 🗺️ Geospatial Intelligence

* Interactive complaint mapping
* Location-based issue tracking
* Risk hotspot identification
* Nearby complaint analysis

### 📊 Analytics Dashboard

* Complaint statistics
* Category distribution
* Resolution tracking
* Severity breakdown
* Priority monitoring


## 🏗️ System Architecture

Citizen
↓
Next.js Frontend
↓
FastAPI Backend
↓
AI/ML Services
├── Scikit-Learn Classifier
├── Sentence Transformers
├── Gemini Vision
└── Gemini AI Assistant
↓
PostgreSQL Database

## 🛠️ Tech Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Axios
* React Leaflet

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* Pydantic
* Uvicorn

### Database

* PostgreSQL

### AI / ML

* Scikit-Learn
* Sentence Transformers
* Hugging Face Transformers
* Gemini 2.5 Flash
* Google Generative AI

### Deployment

* Vercel (Frontend)
* Railway (Backend & PostgreSQL)

## 🤖 AI Modules

### Complaint Classification

Predicts:

* Road
* Water
* Waste
* Drainage
* Electricity
* Streetlight
* Other

### Severity Prediction

Levels:

* Low
* Medium
* High

### Priority Prediction

Levels:

* Low
* Medium
* High

### Duplicate Detection

* Semantic similarity detection
* Sentence Transformer embeddings
* Geographical distance validation
* Duplicate complaint prevention

### Gemini Vision

Analyzes uploaded images and returns:

* Category
* Severity
* Priority
* Confidence Score
* Description

## 📈 Project Highlights

* Built full-stack civic complaint platform with modern web technologies.
* Implemented AI-driven complaint classification and prioritization.
* Integrated Gemini Vision for image-based civic issue analysis.
* Developed AI Municipal Assistant for administrative insights.
* Added geospatial duplicate complaint detection.
* Deployed scalable production environment using Railway and Vercel.
* Designed responsive and modern UI for citizens and administrators.

## ⚙️ Installation

### Clone Repository
git clone https://github.com/Ankan004/CivicPulseAI.git
cd CivicPulseAI

### Backend Setup
cd backend
python -m venv venv
source venv/bin/activate
# Windows
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
### Frontend Setup
cd frontend
npm install
npm run dev

## 🔑 Environment Variables

### Backend
DATABASE_URL=
SECRET_KEY=
ALGORITHM=HS256
GOOGLE_API_KEY=
### Frontend
NEXT_PUBLIC_API_URL=

## 📊 Future Enhancements

* Real-time notifications
* Mobile Application
* Multilingual complaint support
* Predictive infrastructure analytics
* Vector database for large-scale semantic search
* Smart City IoT integration
* AI-generated municipal reports


## 👨‍💻 Author

### Ankan Ghosh

AI-Powered Developer Navigating the Future

* GitHub: https://github.com/Ankan004
* LinkedIn: https://www.linkedin.com/in/ankan-ghosh-7a3b77335


## ⭐ Support

If you found this project useful, please consider giving it a star ⭐ on GitHub.
