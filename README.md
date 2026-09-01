CivicPulse AI

AI-powered civic complaint management, risk intelligence, hotspot detection, and disaster-awareness platform.

CivicPulse AI is a full-stack intelligent civic platform designed to help citizens report local problems and help administrators identify, prioritize, and monitor civic risks.

The platform combines Next.js, FastAPI, PostgreSQL, Machine Learning, NLP embeddings, Gemini AI, geographic clustering, and interactive maps to transform individual civic complaints into actionable spatial intelligence.

🌐 Live Demo

Service

Link

🖥️ Live Application

🚧 Deployment in progress

⚡ Backend API

🚧 Deployment in progress

📚 API Documentation

🚧 Deployment in progress

Production deployment uses Vercel for the frontend, Render for the FastAPI backend, and Supabase PostgreSQL for the production database.

🚀 Key Features

👤 Citizen Complaint Management

User registration and authentication

Secure login using JWT-based authentication

Submit civic complaints

Complaint categories and severity levels

Complaint status tracking

View personal complaint history

Location-based complaint reporting

Image-based complaint submission

🧠 AI-Powered Complaint Intelligence

CivicPulse AI uses machine learning and AI to analyze complaint information.

The system can:

Analyze complaint descriptions

Generate semantic embeddings

Detect potentially duplicate complaints

Calculate complaint risk

Classify complaint severity

Identify patterns across complaints

Support AI-assisted civic analysis

📍 AI Risk Map

The Risk Map provides a geographic view of civic risk.

It combines:

Individual complaint risk

Complaint density

Complaint severity

Complaint priority

Geographic clustering

AI-generated hotspot intelligence

The map distinguishes between individual complaints and geographic risk zones.

🔥 AI Hotspot Detection

CivicPulse uses geographic clustering to identify areas where multiple civic complaints are concentrated.

The hotspot pipeline is:

Civic Complaints
       ↓
Latitude / Longitude
       ↓
Geographic DBSCAN
       ↓
Complaint Clusters
       ↓
Cluster Centroid
       ↓
Risk Calculation
       ↓
Risk Classification
       ↓
AI Hotspot Zone

The clustering system uses geographic distance rather than treating latitude and longitude as ordinary Cartesian coordinates.

Each detected cluster is represented by one hotspot zone on the map.

🎯 Risk Classification

Hotspot risk is calculated using factors including:

Complaint density

Complaint priority

Complaint severity

Cluster size

The resulting hotspot receives a risk score and classification.

Low Risk
    ↓
Medium Risk
    ↓
High Risk

🧬 Semantic Embeddings & Duplicate Detection

Complaint descriptions can be converted into numerical semantic embeddings using a Sentence Transformer model.

Conceptually:

Complaint Description
        ↓
Sentence Transformer
        ↓
Embedding Vector
        ↓
PostgreSQL
        ↓
Similarity Comparison
        ↓
Potential Duplicate Detection

Embeddings allow the system to compare the meaning of complaints rather than relying only on exact keyword matching.

The complaint database contains an embedding field for storing the generated representation.

👁️ AI Vision

CivicPulse includes an AI-assisted image analysis pipeline for submitted civic images.

The system can use image information together with complaint information to support automated civic analysis.

The vision functionality is integrated into the FastAPI backend.

🤖 AI Civic Assistant

The platform includes an AI Assistant that can help users interact with the civic intelligence system.

Possible uses include:

Understanding civic complaints

Asking questions about civic issues

Getting AI-assisted explanations

Supporting complaint analysis

Providing contextual civic information

🌦️ Disaster & Weather Intelligence

The Disaster Center integrates environmental information to provide additional situational awareness.

The platform can combine civic complaint information with external environmental/weather information to help identify potentially important conditions.

🗺️ Interactive Complaint Map

The complaint map provides geographic visualization of reported civic issues.

It supports:

Complaint markers

Geographic coordinates

Risk visualization

Interactive map navigation

Complaint information popups

📊 Dashboard

The dashboard provides an overview of the civic system, including:

Total complaints

Complaint status distribution

Risk information

Active hotspots

Civic intelligence statistics

🏗️ System Architecture

                         ┌─────────────────────┐
                         │       Citizen       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Next.js Web     │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                              REST API / HTTP
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │       Backend       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ PostgreSQL  │       │ ML / NLP    │       │  Gemini AI  │
       │  Database   │       │ Components  │       │   Services  │
       └─────────────┘       └─────────────┘       └─────────────┘
              │                     │                     │
              │                     ▼                     │
              │              ┌─────────────┐              │
              │              │ Embeddings  │              │
              │              │ & Duplicate │              │
              │              │  Detection  │              │
              │              └─────────────┘              │
              │                                           │
              └─────────────────────┬─────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Risk Intelligence │
                         │  & Hotspot Engine   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Risk Map        │
                         │  Geographic Zones   │
                         └─────────────────────┘

