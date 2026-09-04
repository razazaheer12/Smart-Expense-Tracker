/**
 * ==========================================================================
 * FINTRACK - ENTERPRISE FINTECH APPLICATION LOGIC
 * ==========================================================================
 */

// Category icons map
const CATEGORY_ICONS = {
  Salary: "💼",
  Freelance: "🏢",
  Investments: "📈",
  "Food & Dining": "🍔",
  Shopping: "🛍️",
  "Bills & Utilities": "💡",
  "Rent & Housing": "🏠",
  "Transport & Fuel": "🚗",
  Healthcare: "🏥",
  Entertainment: "🎬",
  Others: "📦",
};

// DOM References - Overview & Financial Metrics
const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const spendingProgressBarEl = document.getElementById("spending-progress-bar");
const spendingPercentTextEl = document.getElementById("spending-percent-text");
const spendingRemainingTextEl = document.getElementById("spending-remaining-text");

// DOM References - Transaction Hub & Toolbar
const transactionListEl = document.getElementById("transaction-list");
const transactionCountEl = document.getElementById("transaction-count");
const searchInputEl = document.getElementById("search-input");
const clearSearchBtnEl = document.getElementById("clear-search-btn");
const filterPillsContainer = document.getElementById("filter-pills");
const sortSelectEl = document.getElementById("sort-select");

// DOM References - Analytics
const categoryBreakdownListEl = document.getElementById("category-breakdown-list");

// DOM References - Form & Type Switcher
const transactionFormEl = document.getElementById("transaction-form");
const formTitleEl = document.getElementById("form-title");
const submitBtnTextEl = document.getElementById("submit-btn-text");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const typeExpenseBtn = document.getElementById("type-expense");
const typeIncomeBtn = document.getElementById("type-income");
const transactionTypeInput = document.getElementById("transaction-type");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const dateEl = document.getElementById("date");
const categoryEl = document.getElementById("category");

// DOM References - Actions & Modal
const exportCsvBtn = document.getElementById("export-csv-btn");
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const confirmModal = document.getElementById("confirm-modal");
const cancelClearBtn = document.getElementById("cancel-clear-btn");
const confirmClearBtn = document.getElementById("confirm-clear-btn");

// App State
let transactions = loadTransactions();
let currentFilter = "all"; // 'all' | 'income' | 'expense'
let currentSearchQuery = "";
let currentSort = "date-desc";
let editingTransactionId = null; // Holds ID of transaction being edited

// ==========================================================================
// INITIALIZATION
// ==========================================================================

function init() {
  // Set default date picker to today
  const today = new Date().toISOString().split("T")[0];
  if (dateEl) {
    dateEl.value = today;
  }

  // Setup Event Listeners
  setupEventListeners();

  // Initial UI Render
  renderApp();
}

function setupEventListeners() {
  // Transaction Form Submission
  transactionFormEl.addEventListener("submit", handleAddOrUpdateTransaction);

  // Cancel Edit Button
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEdit);
  }

  // Type Switcher Buttons
  typeExpenseBtn.addEventListener("click", () => setTransactionType("expense"));
  typeIncomeBtn.addEventListener("click", () => setTransactionType("income"));

  // Real-time Search Input
  searchInputEl.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtnEl.style.display = currentSearchQuery.length > 0 ? "block" : "none";
    renderTransactions();
  });

  // Clear Search Button
  clearSearchBtnEl.addEventListener("click", () => {
    searchInputEl.value = "";
    currentSearchQuery = "";
    clearSearchBtnEl.style.display = "none";
    searchInputEl.focus();
    renderTransactions();
  });

  // Filter Pills (All / Income / Expense)
  filterPillsContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;

    filterPillsContainer.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.classList.remove("active");
    });
    pill.classList.add("active");

    currentFilter = pill.dataset.filter;
    renderTransactions();
  });

  // Sorting Dropdown
  sortSelectEl.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderTransactions();
  });

  // Export to CSV & Download PDF
  exportCsvBtn.addEventListener("click", exportToCSV);
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", downloadPDF);
  }

  // Clear All Modal Controls
  clearAllBtn.addEventListener("click", openClearModal);
  cancelClearBtn.addEventListener("click", closeClearModal);
  confirmClearBtn.addEventListener("click", handleClearAllData);

  // Close modal when clicking on overlay backdrop or pressing Esc
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) closeClearModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && confirmModal.style.display === "flex") {
      closeClearModal();
    }
  });
}

