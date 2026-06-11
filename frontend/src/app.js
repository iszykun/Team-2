function $(id) {
  return document.getElementById(id);
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function setMessage(id, message, type = 'error') {
  const element = $(id);
  if (!element) return;
  element.textContent = message || '';
  element.className = `form-message ${type}`;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  sessionStorage.clear();
  window.location.href = '/pages/login.html';
}

async function login() {
  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value;

  if (email === 'admin' && password === 'admin') {
    sessionStorage.setItem('admin', 'true');
    window.location.href = '/pages/admin.html';
    return;
  }

  try {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.success) {
      sessionStorage.setItem('email', email);
      window.location.href = '/pages/dashboard.html';
    }
  } catch (error) {
    setMessage('loginMessage', error.message);
  }
}

async function signup() {
  try {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: $('email').value.trim(), password: $('password').value })
    });
    setMessage('message', data.message || 'Account created successfully', 'success');
    setTimeout(() => { window.location.href = '/pages/login.html'; }, 700);
  } catch (error) {
    setMessage('message', error.message);
  }
}

function calculateFitness() {
  const age = Number($('age').value);
  const height = Number($('height').value);
  const weight = Number($('weight').value);
  const gender = $('gender').value;
  const activity = Number($('activity').value);
  if (!age || !height || !weight) {
    setMessage('trackerMessage', 'Complete age, height, and weight first.');
    return;
  }
  const bmi = weight / ((height / 100) ** 2);
  const bmr = gender === 'female'
    ? (10 * weight) + (6.25 * height) - (5 * age) - 161
    : (10 * weight) + (6.25 * height) - (5 * age) + 5;
  $('bmiDisplay').innerText = bmi.toFixed(2);
  $('calorieNeed').innerText = Math.round(bmr * activity);
  setMessage('trackerMessage', '', 'success');
}

async function addFood() {
  try {
    await apiFetch('/api/calories', {
      method: 'POST',
      body: JSON.stringify({ name: $('foodName').value.trim(), calories: $('foodCalories').value })
    });
    $('foodName').value = '';
    $('foodCalories').value = '';
    await loadFoods();
  } catch (error) {
    setMessage('foodMessage', error.message);
  }
}

function goEditFood(id) {
  sessionStorage.setItem('editFoodId', id);
  window.location.href = '/pages/EditFood.html';
}

async function initEditFoodPage() {
  const id = sessionStorage.getItem('editFoodId');
  if (!id) {
    window.location.href = '/pages/CalorieTracker.html';
    return;
  }
  try {
    const data = await apiFetch('/api/calories/profile');
    const food = data.calories.foods.find((item) => String(item.id) === String(id));
    if (!food) {
      setMessage('editMessage', 'Food entry not found.');
      return;
    }
    $('editName').value = food.name;
    $('editCalories').value = food.calories;
  } catch (error) {
    setMessage('editMessage', error.message);
  }
}

async function saveEdit() {
  const id = sessionStorage.getItem('editFoodId');
  try {
    await apiFetch(`/api/calories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: $('editName').value.trim(), calories: $('editCalories').value })
    });
    window.location.href = '/pages/CalorieTracker.html';
  } catch (error) {
    setMessage('editMessage', error.message);
  }
}

function cancelEdit() {
  window.location.href = '/pages/CalorieTracker.html';
}

async function deleteEdit() {
  const id = sessionStorage.getItem('editFoodId');
  if (!confirm('Delete this food entry?')) return;
  try {
    await apiFetch(`/api/calories/${id}`, { method: 'DELETE' });
    window.location.href = '/pages/CalorieTracker.html';
  } catch (error) {
    setMessage('editMessage', error.message);
  }
}

async function resetFoods() {
  if (!confirm('Reset all food entries for today?')) return;
  try {
    await apiFetch('/api/calories/reset', { method: 'POST' });
    await loadFoods();
  } catch (error) {
    setMessage('foodMessage', error.message);
  }
}

async function loadFoods() {
  const foodList = $('foodList');
  if (!foodList) return;
  try {
    const data = await apiFetch('/api/calories/profile');
    foodList.innerHTML = '';
    let total = 0;
    if (!data.calories.foods.length) foodList.innerHTML = '<li class="empty-state">No food added yet.</li>';
    data.calories.foods.forEach((food) => {
      const li = document.createElement('li');
      li.className = 'food-item';
      li.innerHTML = `<span><strong>${food.name}</strong><small>${food.calories} cal</small></span><button class="icon-button" onclick="goEditFood(${food.id})">Edit</button>`;
      foodList.appendChild(li);
      total += Number(food.calories || 0);
    });
    $('totalCalories').innerText = total;
  } catch (error) {
    setMessage('foodMessage', error.message);
  }
}

async function loadUsers() {
  const userList = $('userList');
  if (!userList) return;
  try {
    const data = await apiFetch('/api/admin/users');
    userList.innerHTML = '';
    if (!data.users.length) {
      userList.innerHTML = '<p class="empty-state">No users found.</p>';
      return;
    }
    data.users.forEach((user) => {
      const row = document.createElement('div');
      row.className = 'user-row';
      row.dataset.email = user.email.toLowerCase();
      row.innerHTML = `<span>${user.email}</span><div class="row-actions"><button onclick="overviewUser('${user.email}')">Overview</button><button class="danger-button" onclick="deleteUser('${user.email}')">Delete</button></div>`;
      userList.appendChild(row);
    });
  } catch (error) {
    userList.innerHTML = `<p class="form-message error">${error.message}</p>`;
  }
}

function filterUsers() {
  const search = $('searchUser').value.toLowerCase();
  document.querySelectorAll('.user-row').forEach((row) => {
    row.style.display = row.dataset.email.includes(search) ? 'flex' : 'none';
  });
}

async function deleteUser(email) {
  if (!confirm(`Delete ${email}?`)) return;
  try {
    await apiFetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
    await loadUsers();
  } catch (error) {
    alert(error.message);
  }
}

async function overviewUser(email) {
  try {
    const data = await apiFetch('/api/admin/users/overview', { method: 'POST', body: JSON.stringify({ email }) });
    const overview = data.overview;
    $('overviewPanel').innerHTML = `<h3>${overview.email}</h3><dl class="overview-list"><div><dt>Created</dt><dd>${overview.createdAt}</dd></div><div><dt>Last login</dt><dd>${overview.lastLogin}</dd></div><div><dt>Foods today</dt><dd>${overview.foodCount}</dd></div><div><dt>Total calories</dt><dd>${overview.totalCalories}</dd></div></dl>`;
  } catch (error) {
    alert(error.message);
  }
}

window.addEventListener('load', () => {
  loadFoods();
  loadUsers();
  if ($('editName')) initEditFoodPage();
});
