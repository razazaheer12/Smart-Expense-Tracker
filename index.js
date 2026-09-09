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

// DOM References - Actions & Mobile Menu
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const headerActionsMenu = document.getElementById("header-actions-menu");
const exportCsvBtn = document.getElementById("export-csv-btn");
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const confirmModal = document.getElementById("confirm-modal");
const cancelClearBtn = document.getElementById("cancel-clear-btn");
const confirmClearBtn = document.getElementById("confirm-clear-btn");

// DOM References - Backup & Restore Modal and Toast Container
const backupRestoreBtn = document.getElementById("backup-restore-btn");
const backupRestoreModal = document.getElementById("backup-restore-modal");
const closeBackupModalBtn = document.getElementById("close-backup-modal-btn");
const downloadBackupBtn = document.getElementById("download-backup-btn");
const exportTxCountEl = document.getElementById("export-tx-count");
const restoreFileInput = document.getElementById("restore-file-input");
const triggerFileSelectBtn = document.getElementById("trigger-file-select-btn");
const selectFileLabel = document.getElementById("select-file-label");
const restorePreview = document.getElementById("restore-preview");
const previewFilename = document.getElementById("preview-filename");
const previewCount = document.getElementById("preview-count");
const previewDates = document.getElementById("preview-dates");
const previewBalance = document.getElementById("preview-balance");
const executeRestoreBtn = document.getElementById("execute-restore-btn");
const restoreErrorBox = document.getElementById("restore-error-box");
const toastContainer = document.getElementById("toast-container");

// DOM References - Budget Control & Modal
const budgetProgressTitleEl = document.getElementById("budget-progress-title");
const openBudgetModalBtn = document.getElementById("open-budget-modal-btn");
const budgetTargetBadgeEl = document.getElementById("budget-target-badge");
const budgetPeriodSpentTextEl = document.getElementById("budget-period-spent-text");
const budgetModal = document.getElementById("budget-modal");
const closeBudgetModalBtn = document.getElementById("close-budget-modal-btn");
const cancelBudgetBtn = document.getElementById("cancel-budget-btn");
const budgetSettingsForm = document.getElementById("budget-settings-form");
const budgetPeriodSwitcher = document.getElementById("budget-period-switcher");
const budgetAmountInput = document.getElementById("budget-target-input") || document.getElementById("budget-amount-input");
const resetBudgetBtn = document.getElementById("reset-budget-btn");

// DOM References - Budget Comparison Chart
const budgetComparisonCard = document.getElementById("budget-comparison-card");
const budgetComparisonCanvas = document.getElementById("budgetComparisonChart");
const budgetComparisonEmptyState = document.getElementById("budget-comparison-empty-state");
let budgetComparisonChartInstance = null;

// DOM References - Subscriptions & Recurring Manager
const subscriptionsBtn = document.getElementById("subscriptions-btn");
const recurringToggle = document.getElementById("recurring-toggle");
const recurringFrequencyWrapper = document.getElementById("recurring-frequency-wrapper");
const recurringFrequency = document.getElementById("recurring-frequency");
const subscriptionModal = document.getElementById("subscription-modal");
const closeSubscriptionModalBtn = document.getElementById("close-subscription-modal-btn");
const subscriptionsList = document.getElementById("subscriptions-list");
const subscriptionsEmptyState = document.getElementById("subscriptions-empty-state");
const dueRecurringModal = document.getElementById("due-recurring-modal");
const dueRecurringList = document.getElementById("due-recurring-list");
const skipDueBtn = document.getElementById("skip-due-btn");
const confirmDueBtn = document.getElementById("confirm-due-btn");

// App State
let transactions = loadTransactions();
let budgetSettings = loadBudgetSettings();
let recurringRules = loadRecurringRules();
let pendingRestoreData = null; // Verified parsed transactions waiting to be applied
let currentFilter = "all"; // 'all' | 'income' | 'expense'
let currentSearchQuery = "";
let currentSort = "date-desc";
let editingTransactionId = null; // Holds ID of transaction being edited

// Chart Instances (destroyed + re-created on each data update to prevent canvas errors)
let categoryChartInstance = null;
let cashFlowChartInstance = null;

// DOM References — Charts & Mobile View Tabs
const mainContentEl = document.getElementById("main-content");
const mobileViewTabsEl = document.getElementById("mobile-view-tabs");
const categoryChartCanvas = document.getElementById("categoryChart");
const cashFlowChartCanvas = document.getElementById("cashFlowChart");
const categoryEmptyState = document.getElementById("category-empty-state");
const cashflowEmptyState = document.getElementById("cashflow-empty-state");


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

  // Check for due recurring entries and subscriptions
  checkDueRecurringTransactions();

  // Register PWA Service Worker & Verify App Icons
  registerServiceWorker();
  ensureAppIcons();
}

