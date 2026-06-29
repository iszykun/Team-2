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

function setActiveSidebarLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    link.classList.toggle('active', linkPath === currentPath);
  });
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

let editingWorkoutId = null;
let allWorkouts = [];

function renderTypeSpecificFields(workoutType = '') {
  const container = $('typeSpecificFields');
  if (!container) return;
  const values = {
    'Gym / Weightlifting': `
      <label for="workoutMuscleGroup">Muscle group targeted</label>
      <select id="workoutMuscleGroup">
        <option value="">Select muscle group</option>
        <option value="Chest">Chest</option>
        <option value="Back">Back</option>
        <option value="Legs">Legs</option>
        <option value="Arms">Arms</option>
        <option value="Shoulders">Shoulders</option>
        <option value="Core">Core</option>
      </select>
      <label for="workoutDescription">Exercise description</label>
      <textarea id="workoutDescription" rows="3" placeholder="Describe what exercises you did"></textarea>
      <div class="row-actions">
        <div><label for="workoutSets">Sets</label><input id="workoutSets" type="number" min="1" step="1"></div>
        <div><label for="workoutReps">Reps</label><input id="workoutReps" type="number" min="1" step="1"></div>
        <div><label for="workoutWeight">Weight (kg)</label><input id="workoutWeight" type="number" min="1" step="0.5"></div>
      </div>
    `,
    Running: `
      <div class="row-actions">
        <div><label for="workoutDistance">Distance (km)</label><input id="workoutDistance" type="number" min="1" step="0.1"></div>
        <div><label for="workoutPace">Pace (min/km)</label><input id="workoutPace" type="text"></div>
      </div>
      <div class="row-actions">
        <div><label for="workoutHeartRate">Heart rate (bpm)</label><input id="workoutHeartRate" type="number" min="1" step="1"></div>
        <div><label for="workoutRouteDescription">Route description</label><input id="workoutRouteDescription" type="text"></div>
      </div>
    `,
    Cycling: `
      <div class="row-actions">
        <div><label for="workoutDistance">Distance (km)</label><input id="workoutDistance" type="number" min="1" step="0.1"></div>
        <div><label for="workoutAverageSpeed">Average speed (km/h)</label><input id="workoutAverageSpeed" type="number" min="1" step="0.1"></div>
      </div>
      <label for="workoutElevationGain">Elevation gain (m)</label>
      <input id="workoutElevationGain" type="number" min="1" step="1">
    `,
    Swimming: `
      <div class="row-actions">
        <div><label for="workoutLaps">Number of laps</label><input id="workoutLaps" type="number" min="1" step="1"></div>
        <div><label for="workoutPoolLength">Pool length (m)</label><input id="workoutPoolLength" type="number" min="1" step="1"></div>
      </div>
      <label for="workoutStrokeType">Stroke type</label>
      <select id="workoutStrokeType">
        <option value="">Select stroke</option>
        <option value="Freestyle">Freestyle</option>
        <option value="Breaststroke">Breaststroke</option>
        <option value="Backstroke">Backstroke</option>
        <option value="Butterfly">Butterfly</option>
      </select>
    `,
    'Yoga / Stretching': `
      <label for="workoutSessionType">Session type</label>
      <select id="workoutSessionType">
        <option value="">Select session</option>
        <option value="Hatha">Hatha</option>
        <option value="Vinyasa">Vinyasa</option>
        <option value="Yin">Yin</option>
        <option value="Stretching">Stretching</option>
      </select>
      <label for="workoutPoses">Notes / poses done</label>
      <textarea id="workoutPoses" rows="3" placeholder="Describe your flow or stretches"></textarea>
    `,
    Other: `
      <label for="workoutDescription">Description</label>
      <textarea id="workoutDescription" rows="3" placeholder="Describe your workout freely"></textarea>
    `
  };
  container.innerHTML = values[workoutType] || '';
}

function resetWorkoutForm() {
  editingWorkoutId = null;
  const form = $('workoutForm');
  if (!form) return;
  form.reset();
  renderTypeSpecificFields('');
  const submitButton = document.querySelector('#workoutForm button[type="submit"]');
  if (submitButton) submitButton.textContent = 'Save workout';
}