🧰 Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Axios

React Leaflet

Leaflet

Backend

Python

FastAPI

Uvicorn

SQLAlchemy

Pydantic

JWT Authentication

Database

PostgreSQL

Supabase PostgreSQL for production deployment

Machine Learning / AI

Sentence Transformers

Transformers

PyTorch

scikit-learn

NumPy

SciPy

Google Gemini AI

Geospatial

DBSCAN

Haversine geographic distance

GeoPy

Leaflet

OpenStreetMap

Deployment

Vercel — Frontend

Render — Backend

Supabase — PostgreSQL


⚙️ Local Development

Prerequisites

Make sure you have:

Python 3.13+

Node.js

npm

PostgreSQL or a PostgreSQL-compatible cloud database

Git

Google Gemini API key

🔧 Backend Setup

cd backend

Create a virtual environment:

Windows

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

🔐 Backend Environment Variables

Create:

backend/.env

Example:

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

GOOGLE_API_KEY=YOUR_GEMINI_API_KEY

SECRET_KEY=YOUR_LONG_RANDOM_SECRET

FRONTEND_URL=http://localhost:3000

Important

Never commit .env to Git.

The repository intentionally ignores environment files containing secrets.

🗄️ Database Setup

CivicPulse uses SQLAlchemy for database access.

The database connection is configured using:

DATABASE_URL=...

For local development, PostgreSQL can be used directly.

For production, CivicPulse uses managed PostgreSQL.

The application creates the SQLAlchemy schema using the project's database models.

The main database entities include:

Users
Complaints

The complaint model also supports semantic embedding storage for duplicate detection.

▶️ Run the Backend

From the backend directory:

uvicorn main:app --reload

The development API will normally be available at:

http://127.0.0.1:8000

FastAPI interactive documentation:

http://127.0.0.1:8000/docs

💻 Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create:

frontend/.env.local

For local development:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

The frontend will normally be available at:

http://localhost:3000

🔄 Application Flow

A typical complaint follows this pipeline:

User
  │
  ▼
Create Complaint
  │
  ▼
Location + Description + Metadata
  │
  ▼
FastAPI Backend
  │
  ├───────────────┐
  │               │
  ▼               ▼
Risk Analysis   Embedding
  │               │
  │               ▼
  │        Duplicate Detection
  │
  ▼
PostgreSQL
  │
  ▼
Dashboard / Maps / Risk Intelligence

🔥 Hotspot Detection Logic

The hotspot engine uses geographic DBSCAN clustering.

The process is:

Complaint Coordinates
        ↓
Convert coordinates to radians
        ↓
Haversine distance
        ↓
DBSCAN clustering
        ↓
Ignore isolated noise points
        ↓
Calculate cluster centroid
        ↓
Calculate cluster risk
        ↓
Classify risk level
        ↓
Generate one hotspot per cluster

The hotspot zone is deliberately different from an individual complaint marker.

Individual Complaint
        ●

Hotspot Cluster
        ● ● ●
       ● ● ●
        ↓
       ⭕

This makes the map easier to interpret and prevents a cluster from being represented by multiple overlapping zones.

📈 Risk Intelligence

Risk analysis combines multiple signals rather than relying only on complaint count.

Conceptually:

Risk
 │
 ├── Complaint Density
 │
 ├── Severity
 │
 ├── Priority
 │
 └── Cluster Information
 │
 ▼
Risk Score
 │
 ├── Low
 ├── Medium
 └── High

This allows CivicPulse to prioritize areas that require more attention.

🧬 Embedding Pipeline

Semantic embeddings are used to represent complaint descriptions numerically.

Example:

"Large pothole near the main road"
              │
              ▼
       Sentence Transformer
              │
              ▼
   [0.12, -0.41, 0.73, ...]
              │
              ▼
        PostgreSQL

When another complaint has a semantically similar description, the system can compare their embeddings to identify potential duplicate or related complaints.

This is more robust than exact text matching.

🗺️ Mapping

The platform uses interactive geographic maps to display:

Complaint locations

High-risk complaints

AI hotspot zones

Risk classifications

Geographic context

Map tiles are provided through OpenStreetMap-compatible map infrastructure.

🔒 Security

CivicPulse follows several basic security practices:

JWT-based authentication

Environment variables for secrets

CORS configuration

Password hashing

Protected user-specific complaint endpoints

Secrets excluded from Git

Production database credentials stored outside source code

Never commit:

.env
API keys
database passwords
JWT secrets
private credentials

🌐 Production Architecture

