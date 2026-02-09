// Initialize tasks array from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add or update a task
function addTask() {
    const input = document.getElementById('taskInput');
    const category = document.getElementById('categorySelect');
    const taskText = input.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    if (editingTaskId !== null) {
        // Update existing task
        const task = tasks.find(t => t.id === editingTaskId);
        task.text = taskText;
        task.category = category.value;
        editingTaskId = null;
        document.querySelector('.add-btn').textContent = 'Add Task';
    } else {
        // Add new task
        const task = {
            id: Date.now(),
            text: taskText,
            category: category.value,
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        tasks.unshift(task);
    }

    input.value = '';
    saveTasks();
    renderTasks();
    updateStats();
}

// Toggle task completion status
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
}

// Delete a task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    document.getElementById('taskInput').value = task.text;
    document.getElementById('categorySelect').value = task.category;
    document.querySelector('.add-btn').textContent = 'Update Task';
    editingTaskId = id;
    document.getElementById('taskInput').focus();
}

// Filter tasks based on selected filter
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// Render tasks to the DOM
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    let filteredTasks = tasks;

    // Apply filters
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (['work', 'personal', 'shopping', 'health'].includes(currentFilter)) {
        filteredTasks = tasks.filter(t => t.category === currentFilter);
    }

    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3>No tasks found!</h3>
                <p>Try a different filter or add a new task</p>
            </div>
        `;
        return;
    }

    // Render filtered tasks
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="category-badge category-${task.category}">${getCategoryIcon(task.category)} ${task.category}</span>
                    <span>📅 ${task.createdAt}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        work: '💼',
        personal: '🏠',
        shopping: '🛒',
        health: '💪'
    };
    return icons[category] || '📝';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;

    // Show/hide clear button
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.style.display = completed > 0 ? 'block' : 'none';
}

// Clear all completed tasks
function clearCompleted() {
    if (confirm('Are you sure you want to delete all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Allow Enter key to add task
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Initialize on load
    renderTasks();
    updateStats();
});