function populateWorkoutForm(workout) {
  editingWorkoutId = workout.id;
  $('workoutType').value = workout.workoutType || 'Other';
  renderTypeSpecificFields($('workoutType').value);
  $('workoutExercise').value = workout.exerciseName || '';
  $('workoutDuration').value = workout.duration || '';
  $('workoutCalories').value = workout.caloriesBurned || '';
  $('workoutDate').value = workout.date || '';
  $('workoutDifficulty').value = workout.difficulty || '';
  $('workoutMood').value = workout.mood || '';
  $('workoutNotes').value = workout.notes || '';
  $('workoutTags').value = workout.tags || '';
  if ($('workoutMuscleGroup')) $('workoutMuscleGroup').value = workout.muscleGroup || '';
  if ($('workoutDescription')) $('workoutDescription').value = workout.description || '';
  if ($('workoutSets')) $('workoutSets').value = workout.sets || '';
  if ($('workoutReps')) $('workoutReps').value = workout.reps || '';
  if ($('workoutWeight')) $('workoutWeight').value = workout.weight || '';
  if ($('workoutDistance')) $('workoutDistance').value = workout.distance || '';
  if ($('workoutPace')) $('workoutPace').value = workout.pace || '';
  if ($('workoutHeartRate')) $('workoutHeartRate').value = workout.heartRate || '';
  if ($('workoutRouteDescription')) $('workoutRouteDescription').value = workout.routeDescription || '';
  if ($('workoutAverageSpeed')) $('workoutAverageSpeed').value = workout.averageSpeed || '';
  if ($('workoutElevationGain')) $('workoutElevationGain').value = workout.elevationGain || '';
  if ($('workoutLaps')) $('workoutLaps').value = workout.laps || '';
  if ($('workoutPoolLength')) $('workoutPoolLength').value = workout.poolLength || '';
  if ($('workoutStrokeType')) $('workoutStrokeType').value = workout.strokeType || '';
  if ($('workoutSessionType')) $('workoutSessionType').value = workout.sessionType || '';
  if ($('workoutPoses')) $('workoutPoses').value = workout.poses || '';
  const submitButton = document.querySelector('#workoutForm button[type="submit"]');
  if (submitButton) submitButton.textContent = 'Update workout';
  $('workoutExercise').focus();
}

function getWorkoutPayload() {
  const workoutType = $('workoutType').value;
  const payload = {
    exerciseName: $('workoutExercise').value.trim(),
    workoutType,
    duration: $('workoutDuration').value,
    caloriesBurned: $('workoutCalories').value,
    date: $('workoutDate').value,
    difficulty: $('workoutDifficulty').value,
    mood: $('workoutMood').value,
    notes: $('workoutNotes').value.trim(),
    tags: $('workoutTags').value.trim()
  };

  if (workoutType === 'Gym / Weightlifting') {
    payload.muscleGroup = $('workoutMuscleGroup').value;
    payload.description = $('workoutDescription').value.trim();
    payload.sets = $('workoutSets').value;
    payload.reps = $('workoutReps').value;
    payload.weight = $('workoutWeight').value;
  }

  if (workoutType === 'Running') {
    payload.distance = $('workoutDistance').value;
    payload.pace = $('workoutPace').value.trim();
    payload.heartRate = $('workoutHeartRate').value;
    payload.routeDescription = $('workoutRouteDescription').value.trim();
  }

  if (workoutType === 'Cycling') {
    payload.distance = $('workoutDistance').value;
    payload.averageSpeed = $('workoutAverageSpeed').value;
    payload.elevationGain = $('workoutElevationGain').value;
  }

  if (workoutType === 'Swimming') {
    payload.laps = $('workoutLaps').value;
    payload.poolLength = $('workoutPoolLength').value;
    payload.strokeType = $('workoutStrokeType').value;
  }

  if (workoutType === 'Yoga / Stretching') {
    payload.sessionType = $('workoutSessionType').value;
    payload.poses = $('workoutPoses').value.trim();
  }

  if (workoutType === 'Other') {
    payload.description = $('workoutDescription').value.trim();
  }

  return payload;
}