function setupEventListeners() {
  // Transaction Form Submission
  transactionFormEl.addEventListener("submit", handleAddOrUpdateTransaction);

  // Cancel Edit Button
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEdit);
  }

  // Recurring Entry Checkbox Toggle
  if (recurringToggle && recurringFrequencyWrapper) {
    recurringToggle.addEventListener("change", () => {
      recurringFrequencyWrapper.style.display = recurringToggle.checked ? "flex" : "none";
    });
  }

  // Subscriptions Manager Modal Controls
  if (subscriptionsBtn) {
    subscriptionsBtn.addEventListener("click", openSubscriptionModal);
  }
  if (closeSubscriptionModalBtn) {
    closeSubscriptionModalBtn.addEventListener("click", closeSubscriptionModal);
  }

  // Due Recurring Prompt Controls
  if (skipDueBtn) {
    skipDueBtn.addEventListener("click", closeDueRecurringModal);
  }
  if (confirmDueBtn) {
    confirmDueBtn.addEventListener("click", handleConfirmDueRecurring);
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

  // Backup & Restore Modal Controls
  if (backupRestoreBtn) {
    backupRestoreBtn.addEventListener("click", openBackupModal);
  }
  if (closeBackupModalBtn) {
    closeBackupModalBtn.addEventListener("click", closeBackupModal);
  }
  if (downloadBackupBtn) {
    downloadBackupBtn.addEventListener("click", exportBackupJSON);
  }
  if (triggerFileSelectBtn && restoreFileInput) {
    triggerFileSelectBtn.addEventListener("click", () => restoreFileInput.click());
    restoreFileInput.addEventListener("change", handleRestoreFileSelect);
  }
  if (executeRestoreBtn) {
    executeRestoreBtn.addEventListener("click", executeRestore);
  }

  // Budget Settings Modal Controls
  if (openBudgetModalBtn) {
    openBudgetModalBtn.addEventListener("click", openBudgetModal);
  }
  if (closeBudgetModalBtn) {
    closeBudgetModalBtn.addEventListener("click", closeBudgetModal);
  }
  if (cancelBudgetBtn) {
    cancelBudgetBtn.addEventListener("click", closeBudgetModal);
  }
  if (budgetSettingsForm) {
    budgetSettingsForm.addEventListener("submit", handleSaveBudgetSettings);
  }
  if (resetBudgetBtn) {
    resetBudgetBtn.addEventListener("click", handleResetBudgetTarget);
  }
  if (budgetPeriodSwitcher) {
    budgetPeriodSwitcher.addEventListener("click", (e) => {
      const btn = e.target.closest(".budget-period-btn");
      if (!btn) return;
      budgetPeriodSwitcher.querySelectorAll(".budget-period-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  }

  // Mobile Actions Dropdown / Hamburger Menu Toggle
  if (mobileMenuBtn && headerActionsMenu) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = headerActionsMenu.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Auto-close menu when clicking any action item
    headerActionsMenu.addEventListener("click", (e) => {
      if (e.target.closest(".btn-action")) {
        headerActionsMenu.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Close when clicking outside header actions
    document.addEventListener("click", (e) => {
      if (!headerActionsMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        if (headerActionsMenu.classList.contains("open")) {
          headerActionsMenu.classList.remove("open");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  // Close modals when clicking on overlay backdrop
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) closeClearModal();
  });

  if (backupRestoreModal) {
    backupRestoreModal.addEventListener("click", (e) => {
      if (e.target === backupRestoreModal) closeBackupModal();
    });
  }

  if (budgetModal) {
    budgetModal.addEventListener("click", (e) => {
      if (e.target === budgetModal) closeBudgetModal();
    });
  }

  if (subscriptionModal) {
    subscriptionModal.addEventListener("click", (e) => {
      if (e.target === subscriptionModal) closeSubscriptionModal();
    });
  }

  if (dueRecurringModal) {
    dueRecurringModal.addEventListener("click", (e) => {
      if (e.target === dueRecurringModal) closeDueRecurringModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (headerActionsMenu && headerActionsMenu.classList.contains("open")) {
        headerActionsMenu.classList.remove("open");
        if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
      if (confirmModal && confirmModal.style.display === "flex") {
        closeClearModal();
      }
      if (backupRestoreModal && backupRestoreModal.style.display === "flex") {
        closeBackupModal();
      }
      if (budgetModal && budgetModal.style.display === "flex") {
        closeBudgetModal();
      }
      if (subscriptionModal && subscriptionModal.style.display === "flex") {
        closeSubscriptionModal();
      }
      if (dueRecurringModal && dueRecurringModal.style.display === "flex") {
        closeDueRecurringModal();
      }
    }
  });

  // Mobile View Tab Switcher ("Quick View" vs "Analytics")
  if (mobileViewTabsEl) {
    mobileViewTabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".view-tab-btn");
      if (!btn) return;

      const tab = btn.dataset.tab;
      mobileViewTabsEl.querySelectorAll(".view-tab-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      if (mainContentEl) mainContentEl.setAttribute("data-active-tab", tab);

      // Resize charts so they render at the correct pixel dimensions after display change
      setTimeout(() => {
        if (categoryChartInstance) categoryChartInstance.resize();
        if (cashFlowChartInstance) cashFlowChartInstance.resize();
        if (budgetComparisonChartInstance) budgetComparisonChartInstance.resize();
      }, 50);
    });
  }
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
      isRecurring: !!item.isRecurring,
      recurringFrequency: item.recurringFrequency || null,
    };
  });
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  // Clean up legacy typo key if it exists
  localStorage.removeItem("transcations");
}

function loadBudgetSettings() {
  const raw = localStorage.getItem("fintrack_budget_settings");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.amount === "number" && parsed.amount > 0) {
        return {
          amount: parsed.amount,
          period: parsed.period || "monthly",
        };
      }
    } catch (err) {
      console.warn("Failed to parse budget settings:", err);
    }
  }
  return { amount: 0, period: "monthly" };
}

function saveBudgetSettings() {
  localStorage.setItem("fintrack_budget_settings", JSON.stringify(budgetSettings));
}

function loadRecurringRules() {
  const raw = localStorage.getItem("fintrack_recurring_rules");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn("Failed to parse recurring rules:", err);
    }
  }
  return [];
}

function saveRecurringRules() {
  localStorage.setItem("fintrack_recurring_rules", JSON.stringify(recurringRules));
}

