let historyStack = []; // Stack lưu lịch sử JSON để hoàn tác
let redoStack = [];    // Stack lưu lịch sử JSON để làm lại

function formatJSON() {
    const jsonInput = document.getElementById("json-input").value;
    try {
        const parsedJSON = JSON.parse(jsonInput);
        saveHistory(); // Lưu trạng thái trước khi thay đổi
        document.getElementById("json-input").value = JSON.stringify(parsedJSON, null, 4);
        redoStack = []; // Reset redo stack sau mỗi thay đổi mới
    } catch (error) {
        alert("JSON không hợp lệ!");
    }
}

function convertKeys(caseType) {
    const jsonInput = document.getElementById("json-input").value;
    try {
        let parsedJSON = JSON.parse(jsonInput);
        saveHistory(); // Lưu trạng thái trước khi thay đổi
        parsedJSON = modifyKeys(parsedJSON, caseType);
        document.getElementById("json-input").value = JSON.stringify(parsedJSON, null, 4);
        redoStack = []; // Reset redo stack sau mỗi thay đổi mới
    } catch (error) {
        alert("JSON không hợp lệ!");
    }
}

function modifyKeys(obj, caseType) {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => modifyKeys(item, caseType));
    }

    const newObj = {};
    for (const key in obj) {
        let newKey = key;
        switch (caseType) {
            case "upper":
                newKey = key.toUpperCase();
                break;
            case "lower":
                newKey = key.toLowerCase();
                break;
            case "snake":
                newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
                break;
            case "pascal":
                newKey = key.replace(/(^\w|_\w)/g, match => match.replace("_", "").toUpperCase());
                break;
        }
        newObj[newKey] = modifyKeys(obj[key], caseType);
    }
    return newObj;
}

// Phục hồi trạng thái trước đó (Undo)
function undo() {
    if (historyStack.length > 0) {
        const currentInput = document.getElementById("json-input").value;
        redoStack.push(currentInput); // Đẩy trạng thái hiện tại vào redo stack
        const previousState = historyStack.pop();
        document.getElementById("json-input").value = previousState;
    } else {
        alert("Không còn lịch sử để hoàn tác!");
    }
}

// Khôi phục trạng thái đã hoàn tác trước đó (Redo)
function redo() {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        historyStack.push(document.getElementById("json-input").value); // Lưu trạng thái hiện tại vào history stack
        document.getElementById("json-input").value = redoState;
    } else {
        alert("Không còn lịch sử để làm lại!");
    }
}

// Chuyển đổi JSON thành chuỗi
function convertToString() {
    const jsonInput = document.getElementById("json-input").value;
    try {
        const parsedJSON = JSON.parse(jsonInput);
        const jsonString = JSON.stringify(parsedJSON); // Chuyển đổi JSON thành chuỗi
        const escapedJsonString = jsonString.replace(/"/g, '\\"'); // Escape dấu nháy kép
        saveHistory(); // Lưu trạng thái trước khi thay đổi
        document.getElementById("json-string-output").value = escapedJsonString; // Hiển thị chuỗi JSON đã escape
        redoStack = []; // Reset redo stack sau mỗi thay đổi mới
    } catch (error) {
        alert("JSON không hợp lệ!");
    }
}

// Chức năng thu gọn JSON
function minifyJSON() {
    const jsonInput = document.getElementById("json-input").value;
    try {
        const parsedJSON = JSON.parse(jsonInput);
        saveHistory(); // Lưu trạng thái trước khi thay đổi
        document.getElementById("json-input").value = JSON.stringify(parsedJSON); // Thu gọn JSON
        redoStack = []; // Reset redo stack sau mỗi thay đổi mới
    } catch (error) {
        alert("JSON không hợp lệ!");
    }
}



// Bắt sự kiện Ctrl+Z để gọi hàm undo và Ctrl+Y để gọi hàm redo
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
    } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
    }
});

// Lưu trạng thái hiện tại vào history stack và xóa redo stack sau khi thay đổi
function saveHistory() {
    const currentInput = document.getElementById("json-input").value;
    historyStack.push(currentInput);
    redoStack = []; // Reset redo stack sau khi lưu lịch sử mới
}

// Tự động lưu JSON vào Local Storage
function autoSave() {
    const currentInput = document.getElementById("json-input").value;
    localStorage.setItem('savedJSON', currentInput); // Lưu vào Local Storage
}

// Tải JSON từ Local Storage khi trang được tải
function loadAutoSavedJSON() {
    const savedJSON = localStorage.getItem('savedJSON');
    if (savedJSON) {
        document.getElementById("json-input").value = savedJSON; // Điền vào ô nhập
    }
}

// Bắt sự kiện để lưu tự động
document.getElementById("json-input").addEventListener("input", autoSave);

// Tải dữ liệu JSON từ Local Storage khi trang được tải
window.addEventListener("load", loadAutoSavedJSON);

function saveToFile() {
    const jsonInput = document.getElementById("json-input").value;
    try {
        const parsedJSON = JSON.parse(jsonInput); // Kiểm tra xem JSON có hợp lệ không
        const blob = new Blob([JSON.stringify(parsedJSON, null, 4)], { type: "application/json" }); // Tạo Blob từ JSON
        const url = URL.createObjectURL(blob); // Tạo URL cho Blob

        // Lấy thời gian hiện tại để tạo tên tệp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:.]/g, "_").slice(0, 19); // Định dạng ngày giờ
        const filename = `JSON_${timestamp}.json`; // Tạo tên tệp

        const a = document.createElement("a"); // Tạo thẻ a
        a.href = url; // Gán URL cho thẻ a
        a.download = filename; // Đặt tên tệp tin
        document.body.appendChild(a); // Thêm thẻ a vào body
        a.click(); // Mô phỏng click để tải tệp
        document.body.removeChild(a); // Xóa thẻ a khỏi body
        URL.revokeObjectURL(url); // Giải phóng URL
    } catch (error) {
        alert("JSON không hợp lệ!"); // Thông báo lỗi nếu JSON không hợp lệ
    }
}

function compressJSON() {
    const jsonInput = document.getElementById("json-input").value;
    try {
        const parsedJSON = JSON.parse(jsonInput);
        const compressedJSON = JSON.stringify(parsedJSON);
        document.getElementById("json-input").value = compressedJSON;
    } catch (error) {
        alert("JSON không hợp lệ!");
    }
}

function copyToClipboard() {
    const jsonInput = document.getElementById("json-input");
    jsonInput.select();
    document.execCommand("copy");
    alert("JSON đã được sao chép vào clipboard!");
}