function validateWorkoutPayload(payload) {
  if (!payload.exerciseName) throw new Error('Exercise name is required');
  if (!payload.workoutType) throw new Error('Workout type is required');
  if (!payload.duration || Number(payload.duration) <= 0) throw new Error('Duration must be greater than 0');
  if (!payload.caloriesBurned || Number(payload.caloriesBurned) <= 0) throw new Error('Calories burned must be greater than 0');
  if (!payload.date) throw new Error('Workout date is required');
  if (!payload.difficulty) throw new Error('Difficulty is required');
  if (!payload.mood) throw new Error('Mood is required');
  if (payload.workoutType === 'Gym / Weightlifting') {
    if (!payload.muscleGroup) throw new Error('Muscle group is required');
    if (!payload.sets || Number(payload.sets) <= 0) throw new Error('Sets must be greater than 0');
    if (!payload.reps || Number(payload.reps) <= 0) throw new Error('Reps must be greater than 0');
    if (!payload.weight || Number(payload.weight) <= 0) throw new Error('Weight must be greater than 0');
  }
  if (payload.workoutType === 'Running') {
    if (!payload.distance || Number(payload.distance) <= 0) throw new Error('Distance must be greater than 0');
    if (!payload.heartRate || Number(payload.heartRate) <= 0) throw new Error('Heart rate must be greater than 0');
  }
  if (payload.workoutType === 'Cycling') {
    if (!payload.distance || Number(payload.distance) <= 0) throw new Error('Distance must be greater than 0');
    if (!payload.averageSpeed || Number(payload.averageSpeed) <= 0) throw new Error('Average speed must be greater than 0');
    if (!payload.elevationGain || Number(payload.elevationGain) <= 0) throw new Error('Elevation gain must be greater than 0');
  }
  if (payload.workoutType === 'Swimming') {
    if (!payload.laps || Number(payload.laps) <= 0) throw new Error('Number of laps must be greater than 0');
    if (!payload.poolLength || Number(payload.poolLength) <= 0) throw new Error('Pool length must be greater than 0');
    if (!payload.strokeType) throw new Error('Stroke type is required');
  }
  if (payload.workoutType === 'Yoga / Stretching' && !payload.sessionType) {
    throw new Error('Session type is required');
  }
  return payload;
}

async function saveWorkout() {
  const payload = validateWorkoutPayload(getWorkoutPayload());

  try {
    const data = editingWorkoutId
      ? await apiFetch(`/api/workouts/${editingWorkoutId}`, { method: 'PUT', body: JSON.stringify({ ...payload, id: editingWorkoutId }) })
      : await apiFetch('/api/workouts', { method: 'POST', body: JSON.stringify(payload) });
    setMessage('workoutMessage', data.message || 'Workout saved successfully', 'success');
    resetWorkoutForm();
    await loadWorkouts();
    await loadDashboardWorkouts();
    await loadDashboardStats();
  } catch (error) {
    setMessage('workoutMessage', error.message);
  }
}

function editWorkout(workout) {
  populateWorkoutForm(workout);
}

function getWorkoutSummary(workout) {
  const details = [];
  if (workout.workoutType === 'Gym / Weightlifting') {
    if (workout.muscleGroup) details.push(`Target: ${workout.muscleGroup}`);
    if (workout.sets || workout.reps) details.push(`Sets/Reps: ${workout.sets || '-'}x${workout.reps || '-'}`);
    if (workout.weight) details.push(`Weight: ${workout.weight}kg`);
  } else if (workout.workoutType === 'Running') {
    if (workout.distance) details.push(`Distance: ${workout.distance}km`);
    if (workout.pace) details.push(`Pace: ${workout.pace}`);
  } else if (workout.workoutType === 'Cycling') {
    if (workout.distance) details.push(`Distance: ${workout.distance}km`);
    if (workout.averageSpeed) details.push(`Avg: ${workout.averageSpeed}km/h`);
  } else if (workout.workoutType === 'Swimming') {
    if (workout.laps) details.push(`Laps: ${workout.laps}`);
    if (workout.poolLength) details.push(`Pool: ${workout.poolLength}m`);
  } else if (workout.workoutType === 'Yoga / Stretching') {
    if (workout.sessionType) details.push(`Type: ${workout.sessionType}`);
  } else if (workout.workoutType === 'Other' && workout.description) {
    details.push(workout.description);
  }
  if (workout.difficulty) details.push(`Difficulty: ${workout.difficulty}`);
  return details.join(' • ');
}

