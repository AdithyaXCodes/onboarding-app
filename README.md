# Employee Onboarding App

A full-stack web application for employee onboarding. Users can fill an onboarding form, and an admin dashboard displays all employee records.

- **Frontend:** React + Vite  
- **Backend:** Flask + SQLite  
- **Features:** Form submission, data storage, admin dashboard, responsive layout

---

## Running the Application

Open **two terminals** in your project folder:

### Terminal 1 — Backend (Flask)

cd onboarding-app
source .venv/bin/activate
python backend/app.py

cd onboarding-app/frontend
npm run dev

### Terminal 2 — Fronkend (REACT+vite)

cd onboarding-app/frontend
npm run dev



### PROMPT USED ###

Prompt:

Build a single-file React Employee Onboarding System (EmployeeOnboarding.jsx) with two tabs: New Employee Form and Admin Dashboard.
Functionality:

Onboarding form with fields: Full Name, Email, Phone, City, State, ZIP, Department (Engineering/HR/Marketing/Sales/Finance/Design), Role (Developer/Designer/Manager/Intern/Analyst/Lead), Work Mode (Remote/Office/Hybrid), Joining Date, and Profile Photo upload
Photo upload with live base64 preview; show generated avatar initials with a unique color if no photo is uploaded
Inline field validation with error messages; a confirmation checkbox that must be checked before the submit button activates
Success animation screen after submit
Admin dashboard with a stats bar (Total / Remote / Office / Hybrid counts), and a table showing all employees
Table filters: text search by name/email/ID, dropdown filter by department, dropdown filter by work mode, and a Clear button
Row actions: View (opens a modal), Edit (loads pre-filled form), Delete (shows a confirmation dialog)
View modal has a gradient purple header, floating avatar, and info tiles
Edit pre-fills all form fields and shows current photo; photo is optional on edit
3 demo employees pre-loaded on first render

Design:

Font pairing: Playfair Display (headings) + Sora (body/UI), loaded from Google Fonts
Color system: indigo/violet primary (#6366f1, #8b5cf6), light background gradient (#f0f4ff → #f5f0ff → #fff0f6), white cards
Top navbar with an HR logo badge and tab navigation with an active indigo underline indicator
Colored department and work mode badges with unique background/text color pairs per value
Stats tiles with colored backgrounds matching each work mode
Form sections in light #fafafa cards with 1.5px borders; inputs highlight indigo on focus
Table rows on white with 6px border-spacing; action buttons are small colored icon buttons (👁 ✏️ 🗑) with colored backgrounds
Confirm/delete dialog and view modal use backdrop-filter: blur(4px) overlays
fadeIn keyframe animation on table rows with staggered delay
(CLAUDE AI)

Used ChatGPT with code assistance features to help generate, debug, and integrate frontend and backend components.