// ==========================================================================
// LOCAL STORAGE & DATA MIGRATION
// ==========================================================================

function loadTransactions() {
  // Backward compatibility: retrieve from 'transactions' or legacy typo 'transcations'
  const rawData = localStorage.getItem("transactions") || localStorage.getItem("transcations");
  let parsed = [];

  try {
    parsed = JSON.parse(rawData) || [];
  } catch (err) {
    console.error("Failed to parse transactions from localStorage:", err);
    parsed = [];
  }

  // Normalize data ensuring required properties exist
  const today = new Date().toISOString().split("T")[0];
  return parsed.map((item) => {
    const amountNum = typeof item.amount === "number" ? item.amount : parseFloat(item.amount) || 0;
    const defaultCategory = amountNum > 0 ? "Salary" : "Others";
    const itemDate = item.date || (item.id ? new Date(item.id).toISOString().split("T")[0] : today);

    return {
      id: item.id || Date.now() + Math.floor(Math.random() * 1000),
      description: item.description || "Untitled Transaction",
      amount: amountNum,
      category: item.category || defaultCategory,
      date: itemDate,
    };
  });
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  // Clean up legacy typo key if it exists
  localStorage.removeItem("transcations");
}

// ==========================================================================
// TRANSACTION MANAGEMENT (ADD, EDIT & DELETE)
// ==========================================================================

function handleAddOrUpdateTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const rawAmount = parseFloat(amountEl.value);
  const selectedType = transactionTypeInput.value;
  const selectedCategory = categoryEl.value;
  const selectedDate = dateEl.value || new Date().toISOString().split("T")[0];

  if (!description || isNaN(rawAmount) || rawAmount <= 0 || !selectedCategory) {
    return;
  }

  // Calculate signed amount
  const finalAmount = selectedType === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  if (editingTransactionId !== null) {
    // Update existing transaction
    const txIndex = transactions.findIndex((tx) => tx.id === editingTransactionId);
    if (txIndex !== -1) {
      transactions[txIndex] = {
        ...transactions[txIndex],
        description,
        amount: finalAmount,
        category: selectedCategory,
        date: selectedDate,
      };
    }
    cancelEdit();
  } else {
    // Add new transaction
    const newTransaction = {
      id: Date.now(),
      description,
      amount: finalAmount,
      category: selectedCategory,
      date: selectedDate,
    };
    transactions.push(newTransaction);
    // Reset form fields
    descriptionEl.value = "";
    amountEl.value = "";
    categoryEl.value = "";
    descriptionEl.focus();
  }

  saveTransactions();
  renderApp();
}

function startEditTransaction(id) {
  const tx = transactions.find((item) => item.id === id);
  if (!tx) return;

  editingTransactionId = id;
  descriptionEl.value = tx.description;
  amountEl.value = Math.abs(tx.amount);
  categoryEl.value = tx.category || "Others";
  dateEl.value = tx.date || new Date().toISOString().split("T")[0];

  const type = tx.amount > 0 ? "income" : "expense";
  setTransactionType(type);

  // Update UI to edit mode
  if (formTitleEl) formTitleEl.textContent = "Edit Transaction";
  if (submitBtnTextEl) submitBtnTextEl.textContent = "Update Transaction";
  if (cancelEditBtn) cancelEditBtn.style.display = "inline-flex";

  // Smooth scroll to form on mobile devices
  transactionFormEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  descriptionEl.focus();
}

function cancelEdit() {
  editingTransactionId = null;
  transactionFormEl.reset();
  if (dateEl) dateEl.value = new Date().toISOString().split("T")[0];
  setTransactionType("expense");

  // Reset UI back to add mode
  if (formTitleEl) formTitleEl.textContent = "Add Transaction";
  if (submitBtnTextEl) submitBtnTextEl.textContent = "Add Transaction";
  if (cancelEditBtn) cancelEditBtn.style.display = "none";
}

function removeTransaction(id) {
  // If the item being deleted is currently in edit mode, cancel edit
  if (editingTransactionId === id) {
    cancelEdit();
  }

  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  renderApp();
}