async function loadWorkouts() {
  const workoutList = $('workoutList');
  if (!workoutList) return;
  try {
    const data = await apiFetch('/api/workouts');
    allWorkouts = data.workouts || [];
    workoutList.innerHTML = '';
    if (!allWorkouts.length) {
      workoutList.innerHTML = '<li class="empty-state">No workouts logged yet.</li>';
      return;
    }
    filterWorkouts();
  } catch (error) {
    setMessage('workoutMessage', error.message);
  }
}

function filterWorkouts() {
  const workoutList = $('workoutList');
  const filter = $('workoutFilter') ? $('workoutFilter').value : 'All';
  if (!workoutList) return;
  workoutList.innerHTML = '';
  const filtered = filter === 'All' ? allWorkouts : allWorkouts.filter((workout) => workout.workoutType === filter);
  if (!filtered.length) {
    workoutList.innerHTML = '<li class="empty-state">No workouts match this filter.</li>';
    return;
  }
  filtered.forEach((workout) => {
    const li = document.createElement('li');
    li.className = 'food-item';
    li.innerHTML = `<span><strong>${workout.exerciseName}</strong><small>${workout.workoutType || 'Other'} • ${workout.duration} min • ${workout.caloriesBurned} cal • ${workout.date}</small><small>${getWorkoutSummary(workout)}</small></span><div class="row-actions"><button class="secondary-button" onclick='editWorkout(${JSON.stringify(workout)})'>Edit</button><button class="danger-button" onclick="deleteWorkout(${workout.id})">Delete</button></div>`;
    workoutList.appendChild(li);
  });
}

async function deleteWorkout(id) {
  if (!confirm('Delete this workout entry?')) return;
  try {
    const data = await apiFetch(`/api/workouts/${id}`, { method: 'DELETE' });
    setMessage('workoutMessage', data.message || 'Workout deleted successfully', 'success');
    await loadWorkouts();
    await loadDashboardWorkouts();
    await loadDashboardStats();
  } catch (error) {
    setMessage('workoutMessage', error.message);
  }
}

function getWorkoutIcon(workoutType) {
  switch (workoutType) {
    case 'Gym / Weightlifting': return '🏋️';
    case 'Running': return '🏃';
    case 'Cycling': return '🚴';
    case 'Swimming': return '🏊';
    case 'Yoga / Stretching': return '🧘';
    default: return '⭐';
  }
}

function renderPersonalBests(workouts) {
  const container = $('personalBests');
  if (!container) return;
  if (!workouts.length) {
    container.innerHTML = '<li class="empty-state">No personal bests yet.</li>';
    return;
  }
  const longestRun = workouts.filter((workout) => workout.workoutType === 'Running').sort((a, b) => Number(b.distance || 0) - Number(a.distance || 0))[0];
  const heaviestLift = workouts.filter((workout) => workout.workoutType === 'Gym / Weightlifting').sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0))[0];
  const items = [];
  if (longestRun) items.push(`<li class="food-item"><span><strong>Longest run</strong><small>${longestRun.exerciseName}</small></span><span>${longestRun.distance || '-'} km</span></li>`);
  if (heaviestLift) items.push(`<li class="food-item"><span><strong>Heaviest lift</strong><small>${heaviestLift.exerciseName}</small></span><span>${heaviestLift.weight || '-'} kg</span></li>`);
  container.innerHTML = items.length ? items.join('') : '<li class="empty-state">No personal bests yet.</li>';
}

function calculateWorkoutStreak(workouts) {
  if (!workouts.length) return 0;
  const sortedDates = [...new Set(workouts.map((workout) => workout.date))].sort();
  let streak = 0;
  const today = new Date();
  const currentDate = new Date(today);
  while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
}

async function loadDashboardStats() {
  const weeklyWorkouts = $('weeklyWorkouts');
  const weeklyCalories = $('weeklyCalories');
  const workoutStreak = $('workoutStreak');
  if (!weeklyWorkouts || !weeklyCalories || !workoutStreak) return;
  try {
    const data = await apiFetch('/api/workouts');
    const workouts = data.workouts || [];
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6);
    const weekWorkouts = workouts.filter((workout) => new Date(workout.date) >= weekStart);
    weeklyWorkouts.textContent = weekWorkouts.length;
    weeklyCalories.textContent = weekWorkouts.reduce((sum, workout) => sum + Number(workout.caloriesBurned || 0), 0);
    workoutStreak.textContent = calculateWorkoutStreak(workouts);
    renderPersonalBests(workouts);
  } catch (error) {
    weeklyWorkouts.textContent = '0';
    weeklyCalories.textContent = '0';
    workoutStreak.textContent = '0';
  }
}

