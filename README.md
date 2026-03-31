# Major_Project
Developing a Real-Time Automated Number Plate Recognition (ANPR) System using image processing and machine learning techniques. 
# 🚗 Real-Time Vehicle Number Plate Recognition (ANPR)

## 📌 Overview
This project is a **Real-Time Vehicle Number Plate Recognition System (ANPR)** that uses **Deep Learning (YOLO)** and **Computer Vision** to detect and recognize vehicle license plates from images or video feeds.

The system automates vehicle identification, logs detected plate numbers with timestamps into a database, and provides a user-friendly dashboard interface for monitoring and analysis.

---

## 🎯 Objectives
- Detect vehicle number plates using YOLO model
- Extract plate text using OCR
- Process uploaded video files
- Store results with timestamp in database
- Provide a simple dashboard interface

---

## 🚀 Features
- 🎥 Upload video for detection
- 🔍 Automatic number plate detection
- 🧠 YOLO-based high accuracy detection
- 🔤 OCR-based text extraction
- 🗄 Automatic database logging
- 📊 Detection results display on dashboard
- ⚡ Fast and efficient processing

---

## 🏗 System Architecture

---

## 🛠 Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### AI & Computer Vision
- YOLO (Ultralytics)
- OpenCV
- EasyOCR / Tesseract

### Database
- SQLite

---

## 📂 Project Structure
vehicle-anpr-system/
│
├── backend/
│     ├── app.py
│     ├── detect.py
│     ├── model/
│     │      best.pt
│     ├── uploads/
│
├── frontend/
│     ├── index.html
│     ├── style.css
│     ├── script.js
│
├── database/
│     vehicles.db


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
### 2️⃣ Install Dependencies
### 3️⃣ Run Backend Server    
### 4️⃣ Open Frontend
Open the file:
---

## ▶️ Usage

1. Open the web dashboard  
2. Upload a video file  
3. Click **Start System / Upload**  
4. The system will:
   - Detect number plates  
   - Extract text using OCR  
   - Display detected plates  
   - Store data in database  

---

## 📊 Output Example

---

## 🗄 Database Schema

Table: `logs`

| Column | Type |
|--------|------|
| id     | INTEGER |
| plate  | TEXT |
| time   | TEXT |

---

## 📌 Applications
- Traffic monitoring systems
- Automatic toll collection
- Parking management systems
- Stolen vehicle detection
- Smart city surveillance

---

## ✅ Advantages
- Reduces manual effort
- High accuracy detection
- Real-time automation
- Automatic data logging
- Scalable solution

---

## 🔮 Future Enhancements
- Live CCTV camera integration
- Multi-camera system
- Cloud deployment
- Vehicle type and color detection
- Alert system for blacklisted vehicles

---

## 📚 References
- YOLO (Ultralytics) Documentation  
- OpenCV Documentation  
- EasyOCR Documentation  
- Research Papers on ANPR  

---

## 👨‍💻 Author
**Sahil Yadav**  
BCA Student | AI/ML Enthusiast  

---

## ⭐ Note
This project is developed as a **major academic project** to demonstrate the use of AI, deep learning, and computer vision in real-world traffic and security systems.
