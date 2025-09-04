# 📝 MindVista

A modern **full-stack blogging platform** built with the **MERN stack**, designed for seamless content creation, publishing, and management.

---

## 🚀 Features

* ✍️ **Rich Blog Editor** – Write and format blogs with ease.
* 👤 **User Authentication** – Secure signup/login system.
* 🖼️ **Image Uploads** – Optimized with **Cloudinary**.
* 📂 **Post Management** – Create, update, and delete posts.
* 💬 **Comment System** – Readers can engage with your blogs.
* 📱 **Responsive Design** – Optimized for mobile and desktop.
* 🔒 **Secure APIs** – Backend powered by Node.js & Express.

---

## 🛠️ Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS / Shadcn UI

**Backend**

* Node.js + Express
* JWT Authentication

**Database & Storage**

* MongoDB Atlas
* Cloudinary (for images)

**Deployment**

* Frontend → Vercel
* Backend → Linode / Render
* Database → MongoDB Atlas

---

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Akshat161/MindVista.git
   cd MindVista
   ```

2. **Install dependencies**

   * For backend

     ```bash
     cd backend
     npm install
     ```
   * For frontend

     ```bash
     cd frontend
     npm install
     ```

3. **Set up environment variables**
   Create a `.env` file in both `backend` and `frontend` directories.

   **Backend (`/backend/.env`)**

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   **Frontend (`/frontend/.env`)**

   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run locally**

   * Start backend

     ```bash
     cd backend
     npm run dev
     ```
   * Start frontend

     ```bash
     cd frontend
     npm run dev
     ```

5. **Visit**

   * Frontend → `http://localhost:5173`
   * Backend → `http://localhost:5000`

---

## 🌍 Deployment

* **Frontend**: Deploy to **Vercel**
* **Backend**: Deploy to **Linode / Render**
* **Database**: Use **MongoDB Atlas**
* **Images**: Use **Cloudinary**

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:

   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request

---


## 👨‍💻 Authors

* **Shikhar Gupta** – [GitHub](https://github.com/ShikharGupta0813)
* **Akshat Trivedi** – [GitHub](https://github.com/Akshat161)