function setTransactionType(type) {
  transactionTypeInput.value = type;

  if (type === "expense") {
    typeExpenseBtn.classList.add("active");
    typeIncomeBtn.classList.remove("active");
    // Pre-select popular expense category if empty
    if (!categoryEl.value) {
      categoryEl.value = "Food & Dining";
    }
  } else {
    typeIncomeBtn.classList.add("active");
    typeExpenseBtn.classList.remove("active");
    // Pre-select Salary for income if empty or an expense category was set
    if (!categoryEl.value || categoryEl.value === "Food & Dining") {
      categoryEl.value = "Salary";
    }
  }
}

// ==========================================================================
// FILTERING & SORTING LOGIC
// ==========================================================================

function getFilteredTransactions() {
  let filtered = transactions.filter((tx) => {
    // 1. Type filter
    if (currentFilter === "income" && tx.amount <= 0) return false;
    if (currentFilter === "expense" && tx.amount >= 0) return false;

    // 2. Search query filter
    if (currentSearchQuery) {
      const matchDesc = tx.description.toLowerCase().includes(currentSearchQuery);
      const matchCat = tx.category.toLowerCase().includes(currentSearchQuery);
      if (!matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Apply Sorting
  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime() || a.id;
    const dateB = new Date(b.date).getTime() || b.id;

    switch (currentSort) {
      case "date-asc":
        return dateA - dateB;
      case "amount-desc":
        return Math.abs(b.amount) - Math.abs(a.amount);
      case "amount-asc":
        return Math.abs(a.amount) - Math.abs(b.amount);
      case "date-desc":
      default:
        return dateB - dateA;
    }
  });

  return filtered;
}

// ==========================================================================
// UI RENDERING ENGINE
// ==========================================================================

function renderApp() {
  updateSummary();
  updateSpendingProgress();
  updateCategoryBreakdown();
  renderTransactions();
}

function renderTransactions() {
  const filtered = getFilteredTransactions();

  // Update dynamic count badge
  transactionCountEl.textContent = filtered.length;

  // Clear container
  transactionListEl.innerHTML = "";

  // Render empty state if no transactions match
  if (filtered.length === 0) {
    const isFiltered = currentSearchQuery.length > 0 || currentFilter !== "all";
    transactionListEl.innerHTML = `
      <li class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>${isFiltered ? "No matching transactions found." : "No transactions recorded yet."}</p>
        <small style="color: var(--text-dim);">${isFiltered ? "Try resetting search or filters" : "Add your first transaction using the form"}</small>
      </li>
    `;
    return;
  }

  // Populate transaction list items
  filtered.forEach((tx) => {
    const isIncome = tx.amount > 0;
    const catIcon = CATEGORY_ICONS[tx.category] || "📦";
    const formattedDate = formatDateDisplay(tx.date);

    const li = document.createElement("li");
    li.className = `transaction ${isIncome ? "income" : "expense"}`;
    li.innerHTML = `
      <div class="tx-main">
        <div class="tx-top">
          <span class="tx-desc" title="${escapeHtml(tx.description)}">${escapeHtml(tx.description)}</span>
          <span class="tx-badge">${catIcon} ${escapeHtml(tx.category)}</span>
        </div>
        <span class="tx-date">${formattedDate}</span>
      </div>
      <div class="tx-right">
        <span class="tx-amount">${isIncome ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}</span>
        <button class="edit-btn" onclick="startEditTransaction(${tx.id})" title="Edit transaction" aria-label="Edit">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="delete-btn" onclick="removeTransaction(${tx.id})" title="Delete transaction" aria-label="Delete">
          &times;
        </button>
      </div>
    `;

    transactionListEl.appendChild(li);
  });
}

// ==========================================================================
// FINANCIAL METRICS & ANALYTICS CALCULATIONS (PKR CURRENCY)
// ==========================================================================

function updateSummary() {
  const balance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const income = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(Math.abs(expenses));
}

function updateSpendingProgress() {
  const income = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expenses = Math.abs(
    transactions
      .filter((tx) => tx.amount < 0)
      .reduce((acc, tx) => acc + tx.amount, 0)
  );

  let percent = 0;
  let remainingMessage = "";

  // Reset classes on fill bar
  spendingProgressBarEl.classList.remove("warning", "danger");

  if (income > 0) {
    percent = Math.round((expenses / income) * 100);
    const clampedWidth = Math.min(percent, 100);
    spendingProgressBarEl.style.width = `${clampedWidth}%`;
    spendingPercentTextEl.textContent = `${percent}%`;

    if (percent >= 100) {
      spendingProgressBarEl.classList.add("danger");
      const overspent = expenses - income;
      remainingMessage = `⚠️ Budget exceeded by ${formatCurrency(overspent)}`;
    } else if (percent >= 75) {
      spendingProgressBarEl.classList.add("warning");
      const remaining = income - expenses;
      remainingMessage = `${formatCurrency(remaining)} left (${100 - percent}% of budget remaining)`;
    } else {
      const remaining = income - expenses;
      remainingMessage = `${formatCurrency(remaining)} remaining balance`;
    }
  } else if (expenses > 0) {
    // Has expenses but no recorded income
    spendingProgressBarEl.style.width = "100%";
    spendingProgressBarEl.classList.add("danger");
    spendingPercentTextEl.textContent = "100%+";
    remainingMessage = `No income recorded. Total spent: ${formatCurrency(expenses)}`;
  } else {
    // Zero transactions
    spendingProgressBarEl.style.width = "0%";
    spendingPercentTextEl.textContent = "0%";
    remainingMessage = "Add income and expenses to track budget health.";
  }

  spendingRemainingTextEl.textContent = remainingMessage;
}

function updateCategoryBreakdown() {
  const expenseTransactions = transactions.filter((tx) => tx.amount < 0);
  const totalExpense = Math.abs(
    expenseTransactions.reduce((acc, tx) => acc + tx.amount, 0)
  );

  categoryBreakdownListEl.innerHTML = "";

  if (totalExpense === 0) {
    categoryBreakdownListEl.innerHTML = `
      <div style="padding: 24px 8px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
        No expense data recorded yet.
      </div>
    `;
    return;
  }

  // Aggregate expenses by category
  const categoryTotals = {};
  expenseTransactions.forEach((tx) => {
    const cat = tx.category || "Others";
    const amt = Math.abs(tx.amount);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  // Sort categories by highest spend
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([category, amount]) => {
    const percentage = Math.round((amount / totalExpense) * 100);
    const catIcon = CATEGORY_ICONS[category] || "📦";

    const catItem = document.createElement("div");
    catItem.className = "cat-item";
    catItem.innerHTML = `
      <div class="cat-item-header">
        <span class="cat-item-name">${catIcon} ${escapeHtml(category)}</span>
        <div>
          <span class="cat-item-amount">${formatCurrency(amount)}</span>
          <span class="cat-item-pct">(${percentage}%)</span>
        </div>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width: ${percentage}%;"></div>
      </div>
    `;

    categoryBreakdownListEl.appendChild(catItem);
  });
}

// ==========================================================================
// DATA EXPORT (CSV UTILITY - PKR FORMAT)
// ==========================================================================

function exportToCSV() {
  if (transactions.length === 0) {
    alert("No transactions available to export. Add some transactions first!");
    return;
  }

  // CSV Headers with PKR denomination
  const headers = ["Transaction ID", "Date", "Description", "Category", "Type", "Amount (PKR)"];

  // Sort rows chronologically for export
  const sortedRows = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build CSV rows with proper RFC 4180 escaping
  const csvRows = [
    headers.join(","),
    ...sortedRows.map((tx) => {
      const type = tx.amount > 0 ? "Income" : "Expense";
      const cleanDesc = `"${tx.description.replace(/"/g, '""')}"`;
      const cleanCat = `"${tx.category.replace(/"/g, '""')}"`;
      const formattedAmount = Math.abs(tx.amount).toFixed(2);

      return [tx.id, tx.date, cleanDesc, cleanCat, type, formattedAmount].join(",");
    }),
  ];

  const csvContent = csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Trigger download via temporary link
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `fintrack_transactions_pkr_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// DATA EXPORT (PDF REPORT UTILITY - PKR FORMAT)
// ==========================================================================

function downloadPDF() {
  // Ensure jsPDF library is available
  if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
    alert("PDF generator library (jsPDF) is loading or unavailable. Please check your connection.");
    return;
  }

  // Get currently filtered or stored transactions
  const targetTransactions = getFilteredTransactions();
  if (targetTransactions.length === 0) {
    alert("No transactions available to generate PDF report. Add transactions or adjust your filters.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  // 1. Header: App Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("Expense Tracker Statement", marginX, 20);

  // Subtitle & Generation Timestamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const currentTimestamp = new Date().toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.text(`Generated on: ${currentTimestamp} • Source: FinTrack Financial OS (PKR)`, marginX, 26);

  // 2. Summary Metrics Calculation
  const totalIncome = targetTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = Math.abs(
    targetTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((acc, tx) => acc + tx.amount, 0)
  );

  const netBalance = totalIncome - totalExpenses;

  // Summary Metrics Card Deck
  const cardY = 32;
  const cardHeight = 18;
  const cardSpacing = 6;
  const cardWidth = (pageWidth - marginX * 2 - cardSpacing * 2) / 3;

  // Card 1: Net Balance
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("NET BALANCE", marginX + 4, cardY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(netBalance), marginX + 4, cardY + 13);

  // Card 2: Total Income
  const incomeCardX = marginX + cardWidth + cardSpacing;
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(incomeCardX, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL INCOME", incomeCardX + 4, cardY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`+${formatCurrency(totalIncome)}`, incomeCardX + 4, cardY + 13);

  // Card 3: Total Expenses
  const expenseCardX = marginX + (cardWidth + cardSpacing) * 2;
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(expenseCardX, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72);
  doc.text("TOTAL EXPENSES", expenseCardX + 4, cardY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(225, 29, 72);
  doc.text(`-${formatCurrency(totalExpenses)}`, expenseCardX + 4, cardY + 13);

  // 3. Transactions Table (PKR Amount Column)
  const tableData = targetTransactions.map((tx) => {
    const isIncome = tx.amount > 0;
    const typeLabel = isIncome ? "Income" : "Expense";
    const amountStr = `${isIncome ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`;
    return [
      formatDateDisplay(tx.date) || tx.date,
      tx.description || "Untitled",
      tx.category || "Others",
      typeLabel,
      amountStr,
    ];
  });

  doc.autoTable({
    startY: cardY + cardHeight + 8,
    margin: { left: marginX, right: marginX },
    head: [["Date", "Description", "Category", "Type", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 3.8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 32 },
      3: { cellWidth: 22 },
      4: { halign: "right", cellWidth: 35 },
    },
    didParseCell: function (data) {
      if (data.section === "body") {
        const row = data.row.raw;
        const typeValue = row[3];

        if (data.column.index === 3 || data.column.index === 4) {
          if (typeValue === "Income") {
            data.cell.styles.textColor = [5, 150, 105]; // Forest Green
            data.cell.styles.fontStyle = "bold";
          } else if (typeValue === "Expense") {
            data.cell.styles.textColor = [225, 29, 72]; // Rose Red
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    },
  });

  // 4. Footer: Page numbers and summary line on each page
  const totalPages = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Summary line
    doc.text(
      "FinTrack — Confidential Expense Tracker Statement (PKR)",
      marginX,
      pageHeight - 9
    );

    // Page number
    const pageText = `Page ${i} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - marginX - textWidth, pageHeight - 9);
  }

  // Save the generated PDF
  const dateStamp = new Date().toISOString().split("T")[0];
  doc.save(`expense_statement_pkr_${dateStamp}.pdf`);
}

// ==========================================================================
// CLEAR ALL DATA & MODAL MANAGEMENT
// ==========================================================================

function openClearModal() {
  if (transactions.length === 0) {
    alert("There are no transactions to clear.");
    return;
  }
  confirmModal.style.display = "flex";
}

function closeClearModal() {
  confirmModal.style.display = "none";
}

function handleClearAllData() {
  transactions = [];
  cancelEdit();
  localStorage.removeItem("transactions");
  localStorage.removeItem("transcations");
  closeClearModal();
  renderApp();
}

// ==========================================================================
// FORMATTING HELPERS (PKR CURRENCY)
// ==========================================================================

function formatCurrency(number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDateDisplay(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return dateString;
}

function escapeHtml(string) {
  if (!string) return "";
  return String(string)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialize Application
init();