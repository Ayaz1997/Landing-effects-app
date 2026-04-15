# App Specification: Image to ASCII/Pixel Animated Background Generator

## 1. Overview
A lightweight, web-based application designed to generate animated backgrounds (ASCII render or Pixel reveal) from user-uploaded images. These animations are intended for use in landing pages or hero sections. The app will feature a sleek, dark-themed, minimalist UI inspired by professional node-based or creative coding environments.

## 2. Technical Stack Suggestions
* **Frontend Framework:** React or Next.js (for component-driven UI).
* **Styling:** Tailwind CSS (ideal for rapidly building the custom dark theme and structural layout).
* **Core Engine:** `https://github.com/dhravya/landing-effects` (Library for ASCII and Pixel processing).
* **Export Handling:** FFmpeg.wasm (for client-side rendering of MP4 and GIF formats without needing a heavy backend).

## 3. UI/UX Architecture & Layout
The user interface will be strictly **Dark Mode**, utilizing a 3-column layout with a predominantly black/dark gray color palette (`#000000` to `#111111` backgrounds) and subtle off-white/gray text for high contrast. Typography should lean heavily on monospaced fonts for a technical aesthetic.

### 3.1. Left Panel (Input & Effects)
* **Input Section:** * A dashed drag-and-drop zone labeled "Standby" or "Awaiting Input".
    * Supported file formats listed (PNG, JPG, GIF, MP4, WebM).
    * Click-to-browse functionality.
* **Effects Selection (Tabs/List):**
    * Primary toggle/tabs to switch between the two main modes: **ASCII Render** and **Pixel Reveal**.
    * Visual indicator (e.g., a dot or highlighted text) showing the currently active effect.

### 3.2. Center Panel (Preview Canvas)
* **State 1: Empty:** Displays placeholder text ("Awaiting input - Drop a file or select a source") centered in the screen.
* **State 2: Active:** Displays the real-time, animated rendering of the applied effect on the uploaded image. 
* **Controls:** Basic zoom controls (e.g., 100%, +, -, Reset) located at the bottom right corner of the canvas.

### 3.3. Right Panel (Customization & Export)
* **Settings/Customization (Dynamic based on Left Panel selection):**
    * *If ASCII Render is selected:* Sliders for Scale, Spacing, Output Width, and a dropdown for Character Set (e.g., Standard, Block, Binary).
    * *If Pixel Reveal is selected:* Sliders for Pixel Size, Animation Speed, Reveal Direction, etc. (mapped to the library's supported parameters).
* **Adjustments (Global):**
    * Standard image adjustment sliders: Brightness, Contrast, Saturation, Hue Rotation, Sharpness, Gamma.
* **Color Mode:**
    * Dropdown for color application (e.g., Original, Monochome).
    * Background color picker (defaulting to `#000000`).
* **Export Section:**
    * Format selection toggles/buttons: **GIF** and **MP4 (Video)**.
    * A primary "Export" or "Render" button to initiate the download.

## 4. Core User Flow
1.  **Upload:** User drags and drops an image into the Left Panel.
2.  **Select Mode:** User selects either "ASCII Render" or "Pixel Reveal" from the Left Panel.
3.  **Preview & Tweak:** The Center Panel immediately updates to show a live preview. The user adjusts sliders in the Right Panel (Scale, Brightness, etc.) to refine the look.
4.  **Export:** User scrolls to the bottom of the Right Panel, selects either GIF or MP4, and clicks Export. The browser processes the animation and prompts a file download.

## 5. Library Integration Requirements
* The AI agent developing this must refer to the provided GitHub repository documentation to map the specific API calls and configuration objects to the UI sliders in the Right Panel.
* The animation loop must be hooked into the browser's `requestAnimationFrame` or the library's native animation loop to ensure smooth playback in the Center Panel preview.

## 6. Future Considerations (Extensibility)
* Ensure the state management (e.g., Context API or Zustand) is structured so that adding new effects (like Dithering, Halftone, Matrix Rain) in the Left Panel can be done simply by extending an array of effect objects.