function calculateNextDueDate(fromDateStr, frequency = "monthly") {
  const parts = fromDateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dt = new Date(year, month, day);

  if (frequency === "weekly") {
    dt.setDate(dt.getDate() + 7);
  } else {
    // Monthly: advance month, clamp to last day of month if necessary
    const origDay = day;
    dt.setMonth(dt.getMonth() + 1);
    if (dt.getDate() < origDay) {
      dt.setDate(0);
    }
  }

  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
  const isRecurring = recurringToggle ? recurringToggle.checked : false;
  const selectedFrequency = isRecurring && recurringFrequency ? recurringFrequency.value : null;

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
        isRecurring,
        recurringFrequency: selectedFrequency,
      };

      // Sync associated recurring rule if present
      const ruleIndex = recurringRules.findIndex((r) => r.id === editingTransactionId);
      if (ruleIndex !== -1) {
        if (isRecurring) {
          recurringRules[ruleIndex].description = description;
          recurringRules[ruleIndex].amount = finalAmount;
          recurringRules[ruleIndex].category = selectedCategory;
          recurringRules[ruleIndex].frequency = selectedFrequency;
        } else {
          recurringRules.splice(ruleIndex, 1);
        }
        saveRecurringRules();
      } else if (isRecurring) {
        const nextDue = calculateNextDueDate(selectedDate, selectedFrequency);
        recurringRules.push({
          id: editingTransactionId,
          description,
          amount: finalAmount,
          category: selectedCategory,
          frequency: selectedFrequency,
          startDate: selectedDate,
          lastAddedDate: selectedDate,
          nextDueDate: nextDue,
          status: "active",
        });
        saveRecurringRules();
      }
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
      isRecurring,
      recurringFrequency: selectedFrequency,
    };
    transactions.push(newTransaction);

    if (isRecurring) {
      const nextDue = calculateNextDueDate(selectedDate, selectedFrequency);
      recurringRules.push({
        id: newTransaction.id,
        description,
        amount: finalAmount,
        category: selectedCategory,
        frequency: selectedFrequency,
        startDate: selectedDate,
        lastAddedDate: selectedDate,
        nextDueDate: nextDue,
        status: "active",
      });
      saveRecurringRules();
      showToast(`Recurring subscription registered (${selectedFrequency})`, "info");
    }

    // Reset form fields
    descriptionEl.value = "";
    amountEl.value = "";
    categoryEl.value = "";
    if (recurringToggle) recurringToggle.checked = false;
    if (recurringFrequencyWrapper) recurringFrequencyWrapper.style.display = "none";
    if (recurringFrequency) recurringFrequency.value = "monthly";
    descriptionEl.focus();
  }

  saveTransactions();
  renderApp();

  if (finalAmount < 0) {
    checkBudgetAlertsOnUpdate();
  }
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

  if (recurringToggle) {
    recurringToggle.checked = !!tx.isRecurring;
    if (recurringFrequencyWrapper) {
      recurringFrequencyWrapper.style.display = tx.isRecurring ? "flex" : "none";
    }
    if (recurringFrequency && tx.recurringFrequency) {
      recurringFrequency.value = tx.recurringFrequency;
    }
  }

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
  if (recurringToggle) recurringToggle.checked = false;
  if (recurringFrequencyWrapper) recurringFrequencyWrapper.style.display = "none";
  if (recurringFrequency) recurringFrequency.value = "monthly";

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
  renderCategoryChart();
  renderCashFlowChart();
  renderBudgetComparisonChart();
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
    const recurringBadge = tx.isRecurring
      ? `<span class="tx-recurring-badge" title="Recurring (${tx.recurringFrequency === "weekly" ? "Weekly" : "Monthly"})">🔁 ${tx.recurringFrequency === "weekly" ? "Weekly" : "Monthly"}</span>`
      : "";

    const li = document.createElement("li");
    li.className = `transaction ${isIncome ? "income" : "expense"}`;
    li.innerHTML = `
      <div class="tx-main">
        <div class="tx-top">
          <span class="tx-desc" title="${escapeHtml(tx.description)}">${escapeHtml(tx.description)}</span>
          <span class="tx-badge">${catIcon} ${escapeHtml(tx.category)}</span>
          ${recurringBadge}
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

function getPeriodExpenses(transactionsList, period = "monthly") {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return transactionsList.filter((tx) => {
    if (tx.amount >= 0 || !tx.date) return false;
    const parts = tx.date.split("-");
    if (parts.length < 3) return false;
    const txYear = parseInt(parts[0], 10);
    const txMonth = parseInt(parts[1], 10) - 1;
    const txDay = parseInt(parts[2], 10);
    const txDate = new Date(txYear, txMonth, txDay);
    if (isNaN(txDate.getTime())) return false;

    if (period === "weekly") {
      // Current calendar week (Monday - Sunday)
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return txDate >= monday && txDate <= sunday;
    } else if (period === "yearly") {
      return txYear === currentYear;
    } else {
      // Monthly
      return txYear === currentYear && txMonth === currentMonth;
    }
  });
}

function checkBudgetAlertsOnUpdate() {
  const period = budgetSettings.period || "monthly";
  const targetLimit = budgetSettings.amount > 0 ? budgetSettings.amount : 0;
  if (!targetLimit || targetLimit <= 0) return;

  const periodExpensesList = getPeriodExpenses(transactions, period);
  const spentInPeriod = Math.abs(
    periodExpensesList.reduce((acc, tx) => acc + tx.amount, 0)
  );

  const pct = Math.round((spentInPeriod / targetLimit) * 100);
  const periodLabel = period === "weekly" ? "weekly" : period === "yearly" ? "yearly" : "monthly";

  if (pct >= 100) {
    showToast(
      `🚨 Overbudget! You exceeded your ${periodLabel} budget limit by ${formatCurrency(spentInPeriod - targetLimit)}.`,
      "error"
    );
  } else if (pct >= 90) {
    showToast(
      `⚡ Alert: 90% of your ${periodLabel} budget reached! (${formatCurrency(targetLimit - spentInPeriod)} left)`,
      "error"
    );
  } else if (pct >= 75) {
    showToast(
      `⚠️ Warning: You have reached 75% of your ${periodLabel} budget (${formatCurrency(targetLimit - spentInPeriod)} left)`,
      "info"
    );
  }
}

function updateSpendingProgress() {
  const period = budgetSettings.period || "monthly";
  const targetLimit = budgetSettings.amount > 0 ? budgetSettings.amount : 0;
  const periodLabel = period === "weekly" ? "Weekly" : period === "yearly" ? "Yearly" : "Monthly";
  const periodShort = period === "weekly" ? "wk" : period === "yearly" ? "yr" : "mo";

  if (budgetProgressTitleEl) {
    budgetProgressTitleEl.textContent = `${periodLabel} Budget Health`;
  }
  if (budgetTargetBadgeEl) {
    budgetTargetBadgeEl.textContent = targetLimit > 0
      ? `${formatCurrency(targetLimit)} / ${periodShort}`
      : "No Budget Set";
  }

  const periodExpensesList = getPeriodExpenses(transactions, period);
  const spentInPeriod = Math.abs(
    periodExpensesList.reduce((acc, tx) => acc + tx.amount, 0)
  );

  let percent = 0;
  let remainingMessage = "";

  // Reset classes on fill bar
  spendingProgressBarEl.classList.remove("warning", "critical", "danger");

  if (targetLimit > 0) {
    percent = Math.round((spentInPeriod / targetLimit) * 100);
    const clampedWidth = Math.min(percent, 100);
    spendingProgressBarEl.style.width = `${clampedWidth}%`;
    spendingPercentTextEl.textContent = `${percent}%`;

    if (percent >= 100) {
      spendingProgressBarEl.classList.add("danger");
      const overspent = spentInPeriod - targetLimit;
      remainingMessage = `🚨 Overbudget by ${formatCurrency(overspent)} (${percent}% used)`;
    } else if (percent >= 90) {
      spendingProgressBarEl.classList.add("critical");
      const remaining = targetLimit - spentInPeriod;
      remainingMessage = `⚡ Critical: ${formatCurrency(remaining)} left (${100 - percent}% remaining)`;
    } else if (percent >= 75) {
      spendingProgressBarEl.classList.add("warning");
      const remaining = targetLimit - spentInPeriod;
      remainingMessage = `⚠️ Caution: ${formatCurrency(remaining)} left (${100 - percent}% remaining)`;
    } else {
      const remaining = targetLimit - spentInPeriod;
      remainingMessage = `${formatCurrency(remaining)} remaining of ${formatCurrency(targetLimit)} budget`;
    }
  } else {
    spendingProgressBarEl.style.width = "0%";
    spendingPercentTextEl.textContent = "0%";
    remainingMessage = "No Budget Set - Click to set target";
  }

  spendingRemainingTextEl.textContent = remainingMessage;
  if (budgetPeriodSpentTextEl) {
    budgetPeriodSpentTextEl.textContent = `Spent: ${formatCurrency(spentInPeriod)}`;
  }
}

// ==========================================================================
// VISUAL ANALYTICS — CHART.JS (CATEGORY DONUT + CASH FLOW BAR)
// ==========================================================================

const CHART_COLORS = [
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#e11d48", // Rose
  "#d97706", // Amber
  "#0ea5e9", // Sky
  "#7c3aed", // Violet
  "#db2777", // Pink
  "#0d9488", // Teal
  "#ea580c", // Orange
  "#65a30d", // Lime
  "#6366f1", // Soft Indigo fallback
];

function getCategoryData() {
  const expenseTxs = transactions.filter((tx) => tx.amount < 0);
  const total = Math.abs(expenseTxs.reduce((acc, tx) => acc + tx.amount, 0));

  const catMap = {};
  expenseTxs.forEach((tx) => {
    const cat = tx.category || "Others";
    catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
  });

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  return {
    labels: sorted.map(([cat]) => cat),
    amounts: sorted.map(([, amt]) => amt),
    total,
  };
}

function getCashFlowData() {
  const monthMap = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const parts = tx.date.split("-");
    if (parts.length < 2) return;
    const key = `${parts[0]}-${parts[1]}`; // "YYYY-MM"
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    if (tx.amount > 0) monthMap[key].income += tx.amount;
    else monthMap[key].expense += Math.abs(tx.amount);
  });

  const sortedKeys = Object.keys(monthMap).sort();
  const visibleKeys = sortedKeys.slice(-7);

  const labels = visibleKeys.map((key) => {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-PK",
      { month: "short", year: "2-digit" }
    );
  });

  return {
    labels,
    incomeData: visibleKeys.map((k) => monthMap[k].income),
    expenseData: visibleKeys.map((k) => monthMap[k].expense),
  };
}

function renderCategoryChart() {
  if (!categoryChartCanvas) return;

  const { labels, amounts, total } = getCategoryData();
  const hasData = total > 0;

  if (categoryEmptyState) {
    categoryEmptyState.style.display = hasData ? "none" : "flex";
  }
  categoryChartCanvas.style.display = hasData ? "block" : "none";

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
    categoryChartInstance = null;
  }

  if (!hasData) return;

  const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  categoryChartInstance = new Chart(categoryChartCanvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Poppins", size: 11, weight: "500" },
            color: "#475569",
            boxWidth: 12,
            boxHeight: 12,
            borderRadius: 3,
            padding: 10,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { family: "Poppins", size: 12, weight: "600" },
          bodyFont: { family: "Poppins", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
              return `  ${formatCurrency(ctx.parsed)}  (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderCashFlowChart() {
  if (!cashFlowChartCanvas) return;

  const { labels, incomeData, expenseData } = getCashFlowData();
  const hasData = transactions.length > 0;

  if (cashflowEmptyState) {
    cashflowEmptyState.style.display = hasData ? "none" : "flex";
  }
  cashFlowChartCanvas.style.display = hasData ? "block" : "none";

  if (cashFlowChartInstance) {
    cashFlowChartInstance.destroy();
    cashFlowChartInstance = null;
  }

  if (!hasData) return;

  cashFlowChartInstance = new Chart(cashFlowChartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "#059669",
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.7,
        },
        {
          label: "Expenses",
          data: expenseData,
          backgroundColor: "#e11d48",
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Poppins", size: 11, weight: "500" },
            color: "#475569",
            boxWidth: 12,
            boxHeight: 12,
            borderRadius: 3,
            padding: 14,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { family: "Poppins", size: 12, weight: "600" },
          bodyFont: { family: "Poppins", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `  ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { family: "Poppins", size: 10.5 },
            color: "#94a3b8",
          },
        },
        y: {
          grid: {
            color: "#f1f5f9",
            drawBorder: false,
          },
          border: { display: false, dash: [4, 4] },
          ticks: {
            font: { family: "Poppins", size: 10 },
            color: "#94a3b8",
            maxTicksLimit: 5,
            callback: (value) => {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
              return value;
            },
          },
        },
      },
    },
  });
}

// ==========================================================================
// VISUAL ANALYTICS — 6-MONTH BUDGET VS ACTUAL COMPARISON CHART
// ==========================================================================

function get6MonthHistoricalData() {
  const now = new Date();
  const months = [];

  // Generate last 6 calendar months chronologically: e.g. 5 months ago to current month
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const key = `${year}-${String(month + 1).padStart(2, "0")}`; // "YYYY-MM"
    const label = d.toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
    months.push({ key, label, year, month });
  }

  // Monthly budget benchmark
  let monthlyBenchmark = 0;
  if (budgetSettings.amount > 0) {
    monthlyBenchmark = budgetSettings.amount;
    if (budgetSettings.period === "weekly") {
      monthlyBenchmark = Math.round(budgetSettings.amount * 4.333);
    } else if (budgetSettings.period === "yearly") {
      monthlyBenchmark = Math.round(budgetSettings.amount / 12);
    }
  }

  const actualExpenses = months.map((m) => {
    return Math.abs(
      transactions
        .filter((tx) => {
          if (tx.amount >= 0 || !tx.date) return false;
          const parts = tx.date.split("-");
          if (parts.length < 2) return false;
          return `${parts[0]}-${parts[1]}` === m.key;
        })
        .reduce((sum, tx) => sum + tx.amount, 0)
    );
  });

  const budgetTargets = months.map(() => monthlyBenchmark);

  return {
    labels: months.map((m) => m.label),
    actualExpenses,
    budgetTargets,
    monthlyBenchmark,
  };
}

function renderBudgetComparisonChart() {
  if (!budgetComparisonCanvas) return;

  const { labels, actualExpenses, budgetTargets, monthlyBenchmark } = get6MonthHistoricalData();
  const hasExpenseData = actualExpenses.some((amt) => amt > 0);

  if (budgetComparisonEmptyState) {
    budgetComparisonEmptyState.style.display = hasExpenseData ? "none" : "flex";
  }
  budgetComparisonCanvas.style.display = hasExpenseData ? "block" : "none";

  if (budgetComparisonChartInstance) {
    budgetComparisonChartInstance.destroy();
    budgetComparisonChartInstance = null;
  }

  if (!hasExpenseData) return;

  const hasBudget = monthlyBenchmark > 0;

  const barColors = actualExpenses.map((amt) =>
    hasBudget && amt > monthlyBenchmark ? "#e11d48" : "#059669"
  );

  const datasets = [
    {
      label: "Actual Spent",
      data: actualExpenses,
      backgroundColor: barColors,
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.55,
      order: 2,
    },
  ];

  // Dynamic Budget Limit Line: only rendered if user has explicitly saved a positive budget
  if (hasBudget) {
    datasets.push({
      label: "Budget Limit",
      data: budgetTargets,
      type: "line",
      borderColor: "#d97706",
      borderWidth: 2.5,
      borderDash: [5, 5],
      pointBackgroundColor: "#d97706",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      order: 1,
    });
  }

  budgetComparisonChartInstance = new Chart(budgetComparisonCanvas, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Poppins", size: 11, weight: "500" },
            color: "#475569",
            boxWidth: 12,
            boxHeight: 12,
            borderRadius: 3,
            padding: 12,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { family: "Poppins", size: 12, weight: "600" },
          bodyFont: { family: "Poppins", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              if (ctx.dataset.type === "line") {
                return `  Budget Limit: ${formatCurrency(val)}`;
              }
              if (hasBudget) {
                const diff = val - monthlyBenchmark;
                const status = diff > 0
                  ? `(Over by ${formatCurrency(diff)})`
                  : `(Under by ${formatCurrency(Math.abs(diff))})`;
                return `  Actual Spent: ${formatCurrency(val)} ${status}`;
              }
              return `  Actual Spent: ${formatCurrency(val)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { family: "Poppins", size: 10.5 },
            color: "#94a3b8",
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9", drawBorder: false },
          border: { display: false, dash: [4, 4] },
          ticks: {
            font: { family: "Poppins", size: 10 },
            color: "#94a3b8",
            maxTicksLimit: 5,
            callback: (value) => {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
              return value;
            },
          },
        },
      },
    },
  });
}

