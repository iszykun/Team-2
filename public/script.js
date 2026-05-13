function logout() {
  fetch("/logout", { credentials: "same-origin" }).then(() => {
    sessionStorage.clear();
    window.location.href = "login.html";
  });
}

/* ---------------- LOGIN ---------------- */

async function login() {

  const email =
    document.getElementById("loginEmail").value;

  const password =
    document.getElementById("loginPassword").value;

  /* ADMIN LOGIN */

  if (
    email === "admin" &&
    password === "admin"
  ) {

    sessionStorage.setItem(
      "admin",
      "true"
    );

    window.location.href =
      "admin.html";

    return;
  }

  /* NORMAL USER LOGIN */

  const res = await fetch("/login", {

    method: "POST",

    credentials: "same-origin",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      email,
      password
    })

  });

  const data = await res.json();

  if (data.success) {

    sessionStorage.setItem(
      "email",
      email
    );

    window.location.href =
      "dashboard.html";

  } else {

    document.getElementById(
      "loginMessage"
    ).innerText =
      data.message;

  }

}

/* ---------------- SIGNUP ---------------- */

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/signup", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  document.getElementById("message").innerText = data.message || "";

  if (data.success) {
    window.location.href = "login.html";
  }
}

/* ---------------- CALORIE TRACKER ---------------- */

function calculateFitness() {

  const age =
    Number(document.getElementById("age").value);

  const height =
    Number(document.getElementById("height").value);

  const weight =
    Number(document.getElementById("weight").value);

  const gender =
    document.getElementById("gender").value;

  const activity =
    Number(document.getElementById("activity").value);

  if (!age || !height || !weight) {
    return;
  }

  /* BMI */

  const bmi =
    weight / ((height / 100) ** 2);

  document.getElementById("bmiDisplay").innerText =
    bmi.toFixed(2);

  /* BMR */

  let bmr = 0;

  if (gender === "female") {

    bmr =
      (10 * weight) +
      (6.25 * height) -
      (5 * age) -
      161;

  } else {

    bmr =
      (10 * weight) +
      (6.25 * height) -
      (5 * age) +
      5;

  }

  const dailyCalories =
    Math.round(bmr * activity);

  document.getElementById("calorieNeed").innerText =
    dailyCalories;

}

/* ---------------- ADD FOOD ---------------- */

async function addFood() {

  const name =
    document.getElementById("foodName").value;

  const calories =
    document.getElementById("foodCalories").value;

  const res = await fetch("/add-food", {

    method: "POST",

    credentials: "same-origin",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name,
      calories
    })

  });

  const data = await res.json();

  if (data.success) {

    document.getElementById("foodName").value = "";
    document.getElementById("foodCalories").value = "";

    loadFoods();

  }

}

/* ---------------- DELETE FOOD ---------------- */

async function deleteFood(id) {

  const res = await fetch("/delete-food", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  });

  const data = await res.json();

  if (data.success) {
    loadFoods(); // refresh list
  }
}

/* ---------------- LOAD FOODS ---------------- */

async function loadFoods() {

  const res =
    await fetch("/get-profile", {
      credentials: "same-origin"
    });

  const data =
    await res.json();

  if (!data.success) return;

  const foodList =
    document.getElementById("foodList");

  foodList.innerHTML = "";

  let total = 0;

  if (
    data.calories &&
    Array.isArray(data.calories.foods)
  ) {

    data.calories.foods.forEach(food => {

  const li = document.createElement("li");

  li.innerHTML = `
    ${food.name} - ${food.calories} cal
    <span onclick="deleteFood(${food.id})"
          style="color:red; cursor:pointer; margin-left:8px;">
      [del]
    </span>
  `;

  foodList.appendChild(li);

  total += Number(food.calories);
});

  }

  document.getElementById("totalCalories").innerText =
    total;

}

/* ---------------- PAGE LOAD ---------------- */

window.onload = function () {

  /* CALORIE TRACKER PAGE */

  if (
    document.getElementById("foodList")
  ) {

    loadFoods();

  }

  /* ADMIN PAGE */

  if (
    document.getElementById("userList")
  ) {

    loadUsers();

  }

};
/* ---------------- ADMIN ---------------- */
/* ---------------- LOAD USERS ---------------- */

async function loadUsers() {

  console.log("Loading users...");

  const res =
    await fetch("/get-users", {
      credentials: "same-origin"
    });

  console.log(res);

  const data =
    await res.json();

  console.log(data);

  const userList =
    document.getElementById("userList");

  userList.innerHTML = "";

  if (!data.users) {

    userList.innerHTML =
      "<p>No users found</p>";

    return;

  }

  data.users.forEach(user => {

    const row =
      document.createElement("div");

    row.className =
      "user-row";

    row.innerHTML = `

      <span>${user.email}</span>

      <div>

        <button onclick="overviewUser('${user.email}')">
          Overview
        </button>

        <button onclick="deleteUser('${user.email}')">
          Delete
        </button>

      </div>

    `;

    userList.appendChild(row);

  });

}

/* ---------------- FILTER USERS ---------------- */

function filterUsers() {

  const search =
    document.getElementById("searchUser")
    .value
    .toLowerCase();

  const rows =
    document.querySelectorAll(".user-row");

  rows.forEach(row => {

    const email =
      row.innerText.toLowerCase();

    row.style.display =
      email.includes(search)
      ? "flex"
      : "none";

  });

}

/* ---------------- DELETE USER ---------------- */

async function deleteUser(email) {

  const confirmDelete =
    confirm(`Delete ${email}?`);

  if (!confirmDelete) return;

  const res = await fetch("/delete-user", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  console.log("Delete response:", data);

  if (data.success) {

    // FORCE REFRESH UI
    await loadUsers();

  } else {
    alert("Delete failed");
  }
}

/* ---------------- OVERVIEW ---------------- */

async function overviewUser(email) {

  const res =
    await fetch("/user-overview", {

      method: "POST",

      credentials: "same-origin",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        email
      })

    });

  const data =
    await res.json();

  if (!data.success) {
    return;
  }

  const o =
    data.overview;

  alert(

`Email:
${o.email}

Account Created:
${o.createdAt}

Last Login:
${o.lastLogin}

Foods Logged Today:
${o.foodCount}

Today's Calories:
${o.totalCalories}`

  );

}
