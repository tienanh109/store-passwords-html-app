# Simple Password Manager (Client-Side)

A simple client-side password manager application built with HTML, JavaScript, and CSS. It allows users to store and manage their passwords locally in their browser using `localStorage`. This project uses the FileSaver.js library for exporting password data.

## Features

*   **Comprehensive Data Storage:** Securely stores Application Name, Username, Password, and associated Notes for each entry.
*   **`localStorage` Integration:** Utilizes browser `localStorage` for improved client-side storage compared to cookies.
*   **Password Visibility Toggle:** Option to show or hide passwords for individual entries.
*   **Edit Functionality:** Easily modify existing password entries.
*   **Selective Deletion:** Delete individual password entries as needed.
*   **Bulk Deletion:** Option to delete all stored passwords with a confirmation step.
*   **Data Export:** Export all password entries to a `.txt` file, with a confirmation prompt.
*   **User-Friendly Interface:** Clean and intuitive design.
*   **Theming:** Light and Dark mode options for user preference.
*   **Language:** Vietnamese interface.

## Important Security Note

This password manager stores your data directly in your web browser's `localStorage`. While this is an improvement over cookies and suitable for basic, non-critical data, **`localStorage` is not a secure vault for sensitive passwords.** Data in `localStorage` can be accessed by any JavaScript code running on the same domain and is vulnerable to Cross-Site Scripting (XSS) attacks if the application has such vulnerabilities (though this application aims to be secure against basic XSS, the storage medium itself has inherent risks).

**For managing highly sensitive passwords, it is strongly recommended to use dedicated, reputable password management software that employs strong encryption and other advanced security measures.** This application is provided as a learning tool and for managing non-critical information only. User discretion is advised.

## Original Author

*By: [tienanh109](https://youtube.com/@tienanh_90)*

(The original project structure and some base functionalities were provided by tienanh109. Significant modifications and feature enhancements have been made.)

## Usage

1.  Open `index.html` in your web browser.
2.  Use the input fields to enter application name, username (optional), password, and any notes.
3.  Click "Lưu" (Save) to store the entry.
4.  Stored entries will be listed below. You can then show/hide passwords, edit, or delete them.
5.  Use "Xuất mật khẩu" to download your passwords as a text file.
6.  Use "Xoá tất cả mật khẩu" to clear all stored data.
7.  Select your preferred theme using the "Giao diện" dropdown.

---
Free to download and use.
