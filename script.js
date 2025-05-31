document.addEventListener('DOMContentLoaded', function() {
    // Materialize component initialization
    var elemsSelect = document.querySelectorAll('select');
    M.FormSelect.init(elemsSelect);

    var chipsElems = document.querySelectorAll('.chips');
    const chipsOptions = { // Define chipsOptions once
        placeholder: 'Nhập một thẻ',
        secondaryPlaceholder: '+Thẻ',
    };
    M.Chips.init(chipsElems, chipsOptions);

    function initializeTooltips() {
        var elemsTooltip = document.querySelectorAll('.tooltipped');
        M.Tooltip.init(elemsTooltip, { enterDelay: 500, exitDelay: 250 }); // Added delays for better UX
    }

    // Global state
    let currentlyEditing = null;
    const mainTitle = "Password Manager"; // Store original title
    let currentSearchTerm = ''; // For search/filter
    let currentSortOption = 'default'; // For sorting

    // Helper function to escape HTML characters for attribute values
    function escapeAttribute(str) {
        if (typeof str !== 'string') return '';
        // Basic escaping for quotes. More comprehensive escaping might be needed for all HTML contexts.
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Helper function to escape HTML content
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    function extractHostname(str) {
        if (!str || typeof str !== 'string') return null;
        str = str.trim();

        try {
            let urlString = str;
            if (!str.startsWith('http://') && !str.startsWith('https://')) {
                if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\S*)$/.test(str.split('/')[0])) {
                    urlString = 'http://' + str;
                } else {
                    return null;
                }
            }

            const url = new URL(urlString);
            return url.hostname;
        } catch (e) {
            return null;
        }
    }

    // Event Listeners for main buttons
    document.getElementById('saveButton').addEventListener('click', savePassword);
    document.getElementById('exportButton').addEventListener('click', exportPasswords);
    document.getElementById('deleteAllButton').addEventListener('click', deleteAllPasswords);

    // Function definitions (all existing functions will be moved here)
    function populateFieldsForEdit(appName, username) {
        let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
        const entry = passwords.find(item => item.appName === appName && item.username === username);
        if (entry) {
            document.getElementById("appName").value = entry.appName;
            document.getElementById("username").value = entry.username;
            document.getElementById("password").value = entry.password;
            document.getElementById("notes").value = entry.notes;

            // Populate Tags for Edit
            const tagsEditInstanceEl = document.getElementById('tagsInput');
            var existingEditInstance = M.Chips.getInstance(tagsEditInstanceEl);
            if (existingEditInstance) {
                existingEditInstance.destroy();
            }
            M.Chips.init(tagsEditInstanceEl, chipsOptions); // Use defined chipsOptions

            var currentEditInstance = M.Chips.getInstance(tagsEditInstanceEl);
            if (entry.tags && entry.tags.length > 0) {
                entry.tags.forEach(function(tag) {
                    currentEditInstance.addChip({ tag: tag });
                });
            }

            // Ensure Materialize labels are active
            M.updateTextFields();

            currentlyEditing = { appName: entry.appName, username: entry.username };
            document.getElementById("saveButton").innerHTML = '<i class="material-icons left">save</i>Cập nhật';
            document.querySelector("h1").textContent = "Chỉnh sửa mục";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

function savePassword() {
    var appNameInput = document.getElementById("appName");
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var notesInput = document.getElementById("notes");
    var tagsInstance = M.Chips.getInstance(document.getElementById('tagsInput'));
    var tagsArray = tagsInstance.chipsData.map(chip => chip.tag);

    var appName = appNameInput.value.trim();
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();
    var notes = notesInput.value.trim();

    // Enhanced Validation
    if (appName === "") {
        M.toast({html: 'Tên ứng dụng không được để trống.', classes: 'red rounded'});
        return;
    }
    if (password === "") {
        M.toast({html: 'Mật khẩu không được để trống.', classes: 'red rounded'});
        return;
    }

    if (appName.length > 0) {
        const looksLikeUrl = appName.includes('://') || appName.startsWith('www.') ||
                             (/\.[a-zA-Z]{2,}/.test(appName) && !appName.includes(' '));
        if (looksLikeUrl) {
            let isValidUrl = false;
            try {
                let fullUrl = appName;
                if (!appName.startsWith('http://') && !appName.startsWith('https://')) {
                    fullUrl = 'http://' + appName;
                }
                new URL(fullUrl);
                isValidUrl = true;
            } catch (e) {
                isValidUrl = false;
            }
            if (!isValidUrl) {
                M.toast({
                    html: 'Tên ứng dụng trông giống URL nhưng có thể không hợp lệ. Lưu ý!',
                    classes: 'orange rounded',
                    displayLength: 5000
                });
            }
        }
    }

    if (currentlyEditing) {
        // We are in edit mode, delete the old entry first without re-rendering
        // Important: Use the appName and username stored in currentlyEditing,
        // not the potentially changed values from the input fields, for deletion.
        deletePassword(currentlyEditing.appName, currentlyEditing.username, true);
        currentlyEditing = null;
        document.getElementById("saveButton").innerHTML = '<i class="material-icons left">save</i>Lưu'; // Keep icon
        document.querySelector("h1").textContent = mainTitle; // Reset title
    }

    // Save to localStorage
    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
    passwords.push({
        appName,
        username,
        password,
        notes,
        tags: tagsArray,
        lastModified: new Date().toISOString() // Add lastModified timestamp
    });
    localStorage.setItem('passwordManagerData', JSON.stringify(passwords));

    // Clear fields
    document.getElementById("appName").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("notes").value = "";

    // Clear Chips input
    const tagsInputElement = document.getElementById('tagsInput');
    var existingClearInstance = M.Chips.getInstance(tagsInputElement);
    if (existingClearInstance) {
        existingClearInstance.destroy();
    }
    M.Chips.init(tagsInputElement, chipsOptions); // Use defined chipsOptions

    // Ensure Materialize labels reset correctly after clearing fields
    M.updateTextFields();
    updatePasswordStrengthIndicator('');

    // Display saved passwords
    displaySavedPasswords();
}

// --- Password Strength Indicator ---
function updatePasswordStrengthIndicator(password) {
    var strengthProgress = document.getElementById('passwordStrengthProgress');
    var strengthBar = document.getElementById('passwordStrengthBar');
    var strengthText = document.getElementById('passwordStrengthText');

    if (!strengthProgress || !strengthBar || !strengthText) return;

    if (!password) {
        strengthProgress.style.display = 'none';
        strengthText.textContent = '';
        strengthText.className = 'helper-text';
        return;
    }

    strengthProgress.style.display = 'block';
    if (typeof zxcvbn === 'undefined') { // Check if zxcvbn is loaded
        strengthText.textContent = 'Thư viện zxcvbn chưa tải...';
        strengthText.className = 'helper-text orange-text';
        strengthBar.style.width = '0%';
        strengthBar.className = 'determinate grey';
        return;
    }
    var result = zxcvbn(password);
    var score = result.score;
    var feedback = result.feedback.suggestions.length > 0 ? result.feedback.suggestions.join(' ') : '';
    if (result.feedback.warning) {
        feedback = result.feedback.warning + (feedback ? ' ' + feedback : '');
    }

    var barWidth = '0%';
    var barColorClass = '';
    var strengthDescription = '';

    switch (score) {
        case 0:
            barWidth = '25%'; barColorClass = 'red'; strengthDescription = 'Rất yếu';
            if (password.length > 0 && password.length < 6) strengthDescription += ' (Quá ngắn)';
            break;
        case 1:
            barWidth = '50%'; barColorClass = 'orange'; strengthDescription = 'Yếu';
            break;
        case 2:
            barWidth = '75%'; barColorClass = 'blue lighten-1'; strengthDescription = 'Trung bình';
            break;
        case 3:
            barWidth = '100%'; barColorClass = 'green lighten-1'; strengthDescription = 'Mạnh';
            break;
        case 4:
            barWidth = '100%'; barColorClass = 'green darken-2'; strengthDescription = 'Rất mạnh';
            break;
        default:
            strengthProgress.style.display = 'none'; strengthDescription = '';
    }

    strengthBar.style.width = barWidth;
    strengthBar.className = 'determinate';
    if (barColorClass) strengthBar.classList.add(barColorClass);

    strengthText.textContent = strengthDescription + (feedback ? '. ' + feedback : '');
    strengthText.className = 'helper-text';
    if (barColorClass) strengthText.classList.add(barColorClass.split(' ')[0] + '-text');
}


function displaySavedPasswords() {
    var passwordList = document.getElementById("passwordList");
    // Clear list but keep header
    passwordList.innerHTML = '<li class="collection-header"><h4>Mật khẩu đã lưu</h4></li>';

    let passwords = JSON.parse(localStorage.getItem('passwordManagerData')) || [];
    let filteredPasswords = passwords;

    // Apply search filter
    if (currentSearchTerm) {
        filteredPasswords = passwords.filter(function(item) {
            const appNameMatch = item.appName && item.appName.toLowerCase().includes(currentSearchTerm);
            const usernameMatch = item.username && item.username.toLowerCase().includes(currentSearchTerm);
            return appNameMatch || usernameMatch;
        });
    }

    // Apply sort
    if (currentSortOption !== 'default' && filteredPasswords.length > 1) {
        filteredPasswords.sort(function(a, b) {
            let valA, valB;
            switch (currentSortOption) {
                case 'appNameAZ':
                    valA = (a.appName || '').toLowerCase();
                    valB = (b.appName || '').toLowerCase();
                    return valA.localeCompare(valB);
                case 'appNameZA':
                    valA = (a.appName || '').toLowerCase();
                    valB = (b.appName || '').toLowerCase();
                    return valB.localeCompare(valA);
                case 'usernameAZ':
                    valA = (a.username || '￿').toLowerCase();
                    valB = (b.username || '￿').toLowerCase();
                    return valA.localeCompare(valB);
                case 'usernameZA':
                    valA = (a.username || '￿').toLowerCase();
                    valB = (b.username || '￿').toLowerCase();
                    return valB.localeCompare(valA);
                case 'lastModifiedNewest':
                    valA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    valB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    return valB - valA;
                case 'lastModifiedOldest':
                    valA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    valB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    return valA - valB;
                default:
                    return 0;
            }
        });
    }

    if (passwords.length === 0) {
        var emptyLi = document.createElement("li");
        emptyLi.className = "collection-item";
        emptyLi.textContent = "Chưa có mật khẩu.";
        passwordList.appendChild(emptyLi);
    } else if (filteredPasswords.length === 0) {
        var emptyLi = document.createElement("li");
        emptyLi.className = "collection-item";
        emptyLi.textContent = "Không tìm thấy mật khẩu nào khớp với tìm kiếm hoặc bộ lọc của bạn."; // Updated message
        passwordList.appendChild(emptyLi);
    } else {
        filteredPasswords.forEach(function(item) {
            var li = document.createElement("li");
            li.className = "collection-item avatar";

            // Favicon / Default Icon Logic
            var iconContainer = document.createElement('div');
            iconContainer.className = 'circle responsive-img'; // Materialize circle for avatar
            var defaultIconHTML = '<i class="material-icons circle teal" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">vpn_key</i>';
            var potentialHostname = extractHostname(item.appName);

            if (potentialHostname) {
                var img = document.createElement('img');
                img.src = `https://www.google.com/s2/favicons?domain=${potentialHostname}&sz=40`;
                img.className = 'circle';
                img.alt = item.appName.substring(0,30);
                img.style.width = '40px';
                img.style.height = '40px';

                img.onerror = function() {
                    var parent = this.parentNode;
                    if (parent) {
                        parent.innerHTML = defaultIconHTML;
                    }
                };
                iconContainer.appendChild(img);
            } else {
                iconContainer.innerHTML = defaultIconHTML;
            }
            li.appendChild(iconContainer);

            var titleSpan = document.createElement("span");
            titleSpan.className = "title";
            // AppName is a primary identifier, usually doesn't need HTML escaping unless it can contain HTML,
            // but for safety, if displaying it via textContent is not enough:
            titleSpan.textContent = "App: " + item.appName; // textContent is safe by default
            li.appendChild(titleSpan);

            var detailsP = document.createElement("p");

            var userHtml = (item.username ? "User: " + escapeHTML(item.username) : "User: N/A");
            if (item.username) {
                userHtml += ` <a href="#!" class="copy-btn tooltipped" data-copy-type="Username" data-copy-value="${escapeAttribute(item.username)}" data-position="top" data-tooltip="Sao chép Tên người dùng"><i class="material-icons tiny">content_copy</i></a>`;
            }

            var passwordHtml = `Password: <span class='password-display' data-actual-password='${escapeAttribute(item.password)}' data-is-masked='true'>••••••••</span> <a href="#!" class="copy-btn tooltipped" data-copy-type="Password" data-copy-value="${escapeAttribute(item.password)}" data-position="top" data-tooltip="Sao chép Mật khẩu"><i class="material-icons tiny">content_copy</i></a>`;

            var notesHtml = item.notes ? "Notes: " + escapeHTML(item.notes) : "Notes: N/A";

            var tagsDisplayHtml = '<div class="tags-display" style="margin-top: 5px;">';
            if (item.tags && item.tags.length > 0) {
                tagsDisplayHtml += item.tags.map(tag => `<div class="chip teal lighten-2 white-text">${escapeHTML(tag)}</div>`).join(' ');
            }
            tagsDisplayHtml += '</div>';

            var lastModifiedHtml = '';
            if (item.lastModified) {
                try {
                    var d = new Date(item.lastModified);
                    if (!isNaN(d.getTime())) {
                         lastModifiedHtml = `<br><span class="grey-text text-darken-1" style="font-size: 0.85em;">Last modified: ${d.toLocaleString()}</span>`;
                    } else {
                         lastModifiedHtml = `<br><span class="grey-text text-darken-1" style="font-size: 0.85em;">Last modified: (Invalid date)</span>`;
                    }
                } catch (e) {
                    lastModifiedHtml = `<br><span class="grey-text text-darken-1" style="font-size: 0.85em;">Last modified: (Error)</span>`;
                }
            }

            detailsP.innerHTML = userHtml + "<br>" + passwordHtml + "<br>" + notesHtml + tagsDisplayHtml + lastModifiedHtml;
            li.appendChild(detailsP);

            var secondaryContentDiv = document.createElement("div");
            secondaryContentDiv.className = "secondary-content";

            // Show/Hide Button
            var toggleBtn = document.createElement("a");
            toggleBtn.href = "#!";
            toggleBtn.className = "waves-effect waves-light btn-small blue tooltipped";
            toggleBtn.setAttribute("data-position", "top");
            toggleBtn.setAttribute("data-tooltip", "Hiện Mật khẩu");
            toggleBtn.innerHTML = '<i class="material-icons">visibility</i>';
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                var passSpan = this.closest('.collection-item').querySelector('.password-display');
                var isMasked = passSpan.getAttribute('data-is-masked') === 'true';

                // Destroy existing tooltip before changing its text
                var tooltipInstance = M.Tooltip.getInstance(this);
                if (tooltipInstance) {
                    tooltipInstance.destroy();
                }

                if (isMasked) {
                    passSpan.textContent = passSpan.getAttribute('data-actual-password');
                    passSpan.setAttribute('data-is-masked', 'false');
                    this.innerHTML = '<i class="material-icons">visibility_off</i>';
                    this.setAttribute('data-tooltip', 'Ẩn Mật khẩu');
                } else {
                    passSpan.textContent = '••••••••';
                    passSpan.setAttribute('data-is-masked', 'true');
                    this.innerHTML = '<i class="material-icons">visibility</i>';
                    this.setAttribute('data-tooltip', 'Hiện Mật khẩu');
                }
                M.Tooltip.init(this); // Reinitialize tooltip with new text
            });
            secondaryContentDiv.appendChild(toggleBtn);

            // Edit Button
            var editBtn = document.createElement("a");
            editBtn.href = "#!";
            editBtn.className = "waves-effect waves-light btn-small amber darken-1 tooltipped";
            editBtn.setAttribute("data-position", "top");
            editBtn.setAttribute("data-tooltip", "Sửa");
            editBtn.innerHTML = '<i class="material-icons">edit</i>';
            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                populateFieldsForEdit(item.appName, item.username);
            });
            secondaryContentDiv.appendChild(editBtn);

            // Delete Button
            var deleteBtn = document.createElement("a");
            deleteBtn.href = "#!";
            deleteBtn.className = "waves-effect waves-light btn-small red tooltipped";
            deleteBtn.setAttribute("data-position", "top");
            deleteBtn.setAttribute("data-tooltip", "Xoá");
            deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm("Bạn có chắc chắn muốn xoá mục này: " + item.appName + (item.username ? " (" + item.username + ")" : "") + "?")) {
                    deletePassword(item.appName, item.username);
                }
            });
            secondaryContentDiv.appendChild(deleteBtn);

            li.appendChild(secondaryContentDiv);
            passwordList.appendChild(li);
        });
    }
    initializeTooltips(); // Initialize tooltips for newly added elements
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

    // Initial calls
    displaySavedPasswords();
    // toggleTheme(); // Theme is set by default in HTML, onchange handles it. Or set based on saved preference.

    // Initialize Modals
    var modalElems = document.querySelectorAll('.modal');
    M.Modal.init(modalElems);

    // Initialize Sort Select
    var sortSelectElems = document.querySelectorAll('#sortOptions');
    if (sortSelectElems.length > 0) {
        M.FormSelect.init(sortSelectElems);
    }
    // Add Event Listener for Sort Select
    var sortOptionsSelect = document.getElementById('sortOptions');
    if (sortOptionsSelect) {
        sortOptionsSelect.addEventListener('change', function() {
            currentSortOption = this.value;
            displaySavedPasswords();
        });
    }


    // Re-initialize tooltips to catch any new ones from modal trigger etc.
    initializeTooltips();

    // Add event listener for main password field strength
    var mainPasswordFieldForStrength = document.getElementById('password');
    if (mainPasswordFieldForStrength) {
        mainPasswordFieldForStrength.addEventListener('input', function() {
            updatePasswordStrengthIndicator(this.value);
        });
    }

    // Event Listener for Search Input
    var searchInputField = document.getElementById('searchInput');
    if (searchInputField) {
        searchInputField.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase();
            displaySavedPasswords();
        });
    }

    // Event Listener for Quick Add Template
    var quickAddSelect = document.getElementById('quickAddTemplate');
    var appNameInputForQuickAdd = document.getElementById('appName');

    if (quickAddSelect && appNameInputForQuickAdd) {
        quickAddSelect.addEventListener('change', function() {
            var selectedPrefix = this.value;
            if (selectedPrefix) {
                var currentAppName = appNameInputForQuickAdd.value;

                if (currentAppName === "" || !currentAppName.startsWith(selectedPrefix)) {
                    appNameInputForQuickAdd.value = selectedPrefix + currentAppName;
                }
                // If currentAppName already starts with selectedPrefix, do nothing to avoid duplication.

                M.updateTextFields();
                appNameInputForQuickAdd.focus();

                this.selectedIndex = 0; // Reset to the first (disabled) option
                M.FormSelect.init(this); // Re-initialize this specific select to update Materialize UI
            }
        });
    }

    // Delegated Event Listener for Copy Buttons in Password List
    var passwordListUL = document.getElementById('passwordList');
    if (passwordListUL) {
        passwordListUL.addEventListener('click', function(event) {
            var targetElement = event.target;
            var copyButton = targetElement.closest('.copy-btn');

            if (copyButton) {
                event.preventDefault();

                var valueToCopy = copyButton.getAttribute('data-copy-value');
                var copyType = copyButton.getAttribute('data-copy-type') || 'Dữ liệu';

                if (valueToCopy) {
                    navigator.clipboard.writeText(valueToCopy).then(function() {
                        M.toast({html: copyType + ' đã được sao chép!', classes: 'green rounded'});
                    }, function(err) {
                        M.toast({html: 'Lỗi khi sao chép ' + copyType.toLowerCase() + '!', classes: 'red rounded'});
                        console.error('Clipboard write failed: ', err);
                    });
                } else {
                    M.toast({html: 'Không có ' + copyType.toLowerCase() + ' để sao chép!', classes: 'orange rounded'});
                }
            }
        });
    }

    // Password Generation Modal Logic
    document.getElementById('doGeneratePasswordButton').addEventListener('click', function() {
        var length = parseInt(document.getElementById('generatedPasswordLength').value);
        var includeUppercase = document.getElementById('includeUppercase').checked;
        var includeLowercase = document.getElementById('includeLowercase').checked;
        var includeNumbers = document.getElementById('includeNumbers').checked;
        var includeSymbols = document.getElementById('includeSymbols').checked;

        var charset = "";
        var password = "";

        if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers) charset += "0123456789";
        if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

        if (charset === "") {
            M.toast({html: 'Vui lòng chọn ít nhất một loại ký tự!', classes: 'red rounded'});
            document.getElementById('generatedPasswordOutput').value = "";
            return;
        }
        if (length < 4 || length > 128) {
             M.toast({html: 'Độ dài mật khẩu không hợp lệ (4-128)!', classes: 'red rounded'});
             document.getElementById('generatedPasswordOutput').value = "";
            return;
        }

        for (var i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        document.getElementById('generatedPasswordOutput').value = password;

        // Ensure label is active for the output field
        var outputLabel = document.querySelector('label[for="generatedPasswordOutput"]');
        if (outputLabel) outputLabel.classList.add('active'); // Should already be active due to HTML, but good practice
    });

    document.getElementById('copyGeneratedPasswordButton').addEventListener('click', function() {
        var passwordToCopy = document.getElementById('generatedPasswordOutput').value;
        if (passwordToCopy) {
            navigator.clipboard.writeText(passwordToCopy).then(function() {
                M.toast({html: 'Đã sao chép mật khẩu!', classes: 'green rounded'});
            }, function(err) {
                M.toast({html: 'Lỗi khi sao chép!', classes: 'red rounded'});
            });
        } else {
             M.toast({html: 'Không có mật khẩu để sao chép!', classes: 'orange rounded'});
        }
    });

    document.getElementById('useGeneratedPasswordButton').addEventListener('click', function() {
        var generatedPassword = document.getElementById('generatedPasswordOutput').value;
        if (generatedPassword) {
            var mainPasswordField = document.getElementById('password');
            mainPasswordField.value = generatedPassword;

            M.updateTextFields(); // This should make the label active for the main password field
            updatePasswordStrengthIndicator(generatedPassword); // Update strength for newly set password

            var modalInstance = M.Modal.getInstance(document.getElementById('generatePasswordModal'));
            modalInstance.close();

            // document.getElementById('generatedPasswordOutput').value = ""; // Optionally clear
        } else {
            M.toast({html: 'Chưa tạo mật khẩu nào để sử dụng!', classes: 'orange rounded'});
        }
    });

    console.log("Phát triển bởi tienanh109 - Materialize Enhanced");
});