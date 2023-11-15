import { sendData, getEmailFromUser, retriveDataFromDatabase, isValidEmail } from "./save.js";

const
  financeText = document.querySelector("#expenseText"),
  financeDate = document.querySelector("#expenseDate"),
  financeAmount = document.querySelector("#expenseAmount"),
  financeBtn = document.querySelector("#addExpenseBtn"),
  financeMessage = document.querySelector("#messageDiv"),
  financeTable = document.querySelector("#expenseTable"),
  AmountTotal = document.querySelector("#expenseAmountTotal"),
  expenseWarning = document.querySelector("#warning"),
  grandTotal = document.querySelector("#financeTotal"),
  settingsModal = document.querySelector(".settings-modal"),
  settingBtn = document.getElementById("setting"),
  currencySelect = document.getElementById("currency"),
  autoSave = JSON.parse(localStorage.getItem("autoSave"));
let loggedIn = false;

// Call the update function when your page loads
window.onload = function () {
  const userEmail = localStorage.getItem("email") || getEmailFromUser();
  localStorage.setItem("email", userEmail);
  if (userEmail) {
    retriveDataFromDatabase(userEmail).then(function () {
      updateTableFromLocalStorage();
    });
    currencySelect.value = currency;
  } else {
    updateTableFromLocalStorage();
  }
};

if (localStorage.getItem("email")) {
  loggedIn = true;
} else {
  loggedIn = false;
}

financeDate.valueAsDate = new Date();

let currency = localStorage.getItem("currency") || "₦";
settingBtn.addEventListener(
  "click",
  () => (settingsModal.style.display = "block")
);

function processAutoSave() {
  let email = localStorage.getItem("email") || getEmailFromUser();
  if (autoSave) {
    sendData(email);
  }
}

window.chooseCurrency = function () {
  currency = currencySelect.value;
  localStorage.setItem("currency", currency);
  updateTableFromLocalStorage();
  processAutoSave();
  updateBudget();
  const message = document.getElementById("setting-messages");
  message.textContent = "Settings Saved";
  setTimeout(() => {
    message.textContent = "";
  }, 3000);
};

window.closeSettingModal = function () {
  settingsModal.style.display = "none";
};

window.resetData = function () {
  localStorage.removeItem("income");
  localStorage.removeItem("rowId");
  localStorage.removeItem("financeData");
  localStorage.removeItem("spending");

  const url = window.location.href;
  window.open(url, "_blank");
};

// Function to update the table from local storage
function updateTableFromLocalStorage() {
  const financeData = localStorage.getItem("financeData");
  const dataArray = JSON.parse(financeData);
  if (!dataArray) {
    return;
  }

  if (dataArray.length > 0) {
    const rowCount = financeTable.rows.length;

    // Remove all rows except the first one (headers)
    if (rowCount > 1) {
      for (let i = rowCount - 1; i >= 1; i--) {
        financeTable.deleteRow(i);
      }
      console.log("executed");
    }
    let financeCell3;
    let totalVal = 0;

    dataArray.forEach((data, index) => {
      const financeRow = financeTable.insertRow();
      financeRow.setAttribute("id", data.rowId);
      const financeCell = financeRow.insertCell();
      const financeCell2 = financeRow.insertCell(1);
      financeCell3 = financeRow.insertCell(2);
      const financeCell4 = financeRow.insertCell(3);

      // Create a delete button
      const delBtn = document.createElement("button");
      delBtn.innerHTML = "X";
      delBtn.id = "delete";

      // Populate the table cells with data from local storage
      financeCell.innerHTML = data.name;
      financeCell2.innerHTML = data.date;
      financeCell3.innerHTML = `${currency}${formatNumber(data.amount)}`;
      financeCell4.appendChild(delBtn);

      // Update totalVal
      totalVal += parseInt(data.amount);
    });

    //Clearing the recent values
    financeText.value = "";
    financeAmount.value = "";
    grandTotal.innerHTML = "";
    financeMessage.remove();

    //Bringing back the focus to the input
    financeText.focus();
    expenseWarning.innerHTML = "";
    document.getElementById("clear").style.display = "block";
    financeCell3.id = "itemAmount";
    localStorage.setItem("spending", totalVal);
    processAutoSave();
    addDailySpending(totalVal);
    grandTotal.classList.add("activeTotal");
    grandTotal.innerHTML = `Spending Total:  ${currency}${formatNumberWithAlpha(
      totalVal
    )}`;

    // Attach a click event handler for delete buttons using event delegation
    financeTable.addEventListener("click", function (event) {
      if (event.target && event.target.id === "delete") {
        const rowToDelete = event.target.closest("tr");
        console.log(rowToDelete);
        const rowId = event.target.closest("tr").id;
        console.log(rowId);
        rowToDelete.remove();
        // Find the index of the data entry to delete
        // Find the object in dataArray with the matching rowId
        const objectToDelete = dataArray.find(
          (item) => parseInt(item.rowId) === parseInt(rowId)
        );
        console.log(objectToDelete);
        if (objectToDelete) {
          // Remove the object from dataArray
          const dataIndex = dataArray.indexOf(objectToDelete);
          dataArray.splice(dataIndex, 1);

          // Update localStorage and recalculate totalVal
          localStorage.setItem("financeData", JSON.stringify(dataArray));
          processAutoSave();
          totalVal = dataArray.reduce(
            (total, item) => total + parseInt(item.amount),
            0
          );
          updateTableFromLocalStorage();
        }
      }
    });
  } else {
    grandTotal.innerHTML = "";
    totalVal = 0;
    localStorage.setItem("spending", totalVal);
    processAutoSave();
    addDailySpending(totalVal);
  }
}

