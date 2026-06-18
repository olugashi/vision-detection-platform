# מדריך התקנת סביבה

## דרישות מינימום

| כלי | גרסה מינימלית | גרסה מומלצת |
|-----|--------------|-------------|
| Python | 3.11 | 3.11.x |
| Node.js | 20.x | 20.x LTS |
| npm | 9.x | מגיע עם Node.js |
| Docker Desktop | 24.x | עדכני |
| Docker Compose | 2.x | מגיע עם Docker Desktop |

---

## התקנה מלאה (Docker — מומלץ)

הדרך הפשוטה ביותר להרצה — ללא צורך בהתקנת Python או Node.js מקומית.

### 1. התקן Docker Desktop

- **Windows / Mac:** https://www.docker.com/products/docker-desktop
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
  ```

### 2. שכפל את הפרויקט

```bash
git clone https://github.com/olugashi/vision-detection-platform.git
cd vision-detection-platform
```

### 3. הרץ

```bash
docker compose up --build
```

> בהרצה הראשונה יוריד YOLOv8s (~22MB) אוטומטית.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger docs:** http://localhost:8000/docs

---

## התקנה מקומית (ללא Docker)

### Python — Backend

#### גרסה נדרשת: Python 3.11+

```bash
# בדוק גרסה קיימת
python --version
```

#### התקנת Python (אם חסר)

- **Windows:** https://www.python.org/downloads/ — בחר Python 3.11.x
- **Mac:**
  ```bash
  brew install python@3.11
  ```
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get install python3.11 python3.11-venv python3-pip
  ```

#### הרצת Backend

```bash
cd backend

# צור סביבה וירטואלית
python -m venv venv

# הפעל סביבה וירטואלית
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# התקן תלויות
pip install -r requirements.txt

# הרץ
uvicorn app.main:app --reload --port 8000
```

#### חבילות Python

| חבילה | גרסה | תיאור |
|-------|------|-------|
| fastapi | 0.110.0 | REST API framework |
| uvicorn | 0.29.0 | ASGI server |
| ultralytics | 8.2.0 | YOLOv8 — זיהוי אובייקטים |
| opencv-python-headless | 4.9.0.80 | עיבוד תמונות |
| pillow | עדכני | קריאת קבצי תמונה |
| numpy | עדכני | מטריצות נומריות |
| sqlalchemy | 2.0.0 | ORM ל-SQLite |
| python-multipart | עדכני | העלאת קבצים |
| aiofiles | עדכני | קריאת קבצים א-סינכרונית |

---

### Node.js — Frontend

#### גרסה נדרשת: Node.js 20.x LTS

```bash
# בדוק גרסה קיימת
node --version
npm --version
```

#### התקנת Node.js (אם חסר)

- **Windows / Mac:** https://nodejs.org — בחר **20.x LTS**
- **Linux (Ubuntu/Debian) — דרך nvm (מומלץ):**
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  nvm install 20
  nvm use 20
  ```

#### הרצת Frontend

```bash
cd frontend

# התקן תלויות
npm install

# הרץ בסביבת פיתוח
npm run dev
```

#### חבילות npm עיקריות

| חבילה | גרסה | תיאור |
|-------|------|-------|
| react | 18.2.0 | UI framework |
| typescript | 5.2.2 | Type safety |
| vite | 5.0.0 | Build tool |
| @mui/material | 5.15.0 | רכיבי UI — Material Design |
| @mui/icons-material | 5.15.0 | אייקוני MUI |
| axios | 1.6.0 | HTTP client |
| react-dropzone | 14.2.3 | העלאת קבצים בגרירה |

---

## דרישות נוספות לפיתוח מקומי

### ffmpeg (לשלב עתידי — וידאו)

- **Windows:** https://ffmpeg.org/download.html
- **Mac:** `brew install ffmpeg`
- **Linux:** `sudo apt-get install ffmpeg`

### GPU (אופציונלי — מאיץ זיהוי)

אם יש GPU תומך CUDA:

```bash
# התקן PyTorch עם CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

ללא GPU — המערכת עובדת על CPU בלבד, מהירות זיהוי נמוכה יותר.

---

## בדיקת תקינות

לאחר הרצה, פתח: http://localhost:8000/docs

אמורה להופיע ממשק Swagger עם הנקודות הבאות:
- `POST /api/media/upload`
- `GET /api/media/list`
- `GET /api/media/{media_id}`
- `DELETE /api/media/{media_id}`
- `POST /api/detect/image`

---

## בעיות נפוצות

| בעיה | פתרון |
|------|-------|
| `libGL.so.1: cannot open` | `apt-get install libgl1 libglib2.0-0` |
| `YOLO model not found` | המודל יורד אוטומטית בהרצה הראשונה, ודא חיבור אינטרנט |
| `Port 8000 already in use` | `lsof -i :8000` ואז `kill -9 <PID>` |
| `npm install` נכשל | ודא Node.js 20.x: `node --version` |
