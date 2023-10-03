//Selecting document elements
const mainBody = document.querySelector("#financeRes"),
  financeForm = document.querySelector("#expenseForm"),
  financeText = document.querySelector("#expenseText"),
  financeDate = document.querySelector("#expenseDate"),
  financeAmount = document.querySelector("#expenseAmount"),
  financeBtn = document.querySelector("#addExpenseBtn"),
  financeMessage = document.querySelector("#messageDiv"),
  financeTable = document.querySelector("#expenseTable"),
  AmountTotal = document.querySelector("#expenseAmountTotal"),
  expenseWarning = document.querySelector("#warning"),
  totalInputBtn = document.querySelector("#totalBtnId"),
  grandTotal = document.querySelector("#financeTotal");

//Retrieving today's date
financeDate.valueAsDate = new Date();

//The output
const financeOutput = () => {
  if (financeText.value.length === 0) {
    financeText.focus();
    expenseWarning.innerHTML = "* Name is required";
  } else if (financeAmount.value.length === 0) {
    financeAmount.focus();
  } else {
    //Creating Table elements
    const financeRow = financeTable.insertRow();
    const financeCell = financeRow.insertCell();
    const financeCell2 = financeRow.insertCell(1);
    const financeCell3 = financeRow.insertCell(2);
    const financeCell4 = financeRow.insertCell(3);

    //creating delete button
    const delBtn = document.createElement("button");
    delBtn.innerHTML = "X";
    delBtn.id = "delete";
    const buttonValue = delBtn;

    //Retrieving input from user
    financeCell.innerHTML = financeText.value;
    financeCell2.innerHTML = financeDate.value;
    financeCell3.innerHTML = financeAmount.value;
    financeCell4.appendChild(delBtn);

    //Deleting the table item
    function deleteITem(event) {
      event.path[(1, 2)].remove();
    }
    delBtn.addEventListener("click", deleteITem, false);

    //Clearing the recent values
    financeText.value = "";
    financeAmount.value = "";
    grandTotal.innerHTML = "";
    financeMessage.remove();

    totalInputBtn.classList.add("showButton"); //display the button
    //Bringing back the focus to the input
    financeText.focus();
    expenseWarning.innerHTML = ""; //clearing warning messages

    financeCell3.id = "itemAmount";
    totalInputBtn.innerHTML = "Total"; //creating total button

    //Creating the sum
    var table = financeTable,
      totalVal = 0;
    for (var i = 1; i < table.rows.length; i++) {
      totalVal = totalVal + parseInt(table.rows[i].cells[2].innerHTML);
    }

    //outputting the total on button click
    totalInputBtn.addEventListener("click", () => {
      grandTotal.classList.add("activeTotal");
      grandTotal.innerHTML = "Spending Total: $" + totalVal;
      localStorage.setItem("spending", totalVal);
      addDailySpending(totalVal);
    });
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
  income =
    localStorage.getItem("income") ||
    parseFloat(prompt("How much do you earn last month?"));
  document.getElementById("total-income").textContent = income;
  if (income) {
    localStorage.setItem("income", income);
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
