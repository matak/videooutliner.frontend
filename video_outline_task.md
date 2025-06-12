# 🧩 Task: React Video Player with Interactive Outline

## 🎯 Objective

Build a **React-based web application** that plays a video (passed as a URL parameter) and displays a collapsible, multi-level outline beside it. Clicking any outline entry seeks the video to its corresponding timestamp.

---

## ✅ Functional Requirements

### 1. Video Playback

- Load video from a public `.avi` file specified in the URL:
  ```
  https://yourdomain.com/app?video=/videos/sample.avi
  ```
- The video file is **served from the same domain**.
- Typical file size: ~1GB.

### 2. Layout

- Two-column layout using **Tailwind CSS**:
  - **Left Column (30–40%)**: Nested collapsible outline.
  - **Right Column (60–70%)**: Video player.

### 3. Outline Panel

- Static multi-level outline (hardcoded JSON).
- Each node:
  ```json
  {
    "title": "string",
    "start_time": "HH:MM:SS",
    "subsections": []
  }
  ```
- Clicking a title seeks the video to `start_time`.
- Nesting must be collapsible (expand/collapse sections).

### 4. UI Design

- Pure **Tailwind CSS** (no UI libraries like DaisyUI).
- Clean and minimal:
  - Toggle arrows for nested items.
  - Optional: highlight currently playing section.
- Responsive for desktop and tablets.

### 5. No Backend

- Entirely client-side.
- No server, API, or database.
- All files (HTML, JS, CSS, video) are served statically.

---

## 🛠 Tech Stack

- React (with Hooks)
- Tailwind CSS
- No external dependencies unless essential
- Vite (or similar, not webpack)

---

## 📂 Project Structure Suggestion

```
src/
  components/
    VideoPlayer.tsx
    OutlineTree.tsx
  utils/
    timeUtils.ts
  App.tsx
  main.tsx
public/
  videos/
    sample.avi
```

---

## 🧪 Sample Outline for Testing

```json
[
  {
    "title": "Introduction",
    "start_time": "00:00:00",
    "subsections": []
  },
  {
    "title": "Topic 1",
    "start_time": "00:02:15",
    "subsections": [
      {
        "title": "Subtopic 1.1",
        "start_time": "00:03:00",
        "subsections": []
      }
    ]
  },
  {
    "title": "Conclusion",
    "start_time": "00:25:00",
    "subsections": []
  }
]
```

---

## 🧪 Example Launch URL

```
http://videooutliner.24gatel.eu?video=sample
```
