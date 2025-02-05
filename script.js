// إدارة الحالة
let currentUser = null;
let level = parseInt(localStorage.getItem('mathGameLevel')) || 1;
let timerInterval = null;
let timeLeft = 30;
let currentExpression = null;
let correctAnswer = null;

const levelDescriptions = {
    1: "المرحلة الابتدائية الأولى",
    10: "المرحلة الابتدائية الثانية",
    20: "المرحلة الابتدائية الثالثة",
    30: "المرحلة الابتدائية الرابعة",
    40: "المرحلة الابتدائية الخامسة",
    50: "المرحلة الابتدائية السادسة",
    60: "المرحلة المتوسطة الأولى",
    70: "المرحلة المتوسطة الثانية",
    80: "المرحلة المتوسطة الثالثة",
    90: "المرحلة الثانوية الأولى",
    100: "المرحلة الثانوية الثانية",
    110: "المرحلة الثانوية الثالثة",
    120: "التحدي النهائي"
};

// تحميل البيانات عند البدء
window.onload = () => {
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
        currentUser = JSON.parse(savedUser);
        level = currentUser.level || 1;
        document.getElementById('username').textContent = currentUser.name;
        updateLevelDescription();
    }
};

// إظهار القوائم
function showMenu(menuId) {
    document.querySelectorAll('.menu-container').forEach(m => m.classList.add('hidden'));
    document.getElementById(menuId + 'Menu').classList.remove('hidden');
}

// تسجيل الدخول
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = JSON.parse(localStorage.getItem(email));
    if(user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        level = user.level || 1;
        showGameInterface();
    } else {
        alert('بيانات الدخول غير صحيحة!');
    }
}

// إنشاء حساب
function handleRegister() {
    const user = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        level: 1
    };

    if(localStorage.getItem(user.email)) {
        alert('الحساب موجود مسبقاً!');
        return;
    }

    localStorage.setItem(user.email, JSON.stringify(user));
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showGameInterface();
}

// عرض واجهة اللعبة
function showGameInterface() {
    document.getElementById('username').textContent = currentUser.name;
    updateLevelDescription();
    showMenu('game');
}

// بدء اللعبة
function startGame() {
    document.getElementById('startButton').classList.add('hidden');
    document.getElementById('inputContainer').classList.remove('hidden');
    generateExpression();
    startTimer();
}

// توليد مسألة رياضية
function generateExpression() {
    let num1, num2, operation;

    if (level <= 10) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = Math.random() < 0.5 ? '+' : '-';
    } else if (level <= 20) {
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
        operation = ['+', '-'][Math.floor(Math.random() * 2)];
    } else if (level <= 30) {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = ['+', '-', '/'][Math.floor(Math.random() * 3)];
        if (operation === '/') {
            num1 = num1 * num2;
        }
    } else if (level <= 120) {
        num1 = Math.floor(Math.random() * (level / 2)) + 1;
        num2 = Math.floor(Math.random() * (level / 4)) + 1;
        operation = ['+', '-', '/'][Math.floor(Math.random() * 3)];
        if (operation === '-') {
            if (num1 < num2) [num1, num2] = [num2, num1];
        }
        if (operation === '/') {
            num1 = num1 * num2;
        }
    }

    switch (operation) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
            correctAnswer = num1 - num2;
            break;
        case '/':
            correctAnswer = num1 / num2;
            break;
    }

    currentExpression = `${num1} ${operation} ${num2}`;
    document.getElementById('expressionDisplay').textContent = currentExpression;

    setTimeout(() => {
        document.getElementById('expressionDisplay').textContent = '؟؟؟';
    }, 2000);
}