// ==========================================================================
// DATA EXPORT (CSV UTILITY - PKR FORMAT)
// ==========================================================================

function exportToCSV() {
  // Read full dataset directly from state or LocalStorage fallback
  const fullData = loadTransactions();

  if (!fullData || fullData.length === 0) {
    alert("No transactions available to export. Add some transactions first!");
    return;
  }

  // CSV Headers with PKR denomination
  const headers = ["Transaction ID", "Date", "Description", "Category", "Type", "Amount (PKR)"];

  // Sort rows chronologically for export
  const sortedRows = [...fullData].sort((a, b) => new Date(a.date) - new Date(b.date));

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
  showToast("Exported transactions to CSV", "success");
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

  // Query full transactions list directly to prevent active filter omissions
  const allTransactions = loadTransactions();
  if (!allTransactions || allTransactions.length === 0) {
    alert("No transactions available to generate PDF report. Add transactions first.");
    return;
  }

  // Sort chronologically (newest to oldest)
  const targetTransactions = [...allTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

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

  // 2. Summary Metrics Calculation (Evaluated from full transaction set)
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

  // 3. Transactions Table (Income and Expenses Combined)
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
  showToast("Statement PDF downloaded successfully", "success");
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
  showToast("All transactions cleared successfully.", "info");
}

// ==========================================================================
// BUDGET CONFIGURATION MODAL MANAGEMENT
// ==========================================================================

function openBudgetModal() {
  if (budgetAmountInput) {
    budgetAmountInput.value = budgetSettings.amount > 0 ? budgetSettings.amount : "";
  }
  if (budgetPeriodSwitcher) {
    budgetPeriodSwitcher.querySelectorAll(".budget-period-btn").forEach((b) => {
      if (b.dataset.period === budgetSettings.period) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }
  if (budgetModal) {
    budgetModal.style.display = "flex";
  }
}

function closeBudgetModal() {
  if (budgetModal) {
    budgetModal.style.display = "none";
  }
}

function handleSaveBudgetSettings(e) {
  e.preventDefault();
  const rawAmt = parseFloat(budgetAmountInput.value);
  if (isNaN(rawAmt) || rawAmt <= 0) {
    showToast("Please enter a valid numeric budget amount.", "error");
    return;
  }

  const activePeriodBtn = budgetPeriodSwitcher
    ? budgetPeriodSwitcher.querySelector(".budget-period-btn.active")
    : null;
  const selectedPeriod = activePeriodBtn ? activePeriodBtn.dataset.period : "monthly";

  budgetSettings = {
    amount: Math.round(rawAmt),
    period: selectedPeriod,
  };

  saveBudgetSettings();
  renderApp();
  checkBudgetAlertsOnUpdate();
  showToast(
    `Budget target saved: ${formatCurrency(budgetSettings.amount)} (${budgetSettings.period})`,
    "success"
  );
  closeBudgetModal();
}

function handleResetBudgetTarget() {
  budgetSettings = {
    amount: 0,
    period: "monthly",
  };
  localStorage.removeItem("fintrack_budget_settings");
  if (budgetAmountInput) {
    budgetAmountInput.value = "";
  }
  closeBudgetModal();
  renderApp();
  showToast("Budget target cleared. Set to 'No Budget Set'.", "info");
}

// ==========================================================================
// BACKUP & RESTORE SYSTEM (JSON IMPORT/EXPORT) & TOAST NOTIFICATIONS
// ==========================================================================

function openBackupModal() {
  if (exportTxCountEl) {
    exportTxCountEl.textContent = `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} ready`;
  }
  resetRestoreInput();
  if (backupRestoreModal) {
    backupRestoreModal.style.display = "flex";
  }
}

function closeBackupModal() {
  if (backupRestoreModal) {
    backupRestoreModal.style.display = "none";
  }
  resetRestoreInput();
}

function resetRestoreInput() {
  if (restoreFileInput) restoreFileInput.value = "";
  if (selectFileLabel) selectFileLabel.textContent = "Select .JSON File";
  if (restorePreview) restorePreview.style.display = "none";
  if (restoreErrorBox) {
    restoreErrorBox.style.display = "none";
    restoreErrorBox.textContent = "";
  }
  pendingRestoreData = null;
}

function exportBackupJSON() {
  const fullData = loadTransactions();
  if (!fullData || fullData.length === 0) {
    showToast("No transactions found to backup. Add transactions first.", "error");
    return;
  }

  const backupPayload = {
    version: 1,
    app: "FinTrack",
    exportedAt: new Date().toISOString(),
    currency: "PKR",
    meta: {
      totalCount: fullData.length,
      platform: "FinTrack Web",
    },
    settings: {
      baseCurrency: "PKR",
      theme: "light",
    },
    budget: budgetSettings,
    recurringRules: recurringRules,
    transactions: fullData,
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStamp = now.toISOString().split("T")[0];
  const timeStamp = now.toTimeString().split(" ")[0].replace(/:/g, "");
  const filename = `fintrack_backup_${dateStamp}_${timeStamp}.json`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Backup exported (${fullData.length} records)`, "success");
}

function handleRestoreFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
    showRestoreError("Unsupported file format. Please choose a valid .json file.");
    return;
  }

  if (selectFileLabel) {
    selectFileLabel.textContent = file.name;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const raw = JSON.parse(event.target.result);
      const validation = validateBackupSchema(raw);

      if (!validation.valid) {
        showRestoreError(validation.error);
        return;
      }

      pendingRestoreData = validation;
      displayRestorePreview(file.name, validation.data);
    } catch (err) {
      showRestoreError("Malformed JSON file. Parsing error: " + err.message);
    }
  };

  reader.onerror = () => {
    showRestoreError("Failed to read file from storage.");
  };

  reader.readAsText(file);
}

function validateBackupSchema(parsedObj) {
  if (!parsedObj) {
    return { valid: false, error: "The uploaded file is empty." };
  }

  let txList = null;
  if (Array.isArray(parsedObj)) {
    // Array format directly
    txList = parsedObj;
  } else if (typeof parsedObj === "object" && Array.isArray(parsedObj.transactions)) {
    // Standard FinTrack envelope format
    txList = parsedObj.transactions;
  } else {
    return {
      valid: false,
      error: "Unrecognized backup structure. Expected transactions list or FinTrack backup format.",
    };
  }

  if (txList.length === 0) {
    return { valid: false, error: "The backup file contains no transaction records." };
  }

  const today = new Date().toISOString().split("T")[0];
  const sanitizedList = [];

  for (let i = 0; i < txList.length; i++) {
    const item = txList[i];
    if (!item || typeof item !== "object") {
      return { valid: false, error: `Invalid entry encountered at transaction #${i + 1}.` };
    }

    const rawAmt = item.amount;
    const amt = typeof rawAmt === "number" ? rawAmt : parseFloat(rawAmt);
    if (isNaN(amt) || amt === 0) {
      return { valid: false, error: `Invalid or 0 amount encountered at item #${i + 1}.` };
    }

    const desc = (item.description || "").trim();
    if (!desc) {
      return { valid: false, error: `Missing description for item #${i + 1}.` };
    }

    const defaultCat = amt > 0 ? "Salary" : "Others";
    const cat = (item.category || defaultCat).trim();
    const dt = item.date || today;

    sanitizedList.push({
      id: item.id || (Date.now() + i + Math.floor(Math.random() * 1000)),
      description: desc,
      amount: amt,
      category: cat,
      date: dt,
    });
  }

  let restoredBudget = null;
  if (parsedObj.budget && typeof parsedObj.budget.amount === "number" && parsedObj.budget.amount > 0) {
    restoredBudget = {
      amount: parsedObj.budget.amount,
      period: parsedObj.budget.period || "monthly",
    };
  }

  let restoredRecurring = null;
  if (Array.isArray(parsedObj.recurringRules)) {
    restoredRecurring = parsedObj.recurringRules.filter(
      (r) => r && typeof r === "object" && r.description && typeof r.amount === "number"
    );
  }

  return { valid: true, data: sanitizedList, budget: restoredBudget, recurringRules: restoredRecurring };
}

function showRestoreError(msg) {
  pendingRestoreData = null;
  if (restorePreview) restorePreview.style.display = "none";
  if (restoreErrorBox) {
    restoreErrorBox.style.display = "block";
    restoreErrorBox.textContent = `❌ ${msg}`;
  }
}

function displayRestorePreview(filename, list) {
  if (restoreErrorBox) restoreErrorBox.style.display = "none";
  if (!restorePreview) return;

  if (previewFilename) previewFilename.textContent = filename;
  if (previewCount) previewCount.textContent = list.length;

  const dates = list
    .map((tx) => tx.date)
    .filter(Boolean)
    .sort();

  if (previewDates) {
    if (dates.length > 0) {
      const earliest = formatDateDisplay(dates[0]);
      const latest = formatDateDisplay(dates[dates.length - 1]);
      previewDates.textContent = earliest === latest ? earliest : `${earliest} - ${latest}`;
    } else {
      previewDates.textContent = "N/A";
    }
  }

  const net = list.reduce((acc, tx) => acc + tx.amount, 0);
  if (previewBalance) {
    previewBalance.textContent = formatCurrency(net);
  }

  restorePreview.style.display = "flex";
}

function executeRestore() {
  if (!pendingRestoreData || !pendingRestoreData.data || pendingRestoreData.data.length === 0) {
    showToast("No valid transactions found to restore.", "error");
    return;
  }

  const modeRadio = document.querySelector('input[name="restore-mode"]:checked');
  const mode = modeRadio ? modeRadio.value : "merge";

  if (mode === "replace") {
    transactions = [...pendingRestoreData.data];
    if (pendingRestoreData.budget) {
      budgetSettings = pendingRestoreData.budget;
      saveBudgetSettings();
    }
    if (pendingRestoreData.recurringRules) {
      recurringRules = [...pendingRestoreData.recurringRules];
      saveRecurringRules();
    }
    cancelEdit();
    saveTransactions();
    renderApp();
    showToast(`Data restored successfully (${transactions.length} transactions)`, "success");
  } else {
    // Merge mode: Deduplicate by item.id
    const existingIds = new Set(transactions.map((tx) => tx.id));
    let addedCount = 0;

    pendingRestoreData.data.forEach((item) => {
      if (!existingIds.has(item.id)) {
        transactions.push(item);
        existingIds.add(item.id);
        addedCount++;
      }
    });

    if (pendingRestoreData.budget) {
      budgetSettings = pendingRestoreData.budget;
      saveBudgetSettings();
    }

    if (pendingRestoreData.recurringRules) {
      const existingRuleIds = new Set(recurringRules.map((r) => r.id));
      pendingRestoreData.recurringRules.forEach((rule) => {
        if (!existingRuleIds.has(rule.id)) {
          recurringRules.push(rule);
          existingRuleIds.add(rule.id);
        }
      });
      saveRecurringRules();
    }

    cancelEdit();
    saveTransactions();
    renderApp();
    showToast(`Merged ${addedCount} new transactions (${transactions.length} total)`, "success");
  }

  closeBackupModal();
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast-item ${type}`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }, 3200);
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

// ==========================================================================
// SUBSCRIPTIONS & RECURRING TRANSACTIONS ENGINE
// ==========================================================================

function openSubscriptionModal() {
  renderSubscriptionsList();
  if (subscriptionModal) {
    subscriptionModal.style.display = "flex";
  }
}

function closeSubscriptionModal() {
  if (subscriptionModal) {
    subscriptionModal.style.display = "none";
  }
}

function renderSubscriptionsList() {
  if (!subscriptionsList) return;
  subscriptionsList.innerHTML = "";

  if (!recurringRules || recurringRules.length === 0) {
    if (subscriptionsEmptyState) subscriptionsEmptyState.style.display = "flex";
    return;
  }

  if (subscriptionsEmptyState) subscriptionsEmptyState.style.display = "none";

  const todayStr = new Date().toISOString().split("T")[0];

  recurringRules.forEach((rule) => {
    const li = document.createElement("li");
    li.className = "subscription-item";

    const isIncome = rule.amount > 0;
    const isPaused = rule.status === "paused";
    const categoryIcon = CATEGORY_ICONS[rule.category] || "📦";
    const freqLabel = rule.frequency === "weekly" ? "Weekly" : "Monthly";
    const freqClass = rule.frequency === "weekly" ? "weekly" : "monthly";

    let dueStatusText = "";
    if (rule.nextDueDate) {
      if (rule.nextDueDate <= todayStr) {
        dueStatusText = `<span style="color: var(--expense-600); font-weight: 600;">Due now (${formatDateDisplay(rule.nextDueDate)})</span>`;
      } else {
        dueStatusText = `<span>Next due: ${formatDateDisplay(rule.nextDueDate)}</span>`;
      }
    }

    li.innerHTML = `
      <div class="sub-left">
        <div class="sub-title">
          <span>${categoryIcon}</span>
          <span>${escapeHtml(rule.description)}</span>
        </div>
        <div class="sub-meta">
          <span class="sub-badge ${freqClass}">${freqLabel}</span>
          <span class="sub-badge ${isPaused ? "paused" : "active"}">${isPaused ? "Paused" : "Active"}</span>
          ${dueStatusText}
        </div>
      </div>
      <div class="sub-right">
        <div class="sub-amount ${isIncome ? "income" : "expense"}">
          ${isIncome ? "+" : "-"}${formatCurrency(Math.abs(rule.amount))}
        </div>
        <div class="sub-actions">
          <button type="button" class="sub-action-btn post-now" data-id="${rule.id}" title="Record an instance to ledger today">Post Now</button>
          <button type="button" class="sub-action-btn toggle-status" data-id="${rule.id}">${isPaused ? "Resume" : "Pause"}</button>
          <button type="button" class="sub-action-btn delete" data-id="${rule.id}" title="Delete recurring rule">Delete</button>
        </div>
      </div>
    `;

    const postNowBtn = li.querySelector(".post-now");
    const toggleStatusBtn = li.querySelector(".toggle-status");
    const deleteBtn = li.querySelector(".delete");

    if (postNowBtn) {
      postNowBtn.addEventListener("click", () => postSubscriptionNow(rule.id));
    }
    if (toggleStatusBtn) {
      toggleStatusBtn.addEventListener("click", () => toggleSubscriptionStatus(rule.id));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteSubscription(rule.id));
    }

    subscriptionsList.appendChild(li);
  });
}

function postSubscriptionNow(ruleId) {
  const rule = recurringRules.find((r) => r.id === ruleId);
  if (!rule) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const newTx = {
    id: Date.now(),
    description: rule.description,
    amount: rule.amount,
    category: rule.category,
    date: todayStr,
    isRecurring: true,
    recurringFrequency: rule.frequency,
  };

  transactions.push(newTx);
  rule.lastAddedDate = todayStr;
  rule.nextDueDate = calculateNextDueDate(rule.nextDueDate || todayStr, rule.frequency);

  saveTransactions();
  saveRecurringRules();
  renderApp();
  renderSubscriptionsList();
  showToast(`Recorded "${rule.description}" to ledger`, "success");
}

function toggleSubscriptionStatus(ruleId) {
  const rule = recurringRules.find((r) => r.id === ruleId);
  if (!rule) return;

  rule.status = rule.status === "active" ? "paused" : "active";
  saveRecurringRules();
  renderSubscriptionsList();
  showToast(
    `"${rule.description}" ${rule.status === "active" ? "resumed" : "paused"}`,
    "info"
  );
}

function deleteSubscription(ruleId) {
  const index = recurringRules.findIndex((r) => r.id === ruleId);
  if (index === -1) return;

  const desc = recurringRules[index].description;
  recurringRules.splice(index, 1);
  saveRecurringRules();
  renderSubscriptionsList();
  showToast(`Recurring rule for "${desc}" deleted`, "info");
}

// Due Recurring Transactions Scanner & Prompt Modal
function checkDueRecurringTransactions() {
  if (!recurringRules || recurringRules.length === 0) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const dueRules = recurringRules.filter(
    (r) => r.status === "active" && r.nextDueDate && r.nextDueDate <= todayStr
  );

  if (dueRules.length === 0) return;

  populateDueRecurringList(dueRules);
  if (dueRecurringModal) {
    dueRecurringModal.style.display = "flex";
  }
}

function populateDueRecurringList(dueRules) {
  if (!dueRecurringList) return;
  dueRecurringList.innerHTML = "";

  dueRules.forEach((rule) => {
    const item = document.createElement("label");
    item.className = "due-item";

    const isIncome = rule.amount > 0;
    const categoryIcon = CATEGORY_ICONS[rule.category] || "📦";

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <input type="checkbox" class="due-checkbox" data-id="${rule.id}" checked />
        <div>
          <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-primary);">
            <span>${categoryIcon}</span> ${escapeHtml(rule.description)}
          </div>
          <small style="color: var(--text-secondary); font-size: 0.74rem;">
            Due: ${formatDateDisplay(rule.nextDueDate)} (${rule.frequency === "weekly" ? "Weekly" : "Monthly"})
          </small>
        </div>
      </div>
      <div style="font-weight: 700; font-size: 0.88rem; color: ${isIncome ? "var(--income-600)" : "var(--expense-600)"};">
        ${isIncome ? "+" : "-"}${formatCurrency(Math.abs(rule.amount))}
      </div>
    `;

    dueRecurringList.appendChild(item);
  });
}

