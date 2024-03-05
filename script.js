function savePassword() {
    var appName = document.getElementById("appName").value;
    var password = document.getElementById("password").value;
    var notes = document.getElementById("notes").value;

    // Save to cookie
    document.cookie = encodeURIComponent(appName) + "=" + encodeURIComponent(password) + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";

    // Clear fields
    document.getElementById("appName").value = "";
    document.getElementById("password").value = "";
    document.getElementById("notes").value = "";

    // Display saved passwords
    displaySavedPasswords();
}

function displaySavedPasswords() {
    var passwordList = document.getElementById("passwordList");
    passwordList.innerHTML = "";

    var cookies = document.cookie.split("; ");
    if (cookies.length === 1 && cookies[0] === "") {
        passwordList.innerHTML = "Chưa có mật khẩu.";
    } else {
        cookies.forEach(function(cookie) {
            var parts = cookie.split("=");
            var appName = decodeURIComponent(parts[0]);
            var password = decodeURIComponent(parts[1]);

            var li = document.createElement("li");
            li.textContent = "App: " + appName + ", Password: " + password;
            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Xoá";
            deleteButton.className = "deleteButton";
            deleteButton.onclick = function() {
                deletePassword(appName);
            };
            li.appendChild(deleteButton);
            passwordList.appendChild(li);
        });
    }
}

function deletePassword(appName) {
    document.cookie = encodeURIComponent(appName) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    displaySavedPasswords();
}

function deleteAllPasswords() {
    var cookies = document.cookie.split("; ");
    cookies.forEach(function(cookie) {
        var parts = cookie.split("=");
        var appName = decodeURIComponent(parts[0]);
        deletePassword(appName);
    });
}

function exportPasswords() {
    var cookies = document.cookie.split("; ");
    var data = cookies.map(function(cookie) {
        var parts = cookie.split("=");
        return decodeURIComponent(parts[0]) + ": " + decodeURIComponent(parts[1]);
    }).join("\n");

    var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "bzot9_passwords.txt");
}

function toggleTheme() {
    var theme = document.getElementById("theme").value;
    document.body.className = theme;
}

displaySavedPasswords();
toggleTheme();

console.log("Phát triển bởi tienanh109");