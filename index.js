const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");

const app = express();
const PORT = 3000;

function getToday() {
  return new Date().toISOString().split("T")[0];
}

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "rp-fitness-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------------- READ / WRITE ---------------- */

function readUsers() {
  return JSON.parse(fs.readFileSync("users.json"));
}

function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

/* ---------------- SIGNUP ---------------- */

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Empty fields" });
  }

  const regex = /^\d{8}@myrp\.edu\.sg$/;

  if (!regex.test(email)) {
    return res.json({
      success: false,
      message: "Email must be 8 digits @myrp.edu.sg"
    });
  }

  let users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: "User exists" });
  }

  users.push({

  email,
  password,

  createdAt:
    new Date().toLocaleString(),

  lastLogin:
    "Never",

  profile: null,

  calories: {
    date: getToday(),
    foods: []
  }

});

saveUsers(users);

  res.json({ success: true });
});

/* ---------------- LOGIN ---------------- */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let users = readUsers();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ success: false, message: "Invalid login" });
  }

  req.session.user = email;

  user.lastLogin =
  new Date().toLocaleString();

saveUsers(users);

  res.json({ success: true });
});

/* ---------------- SESSION CHECK ---------------- */

app.get("/check-session", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

/* ---------------- LOGOUT ---------------- */

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

/* ---------------- GET PROFILE ---------------- */

app.get("/get-profile", (req, res) => {

  const email = req.session.user;

  if (!email) {
    return res.json({ success: false });
  }

  let users = readUsers();

  let user = users.find(u => u.email === email);

  if (!user) {
    return res.json({ success: false });
  }

  const today = new Date().toISOString().split("T")[0];

  if (!user.calories || user.calories.date !== today) {

    user.calories = {
      date: today,
      foods: []
    };

    saveUsers(users);
  }

  res.json({
    success: true,
    calories: {
      date: user.calories.date,
      foods: user.calories.foods || []
    }
  });

});
/* ---------------- ADD FOOD ---------------- */

app.post("/add-food", (req, res) => {

  const email = req.session.user;

  if (!email) {
    return res.json({
      success: false
    });
  }

  const { name, calories } = req.body;

  let users = readUsers();

  let user =
    users.find(u => u.email === email);

  if (!user) {
    return res.json({
      success: false
    });
  }

  const today =
    new Date().toISOString().split("T")[0];

  /* RESET DAILY */

  if (
    !user.calories ||
    user.calories.date !== today
  ) {

    user.calories = {
      date: today,
      foods: []
    };

  }

  user.calories.foods.push({
  id: Date.now(), // ✅ UNIQUE ID
  name,
  calories: Number(calories)
});

  saveUsers(users);

  res.json({
    success: true
  });

});

/* ---------------- DELETE FOOD ---------------- */

app.post("/delete-food", (req, res) => {
  const email = req.session.user;
  const { id } = req.body;

  let users = readUsers();
  let user = users.find(u => u.email === email);

  if (!user || !user.calories) {
    return res.json({ success: false });
  }

  user.calories.foods =
    user.calories.foods.filter(
      food => String(food.id) !== String(id)
    );

  saveUsers(users);

  console.log("Deleted ID:", id);

  res.json({ success: true });
});

/* ---------------- ADMIN ---------------- */
/* ---------------- GET USERS ---------------- */

app.get("/get-users", (req, res) => {

  let users = readUsers();

  const cleanUsers =
    users.map(user => ({
      email: user.email
    }));

  res.json({
    success: true,
    users: cleanUsers
  });

});
/* ---------------- DELETE USER ---------------- */

app.post("/delete-user", (req, res) => {

  const { email } = req.body;

  let users = readUsers();

  const newUsers = users.filter(
    user => user.email !== email
  );

  saveUsers(newUsers);

  console.log("Deleted:", email);
  console.log("Remaining:", newUsers);

  res.json({
    success: true
  });

});

/* ---------------- USER OVERVIEW ---------------- */

app.post("/user-overview", (req, res) => {

  const { email } = req.body;

  let users = readUsers();

  let user =
    users.find(u => u.email === email);

  if (!user) {
    return res.json({
      success: false
    });
  }

  let totalCalories = 0;
  let foodCount = 0;

  if (
    user.calories &&
    Array.isArray(user.calories.foods)
  ) {

    foodCount =
      user.calories.foods.length;

    user.calories.foods.forEach(food => {

      totalCalories +=
        Number(food.calories || 0);

    });

  }

  res.json({

    success: true,

    overview: {

      email: user.email,

      createdAt:
        user.createdAt || "Unknown",

      lastLogin:
        user.lastLogin || "Never",

      foodCount,

      totalCalories

    }

  });

});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/login.html`);
});