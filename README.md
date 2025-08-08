# Inspecto App

## Overview
Inspecto App is a modern React-based web application designed for advanced automation, reporting, and device control. It leverages a modular component architecture and integrates with various device APIs, charts, PDF generation, and real-time data visualization.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS
- **Visualization:** react-charts, chartjs-to-image
- **PDF Generation:** @react-pdf/renderer
- **Device APIs:** roslib, joypad.js
- **UI Components:** react-daisyui, react-icons, custom components
- **Networking:** axios, cors
- **Utilities:** dotenv, file-saver, sweetalert2

## Directory Structure
```
inspecto-app/
├── dist/                  # Production build output
├── js/                    # (Custom JavaScript, if any)
├── node_modules/          # Dependencies
├── public/                # Static public assets
├── src/                   # Source code
│   ├── App.jsx            # Main React app entry
│   ├── main.jsx           # Vite entry point
│   ├── Components/        # Reusable UI and logic components
│   │   ├── common/        # Common/shared components
│   │   ├── features/      # Feature-specific components
│   │   └── ui/            # UI widgets and panels
│   ├── assets/            # Images and static assets
│   ├── fonts/             # Custom fonts
│   ├── pages/             # Main page-level components (Home, Login, PDF Generation)
│   └── styles/            # CSS files (Tailwind, custom styles)
├── package.json           # Project metadata and scripts
├── postcss.config.cjs     # PostCSS config
├── tailwind.config.cjs    # Tailwind CSS config
├── vite.config.js         # Vite config
├── webpack.config.cjs     # Webpack config (if used)
└── README.md              # Project documentation (this file)
```

## Main Pages
- **Home.jsx**: The main dashboard and entry point for users.
- **login.jsx**: Authentication and login page.
- **GeneratePDF.jsx**: Page for generating PDF reports from app data.

## Component Structure
- **Components/common/**: Shared buttons, navigation, indicators (e.g., `NavBar.jsx`, `GeneratePDFButton.jsx`).
- **Components/features/**: Domain-specific modules (e.g., `CleaningModule.jsx`, `LEDController.jsx`, `ReportForm.jsx`).
- **Components/ui/**: UI widgets and panels (e.g., `BtnFullscreen.jsx`, `MediaPanel.jsx`, `OdometerPanel.jsx`).

## Assets & Styles
- **assets/images/**: Image assets (e.g., `a2tech.png`).
- **fonts/**: Custom font files.
- **styles/**: CSS files including Tailwind and custom styles (`App.css`, `index.css`).

## Setup & Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run in development:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Extending & Contributing
- Add new features by creating components in the appropriate `src/Components/` subdirectory.
- Page-level logic should go in `src/pages/`.
- For UI consistency, use Tailwind CSS classes and reference shared components.
- Document all new components using JSDoc or PropTypes.

## Additional Notes
- Environment variables can be set in `.env`.
- Uses Vite for fast development and HMR.
- Some device-specific functionality may require browser permissions or device access.

---
For detailed documentation on each component or module, see the source code files in `src/Components/` and `src/pages/`. Inline comments and JSDoc are provided where necessary.
