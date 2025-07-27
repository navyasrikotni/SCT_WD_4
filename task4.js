document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const taskCount = document.getElementById('taskCount');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    
    function init() {
        renderTasks();
        updateTaskCount();
        
       
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().slice(0, 16);
        taskDateTime.min = localISOTime;
    }
    
   
    function addTask() {
        const taskText = taskInput.value.trim();
        const taskDate = taskDateTime.value;
        
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                dateTime: taskDate || null,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateTaskCount();
            
           
            taskInput.value = '';
            taskDateTime.value = '';
            taskInput.focus();
        }
    }
    
    
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        
        let filteredTasks = [];
        
        switch(filter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = [...tasks];
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }
        
        
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            if (a.dateTime && b.dateTime) {
                return new Date(a.dateTime) - new Date(b.dateTime);
            }
            
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            
            const taskText = document.createElement('span');
            taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
            taskText.textContent = task.text;
            
            const taskDateTimeDisplay = document.createElement('span');
            taskDateTimeDisplay.className = 'task-datetime';
            if (task.dateTime) {
                const date = new Date(task.dateTime);
                taskDateTimeDisplay.textContent = formatDateTime(date);
                
               
                if (!task.completed && date < new Date()) {
                    taskDateTimeDisplay.style.color = '#ff5d5d';
                    taskDateTimeDisplay.textContent += ' (Overdue)';
                }
            }
            
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editTask(task.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskActions.append(editBtn, deleteBtn);
            taskItem.append(checkbox, taskText, taskDateTimeDisplay, taskActions);
            taskList.appendChild(taskItem);
        });
    }
    
    
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        );
        saveTasks();
        renderTasks(getCurrentFilter());
        updateTaskCount();
    }
    
    
    function editTask(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            const newDateTime = prompt('Edit date/time (leave empty to remove):', task.dateTime || '');
            if (newDateTime !== null) {
                task.dateTime = newDateTime.trim() || null;
            }
            
            saveTasks();
            renderTasks(getCurrentFilter());
        }
    }
    
    
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks(getCurrentFilter());
            updateTaskCount();
        }
    }
    
   
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(getCurrentFilter());
        updateTaskCount();
    }
    
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
    }
    
   
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    
    function formatDateTime(date) {
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.filter : 'all';
    }
    
    
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    
    init();
});