//The output
const financeOutput = () => {
  if (financeText.value.length === 0) {
    financeText.focus();
    expenseWarning.innerHTML = "* Name is required";
  } else if (financeAmount.value.length === 0) {
    financeAmount.focus();
  } else {
    // Function to save finance data to local storage
    let rowIdCounter = localStorage.getItem("rowId") || 1; // Initialize the row ID counter

    // Function to save finance data to local storage
    async function saveToLocalStorage() {
      const financeData = localStorage.getItem("financeData");
      financeAmount.value = parseFloat(financeAmount.value.replace(/,/g, ""));
      const newData = {
        name: financeText.value,
        date: financeDate.value,
        amount: financeAmount.value,
        rowId: rowIdCounter, // Assign the row ID to the new data
      };

      // Check if there's existing data in local storage
      let dataArray = financeData ? JSON.parse(financeData) : [];

      // Add the new data to the array
      dataArray.push(newData);

      // Store the updated data in local storage
      localStorage.setItem("financeData", JSON.stringify(dataArray));
      // Increment the row ID counter for the next row
      rowIdCounter++;
      localStorage.setItem("rowId", rowIdCounter);
      processAutoSave();
    }

    saveToLocalStorage().then(updateTableFromLocalStorage());
  }
};

financeAmount.addEventListener("keypress", function (e) {
  if (e.key === "Enter") financeOutput();
});

financeText.addEventListener("keypress", function (e) {
  if (e.key === "Enter") financeOutput();
}); // save the value if the enter key is pressed

financeBtn.addEventListener("click", financeOutput); //Invoke the output

var income = localStorage.getItem("income") || 0;
var spending = localStorage.getItem("spending") || 0;
var chart = null;
var ctx = document.getElementById("budgetChart").getContext("2d");

function updateBudget(trigger) {
  if (trigger) {
    localStorage.removeItem("income");
  }
  if (!loggedIn) {
    income =
      localStorage.getItem("income") ||
      parseFloat(prompt("How much do you earn last month?"));
  }
  document.getElementById(
    "total-income"
  ).textContent = `${currency}${formatNumber(income)}`;
  if (income) {
    localStorage.setItem("income", income);
    processAutoSave();
    updateChart();
  } else {
    updateBudget(true);
  }
}

setTimeout(() => {
  updateBudget();
}, 1000);

function addDailySpending(amount) {
  var dailySpending = parseFloat(amount);
  spending = localStorage.getItem("spending") || dailySpending;
  updateChart();
}

function updateChart() {
  if (chart) {
    chart.destroy(); // Clear the previous chart instance
  }

  var remainingBalance = income - spending;
  var data = {
    labels: ["Spending", "Remaining"],
    datasets: [
      {
        data: [income - remainingBalance, remainingBalance],
        backgroundColor: ["red", "green"],
      },
    ],
  };

  chart = new Chart(ctx, {
    type: "pie",
    data: data,
  });
}

document.getElementById("update").addEventListener("click", updateBudget);

// Format numbers with an alphabet representation
function formatNumberWithAlpha(number) {
  number = Number(number);
  // Check if the number is in billions, millions, or thousands range
  if (number >= 1e9) {
    return (number / 1e9).toFixed(1).replace(/\d(?=(\d{3})+\.)/g, "$&,") + "B";
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1).replace(/\d(?=(\d{3})+\.)/g, "$&,") + "M";
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1).replace(/\d(?=(\d{3})+\.)/g, "$&,") + "K";
  } else {
    return number.toFixed(0).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }
}

// Format numbers to include the appropriate commas
function formatNumber(number) {
  return parseInt(number).toLocaleString();
}

// Format input numbers with comma separation
window.formatInput = function (id) {
  const inputElement = document.getElementById(id);
  const inputValue = inputElement.value.replace(/,/g, "");

  if (inputValue === "") {
    // If the input is empty, do nothing
    return;
  }

  // Parse the input value as a number
  const numberValue = parseInt(inputValue);

  if (!isNaN(numberValue)) {
    inputElement.value = numberValue.toLocaleString();
  }
};

const changeEmail = document.getElementById("change-email");
let changeDetailsIsClicked = false;
changeEmail.addEventListener("click", () => {
  const emailField = document.getElementById("email");
  const email = localStorage.getItem("email");
  

  if (changeDetailsIsClicked) {
    if (emailField.value !== email) {
      localStorage.setItem("email", emailField.value);
      alert("Your email has been updated")
    }else {
      alert("This is your current email.")
      return;
    }
    emailField.style.display = "none";
    changeEmail.textContent = "Edit Details";
    changeDetailsIsClicked = false;
  }else {
    emailField.style.display = "block";
    emailField.value = email;
    changeEmail.textContent = "Save Details";
    changeDetailsIsClicked = true;
  }
})