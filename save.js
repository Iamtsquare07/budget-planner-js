// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  remove,
  child,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-REg91GmdqlgXbPD0fcWE43FOhv5E898",
  authDomain: "open-source-tsquare.firebaseapp.com",
  databaseURL: "https://open-source-tsquare-default-rtdb.firebaseio.com",
  projectId: "open-source-tsquare",
  storageBucket: "open-source-tsquare.appspot.com",
  messagingSenderId: "852914490414",
  appId: "1:852914490414:web:4a5d771ed704d7775363bf",
  measurementId: "G-27162N4PPC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const currency = localStorage.getItem("currency") || null;
const spending = localStorage.getItem("spending") || null;
let financeData = localStorage.getItem("financeData") || {};
const rowId = localStorage.getItem("rowId") || null;
const income = localStorage.getItem("income") || null;
let autoSave = localStorage.getItem("autoSave") || false;
autoSave = JSON.parse(autoSave)
const autoSaveCheckbox = document.getElementById("auto-save-to-db");
let userToggled = localStorage.getItem("checked") || false;
userToggled = JSON.parse(userToggled)
const autoSaveField = document.getElementById("auto-save");
let messageFired = JSON.parse(localStorage.getItem("messageFired")) || null;

console.log(financeData);


async function setData(email) {
  const id = email.replace(/[.]/g, "");
  if (isValidEmail(email)) {
    set(ref(db, "financeBuddy/" + id), {
      email: email,
      income: income,
      spending: spending,
      currency: currency,
      financeData: JSON.parse(financeData),
      rowId: rowId,
    })
      .then(() => {
        console.log("Data saved successfully");
        if (!messageFired) {
          alert(`Your budget was saved to the database successfully`);
          JSON.stringify(
            localStorage.setItem("messageFired", (messageFired = true))
          );
        }
      })
      .catch((err) => {
        console.error(err);
        console.log(err);
        alert(err);
      });
  } else {
    console.log("Something went wrong");
  }
}

async function sendData(email) {
  if (isValidEmail(email)) {
    if (income) {
      setData(email);
      console.log("Saved");
    } else {
      alert("Something went wrong, try again later.");
    }
  } else {
    alert("Invalid email");
  }
}

autoSaveCheckbox.addEventListener("change", () => {
  let email = localStorage.getItem("email") || getEmailFromUser();
  localStorage.setItem("email", email);
  if (autoSaveCheckbox.checked) {
    sendData(email);
    autoSaveField.textContent = "ON";
    JSON.stringify(localStorage.setItem("autoSave", (autoSave = true)));
    localStorage.setItem("checked", JSON.stringify((userToggled = true)));
  } else {
    localStorage.setItem("checked", JSON.stringify((userToggled = false)));
    autoSaveField.textContent = "OFF";
    JSON.stringify(localStorage.setItem("autoSave", (autoSave = false)));
  }
});

if (!userToggled) {
  autoSaveCheckbox.checked = false;
} else {
  autoSaveCheckbox.checked = true;
  autoSaveField.textContent = "ON";
}

function isValidEmail(email) {
  // Regular expression for a simple email validation
  const emailInspector = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailInspector.test(email);
}

function saveFinanceData() {
  let email = localStorage.getItem("email") || getEmailFromUser();

  if (email) {
    sendData(email);
  }
}

function getEmailFromUser() {
  let userEmail;
  do {
    // Prompt the user for an email
    userEmail = prompt("Enter your email to save your budget to database:");

    // Check if the email is valid
    if (!isValidEmail(userEmail)) {
      alert("Invalid email. Please enter a valid email address.");
    }
  } while (!isValidEmail(userEmail));

  localStorage.setItem("email", userEmail);
  return userEmail;
}

document.getElementById("save-data").addEventListener("click", saveFinanceData);

async function retriveDataFromDatabase(email) {
  if (!isValidEmail(email)) {
    email = getEmailFromUser();
  }

  let data;
  const id = email.replace(/[.]/g, "");
  const dbref = ref(db);

  get(child(dbref, "financeBuddy/" + id))
    .then((snapshot) => {
      if (snapshot.exists()) {
        data = snapshot.val();
        localStorage.setItem("financeData", JSON.stringify(data.financeData));
        localStorage.setItem("income", data.income);
        localStorage.setItem("rowId", data.rowId);
        localStorage.setItem("spending", data.spending);
        localStorage.setItem("currency", data.currency);
      } else {
        console.log("Data not found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

export { sendData, getEmailFromUser, retriveDataFromDatabase, isValidEmail };
