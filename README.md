<div align="center">

# 💸 Smart Expense Tracker (PKR)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://smart-expense-tracker-pkr.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/razazaheer12/Smart-Expense-Tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Mobile--First](https://img.shields.io/badge/Design-Mobile--First-10b981?style=for-the-badge)](https://github.com/razazaheer12/Smart-Expense-Tracker)

<p align="center">
  A clean, modern SaaS personal finance dashboard engineered with a mobile-first approach, localized for <strong>Pakistani Rupees (PKR)</strong>. Features real-time budget spending analytics, dynamic category breakdown, transaction editing, search/filter toolbar, and one-click <strong>CSV & PDF export</strong> utilities.
</p>

[🚀 Live Demo](https://smart-expense-tracker-pkr.netlify.app/) &bull; [Explore Repository](https://github.com/razazaheer12/Smart-Expense-Tracker) &bull; [Report Bug](https://github.com/razazaheer12/Smart-Expense-Tracker/issues) &bull; [Request Feature](https://github.com/razazaheer12/Smart-Expense-Tracker/issues)

</div>

<img width="949" height="439" alt="image" src="https://github.com/user-attachments/assets/a9a0ec73-befb-4839-b8ed-8228314d5ca6" />


---

## 📖 Overview

**Smart Expense Tracker (FinTrack)** is an enterprise-grade, client-side personal finance management web application. Designed around clean, light-themed SaaS principles (inspired by CartWise, Stripe, and Linear), it provides an uncluttered, responsive dashboard for tracking daily income and expenditures without heavy frameworks or backend dependencies.

All data is managed locally using the browser's `LocalStorage` API with zero external tracking, offering complete data privacy and instant load times.

---

## ✨ Key Features

- **💼 Modern Light SaaS Dashboard Layout**: Clean, border-card architecture eliminating nested framing, built with a crisp slate background (`#f8fafc`) and subtle drop-shadows.
- **📱 100% Mobile-First & Pixel-Perfect Responsiveness**: Built with `min-width` progressive enhancement media queries ensuring zero text truncation, zero horizontal overflow, and touch-optimized controls across phones (320px+), tablets, laptops, and large displays.
- **🇵🇰 Pakistani Rupee (PKR) Currency Localization**: Native currency formatting via `Intl.NumberFormat('en-PK', { currency: 'PKR' })` across balance metrics, expense cards, transaction items, and report exports.
- **🏷️ Comprehensive Category Tagging**: 11 icon-rich categories (💼 Salary, 🏢 Freelance, 📈 Investments, 🍔 Food & Dining, 🛍️ Shopping, 💡 Bills & Utilities, 🏠 Rent & Housing, 🚗 Transport & Fuel, 🏥 Healthcare, 🎬 Entertainment, 📦 Others) rendered with visual pill badges.
- **✏️ Full CRUD Operations & In-Place Editing**:
  - Add income or expense transactions with category and date assignment.
  - One-click **Edit** button populates the form, toggles button state to *"Update Transaction"*, and smoothly scrolls to the input fields.
  - Dedicated **Cancel Edit** button to discard modifications safely.
  - Delete individual entries with instant UI and balance synchronization.
- **📊 Financial Overview & Spending Ratio**:
  - Net Balance, Total Income, and Total Expense cards.
  - Dynamic spending ratio progress bar that adapts dynamically from mint green (`< 75%`) to warning amber (`75% - 99%`) and rose red (`≥ 100%`).
  - Visual category breakdown displaying spending shares and horizontal progress bars.
- **🔍 Real-Time Search, Filter & Sorting Toolbar**:
  - Live query filtering across both descriptions and category tags with one-click clear (`×`).
  - Filter pills for **All**, **Income**, and **Expense** feeds.
  - Multi-criteria sorting: *Newest First*, *Oldest First*, *Highest Amount*, and *Lowest Amount*.
  - Dynamic counter displaying matching transactions (`Showing X of Y`).
- **📑 Data Management & Export Utilities**:
  - **Export to CSV**: Generates standard RFC 4180 spreadsheet-ready `.csv` files.
  - **Download PDF Statement Report**: Formatted PDF statements powered by `jsPDF` and `jsPDF-AutoTable` with dark header styling, zebra striping, and colored cashflow indicators.
  - **Clear All with Confirmation Modal**: Non-intrusive safety dialog preventing accidental data erasure.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Structure** | HTML5 | Semantic markup, responsive viewport, accessible form controls |
| **Styling** | CSS3 | Mobile-first CSS Grid, Flexbox, custom design tokens (`:root`), light SaaS theme |
| **Application Logic** | JavaScript (ES6+) | Vanilla DOM manipulation, `Intl.NumberFormat`, `LocalStorage` persistence |
| **Typography** | Google Fonts | [Poppins](https://fonts.google.com/specimen/Poppins) (Weights: 300, 400, 500, 600, 700, 800) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | Client-side vector PDF document generator |
| **PDF Tables** | [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Automated tabular layout and zebra styling for PDF statements |

---

## 📂 Project Structure

```text
Smart-Expense-Tracker/
├── index.html         # Application layout, semantic markup, and modal structures
├── style.css          # Mobile-first SaaS light theme stylesheet & CSS variables
├── index.js           # Core state management, CRUD, analytics, and PDF/CSV export logic
└── README.md          # Project documentation, feature overview, and setup guide
```

---

## 🚀 Quick Start Guide

### Option 1: Try the Live Demo (Instant)

Test the application immediately in your web browser with zero installation:  
👉 **[https://smart-expense-tracker-pkr.netlify.app/](https://smart-expense-tracker-pkr.netlify.app/)**

---

### Option 2: Run Locally via Git Clone

1. **Clone the repository:**
   ```bash
   git clone https://github.com/razazaheer12/Smart-Expense-Tracker.git
   ```

2. **Navigate into the project directory:**
   ```bash
   cd Smart-Expense-Tracker
   ```

3. **Launch the application:**
   - Simply double-click `index.html` to open it in your default web browser.
   - Alternatively, open the directory in **VS Code** and use the **Live Server** extension (`Right Click index.html -> Open with Live Server`).

---

### Option 3: Deploy to Netlify / Vercel / GitHub Pages

Since **Smart Expense Tracker** is a 100% vanilla client-side project without a build step, deployment is instantaneous:

#### Deploy on Netlify:
The official live demo is deployed on Netlify:  
🔗 **[https://smart-expense-tracker-pkr.netlify.app/](https://smart-expense-tracker-pkr.netlify.app/)**

To deploy your own fork:
1. Go to [Netlify](https://www.netlify.com/) and click **Add new site** &rarr; **Import an existing project**.
2. Connect your GitHub account and select `razazaheer12/Smart-Expense-Tracker`.
3. Leave build command and publish directory blank (defaults to root).
4. Click **Deploy Site**.

#### Deploy on GitHub Pages:
1. Push the code to your repository:
   ```bash
   git add .
   git commit -m "Initial commit: Smart Expense Tracker"
   git push origin main
   ```
2. In your repository on GitHub, navigate to **Settings** &rarr; **Pages**.
3. Under **Branch**, select `main` and root directory `/ (root)`, then click **Save**.
4. Your site will be published live at `https://razazaheer12.github.io/Smart-Expense-Tracker/`.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) &mdash; feel free to modify, distribute, and use it in your personal and commercial projects.

---

<div align="center">
  <sub>Engineered with ❤️ by <a href="https://github.com/razazaheer12">Raza Zaheer</a></sub>
</div>