function closeDueRecurringModal() {
  if (dueRecurringModal) {
    dueRecurringModal.style.display = "none";
  }
}

function handleConfirmDueRecurring() {
  if (!dueRecurringList) return;

  const checkedBoxes = dueRecurringList.querySelectorAll(".due-checkbox:checked");
  if (checkedBoxes.length === 0) {
    closeDueRecurringModal();
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  let recordedCount = 0;

  checkedBoxes.forEach((cb) => {
    const ruleId = parseFloat(cb.dataset.id);
    const rule = recurringRules.find((r) => r.id === ruleId);
    if (rule) {
      const newTx = {
        id: Date.now() + Math.floor(Math.random() * 1000) + recordedCount,
        description: rule.description,
        amount: rule.amount,
        category: rule.category,
        date: todayStr,
        isRecurring: true,
        recurringFrequency: rule.frequency,
      };
      transactions.push(newTx);
      rule.lastAddedDate = todayStr;
      rule.nextDueDate = calculateNextDueDate(rule.nextDueDate || todayStr, rule.frequency);
      recordedCount++;
    }
  });

  if (recordedCount > 0) {
    saveTransactions();
    saveRecurringRules();
    renderApp();
    showToast(`Added ${recordedCount} recurring transaction${recordedCount === 1 ? "" : "s"} to ledger`, "success");
  }

  closeDueRecurringModal();
}

// ==========================================================================
// PWA SERVICE WORKER REGISTRATION & ICON FALLBACK
// ==========================================================================

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("[FinTrack PWA] Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.warn("[FinTrack PWA] Service Worker registration failed:", error);
        });
    });
  }
}

function ensureAppIcons() {
  const testImg = new Image();
  testImg.onerror = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 192;
      canvas.height = 192;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#059669";
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(0, 0, 192, 192, 42);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, 192, 192);
        }

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(38, 134);
        ctx.lineTo(76, 96);
        ctx.lineTo(108, 114);
        ctx.lineTo(152, 58);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(126, 58);
        ctx.lineTo(152, 58);
        ctx.lineTo(152, 84);
        ctx.stroke();

        const fallbackUrl = canvas.toDataURL("image/png");
        let iconLink = document.querySelector('link[rel="icon"]');
        if (!iconLink) {
          iconLink = document.createElement("link");
          iconLink.rel = "icon";
          document.head.appendChild(iconLink);
        }
        iconLink.href = fallbackUrl;

        let appleLink = document.querySelector('link[rel="apple-touch-icon"]');
        if (appleLink) {
          appleLink.href = fallbackUrl;
        }
      }
    } catch (err) {
      console.warn("[FinTrack PWA] Canvas fallback skipped:", err);
    }
  };
  testImg.src = "icons/icon-192.png";
}

// Initialize Application
init();