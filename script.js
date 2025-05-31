let currentlyEditing = null;
const mainTitle = "Password Manager"; // Store original title

function populateFieldsForEdit(appName, username) {
    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
    const entry = passwords.find(item => item.appName === appName && item.username === username);
    if (entry) {
        document.getElementById("appName").value = entry.appName;
        document.getElementById("username").value = entry.username;
        document.getElementById("password").value = entry.password;
        document.getElementById("notes").value = entry.notes;

        currentlyEditing = { appName: entry.appName, username: entry.username }; // Store original identifiers
        document.getElementById("saveButton").textContent = "Cập nhật";
        document.querySelector("h1").textContent = "Chỉnh sửa mục";
    }
}

function savePassword() {
    var appNameInput = document.getElementById("appName");
    var usernameInput = document.getElementById("username"); // Not validated for emptiness
    var passwordInput = document.getElementById("password");
    var notesInput = document.getElementById("notes");

    var appName = appNameInput.value.trim();
    var username = usernameInput.value.trim(); // Username can be empty
    var password = passwordInput.value.trim();
    var notes = notesInput.value.trim();

    if (appName === "") {
        alert("Tên ứng dụng không được để trống.");
        return;
    }
    if (password === "") {
        alert("Mật khẩu không được để trống.");
        return;
    }

    if (currentlyEditing) {
        // We are in edit mode, delete the old entry first without re-rendering
        // Important: Use the appName and username stored in currentlyEditing,
        // not the potentially changed values from the input fields, for deletion.
        deletePassword(currentlyEditing.appName, currentlyEditing.username, true);
        currentlyEditing = null;
        document.getElementById("saveButton").textContent = "Lưu";
        document.querySelector("h1").textContent = mainTitle; // Reset title
    }

    // Save to localStorage
    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
    // Use the trimmed values for saving
    passwords.push({ appName, username, password, notes });
    localStorage.setItem('passwordManagerData', JSON.stringify(passwords));

    // Clear fields
    document.getElementById("appName").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("notes").value = "";

    // Display saved passwords
    displaySavedPasswords();
}

function displaySavedPasswords() {
    var passwordList = document.getElementById("passwordList");
    passwordList.innerHTML = "";

    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];

    if (passwords.length === 0) {
        passwordList.innerHTML = "Chưa có mật khẩu.";
    } else {
        passwords.forEach(function(item) {
            var li = document.createElement("li");

            // Create a span to hold the password display
            var passwordSpan = document.createElement("span");
            passwordSpan.textContent = "••••••••"; // Initial masked display
            passwordSpan.setAttribute("data-actual-password", item.password);
            passwordSpan.setAttribute("data-is-masked", "true");

            // Create the toggle button
            var toggleButton = document.createElement("button");
            toggleButton.textContent = "Hiện"; // "Show" in Vietnamese
            toggleButton.className = "togglePasswordButton"; // Add a class for styling
            toggleButton.onclick = function() {
                if (passwordSpan.getAttribute("data-is-masked") === "true") {
                    passwordSpan.textContent = passwordSpan.getAttribute("data-actual-password");
                    passwordSpan.setAttribute("data-is-masked", "false");
                    toggleButton.textContent = "Ẩn"; // "Hide" in Vietnamese
                } else {
                    passwordSpan.textContent = "••••••••";
                    passwordSpan.setAttribute("data-is-masked", "true");
                    toggleButton.textContent = "Hiện"; // "Show" in Vietnamese
                }
            };

            // Build list item content
            li.appendChild(document.createTextNode("App: " + item.appName + ", User: " + item.username + ", Password: "));
            li.appendChild(passwordSpan);

            if (item.notes) {
                li.appendChild(document.createTextNode(", Notes: " + item.notes));
            }

            li.appendChild(toggleButton); // Add toggle button

            var editButton = document.createElement("button");
            editButton.textContent = "Sửa";
            editButton.className = "editButton"; // Add a class for styling
            editButton.onclick = function() {
                populateFieldsForEdit(item.appName, item.username);
            };
            li.appendChild(editButton);

            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Xoá";
            deleteButton.className = "deleteButton";
            deleteButton.onclick = function() {
                deletePassword(item.appName, item.username);
            };
            li.appendChild(deleteButton);
            passwordList.appendChild(li);
        });
    }
}

function deletePassword(appName, username, suppressDisplayUpdate = false) {
    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
    passwords = passwords.filter(item => !(item.appName === appName && item.username === username));
    localStorage.setItem('passwordManagerData', JSON.stringify(passwords));
    if (!suppressDisplayUpdate) {
        displaySavedPasswords();
    }
}

function deleteAllPasswords() {
    if (confirm("Bạn có chắc chắn muốn XOÁ TẤT CẢ mật khẩu không? Hành động này không thể hoàn tác.")) {
        localStorage.removeItem('passwordManagerData');
        displaySavedPasswords();
    }
}

function exportPasswords() {
    if (confirm("Bạn có chắc chắn muốn xuất tất cả mật khẩu không?")) {
        let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
        var data = passwords.map(function(item) {
            return "App: " + item.appName + ", User: " + item.username + ", Password: " + item.password + (item.notes ? ", Notes: " + item.notes : "");
        }).join("\n");

        var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "bzot9_passwords.txt");
    }
}

function toggleTheme() {
    var theme = document.getElementById("theme").value;
    document.body.className = theme;
}

displaySavedPasswords();
toggleTheme();

console.log("Phát triển bởi tienanh109");