The production architecture is:

                     Internet
                         │
                         ▼
                ┌────────────────┐
                │     Vercel     │
                │ Next.js Frontend│
                └───────┬────────┘
                        │
                     HTTPS
                        │
                        ▼
                ┌────────────────┐
                │     Render     │
                │ FastAPI Backend│
                └───────┬────────┘
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
        PostgreSQL    Gemini AI    ML Models
        (Supabase)

🚀 Deployment

Frontend

The Next.js frontend can be deployed to Vercel.

Set:

NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL

in the frontend deployment environment.

Backend

The FastAPI backend can be deployed as a Render Web Service.

Build command:

pip install -r requirements.txt

Start command:

uvicorn main:app --host 0.0.0.0 --port $PORT

Required environment variables:

DATABASE_URL
GOOGLE_API_KEY
SECRET_KEY
FRONTEND_URL

Database

Production PostgreSQL is hosted separately from the backend.

The backend connects using:

DATABASE_URL=...

This keeps the database independent from the application server.

🧪 Testing Checklist

Before production deployment, verify:

[ ] Backend starts successfully
[ ] Frontend starts successfully
[ ] PostgreSQL connection works
[ ] User registration works
[ ] Login works
[ ] JWT authentication works
[ ] Complaint creation works
[ ] Complaint retrieval works
[ ] Complaint embeddings are generated
[ ] Duplicate detection works
[ ] Risk scoring works
[ ] Hotspot detection works
[ ] Risk Map loads
[ ] Individual complaint markers load
[ ] Hotspot zones load
[ ] AI Assistant works
[ ] Vision analysis works
[ ] Weather / Disaster Center works
[ ] CORS works
[ ] Production environment variables are configured
[ ] No secrets are committed to Git

🛡️ Important Production Considerations

File Uploads

The application currently uses an uploads directory for uploaded files.

For long-term production use, persistent object storage should be considered because application-server local storage may not be persistent across deployments or restarts.

ML Models

Machine-learning models can require significant memory and startup time.

For production optimization, models should be:

Loaded lazily when appropriate

Reused between requests

Cached in memory

Loaded only by services that need them

Database Migrations

For a larger production system, a migration system such as Alembic should be introduced rather than relying solely on automatic table creation.

🎯 Project Goals

CivicPulse AI aims to transform civic complaint systems from simple reporting tools into proactive civic intelligence platforms.

Instead of:

Citizen reports problem
        ↓
Government receives complaint

CivicPulse aims toward:

Citizen Reports
      ↓
AI Analysis
      ↓
Risk Assessment
      ↓
Duplicate Detection
      ↓
Geographic Clustering
      ↓
Hotspot Detection
      ↓
Risk Map
      ↓
Prioritized Civic Intervention

The goal is to help move civic management from reactive complaint handling toward data-driven and proactive intervention.

🌟 Why CivicPulse AI?

Traditional complaint systems primarily store and forward reports.

CivicPulse adds an intelligence layer that can help answer:

Where are civic problems concentrated?

Which locations are becoming risky?

Which complaints may be duplicates?

Which areas require immediate attention?

What patterns exist across reported problems?

How can geographic information improve civic decision-making?

The goal is to help move civic management from reactive complaint handling toward data-driven and proactive intervention.

🔮 Future Improvements

Potential future improvements include:

Real-time notifications

Advanced geospatial analytics

Historical risk forecasting

Time-series hotspot prediction

Automated authority routing

Persistent cloud image storage

Advanced vector database integration

More sophisticated duplicate detection

Explainable AI risk scores

Administrative analytics

Heatmap visualization

Mobile application

Automated civic department assignment

Historical complaint trend analysis

Real-time disaster alerts

📌 Project Status

Current Status: Active Development / Deployment Preparation

Core functionality currently includes:

Authentication             ✅
Complaint Management      ✅
PostgreSQL Database       ✅
Risk Analysis             ✅
Embeddings                ✅
Duplicate Detection       ✅
AI Vision                 ✅
AI Assistant              ✅
Interactive Maps          ✅
Risk Map                  ✅
Geographic Hotspots       ✅
Weather / Disaster        ✅
Frontend                  ✅
Backend                   ✅
Production Architecture  🚧

👨‍💻 Development

CivicPulse AI is developed as a full-stack AI/ML civic technology project combining:

Software Engineering

Machine Learning

Natural Language Processing

Computer Vision

Geospatial Computing

Database Systems

Web Development

AI-assisted Decision Support

📄 License

This project is currently maintained as a project/research prototype.

License terms can be added when the project is prepared for public open-source distribution.

🙏 Acknowledgements

CivicPulse AI builds upon open-source technologies and services including:

FastAPI

Next.js

React

PostgreSQL

SQLAlchemy

scikit-learn

Sentence Transformers

PyTorch

Google Gemini

Leaflet

OpenStreetMap

CivicPulse AI

Report. Analyze. Detect. Prioritize. Act.