async function loadDashboardWorkouts() {
  const dashboardList = $('dashboardWorkouts');
  if (!dashboardList) return;
  try {
    const data = await apiFetch('/api/workouts');
    dashboardList.innerHTML = '';
    if (!data.workouts.length) {
      dashboardList.innerHTML = '<li class="empty-state">No workout history yet.</li>';
      return;
    }
    data.workouts.slice(0, 5).forEach((workout) => {
      const li = document.createElement('li');
      li.className = 'food-item';
      li.innerHTML = `<span><strong>${getWorkoutIcon(workout.workoutType)} ${workout.exerciseName}</strong><small>${workout.workoutType || 'Other'} • ${workout.duration} min • ${workout.caloriesBurned} cal</small></span><span>${workout.date}</span>`;
      dashboardList.appendChild(li);
    });
  } catch (error) {
    dashboardList.innerHTML = `<li class="empty-state">${error.message}</li>`;
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

async function loadGoalPage() {
  if (!$('dailyGoalInput')) return;
  renderCalendarWeekdays();
  try {
    const data = await apiFetch('/api/goals');
    $('dailyGoalInput').value = data.goal !== null ? data.goal : '';
    $('todayGoal').innerText = data.goal !== null ? `${data.goal} cal` : 'Not set';
    $('caloriesConsumed').innerText = `${data.caloriesConsumed} cal`;
    $('caloriesRemaining').innerText = data.goal !== null ? `${data.caloriesRemaining} cal` : '-';
    currentGoal = data.goal;
    await renderCalendar(currentYear, currentMonth);
  } catch (error) {
    setMessage('dailyGoalMessage', error.message);
  }
}

function renderCalendarWeekdays() {
  const header = $('calendarWeekdays');
  if (!header) return;
  header.innerHTML = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .map((day) => `<div>${day}</div>`)
    .join('');
}

async function saveDailyGoal() {
  const input = $('dailyGoalInput');
  const value = input ? String(input.value).trim() : '';
  try {
    await apiFetch('/api/goals', { method: 'POST', body: JSON.stringify({ goal: value }) });
    setMessage('dailyGoalMessage', 'Saved successfully', 'success');
    await loadGoalPage();
  } catch (error) {
    setMessage('dailyGoalMessage', error.message);
  }
}

function buildCalendarGrid(year, month, results, today) {
  const calendarDays = $('calendarDays');
  if (!calendarDays) return;
  calendarDays.innerHTML = '';

  const firstOfMonth = new Date(year, month - 1, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < startDay; i += 1) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell blank';
    calendarDays.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'calendar-cell';
    cell.innerHTML = `<span>${day}</span>`;
    const result = results[dateString] || { status: 'neutral' };
    cell.classList.add(result.status);
    if (dateString === today) cell.classList.add('today');
    calendarDays.appendChild(cell);
  }
}

async function renderCalendar(year, month) {
  const title = $('calendarTitle');
  if (!title) return;
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
  title.textContent = `${monthName} ${year}`;

  try {
    const data = await apiFetch(`/api/goals/calendar?year=${year}&month=${month}`);
    buildCalendarGrid(year, month, data.results, data.today);
  } catch (error) {
    setMessage('dailyGoalMessage', error.message);
  }
}

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentGoal = null;

function changeCalendarMonth(direction) {
  currentMonth += direction;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear -= 1;
  }
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear += 1;
  }
  renderCalendar(currentYear, currentMonth);
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
  setActiveSidebarLink();
  loadFoods();
  if ($('workoutType')) {
    $('workoutType').addEventListener('change', (event) => renderTypeSpecificFields(event.target.value));
  }
  loadWorkouts();
  loadDashboardWorkouts();
  loadDashboardStats();
  loadUsers();
  if ($('editName')) initEditFoodPage();
  if ($('dailyGoalInput')) loadGoalPage();
  resetWorkoutForm();
});
