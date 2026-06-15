function formatCalendarDay(day) {
  return String(day).padStart(2, '0');
}

function createCalendarCell(day, status, isToday) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = `calendar-cell ${status}`;
  if (isToday) cell.classList.add('today');
  cell.innerHTML = `<span>${day}</span>`;
  return cell;
}

function createBlankCell() {
  const blank = document.createElement('div');
  blank.className = 'calendar-cell blank';
  return blank;
}

function getWeekdayHeaders() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

function renderWeekdayLabels(container) {
  container.innerHTML = '';
  getWeekdayHeaders().forEach((day) => {
    const div = document.createElement('div');
    div.textContent = day;
    container.appendChild(div);
  });
}

module.exports = { formatCalendarDay, createCalendarCell, createBlankCell, renderWeekdayLabels };
