// -------------------------
// Initialize tasks and theme
// -------------------------
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]'); // Load tasks from localStorage or empty array
let darkMode = false; // Dark mode flag

// -------------------------
// Save tasks to localStorage
// -------------------------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// -------------------------
// Render tasks on the page
// filter: 'all', 'active', 'completed', 'overdue'
// search: text to search in task description
// -------------------------
function renderTasks(filter='all', search='') {
  const list = document.getElementById('taskList');
  list.innerHTML = ''; // Clear previous list
  const now = new Date();

  tasks.forEach((task, index) => {
    const due = new Date(task.dueDateTime);
    const isOverdue = due < now && !task.completed;

    // Apply filters
    if(filter==='active' && task.completed) return;
    if(filter==='completed' && !task.completed) return;
    if(filter==='overdue' && !isOverdue) return;
    if(search && !task.text.toLowerCase().includes(search.toLowerCase())) return;

    // Create task element
    const div = document.createElement('div');
    div.className = `task ${task.priority} ${task.completed?'completed':''} ${isOverdue?'overdue':''}`;
    div.innerHTML = `
      <input type="checkbox" ${task.completed?'checked':''} onchange="toggleComplete(${index})">
      <span>${task.text} <small>(${task.priority})</small><br><small>🗓️ ${due.toLocaleString()}</small></span>
      <div>
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// -------------------------
// Add a new task
// -------------------------
function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('priority').value;
  const date = document.getElementById('dueDate').value;
  const time = document.getElementById('dueTime').value || '00:00';

  if(!text || !date) return alert('কাজ ও তারিখ দিন');

  const dueDateTime = new Date(`${date}T${time}`);
  tasks.push({text, priority, dueDateTime, completed:false});
  saveTasks();
  renderTasks();
  document.getElementById('taskInput').value='';
}

// -------------------------
// Toggle task completion
// -------------------------
function toggleComplete(i) {
  tasks[i].completed = !tasks[i].completed;
  saveTasks();
  renderTasks();
}

// -------------------------
// Delete a task
// -------------------------
function deleteTask(i) {
  tasks.splice(i, 1);
  saveTasks();
  renderTasks();
}

// -------------------------
// Edit a task
// -------------------------
function editTask(i) {
  const newText = prompt('নতুন কাজ লিখুন', tasks[i].text);
  if(newText !== null) {
    tasks[i].text = newText;
    saveTasks();
    renderTasks();
  }
}

// -------------------------
// Clear completed tasks
// -------------------------
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

// -------------------------
// Clear all tasks
// -------------------------
function clearAll() {
  if(confirm('সব কাজ মুছে ফেলবেন?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

// -------------------------
// Export tasks as CSV
// -------------------------
function exportCSV() {
  let csv = 'কাজ,প্রায়োরিটি,ডিউ সময়,সম্পন্ন\n';
  tasks.forEach(t => {
    csv += `${t.text},${t.priority},${new Date(t.dueDateTime).toLocaleString()},${t.completed?'হ্যাঁ':'না'}\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tasks.csv';
  a.click();
}

// -------------------------
// Toggle dark/light theme
// -------------------------
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
}

// -------------------------
// Browser notification
// -------------------------
function notify(msg) {
  if(Notification.permission === 'granted') {
    new Notification('To-Do Reminder', {body: msg});
  }
}

// -------------------------
// Check upcoming reminders (within 5 minutes)
// -------------------------
function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if(!task.completed) {
      const due = new Date(task.dueDateTime);
      const diff = due - now;
      if(diff > 0 && diff < 5*60*1000 && !task.notified) {
        notify(`'${task.text}' কাজটি ${Math.floor(diff/60000)} মিনিটের মধ্যে শেষ করতে হবে!`);
        task.notified = true;
        saveTasks();
      }
    }
  });
}

// Request permission for notifications if not granted
if(Notification.permission !== 'granted') Notification.requestPermission();

// Check reminders every 1 minute
setInterval(checkReminders, 60000);

// -------------------------
// Event listeners
// -------------------------
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('filterAll').addEventListener('click', () => renderTasks('all'));
document.getElementById('filterActive').addEventListener('click', () => renderTasks('active'));
document.getElementById('filterCompleted').addEventListener('click', () => renderTasks('completed'));
document.getElementById('filterOverdue').addEventListener('click', () => renderTasks('overdue'));
document.getElementById('clearCompleted').addEventListener('click', clearCompleted);
document.getElementById('clearAll').addEventListener('click', clearAll);
document.getElementById('exportCSV').addEventListener('click', exportCSV);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('searchBox').addEventListener('input', e => renderTasks('all', e.target.value));

// Initial render
renderTasks();