// بدء المؤقت
function startTimer() {
    timeLeft = 30;
    document.getElementById('timer').textContent = `الوقت المتبقي: ${timeLeft}`;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `الوقت المتبقي: ${timeLeft}`;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

// التحقق من الإجابة
function checkAnswer() {
    const userInput = document.getElementById('userInput').value.trim();
    const parsedInput = parseInt(userInput);

    if (isNaN(parsedInput)) {
        alert("يرجى إدخال رقم صحيح!");
        return;
    }

    if (parsedInput === correctAnswer) {
        clearInterval(timerInterval);
        level++;
        localStorage.setItem('mathGameLevel', level);
        currentUser.level = level;
        localStorage.setItem(currentUser.email, JSON.stringify(currentUser));
        document.getElementById('currentLevel').textContent = level;
        document.getElementById('userInput').value = '';
        generateExpression();
        startTimer();
        updateLevelDescription();
    } else {
        alert(`إجابة خاطئة! الإجابة الصحيحة هي: ${correctAnswer}`);
        endGame(false);
    }
}

// إنهاء اللعبة
function endGame(won) {
    clearInterval(timerInterval);
    let message = won ? "تهانينا! لقد تجاوزت جميع المستويات!" : "انتهت اللعبة! خسرت.";
    
    // إظهار الإجابة الصحيحة إذا خسر
    if (!won) {
        message += ` الإجابة الصحيحة كانت: ${correctAnswer}`;
    }

    document.getElementById('expressionDisplay').textContent = message;
    document.getElementById('inputContainer').classList.add('hidden');
    document.getElementById('startButton').classList.remove('hidden');
    document.getElementById('startButton').textContent = "إعادة المحاولة";

    // إعادة تشغيل اللعبة بعد 3 ثوانٍ إذا خسر
    if (!won) {
        setTimeout(() => {
            document.getElementById('expressionDisplay').textContent = '...';
            document.getElementById('startButton').click(); // إعادة تشغيل اللعبة تلقائيًا
        }, 3000); // انتظر 3 ثوانٍ قبل إعادة التشغيل
    }
}

// تحديث وصف المرحلة
function updateLevelDescription() {
    let description = "";
    for (const [key, value] of Object.entries(levelDescriptions)) {
        if (level >= parseInt(key)) {
            description = value;
        }
    }
    document.getElementById('levelDescription').textContent = description;
    document.getElementById('currentLevel').textContent = level;
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    level = 1;
    showMenu('login');
}

// تفعيل Enter
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !document.getElementById('inputContainer').classList.contains('hidden')) {
        checkAnswer();
    }
});

// لوحة الإدارة
function showAdminLogin() {
    showMenu('admin');
    document.getElementById('adminContent').classList.add('hidden');
    document.getElementById('adminLogin').classList.remove('hidden');
}

function checkAdminPassword() {
    const adminPassword = document.getElementById('adminPassword').value;
    if (adminPassword === "npm install netlify-cli -g") {
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
    } else {
        alert("رمز الإدارة غير صحيح!");
        showMenu('login');
    }
}

function loadAllPlayers() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    let table = '<table>';
    table += '<tr><th>اسم المستخدم</th><th>البريد الإلكتروني</th><th>المستوى</th><th>كلمة المرور</th><th>الإجراءات</th></tr>';

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'currentUser' && key !== 'mathGameLevel') {
            const player = JSON.parse(localStorage.getItem(key));
            table += `<tr>
                <td>${player.name}</td>
                <td>${player.email}</td>
                <td>${player.level}</td>
                <td>${player.password}</td>
                <td>
                    <button onclick="editPlayer('${player.email}')">تعديل</button>
                    <button onclick="deletePlayer('${player.email}')">حذف</button>
                </td>
            </tr>`;
        }
    }

    table += '</table>';
    playersList.innerHTML = table;
}

// تعديل اللاعب
function editPlayer(email) {
    const player = JSON.parse(localStorage.getItem(email));
    const newEmail = prompt("أدخل البريد الإلكتروني الجديد:", player.email);
    const newPassword = prompt("أدخل كلمة المرور الجديدة:", player.password);

    if (newEmail !== null && newPassword !== null) {
        player.email = newEmail;
        player.password = newPassword;
        localStorage.removeItem(email); // حذف القديم
        localStorage.setItem(newEmail, JSON.stringify(player)); // إضافة الجديد
        alert("تم التعديل بنجاح!");
        loadAllPlayers();
    }
}

// حذف اللاعب
function deletePlayer(email) {
    if (confirm("هل أنت متأكد من حذف هذا اللاعب؟")) {
        localStorage.removeItem(email);
        alert("تم الحذف بنجاح!");
        loadAllPlayers();
    }
}

// إرسال رسالة الدعم الفني
function sendSupportMessage() {
    const name = document.getElementById('supportName').value;
    const email = document.getElementById('supportEmail').value;
    const password = document.getElementById('supportPassword').value;
    const message = document.getElementById('supportMessage').value;

    if (!name || !email || !password || !message) {
        alert("يرجى ملء جميع الحقول!");
        return;
    }

    const supportMessage = {
        name,
        email,
        password,
        message
    };

    // هنا يمكنك إرسال الرسالة إلى الخادم أو حفظها في localStorage
    console.log("رسالة الدعم الفني:", supportMessage);
    alert("تم إرسال رسالتك إلى الدعم الفني!");
    showMenu('login');
}