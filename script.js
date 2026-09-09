let tasks = JSON.parse(localStorage.getItem("studentTasks")) || [];

let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskModal = document.getElementById("taskModal");

function saveTasks() {
    localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function openTaskModal(task = null) {

    taskModal.classList.add("show");

    if (task) {
        document.getElementById("modalTitle").textContent = "Edit Task";

        document.getElementById("taskId").value = task.id;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;
        document.getElementById("taskDate").value = task.date;
        document.getElementById("taskCategory").value = task.category;
    } else {
        document.getElementById("modalTitle").textContent = "Add New Task";

        taskForm.reset();
        document.getElementById("taskId").value = "";
    }
}

function closeTaskModal() {
    taskModal.classList.remove("show");
    taskForm.reset();
}

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const id = document.getElementById("taskId").value;

    const taskData = {
        title: document.getElementById("taskTitle").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        date: document.getElementById("taskDate").value,
        category: document.getElementById("taskCategory").value
    };

    if (!taskData.title) {
        return;
    }

    if (id) {

        const task = tasks.find(task => task.id === Number(id));

        if (task) {
            task.title = taskData.title;
            task.description = taskData.description;
            task.date = taskData.date;
            task.category = taskData.category;
        }

    } else {

        tasks.push({
            id: Date.now(),
            ...taskData,
            completed: false
        });

    }

    saveTasks();
    renderTasks();
    closeTaskModal();
});

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();
    renderTasks();
}

function deleteTask(id) {

    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        openTaskModal(task);
    }
}

function filterTasks(filter, button) {

    currentFilter = filter;

    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    renderTasks();
}

function renderTasks() {

    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    const searchTerm =
        document.getElementById("searchInput").value.toLowerCase();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm);

        if (currentFilter === "pending") {
            return !task.completed && matchesSearch;
        }

        if (currentFilter === "completed") {
            return task.completed && matchesSearch;
        }

        return matchesSearch;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <div class="task-main">

                <button
                    class="check-btn ${task.completed ? "completed" : ""}"
                    onclick="toggleTask(${task.id})"
                >
                    ${task.completed ? "✓" : ""}
                </button>

                <div>

                    <div class="task-title ${task.completed ? "done" : ""}">
                        ${escapeHTML(task.title)}
                    </div>

                    ${
                        task.description
                            ? `<div class="task-description">
                                ${escapeHTML(task.description)}
                               </div>`
                            : ""
                    }

                    <div class="task-meta">

                        <span class="badge">
                            ${escapeHTML(task.category)}
                        </span>

                        ${
                            task.date
                                ? `<span class="badge">
                                    Due: ${formatDate(task.date)}
                                   </span>`
                                : ""
                        }

                        <span class="badge">
                            ${task.completed ? "Completed" : "Pending"}
                        </span>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="action-btn"
                    onclick="editTask(${task.id})"
                    title="Edit"
                >
                    ✏️
                </button>

                <button
                    class="action-btn"
                    onclick="deleteTask(${task.id})"
                    title="Delete"
                >
                    🗑️
                </button>

            </div>
        `;

        taskList.appendChild(card);
    });

    updateStats();
}

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
}

function formatDate(date) {

    const options = {
        day: "numeric",
        month: "short",
        year: "numeric"
    };

    return new Date(date + "T00:00:00")
        .toLocaleDateString("en-IN", options);
}

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

window.addEventListener("click", function (event) {

    if (event.target === taskModal) {
        closeTaskModal();
    }

});

renderTasks();