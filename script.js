'أعلى درجة': Math.max(...data.scores),
            'أقل درجة': Math.min(...data.scores)
        };
    });
    
    // إنشاء ملف Excel
    const workbook = XLSX.utils.book_new();
    
    // إضافة الإحصائيات العامة
    const generalWorksheet = XLSX.utils.json_to_sheet(generalStats);
    XLSX.utils.book_append_sheet(workbook, generalWorksheet, "الإحصائيات العامة");
    
    // إضافة إحصائيات التخصصات
    const majorWorksheet = XLSX.utils.json_to_sheet(majorStatsData);
    XLSX.utils.book_append_sheet(workbook, majorWorksheet, "إحصائيات التخصصات");
    
    // إضافة النتائج التفصيلية
    exportResultsData(workbook);
    
    const fileName = `exam_statistics_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert(`تم تصدير الإحصائيات بنجاح إلى ملف: ${fileName}`);
}

// الحصول على إحصائيات الاختبار
function getExamStatistics() {
    const results = appData.examResults || [];
    
    if (results.length === 0) {
        return {
            totalExams: 0,
            averageScore: 0,
            passRate: 0,
            topScore: 0,
            lowScore: 0
        };
    }
    
    const scores = results.map(r => r.score);
    const passCount = scores.filter(score => score >= 60).length;
    
    return {
        totalExams: results.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        passRate: Math.round((passCount / results.length) * 100),
        topScore: Math.max(...scores),
        lowScore: Math.min(...scores)
    };
}

// الحصول على التقدير
function getGrade(score) {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'راسب';
}

// الحصول على فئة CSS للطباعة
function getScoreClassForPrint(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
}

// تنسيق التاريخ
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'

// تحديث الهيكل الشجري للطلاب (الصف → التخصص → المادة)
function updateStudentsTree() {
    const treeContainer = document.getElementById('studentsTree');
    if (!treeContainer) return;
    
    let treeHTML = '';
    
    // تجميع الطلاب حسب الصف ثم التخصص ثم المادة
    const studentsByClassification = {};
    
    appData.students.forEach(student => {
        const className = student.class || 'غير محدد';
        const major = student.major || 'غير محدد';
        const subject = student.subject || 'غير محدد';
        
        if (!studentsByClassification[className]) {
            studentsByClassification[className] = {};
        }
        if (!studentsByClassification[className][major]) {
            studentsByClassification[className][major] = {};
        }
        if (!studentsByClassification[className][major][subject]) {
            studentsByClassification[className][major][subject] = [];
        }
        
        studentsByClassification[className][major][subject].push(student);
    });
    
    Object.keys(studentsByClassification).forEach(className => {
        const classStudentsCount = Object.values(studentsByClassification[className])
            .flatMap(majorData => Object.values(majorData))
            .flatMap(subjectData => subjectData).length;
            
        treeHTML += `
            <div class="tree-item mb-3">
                <div class="tree-toggle flex items-center p-2 bg-blue-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                    <i class="fas fa-chevron-down ml-2"></i>
                    <i class="fas fa-layer-group ml-2"></i>
                    <span class="font-semibold">${className} (${classStudentsCount} طالب)</span>
                </div>
                <div class="tree-content mr-4">
        `;
        
        Object.keys(studentsByClassification[className]).forEach(major => {
            const majorStudentsCount = Object.values(studentsByClassification[className][major])
                .flatMap(subjectData => subjectData).length;
                
            treeHTML += `
                <div class="tree-item mb-2">
                    <div class="tree-toggle flex items-center p-2 bg-green-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                        <i class="fas fa-chevron-down ml-2"></i>
                        <i class="fas fa-graduation-cap ml-2"></i>
                        <span class="font-medium">${major} (${majorStudentsCount} طالب)</span>
                    </div>
                    <div class="tree-content mr-4">
            `;
            
            Object.keys(studentsByClassification[className][major]).forEach(subject => {
                const subjectStudents = studentsByClassification[className][major][subject];
                
                treeHTML += `
                    <div class="tree-item mb-1">
                        <div class="tree-toggle flex items-center p-2 bg-yellow-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                            <i class="fas fa-chevron-down ml-2"></i>
                            <i class="fas fa-book ml-2"></i>
                            <span>${subject} (${subjectStudents.length} طالب)</span>
                        </div>
                        <div class="tree-content mr-4">
                `;
                
                subjectStudents.forEach(student => {
                    treeHTML += `
                        <div class="flex items-center p-2 bg-gray-50 rounded mb-1">
                            <i class="fas fa-user ml-2"></i>
                            <span>${student.name} - ${student.id}</span>
                            <div class="mr-auto">
                                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 ml-1">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                treeHTML += `
                        </div>
                    </div>
                `;
            });
            
            treeHTML += `
                    </div>
                </div>
            `;
        });
        
        treeHTML += `
                </div>
            </div>
        `;
    });
    
    treeContainer.innerHTML = treeHTML || '<p class="text-gray-500">لا توجد بيانات طلاب</p>';
}

// تحديث قائمة الأسئلة
function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    appData.questions.forEach((question, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${question.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.text.substring(0, 50)}...</td>
            <td class="px-4 py-3 text-sm text-gray-700">${getQuestionTypeText(question.type)}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.correctAnswer}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.score}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editQuestion(${index})" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteQuestion(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        questionsList.appendChild(row);
    });
}

// تحديث الهيكل الشجري للمواد
function updateSubjectsTree() {
    const treeContainer = document.getElementById('subjectsTree');
    if (!treeContainer) return;
    
    let treeHTML = '';
    
    Object.keys(appData.subjects).forEach(classLevel => {
        treeHTML += `
            <div class="tree-item mb-3">
                <div class="tree-toggle flex items-center p-2 bg-blue-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                    <i class="fas fa-chevron-down ml-2"></i>
                    <i class="fas fa-layer-group ml-2"></i>
                    <span class="font-semibold">${classLevel}</span>
                    <button onclick="editClass('${classLevel}')" class="mr-auto text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="tree-content mr-4">
        `;
        
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            treeHTML += `
                <div class="tree-item mb-2">
                    <div class="tree-toggle flex items-center p-2 bg-green-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                        <i class="fas fa-chevron-down ml-2"></i>
                        <i class="fas fa-graduation-cap ml-2"></i>
                        <span class="font-medium">${major}</span>
                        <button onclick="editMajor('${classLevel}', '${major}')" class="mr-auto text-green-600 hover:text-green-800">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="tree-content mr-4">
            `;
            
            appData.subjects[classLevel][major].forEach(subject => {
                treeHTML += `
                    <div class="flex items-center p-2 bg-yellow-50 rounded mb-1">
                        <i class="fas fa-book ml-2"></i>
                        <span>${subject}</span>
                        <button onclick="editSubject('${classLevel}', '${major}', '${subject}')" class="mr-auto text-yellow-600 hover:text-yellow-800">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            });
            
            treeHTML += `
                    </div>
                </div>
            `;
        });
        
        treeHTML += `
                </div>
            </div>
        `;
    });
    
    treeContainer.innerHTML = treeHTML;
}

// تحديث إحصائيات قاعدة البيانات
function updateDatabaseStats() {
    document.getElementById('totalStudentsStats').textContent = appData.students.length;
    document.getElementById('totalQuestionsStats').textContent = appData.questions.length;
    
    let subjectsCount = 0;
    Object.keys(appData.subjects).forEach(classLevel => {
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            subjectsCount += appData.subjects[classLevel][major].length;
        });
    });
    document.getElementById('totalSubjectsStats').textContent = subjectsCount;
    document.getElementById('totalResultsStats').textContent = (appData.examResults || []).length;
}

// الوظائف المساعدة للحصول على فئات CSS
function getStatusClass(status) {
    switch (status) {
        case 'في انتظار الموافقة':
            return 'bg-yellow-100 text-yellow-800';
        case 'جاري الاختبار':
            return 'bg-blue-100 text-blue-800';
        case 'مكتمل':
            return 'bg-green-100 text-green-800';
        case 'تمت الموافقة':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getScoreClass(score) {
    if (score === '--' || score === null) return 'text-gray-600';
    const numScore = parseInt(score);
    if (numScore >= 80) return 'text-green-600';
    if (numScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

function getQuestionTypeText(type) {
    switch (type) {
        case 'multiple_choice':
            return 'اختيار من متعدد';
        case 'multiple_select':
            return 'اختيار متعدد';
        case 'essay':
            return 'مقالي';
        default:
            return 'غير محدد';
    }
}

// النوافذ المنبثقة
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal').classList.add('hidden');
    currentModalType = '';
    editingIndex = -1;
}

function handleModalOutsideClick(e) {
    if (e.target === document.getElementById('modal')) {
        hideModal();
    }
}

// عرض نافذة إضافة طالب
function showAddStudentModal() {
    currentModalType = 'student';
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">رقم الجلوس</label>
                <input type="text" id="studentId" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">اسم الطالب</label>
                <input type="text" id="studentName" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">الصف</label>
                <select id="studentClass" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    ${Object.keys(appData.subjects).map(classLevel => `<option value="${classLevel}">${classLevel}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">التخصص</label>
                <select id="studentMajor" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">اختر التخصص</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">المادة</label>
                <select id="studentSubject" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">اختر المادة</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">كلمة المرور (5 أرقام)</label>
                <input type="text" id="studentPassword" pattern="[0-9]{5}" maxlength="5" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
        </div>
    `;
    showModal('إضافة طالب جديد', content);
    
    // تحديث المواد عند تغيير التخصص أو الصف
    setTimeout(() => {
        document.getElementById('studentClass').addEventListener('change', updateStudentSubjects);
        document.getElementById('studentMajor').addEventListener('change', updateStudentSubjects);
        updateStudentSubjects();
    }, 100);
}

// تحديث قائمة التخصصات والمواد في نافذة الطالب
function updateStudentSubjects() {
    const classSelect = document.getElementById('studentClass');
    const majorSelect = document.getElementById('studentMajor');
    const subjectSelect = document.getElementById('studentSubject');
    
    if (!classSelect || !majorSelect || !subjectSelect) return;
    
    const selectedClass = classSelect.value;
    
    // تحديث التخصصات
    majorSelect.innerHTML = '<option value="">اختر التخصص</option>';
    if (selectedClass && appData.subjects[selectedClass]) {
        Object.keys(appData.subjects[selectedClass]).forEach(major => {
            const option = document.createElement('option');
            option.value = major;
            option.textContent = major;
            majorSelect.appendChild(option);
        });
    }
    
    // تحديث المواد
    const selectedMajor = majorSelect.value;
    subjectSelect.innerHTML = '<option value="">اختر المادة</option>';
    
    if (selectedClass && selectedMajor && appData.subjects[selectedClass] && appData.subjects[selectedClass][selectedMajor]) {
        appData.subjects[selectedClass][selectedMajor].forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }
}

// توليد كلمة مرور عشوائية
function generateRandomPassword() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// اختصارات لوحة المفاتيح
function handleKeyboardShortcuts(event) {
    // Ctrl+S للحفظ
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveData();
        showNotification('تم حفظ البيانات', 'success');
    }
    
    // Ctrl+E لتصدير جميع البيانات
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        exportData('all');
    }
    
    // Ctrl+B لإنشاء نسخة احتياطية
    if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        createBackup();
    }
    
    // Escape لإغلاق النافذة المنبثقة
    if (event.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal && !modal.classList.contains('hidden')) {
            hideModal();
        }
    }
}

// عرض إشعار
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-4 z-50 p-4 rounded-lg shadow-lg ${getNotificationClass(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// الحصول على فئة الإشعار
function getNotificationClass(type) {
    switch (type) {
        case 'success':
            return 'bg-green-100 text-green-800 border border-green-200';
        case 'error':
            return 'bg-red-100 text-red-800 border border-red-200';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        default:
            return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
}

// تصدير الوظائف العامة للنافذة العامة لاستخدامها في HTML
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
window.toggleTreeNode = toggleTreeNode;
window.editClass = editClass;
window.editMajor = editMajor;
window.editSubject = editSubject;

// تهيئة النظام عند تحميل الصفحة
console.log('نظام الاختبارات الإلكترونية تم تحميله بنجاح');
console.log('اختصارات لوحة المفاتيح:');
console.log('Ctrl+S: حفظ البيانات');
console.log('Ctrl+E: تصدير جميع البيانات');
console.log('Ctrl+B: إنشاء نسخة احتياطية');
console.log('Escape: إغلاق النافذة المنبثقة');

console.log('');
console.log('بيانات تسجيل الدخول:');
console.log('مسؤول النظام: admin / admin123');
console.log('طالب تجريبي: 2023001 / 12345');

// البحث في الأسئلة
function searchQuestions() {
    const searchTerm = document.getElementById('questionSearch').value.toLowerCase();
    const filteredQuestions = appData.questions.filter(question =>
        question.text.toLowerCase().includes(searchTerm) ||
        (question.subject && question.subject.toLowerCase().includes(searchTerm)) ||
        question.correctAnswer.toLowerCase().includes(searchTerm)
    );
    
    updateQuestionsListWithData(filteredQuestions);
}

// تحديث قائمة الطلاب بالبيانات المفلترة
function updateStudentsListWithData(students) {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;
    
    studentsList.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${student.id}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.name}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.class || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.major}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.password}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        studentsList.appendChild(row);
    });
}

// تحديث قائمة الأسئلة بالبيانات المفلترة
function updateQuestionsListWithData(questions) {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    questions.forEach((question) => {
        const originalIndex = appData.questions.indexOf(question);
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${question.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.text.substring(0, 50)}...</td>
            <td class="px-4 py-3 text-sm text-gray-700">${getQuestionTypeText(question.type)}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.correctAnswer}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.score}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editQuestion(${originalIndex})" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteQuestion(${originalIndex})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        questionsList.appendChild(row);
    });
}

// استيراد البيانات
function importData(dataType) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = e => handleExcelImport(e.target.files[0], dataType);
    input.click();
}

// معالجة استيراد ملف Excel
function handleExcelImport(file, dataType) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            switch (dataType) {
                case 'students':
                    processStudentsImport(jsonData);
                    break;
                case 'questions':
                    processQuestionsImport(jsonData);
                    break;
                case 'all':
                    processAllDataImport(workbook);
                    break;
            }
        } catch (error) {
            console.error('خطأ في استيراد الملف:', error);
            alert('خطأ في استيراد الملف. تأكد من صحة تنسيق الملف.');
        }
    };
    reader.readAsArrayBuffer(file);
}

// معالجة استيراد الطلاب
function processStudentsImport(data) {
    let importedCount = 0;
    let errors = [];
    
    data.forEach((row, index) => {
        try {
            const student = {
                id: row['رقم الجلوس'] || row['ID'] || row['id'] || '',
                name: row['اسم الطالب'] || row['الاسم'] || row['Name'] || row['name'] || '',
                class: row['الصف'] || row['Class'] || row['class'] || 'الأول',
                major: row['التخصص'] || row['Major'] || row['major'] || 'علوم الحاسوب',
                subject: row['المادة'] || row['Subject'] || row['subject'] || '',
                password: row['كلمة المرور'] || row['Password'] || row['password'] || generateRandomPassword(),
                email: row['البريد الإلكتروني'] || row['Email'] || row['email'] || `${row['رقم الجلوس'] || row['ID']}@student.edu`
            };
            
            if (!student.id || !student.name) {
                errors.push(`الصف ${index + 2}: رقم الجلوس والاسم مطلوبان`);
                return;
            }
            
            if (appData.students.some(s => s.id === student.id)) {
                errors.push(`الصف ${index + 2}: رقم الجلوس ${student.id} موجود مسبقاً`);
                return;
            }
            
            if (!/^[0-9]{5}$/.test(student.password)) {
                student.password = generateRandomPassword();
            }
            
            appData.students.push(student);
            importedCount++;
        } catch (error) {
            errors.push(`الصف ${index + 2}: خطأ في البيانات`);
        }
    });
    
    saveData();
    updateStudentsList();
    updateStudentsTree();
    updateAdminDashboard();
    
    let message = `تم استيراد ${importedCount} طالب بنجاح`;
    if (errors.length > 0) {
        message += `\n\nأخطاء:\n${errors.slice(0, 10).join('\n')}`;
        if (errors.length > 10) {
            message += `\n... و ${errors.length - 10} أخطاء أخرى`;
        }
    }
    alert(message);
}

// معالجة استيراد الأسئلة
function processQuestionsImport(data) {
    let importedCount = 0;
    let errors = [];
    
    data.forEach((row, index) => {
        try {
            const question = {
                subject: row['المادة'] || row['Subject'] || row['subject'] || '',
                text: row['السؤال'] || row['Question'] || row['question'] || '',
                type: row['النوع'] || row['Type'] || row['type'] || 'multiple_choice',
                correctAnswer: row['الإجابة الصحيحة'] || row['Correct Answer'] || row['correct_answer'] || '',
                score: parseInt(row['الدرجة'] || row['Score'] || row['score'] || 1)
            };
            
            // معالجة الخيارات
            const optionsText = row['الخيارات'] || row['Options'] || row['options'] || '';
            if (optionsText) {
                question.options = optionsText.split(',').map(opt => opt.trim());
            }
            
            if (!question.subject || !question.text || !question.correctAnswer) {
                errors.push(`الصف ${index + 2}: المادة والسؤال والإجابة الصحيحة مطلوبة`);
                return;
            }
            
            appData.questions.push(question);
            importedCount++;
        } catch (error) {
            errors.push(`الصف ${index + 2}: خطأ في البيانات`);
        }
    });
    
    saveData();
    updateQuestionsList();
    updateAdminDashboard();
    
    let message = `تم استيراد ${importedCount} سؤال بنجاح`;
    if (errors.length > 0) {
        message += `\n\nأخطاء:\n${errors.slice(0, 10).join('\n')}`;
        if (errors.length > 10) {
            message += `\n... و ${errors.length - 10} أخطاء أخرى`;
        }
    }
    alert(message);
}

// معالجة استيراد جميع البيانات
function processAllDataImport(workbook) {
    try {
        // استيراد الطلاب
        if (workbook.SheetNames.includes('Students') || workbook.SheetNames.includes('الطلاب')) {
            const studentsSheet = workbook.Sheets['Students'] || workbook.Sheets['الطلاب'];
            const studentsData = XLSX.utils.sheet_to_json(studentsSheet);
            processStudentsImport(studentsData);
        }
        
        // استيراد الأسئلة
        if (workbook.SheetNames.includes('Questions') || workbook.SheetNames.includes('الأسئلة')) {
            const questionsSheet = workbook.Sheets['Questions'] || workbook.Sheets['الأسئلة'];
            const questionsData = XLSX.utils.sheet_to_json(questionsSheet);
            processQuestionsImport(questionsData);
        }
        
        // استيراد المواد
        if (workbook.SheetNames.includes('Subjects') || workbook.SheetNames.includes('المواد')) {
            const subjectsSheet = workbook.Sheets['Subjects'] || workbook.Sheets['المواد'];
            const subjectsData = XLSX.utils.sheet_to_json(subjectsSheet);
            processSubjectsImport(subjectsData);
        }
        
        alert('تم استيراد البيانات بنجاح');
    } catch (error) {
        console.error('خطأ في استيراد البيانات:', error);
        alert('خطأ في استيراد البيانات');
    }
}

// معالجة استيراد المواد
function processSubjectsImport(data) {
    // إعادة تعيين هيكل المواد
    appData.subjects = {};
    
    data.forEach(row => {
        const classLevel = row['الصف'] || row['Class'] || '';
        const major = row['التخصص'] || row['Major'] || '';
        const subject = row['المادة'] || row['Subject'] || '';
        
        if (classLevel && major && subject) {
            if (!appData.subjects[classLevel]) {
                appData.subjects[classLevel] = {};
            }
            if (!appData.subjects[classLevel][major]) {
                appData.subjects[classLevel][major] = [];
            }
            if (!appData.subjects[classLevel][major].includes(subject)) {
                appData.subjects[classLevel][major].push(subject);
            }
        }
    });
    
    updateSubjectsTree();
    updateStudentsTree();
}

// تصدير البيانات
function exportData(dataType) {
    try {
        let workbook = XLSX.utils.book_new();
        let fileName = '';

        switch (dataType) {
            case 'students':
                exportStudentsData(workbook);
                fileName = 'students_data.xlsx';
                break;
            case 'questions':
                exportQuestionsData(workbook);
                fileName = 'questions_bank.xlsx';
                break;
            case 'results':
                exportResultsData(workbook);
                fileName = 'exam_results.xlsx';
                break;
            case 'all':
                exportAllData(workbook);
                fileName = 'complete_system_data.xlsx';
                break;
        }

        if (workbook.SheetNames.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }

        XLSX.writeFile(workbook, fileName);
        alert(`تم تصدير البيانات بنجاح إلى ملف: ${fileName}`);
        
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        alert('خطأ في تصدير البيانات');
    }
}

// تصدير بيانات الطلاب
function exportStudentsData(workbook) {
    const studentsData = appData.students.map(student => ({
        'رقم الجلوس': student.id,
        'اسم الطالب': student.name,
        'الصف': student.class || 'غير محدد',
        'التخصص': student.major,
        'المادة': student.subject || 'غير محدد',
        'كلمة المرور': student.password,
        'البريد الإلكتروني': student.email || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "الطلاب");
}

// تصدير بيانات الأسئلة
function exportQuestionsData(workbook) {
    const questionsData = appData.questions.map(question => ({
        'المادة': question.subject,
        'السؤال': question.text,
        'النوع': getQuestionTypeText(question.type),
        'الخيارات': question.options ? question.options.join(', ') : '',
        'الإجابة الصحيحة': question.correctAnswer,
        'الدرجة': question.score
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(questionsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "الأسئلة");
}

// تصدير بيانات النتائج
function exportResultsData(workbook) {
    const resultsData = (appData.examResults || []).map(result => ({
        'رقم الجلوس': result.studentId,
        'اسم الطالب': result.studentName,
        'المادة': result.subject,
        'الدرجة المئوية': result.score,
        'الدرجة الفعلية': result.totalScore,
        'الدرجة الكاملة': result.maxScore,
        'التخصص': result.major,
        'تاريخ الاختبار': result.date,
        'معرف الاختبار': result.examId
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "النتائج");
}

// تصدير جميع البيانات
function exportAllData(workbook) {
    // تصدير الطلاب
    exportStudentsData(workbook);
    
    // تصدير الأسئلة
    exportQuestionsData(workbook);
    
    // تصدير المواد
    const subjectsData = [];
    Object.keys(appData.subjects).forEach(classLevel => {
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            appData.subjects[classLevel][major].forEach(subject => {
                subjectsData.push({
                    'الصف': classLevel,
                    'التخصص': major,
                    'المادة': subject
                });
            });
        });
    });
    
    if (subjectsData.length > 0) {
        const subjectsWorksheet = XLSX.utils.json_to_sheet(subjectsData);
        XLSX.utils.book_append_sheet(workbook, subjectsWorksheet, "المواد");
    }
    
    // تصدير النتائج إذا وجدت
    if (appData.examResults && appData.examResults.length > 0) {
        exportResultsData(workbook);
    }
}

// إنشاء نسخة احتياطية JSON
function createBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: appData
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('تم إنشاء النسخة الاحتياطية بنجاح');
}

// استعادة نسخة احتياطية
function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                if (backup.data) {
                    if (confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
                        Object.assign(appData, backup.data);
                        saveData();
                        updateAllDisplays();
                        alert('تم استعادة النسخة الاحتياطية بنجاح');
                    }
                } else {
                    alert('ملف النسخة الاحتياطية غير صحيح');
                }
            } catch (error) {
                alert('خطأ في قراءة ملف النسخة الاحتياطية');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// مسح جميع البيانات
function clearAllData() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        // إيقاف المؤقت إذا كان يعمل
        if (appData.examTimer) {
            clearInterval(appData.examTimer);
            appData.examTimer = null;
        }
        
        // مسح البيانات
        appData.students = [];
        appData.questions = [];
        appData.connectedStudents = [];
        appData.examResults = [];
        appData.activeExams = [];
        appData.currentExam = null;
        appData.currentStudentId = null;
        
        // الاحتفاظ بهيكل المواد الافتراضي
        appData.subjects = {
            'الأول': {
                'علوم الحاسوب': ['برمجة الحاسوب', 'مقدمة في الحاسوب', 'الرياضيات المتقطعة'],
                'هندسة البرمجيات': ['أساسيات البرمجة', 'التحليل والتصميم', 'إدارة المشاريع'],
                'أمن المعلومات': ['مقدمة في أمن المعلومات', 'الشبكات', 'البرمجة']
            },
            'الثاني': {
                'علوم الحاسوب': ['هياكل البيانات', 'البرمجة الشيئية', 'نظم التشغيل'],
                'هندسة البرمجيات': ['هندسة المتطلبات', 'اختبار البرمجيات', 'قواعد البيانات'],
                'أمن المعلومات': ['التشفير', 'أمن الشبكات', 'البرمجة الآمنة']
            },
            'الثالث': {
                'علوم الحاسوب': ['قواعد البيانات', 'الذكاء الاصطناعي', 'شبكات الحاسوب'],
                'هندسة البرمجيات': ['تطوير الويب', 'هندسة البرمجيات المتقدمة', 'الذكاء الاصطناعي'],
                'أمن المعلومات': ['اختبار الاختراق', 'الطب الجنائي الرقمي', 'إدارة المخاطر']
            },
            'الرابع': {
                'علوم الحاسوب': ['هندسة البرمجيات', 'أمن المعلومات', 'مشروع التخرج'],
                'هندسة البرمجيات': ['مشروع التخرج', 'ريادة الأعمال', 'أمن البرمجيات'],
                'أمن المعلومات': ['أمن التطبيقات', 'أمن البنية التحتية', 'مشروع التخرج']
            }
        };
        
        saveData();
        updateAllDisplays();
        alert('تم مسح جميع البيانات بنجاح');
    }
}

// طباعة النتائج
function printResults() {
    const results = appData.examResults || [];
    if (results.length === 0) {
        alert('لا توجد نتائج للطباعة');
        return;
    }
    
    const stats = getExamStatistics();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>نتائج الاختبارات</title>
            <style>
                body { font-family: 'Tahoma', sans-serif; direction: rtl; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; }
                .excellent { color: #059669; font-weight: bold; }
                .good { color: #d97706; font-weight: bold; }
                .poor { color: #dc2626; font-weight: bold; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>تقرير نتائج الاختبارات الإلكترونية</h1>
                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
            </div>
            
            <div class="stats">
                <div class="stat-box">
                    <h3>إجمالي الطلاب</h3>
                    <p>${stats.totalExams}</p>
                </div>
                <div class="stat-box">
                    <h3>المعدل العام</h3>
                    <p>${stats.averageScore}%</p>
                </div>
                <div class="stat-box">
                    <h3>نسبة النجاح</h3>
                    <p>${stats.passRate}%</p>
                </div>
                <div class="stat-box">
                    <h3>أعلى درجة</h3>
                    <p>${stats.topScore}</p>
                </div>
                <div class="stat-box">
                    <h3>أقل درجة</h3>
                    <p>${stats.lowScore}</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>رقم الجلوس</th>
                        <th>اسم الطالب</th>
                        <th>التخصص</th>
                        <th>المادة</th>
                        <th>الدرجة المئوية</th>
                        <th>الدرجة الفعلية</th>
                        <th>التقدير</th>
                        <th>تاريخ الاختبار</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                        <tr>
                            <td>${result.studentId}</td>
                            <td>${result.studentName}</td>
                            <td>${result.major}</td>
                            <td>${result.subject}</td>
                            <td class="${getScoreClassForPrint(result.score)}">${result.score}%</td>
                            <td>${result.totalScore}/${result.maxScore}</td>
                            <td>${getGrade(result.score)}</td>
                            <td>${result.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="no-print" style="text-align: center; margin: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">طباعة</button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-right: 10px;">إغلاق</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// تصدير الإحصائيات
function exportStatistics() {
    const stats = getExamStatistics();
    const results = appData.examResults || [];
    
    if (results.length === 0) {
        alert('لا توجد نتائج لتصدير الإحصائيات');
        return;
    }
    
    // إحصائيات عامة
    const generalStats = [{
        'المؤشر': 'إجمالي الطلاب المختبرين',
        'القيمة': stats.totalExams
    }, {
        'المؤشر': 'المعدل العام',
        'القيمة': `${stats.averageScore}%`
    }, {
        'المؤشر': 'نسبة النجاح',
        'القيمة': `${stats.passRate}%`
    }, {
        'المؤشر': 'أعلى درجة',
        'القيمة': stats.topScore
    }, {
        'المؤشر': 'أقل درجة',
        'القيمة': stats.lowScore
    }];
    
    // إحصائيات حسب التخصص
    const majorStats = {};
    results.forEach(result => {
        if (!majorStats[result.major]) {
            majorStats[result.major] = {
                count: 0,
                totalScore: 0,
                scores: []
            };
        }
        majorStats[result.major].count++;
        majorStats[result.major].totalScore += result.score;
        majorStats[result.major].scores.push(result.score);
    });
    
    const majorStatsData = Object.keys(majorStats).map(major => {
        const data = majorStats[major];
        const average = Math.round(data.totalScore / data.count);
        const passCount = data.scores.filter(score => score >= 60).length;
        const passRate = Math.round((passCount / data.count) * 100);
        
        return {
            'التخصص': major,
            'عدد الطلاب': data.count,
            'المعدل': `${average}%`,
            'نسبة النجاح': `${passRate}%`,
            'أعلى درجة': Math.                const option = document.createElement('option');
                option.value = subject;
                option.textContent = `${subject} (${major} - ${classLevel})`;
                subjectSelect.appendChild(option);
            });
        });
    });
}

// التعامل مع تغيير نوع السؤال
function handleQuestionTypeChange() {
    const questionType = document.getElementById('questionType').value;
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (questionType === 'essay') {
        optionsContainer.style.display = 'none';
    } else {
        optionsContainer.style.display = 'block';
    }
}

// إضافة خيار جديد
function addOption() {
    const optionsList = document.getElementById('optionsList');
    const optionCount = optionsList.children.length + 1;
    
    const newOption = document.createElement('input');
    newOption.type = 'text';
    newOption.className = 'option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2';
    newOption.placeholder = `الخيار ${optionCount}`;
    
    optionsList.appendChild(newOption);
}

// التعامل مع حفظ النافذة المنبثقة
function handleModalSave() {
    switch (currentModalType) {
        case 'student':
            saveStudent();
            break;
        case 'subject':
            saveSubject();
            break;
        case 'question':
            saveQuestion();
            break;
    }
}

// حفظ الطالب
function saveStudent() {
    const id = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const major = document.getElementById('studentMajor').value;
    const subject = document.getElementById('studentSubject').value;
    const password = document.getElementById('studentPassword').value.trim();
    
    if (!id || !name || !studentClass || !major || !subject || !password) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    if (!/^[0-9]{5}$/.test(password)) {
        alert('كلمة المرور يجب أن تكون مكونة من 5 أرقام فقط');
        return;
    }
    
    // التحقق من عدم وجود الطالب مسبقاً (إلا في حالة التعديل)
    const existingStudent = appData.students.find(s => s.id === id);
    if (existingStudent && editingIndex === -1) {
        alert('رقم الجلوس موجود مسبقاً');
        return;
    }
    
    const studentData = {
        id,
        name,
        class: studentClass,
        major,
        subject,
        password,
        email: `${id}@student.edu`
    };
    
    if (editingIndex >= 0) {
        // تعديل طالب موجود
        appData.students[editingIndex] = studentData;
    } else {
        // إضافة طالب جديد
        appData.students.push(studentData);
    }
    
    saveData();
    updateStudentsList();
    updateStudentsTree();
    updateAdminDashboard();
    hideModal();
    alert(editingIndex >= 0 ? 'تم تحديث بيانات الطالب بنجاح' : 'تم إضافة الطالب بنجاح');
}

// حفظ المادة
function saveSubject() {
    const classSelect = document.getElementById('subjectClass');
    const newClassName = document.getElementById('newClassName')?.value.trim();
    const majorSelect = document.getElementById('subjectMajor');
    const newMajorName = document.getElementById('newMajorName')?.value.trim();
    const subjectName = document.getElementById('subjectName').value.trim();
    
    if (!subjectName) {
        alert('الرجاء إدخال اسم المادة');
        return;
    }
    
    let targetClass;
    if (classSelect.value === 'new') {
        if (!newClassName) {
            alert('الرجاء إدخال اسم الصف الجديد');
            return;
        }
        targetClass = newClassName;
        if (!appData.subjects[targetClass]) {
            appData.subjects[targetClass] = {};
        }
    } else {
        targetClass = classSelect.value;
    }
    
    let targetMajor;
    if (majorSelect.value === 'new') {
        if (!newMajorName) {
            alert('الرجاء إدخال اسم التخصص الجديد');
            return;
        }
        targetMajor = newMajorName;
        if (!appData.subjects[targetClass][targetMajor]) {
            appData.subjects[targetClass][targetMajor] = [];
        }
    } else {
        targetMajor = majorSelect.value;
        if (!targetMajor) {
            alert('الرجاء اختيار التخصص');
            return;
        }
    }
    
    if (!appData.subjects[targetClass][targetMajor]) {
        appData.subjects[targetClass][targetMajor] = [];
    }
    
    if (appData.subjects[targetClass][targetMajor].includes(subjectName)) {
        alert('هذه المادة موجودة مسبقاً');
        return;
    }
    
    appData.subjects[targetClass][targetMajor].push(subjectName);
    saveData();
    updateSubjectsTree();
    updateStudentsTree();
    updateAdminDashboard();
    hideModal();
    alert('تم إضافة المادة بنجاح');
}

// حفظ السؤال
function saveQuestion() {
    const subject = document.getElementById('questionSubject').value;
    const type = document.getElementById('questionType').value;
    const text = document.getElementById('questionText').value.trim();
    const answer = document.getElementById('questionAnswer').value.trim();
    const score = parseInt(document.getElementById('questionScore').value);
    
    if (!subject || !text || !answer || !score) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const questionData = {
        subject,
        type,
        text,
        correctAnswer: answer,
        score
    };
    
    if (type !== 'essay') {
        const options = Array.from(document.querySelectorAll('.option-input'))
            .map(input => input.value.trim())
            .filter(value => value);
        
        if (options.length < 2) {
            alert('الرجاء إدخال خيارين على الأقل');
            return;
        }
        
        questionData.options = options;
    }
    
    if (editingIndex >= 0) {
        // تعديل سؤال موجود
        appData.questions[editingIndex] = questionData;
    } else {
        // إضافة سؤال جديد
        appData.questions.push(questionData);
    }
    
    saveData();
    updateQuestionsList();
    updateAdminDashboard();
    hideModal();
    alert(editingIndex >= 0 ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح');
}

// تبديل عقدة الشجرة
function toggleTreeNode(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
    } else {
        content.classList.add('expanded');
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
    }
}

// تعديل الصف
function editClass(className) {
    const newName = prompt('أدخل الاسم الجديد للصف:', className);
    if (newName && newName !== className && !appData.subjects[newName]) {
        appData.subjects[newName] = appData.subjects[className];
        delete appData.subjects[className];
        
        // تحديث الطلاب
        appData.students.forEach(student => {
            if (student.class === className) {
                student.class = newName;
            }
        });
        
        saveData();
        updateSubjectsTree();
        updateStudentsTree();
        updateStudentsList();
        alert('تم تحديث اسم الصف بنجاح');
    } else if (appData.subjects[newName]) {
        alert('هذا الاسم موجود مسبقاً');
    }
}

// تعديل التخصص
function editMajor(className, majorName) {
    const newName = prompt('أدخل الاسم الجديد للتخصص:', majorName);
    if (newName && newName !== majorName && !appData.subjects[className][newName]) {
        appData.subjects[className][newName] = appData.subjects[className][majorName];
        delete appData.subjects[className][majorName];
        
        // تحديث الطلاب
        appData.students.forEach(student => {
            if (student.class === className && student.major === majorName) {
                student.major = newName;
            }
        });
        
        saveData();
        updateSubjectsTree();
        updateStudentsTree();
        updateStudentsList();
        alert('تم تحديث اسم التخصص بنجاح');
    } else if (appData.subjects[className][newName]) {
        alert('هذا الاسم موجود مسبقاً');
    }
}

// تعديل المادة
function editSubject(className, majorName, subjectName) {
    const newName = prompt('أدخل الاسم الجديد للمادة:', subjectName);
    if (newName && newName !== subjectName) {
        const subjectIndex = appData.subjects[className][majorName].indexOf(subjectName);
        if (subjectIndex !== -1) {
            if (!appData.subjects[className][majorName].includes(newName)) {
                appData.subjects[className][majorName][subjectIndex] = newName;
                
                // تحديث الطلاب والأسئلة
                appData.students.forEach(student => {
                    if (student.subject === subjectName) {
                        student.subject = newName;
                    }
                });
                
                appData.questions.forEach(question => {
                    if (question.subject === subjectName) {
                        question.subject = newName;
                    }
                });
                
                saveData();
                updateSubjectsTree();
                updateStudentsTree();
                updateStudentsList();
                updateQuestionsList();
                alert('تم تحديث اسم المادة بنجاح');
            } else {
                alert('هذا الاسم موجود مسبقاً');
            }
        }
    }
}

// تعديل طالب
function editStudent(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;
    
    editingIndex = appData.students.indexOf(student);
    showAddStudentModal();
    
    setTimeout(() => {
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentClass').value = student.class || 'الأول';
        
        updateStudentSubjects();
        setTimeout(() => {
            document.getElementById('studentMajor').value = student.major;
            updateStudentSubjects();
            setTimeout(() => {
                document.getElementById('studentSubject').value = student.subject || '';
            }, 100);
        }, 100);
        
        document.getElementById('studentPassword').value = student.password;
        document.getElementById('modalTitle').textContent = 'تعديل بيانات الطالب';
    }, 100);
}

// حذف طالب
function deleteStudent(studentId) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        appData.students = appData.students.filter(s => s.id !== studentId);
        appData.connectedStudents = appData.connectedStudents.filter(s => s.id !== studentId);
        saveData();
        updateStudentsList();
        updateStudentsTree();
        updateAdminDashboard();
        alert('تم حذف الطالب بنجاح');
    }
}

// تعديل سؤال
function editQuestion(index) {
    const question = appData.questions[index];
    if (!question) return;
    
    editingIndex = index;
    showAddQuestionModal();
    
    setTimeout(() => {
        document.getElementById('questionSubject').value = question.subject;
        document.getElementById('questionType').value = question.type;
        document.getElementById('questionText').value = question.text;
        document.getElementById('questionAnswer').value = question.correctAnswer;
        document.getElementById('questionScore').value = question.score;
        
        if (question.options) {
            const optionsList = document.getElementById('optionsList');
            optionsList.innerHTML = '';
            question.options.forEach((option, i) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2';
                input.placeholder = `الخيار ${i + 1}`;
                input.value = option;
                optionsList.appendChild(input);
            });
        }
        
        handleQuestionTypeChange();
        document.getElementById('modalTitle').textContent = 'تعديل السؤال';
    }, 100);
}

// حذف سؤال
function deleteQuestion(index) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
        appData.questions.splice(index, 1);
        saveData();
        updateQuestionsList();
        updateAdminDashboard();
        alert('تم حذف السؤال بنجاح');
    }
}

// تكوين الاختبار
function configureExam() {
    const duration = parseInt(document.getElementById('examDuration').value);
    const questionsCount = parseInt(document.getElementById('examQuestionsCount').value);
    const major = document.getElementById('examMajor').value;
    
    if (isNaN(duration) || duration <= 0) {
        alert('الرجاء إدخال مدة صحيحة للاختبار');
        return;
    }
    
    if (isNaN(questionsCount) || questionsCount <= 0) {
        alert('الرجاء إدخال عدد أسئلة صحيح');
        return;
    }
    
    if (questionsCount > appData.questions.length) {
        alert(`عدد الأسئلة المطلوب (${questionsCount}) أكبر من الأسئلة المتاحة (${appData.questions.length})`);
        return;
    }
    
    appData.currentExam = {
        duration,
        questionsCount,
        major,
        date: new Date().toLocaleString(),
        examId: Date.now().toString()
    };
    
    saveData();
    alert('تم حفظ إعدادات الاختبار بنجاح');
}

// بدء الاختبار
function startExam() {
    if (appData.connectedStudents.length === 0) {
        alert('لا يوجد طلاب متصلين لبدء الاختبار');
        return;
    }
    
    if (!appData.currentExam) {
        alert('الرجاء تهيئة إعدادات الاختبار أولاً');
        return;
    }
    
    // تحديث حالة جميع الطلاب المتصلين
    appData.connectedStudents.forEach(student => {
        student.examStatus = 'جاري الاختبار';
        student.examData = {
            startTime: new Date().toLocaleString(),
            examId: appData.currentExam.examId
        };
    });
    
    updateAdminDashboard();
    saveData();
    alert(`تم بدء الاختبار لجميع الطلاب المتصلين (${appData.connectedStudents.length} طالب)`);
}

// الموافقة على جميع الطلاب
function approveAllStudents() {
    if (appData.connectedStudents.length === 0) {
        alert('لا يوجد طلاب متصلين للموافقة عليهم');
        return;
    }
    
    appData.connectedStudents.forEach(student => {
        if (student.examStatus === 'في انتظار الموافقة') {
            student.examStatus = 'تمت الموافقة';
        }
    });
    
    updateAdminDashboard();
    saveData();
    alert(`تمت الموافقة على جميع الطلاب (${appData.connectedStudents.length} طالب)`);
}

// تحديث قائمة الطلاب المتصلين
function refreshConnectedStudents() {
    updateAdminDashboard();
    alert('تم تحديث قائمة الطلاب المتصلين');
}

// عرض شاشة الاختبار للطالب
function showExamScreen() {
    if (!appData.currentExam) {
        alert('لا يوجد اختبار نشط حالياً');
        return;
    }
    
    hideAllScreens();
    document.getElementById('studentExamScreen').classList.remove('hidden');
    document.getElementById('examTitle').textContent = `اختبار ${appData.currentExam.major}`;
    
    // توليد أسئلة الاختبار
    generateExamQuestions();
    
    // بدء المؤقت
    startExamTimer(appData.currentExam.duration);
}

// توليد أسئلة الاختبار
function generateExamQuestions() {
    const examContainer = document.getElementById('examQuestions');
    if (!examContainer) return;
    
    const questionCount = Math.min(appData.currentExam?.questionsCount || 5, appData.questions.length);
    
    // اختيار أسئلة عشوائية
    const shuffledQuestions = [...appData.questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, questionCount);
    
    examContainer.innerHTML = '';
    
    selectedQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-card bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4';
        
        let questionHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold">السؤال ${index + 1}: ${question.text}</h3>
                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">درجة السؤال: ${question.score}</span>
            </div>
        `;
        
        if (question.type === 'multiple_choice') {
            questionHTML += '<div class="space-y-3">';
            question.options.forEach((option, optIndex) => {
                questionHTML += `
                    <div class="question-option flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-blue-50">
                        <input type="radio" name="q${index}" id="q${index}${optIndex}" class="h-4 w-4 text-blue-600" value="${option}">
                        <label for="q${index}${optIndex}" class="mr-2 cursor-pointer flex-1">${option}</label>
                    </div>
                `;
            });
            questionHTML += '</div>';
        } else if (question.type === 'multiple_select') {
            questionHTML += '<div class="space-y-3">';
            question.options.forEach((option, optIndex) => {
                questionHTML += `
                    <div class="question-option flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-blue-50">
                        <input type="checkbox" name="q${index}" id="q${index}${optIndex}" class="h-4 w-4 text-blue-600" value="${option}">
                        <label for="q${index}${optIndex}" class="mr-2 cursor-pointer flex-1">${option}</label>
                    </div>
                `;
            });
            questionHTML += '</div>';
        } else if (question.type === 'essay') {
            questionHTML += `
                <textarea name="q${index}" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                         rows="4" placeholder="اكتب إجابتك هنا..."></textarea>
            `;
        }
        
        questionDiv.innerHTML = questionHTML;
        examContainer.appendChild(questionDiv);
    });
    
    // حفظ الأسئلة المختارة للتصحيح لاحقاً
    appData.currentExamQuestions = selectedQuestions;
}

// بدء مؤقت الاختبار
function startExamTimer(minutes) {
    let timeLeft = minutes * 60;
    
    appData.examTimer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        const timerElement = document.getElementById('examTimer');
        if (timerElement) {
            timerElement.textContent = formattedTime;
            
            // تغيير لون المؤقت عند اقتراب النهاية
            if (timeLeft <= 300) { // آخر 5 دقائق
                timerElement.parentElement.className = 'bg-red-100 text-red-800 px-3 py-1 rounded-full';
            } else if (timeLeft <= 600) { // آخر 10 دقائق
                timerElement.parentElement.className = 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full';
            }
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(appData.examTimer);
            alert('انتهى وقت الاختبار');
            submitExam();
        }
    }, 1000);
}

// تسليم الاختبار
function submitExam() {
    if (appData.examTimer) {
        clearInterval(appData.examTimer);
        appData.examTimer = null;
    }
    
    const result = calculateExamScore();
    const studentId = appData.currentStudentId;
    const student = appData.students.find(s => s.id === studentId);
    
    if (student) {
        // حفظ النتيجة
        if (!appData.examResults) {
            appData.examResults = [];
        }
        
        appData.examResults.push({
            studentId: student.id,
            studentName: student.name,
            subject: student.subject,
            score: result.score,
            totalScore: result.totalScore,
            maxScore: result.maxScore,
            date: new Date().toLocaleString(),
            major: student.major,
            examId: appData.currentExam?.examId,
            answers: result.answers
        });
        
        // تحديث حالة الطالب المتصل
        const connectedStudent = appData.connectedStudents.find(s => s.id === student.id);
        if (connectedStudent) {
            connectedStudent.examStatus = 'مكتمل';
            connectedStudent.score = result.score;
        }
        
        saveData();
    }
    
    alert(`تم تسليم الاختبار بنجاح\nدرجتك: ${result.score}/100\nالدرجة الفعلية: ${result.totalScore}/${result.maxScore}`);
    
    // العودة لشاشة تسجيل الدخول
    handleLogout();
}

// حساب درجة الاختبار
function calculateExamScore() {
    const questionElements = document.querySelectorAll('.question-card');
    let totalScore = 0;
    let maxScore = 0;
    const answers = [];
    
    questionElements.forEach((element, index) => {
        const question = appData.currentExamQuestions[index];
        if (!question) return;
        
        maxScore += question.score;
        let studentAnswer = '';
        let isCorrect = false;
        
        if (question.type === 'multiple_choice') {
            const selected = element.querySelector(`input[name="q${index}"]:checked`);
            if (selected) {
                studentAnswer = selected.value;
                isCorrect = studentAnswer === question.correctAnswer;
                if (isCorrect) totalScore += question.score;
            }
        } else if (question.type === 'multiple_select') {
            const selected = Array.from(element.querySelectorAll(`input[name="q${index}"]:checked`))
                .map(input => input.value);
            studentAnswer = selected.join(', ');
            const correct = question.correctAnswer.split(',').map(s => s.trim());
            isCorrect = selected.length === correct.length && 
                       selected.every(val => correct.includes(val));
            if (isCorrect) totalScore += question.score;
        } else if (question.type === 'essay') {
            const textarea = element.querySelector(`textarea[name="q${index}"]`);
            if (textarea) {
                studentAnswer = textarea.value.trim();
                // تقييم بسيط للأسئلة المقالية (يمكن تحسينه)
                if (studentAnswer.length > 20) {
                    const partialScore = Math.floor(question.score * 0.7); // 70% للإجابة المقبولة
                    totalScore += partialScore;
                    isCorrect = true;
                }
            }
        }
        
        answers.push({
            questionText: question.text,
            studentAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            score: isCorrect ? question.score : 0,
            maxScore: question.score
        });
    });
    
    const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    return {
        score: percentageScore,
        totalScore,
        maxScore,
        answers
    };
} قائمة التخصصات في نافذة المادة
function updateSubjectMajors() {
    const classSelect = document.getElementById('subjectClass');
    const majorSelect = document.getElementById('subjectMajor');
    
    if (!classSelect || !majorSelect) return;
    
    const selectedClass = classSelect.value;
    
    majorSelect.innerHTML = '<option value="">اختر التخصص</option>';
    
    if (selectedClass && selectedClass !== 'new' && appData.subjects[selectedClass]) {
        Object.keys(appData.subjects[selectedClass]).forEach(major => {
            const option = document.createElement('option');
            option.value = major;
            option.textContent = major;
            majorSelect.appendChild(option);
        });
    }
    
    majorSelect.innerHTML += '<option value="new">إضافة تخصص جديد</option>';
}

// عرض نافذة إضافة سؤال
function showAddQuestionModal() {
    currentModalType = 'question';
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">المادة</label>
                <select id="questionSubject" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">اختر المادة</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">نوع السؤال</label>
                <select id="questionType" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="multiple_choice">اختيار من متعدد</option>
                    <option value="multiple_select">اختيار متعدد</option>
                    <option value="essay">مقالي</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">نص السؤال</label>
                <textarea id="questionText" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
            <div id="optionsContainer">
                <label class="block text-sm font-medium text-gray-700">الخيارات</label>
                <div id="optionsList">
                    <input type="text" class="option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2" placeholder="الخيار 1">
                    <input type="text" class="option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2" placeholder="الخيار 2">
                    <input type="text" class="option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2" placeholder="الخيار 3">
                    <input type="text" class="option-input mt-1 block w-full p-2 border border-gray-300 rounded-md mb-2" placeholder="الخيار 4">
                </div>
                <button type="button" id="addOptionBtn" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">إضافة خيار</button>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">الإجابة الصحيحة</label>
                <input type="text" id="questionAnswer" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="الإجابة الصحيحة">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">درجة السؤال</label>
                <input type="number" id="questionScore" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" value="1" min="1">
            </div>
        </div>
    `;
    showModal('إضافة سؤال جديد', content);
    
    setTimeout(() => {
        populateSubjectsDropdown();
        document.getElementById('questionType').addEventListener('change', handleQuestionTypeChange);
        document.getElementById('addOptionBtn').addEventListener('click', addOption);
        handleQuestionTypeChange();
    }, 100);
}

// ملء قائمة المواد المنسدلة
function populateSubjectsDropdown() {
    const subjectSelect = document.getElementById('questionSubject');
    if (!subjectSelect) return;
    
    subjectSelect.innerHTML = '<option value="">اختر المادة</option>';
    
    Object.keys(appData.subjects).forEach(classLevel => {
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            appData.subjects[classLevel][major].forEach(subject => {
                const option = // تخزين البيانات محلياً
const appData = {
    students: [
        { 
            id: '2023001', 
            name: 'أحمد محمد علي', 
            class: 'الأول',
            major: 'علوم الحاسوب', 
            subject: 'برمجة الحاسوب',
            email: 'ahmed@example.com', 
            password: '12345' 
        },
        { 
            id: '2023002', 
            name: 'سارة عبد الرحمن', 
            class: 'الثاني',
            major: 'هندسة البرمجيات', 
            subject: 'قواعد البيانات',
            email: 'sara@example.com', 
            password: '54321' 
        },
        { 
            id: '2023003', 
            name: 'محمد حسن', 
            class: 'الثالث',
            major: 'أمن المعلومات', 
            subject: 'التشفير',
            email: 'mohamed@example.com', 
            password: '11111' 
        }
    ],
    subjects: {
        'الأول': {
            'علوم الحاسوب': ['برمجة الحاسوب', 'مقدمة في الحاسوب', 'الرياضيات المتقطعة'],
            'هندسة البرمجيات': ['أساسيات البرمجة', 'التحليل والتصميم', 'إدارة المشاريع'],
            'أمن المعلومات': ['مقدمة في أمن المعلومات', 'الشبكات', 'البرمجة']
        },
        'الثاني': {
            'علوم الحاسوب': ['هياكل البيانات', 'البرمجة الشيئية', 'نظم التشغيل'],
            'هندسة البرمجيات': ['هندسة المتطلبات', 'اختبار البرمجيات', 'قواعد البيانات'],
            'أمن المعلومات': ['التشفير', 'أمن الشبكات', 'البرمجة الآمنة']
        },
        'الثالث': {
            'علوم الحاسوب': ['قواعد البيانات', 'الذكاء الاصطناعي', 'شبكات الحاسوب'],
            'هندسة البرمجيات': ['تطوير الويب', 'هندسة البرمجيات المتقدمة', 'الذكاء الاصطناعي'],
            'أمن المعلومات': ['اختبار الاختراق', 'الطب الجنائي الرقمي', 'إدارة المخاطر']
        },
        'الرابع': {
            'علوم الحاسوب': ['هندسة البرمجيات', 'أمن المعلومات', 'مشروع التخرج'],
            'هندسة البرمجيات': ['مشروع التخرج', 'ريادة الأعمال', 'أمن البرمجيات'],
            'أمن المعلومات': ['أمن التطبيقات', 'أمن البنية التحتية', 'مشروع التخرج']
        }
    },
    questions: [
        {
            subject: 'برمجة الحاسوب',
            text: "ما هي لغة البرمجة الأكثر استخداماً في تطوير الويب؟",
            type: 'multiple_choice',
            options: ['Python', 'JavaScript', 'Java', 'C++'],
            correctAnswer: "JavaScript",
            score: 2
        },
        {
            subject: 'قواعد البيانات',
            text: "اختر الإجابات الصحيحة حول أنواع قواعد البيانات:",
            type: 'multiple_select',
            options: ['SQL', 'NoSQL', 'Graph', 'XML'],
            correctAnswer: "SQL,NoSQL,Graph",
            score: 3
        },
        {
            subject: 'برمجة الحاسوب',
            text: "اكتب تعريفاً مختصراً للبرمجة الشيئية:",
            type: 'essay',
            correctAnswer: "نموذج برمجي يعتمد على الكائنات والفئات",
            score: 5
        },
        {
            subject: 'التشفير',
            text: "ما هو الخوارزمية المستخدمة في التشفير المتماثل؟",
            type: 'multiple_choice',
            options: ['AES', 'RSA', 'DSA', 'ECC'],
            correctAnswer: "AES",
            score: 3
        },
        {
            subject: 'هياكل البيانات',
            text: "أي من التالي يستخدم مبدأ LIFO؟",
            type: 'multiple_choice',
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            correctAnswer: "Stack",
            score: 2
        }
    ],
    activeExams: [],
    connectedStudents: [],
    currentExam: null,
    examResults: [],
    currentStudentId: null,
    examTimer: null
};

// متغيرات عامة
let currentModalType = '';
let editingIndex = -1;

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSavedData();
    updateAllDisplays();
});

// تهيئة التطبيق
function initializeApp() {
    console.log('تهيئة نظام الاختبارات الإلكترونية...');
    
    // إخفاء جميع الشاشات عدا شاشة تسجيل الدخول
    hideAllScreens();
    document.getElementById('loginScreen').classList.remove('hidden');
    
    // تعيين الشاشة الافتراضية للإدمن
    showContent('dashboard');
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تسجيل الدخول
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // تسجيل الخروج
    document.getElementById('logoutAdmin').addEventListener('click', handleLogout);
    
    // أزرار الإدمن الرئيسية
    document.getElementById('configureExamBtn').addEventListener('click', configureExam);
    document.getElementById('startExamBtn').addEventListener('click', startExam);
    document.getElementById('approveAllBtn').addEventListener('click', approveAllStudents);
    document.getElementById('exportResultsBtn').addEventListener('click', () => exportData('results'));
    document.getElementById('refreshStudentsBtn').addEventListener('click', refreshConnectedStudents);
    
    // أزرار إدارة الطلاب (تم تحديث الموقع)
    document.getElementById('addStudentBtn')?.addEventListener('click', showAddStudentModal);
    document.getElementById('importStudentsBtn')?.addEventListener('click', () => importData('students'));
    document.getElementById('exportStudentsBtn')?.addEventListener('click', () => exportData('students'));
    document.getElementById('studentSearch')?.addEventListener('input', searchStudents);
    
    // أزرار إدارة الأسئلة (تم تحديث الموقع)
    document.getElementById('addSubjectBtn')?.addEventListener('click', showAddSubjectModal);
    document.getElementById('addQuestionBtn')?.addEventListener('click', showAddQuestionModal);
    document.getElementById('importQuestionsBtn')?.addEventListener('click', () => importData('questions'));
    document.getElementById('exportQuestionsBtn')?.addEventListener('click', () => exportData('questions'));
    document.getElementById('questionSearch')?.addEventListener('input', searchQuestions);
    
    // أزرار إدارة قاعدة البيانات
    document.getElementById('exportAllDataBtn')?.addEventListener('click', () => exportData('all'));
    document.getElementById('exportStudentsDataBtn')?.addEventListener('click', () => exportData('students'));
    document.getElementById('exportQuestionsDataBtn')?.addEventListener('click', () => exportData('questions'));
    document.getElementById('importAllDataBtn')?.addEventListener('click', () => importData('all'));
    document.getElementById('createBackupBtn')?.addEventListener('click', createBackup);
    document.getElementById('restoreBackupBtn')?.addEventListener('click', restoreBackup);
    document.getElementById('clearAllDataBtn')?.addEventListener('click', clearAllData);
    document.getElementById('printResultsBtn')?.addEventListener('click', printResults);
    document.getElementById('exportStatsBtn')?.addEventListener('click', exportStatistics);
    
    // أزرار الطلاب
    document.getElementById('submitExam')?.addEventListener('click', submitExam);
    
    // النوافذ المنبثقة
    document.getElementById('modalCancel')?.addEventListener('click', hideModal);
    document.getElementById('modalSave')?.addEventListener('click', handleModalSave);
    document.getElementById('modal')?.addEventListener('click', handleModalOutsideClick);
    
    // التنقل في الإدمن
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// تحميل البيانات المحفوظة
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('examSystemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.assign(appData, parsedData);
            console.log('تم تحميل البيانات المحفوظة بنجاح');
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

// حفظ البيانات
function saveData() {
    try {
        const dataString = JSON.stringify(appData);
        if (dataString.length > 5000000) { // حد 5 ميجابايت
            alert('تحذير: حجم البيانات كبير جداً. قد تحتاج لحذف بعض البيانات القديمة.');
            return false;
        }
        localStorage.setItem('examSystemData', dataString);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        if (error.name === 'QuotaExceededError') {
            alert('مساحة التخزين ممتلئة. الرجاء حذف بعض البيانات أو تصدير البيانات لحفظها خارجياً.');
        } else {
            alert('خطأ في حفظ البيانات: ' + error.message);
        }
        return false;
    }
}

// تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const userType = document.getElementById('user-type').value;
    const idNumber = document.getElementById('id-number').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!idNumber || !password) {
        alert('الرجاء إدخال جميع البيانات المطلوبة');
        return;
    }
    
    if (userType === 'admin') {
        if (idNumber === 'admin' && password === 'admin123') {
            showAdminDashboard();
        } else {
            alert('بيانات المدير غير صحيحة');
        }
    } else if (userType === 'student') {
        const student = appData.students.find(s => s.id === idNumber && s.password === password);
        if (student) {
            if (!/^[0-9]{5}$/.test(password)) {
                alert('كلمة المرور يجب أن تكون مكونة من 5 أرقام فقط');
                return;
            }
            showStudentInterface(student);
        } else {
            alert('بيانات الطالب غير صحيحة');
        }
    }
}

// تسجيل الخروج
function handleLogout() {
    // إيقاف المؤقت إذا كان يعمل
    if (appData.examTimer) {
        clearInterval(appData.examTimer);
        appData.examTimer = null;
    }
    
    // إزالة الطالب من المتصلين إذا كان طالباً
    if (appData.currentStudentId) {
        appData.connectedStudents = appData.connectedStudents.filter(s => s.id !== appData.currentStudentId);
        appData.currentStudentId = null;
        saveData();
    }
    
    hideAllScreens();
    document.getElementById('loginScreen').classList.remove('hidden');
    
    // مسح النموذج
    document.getElementById('loginForm').reset();
}

// إخفاء جميع الشاشات
function hideAllScreens() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('studentWaitingScreen').classList.add('hidden');
    document.getElementById('studentExamScreen').classList.add('hidden');
}

// عرض لوحة تحكم الإدمن
function showAdminDashboard() {
    hideAllScreens();
    document.getElementById('adminDashboard').classList.remove('hidden');
    updateAllDisplays();
    
    // بدء الحفظ التلقائي
    setInterval(() => {
        saveData();
    }, 30000); // كل 30 ثانية
}

// عرض واجهة الطالب
function showStudentInterface(student) {
    appData.currentStudentId = student.id;
    
    // إضافة الطالب للمتصلين
    if (!appData.connectedStudents.find(s => s.id === student.id)) {
        appData.connectedStudents.push({
            id: student.id,
            name: student.name,
            major: student.major,
            subject: student.subject,
            status: 'متصل',
            examStatus: 'في انتظار الموافقة',
            score: null,
            connectionTime: new Date().toLocaleString()
        });
        saveData();
    }
    
    hideAllScreens();
    document.getElementById('studentWaitingScreen').classList.remove('hidden');
    document.getElementById('studentIdDisplay').textContent = student.id;
    
    // فحص حالة الاختبار
    checkExamStatus(student.id);
}

// فحص حالة الاختبار للطالب
function checkExamStatus(studentId) {
    const connectedStudent = appData.connectedStudents.find(s => s.id === studentId);
    if (connectedStudent) {
        const statusElement = document.getElementById('examStatus');
        if (statusElement) {
            statusElement.textContent = connectedStudent.examStatus;
        }
        
        // إذا تمت الموافقة وبدء الاختبار، انتقل لشاشة الاختبار
        if (connectedStudent.examStatus === 'جاري الاختبار') {
            setTimeout(() => {
                showExamScreen();
            }, 1000);
        }
    }
    
    // فحص دوري لحالة الاختبار
    setTimeout(() => checkExamStatus(studentId), 3000);
}

// التنقل في لوحة الإدمن
function handleNavigation(e) {
    e.preventDefault();
    const contentType = e.target.getAttribute('data-content');
    if (contentType) {
        showContent(contentType);
    }
}

// عرض المحتوى المحدد
function showContent(contentType) {
    // إخفاء جميع أقسام المحتوى
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // عرض القسم المحدد
    const targetContent = document.getElementById(`${contentType}-content`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }
    
    // تحديث التنقل
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-content="${contentType}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // تحديث المحتوى حسب النوع
    switch (contentType) {
        case 'students':
            updateStudentsList();
            updateStudentsTree();
            break;
        case 'questions':
            updateQuestionsList();
            updateSubjectsTree();
            break;
        case 'database':
            updateDatabaseStats();
            break;
        case 'dashboard':
        default:
            updateAdminDashboard();
            break;
    }
}

// تحديث جميع العروض
function updateAllDisplays() {
    updateAdminDashboard();
    updateStudentsList();
    updateQuestionsList();
    updateSubjectsTree();
    updateStudentsTree();
    updateDatabaseStats();
}

// تحديث لوحة تحكم الإدمن
function updateAdminDashboard() {
    // تحديث العدادات
    document.getElementById('studentsCount').textContent = appData.students.length;
    document.getElementById('connectedStudentsCount').textContent = appData.connectedStudents.length;
    document.getElementById('questionsCount').textContent = appData.questions.length;
    
    // تحديث قائمة الطلاب المتصلين
    const connectedStudentsList = document.getElementById('connectedStudentsList');
    if (connectedStudentsList) {
        connectedStudentsList.innerHTML = '';
        
        appData.connectedStudents.forEach(student => {
            const score = student.score || '--';
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${student.id}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${student.name}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${student.major}</td>
                <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(student.examStatus)}">
                        ${student.examStatus}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm font-bold ${getScoreClass(score)}">
                    ${score}
                </td>
            `;
            connectedStudentsList.appendChild(row);
        });
    }
}

// تحديث قائمة الطلاب
function updateStudentsList() {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;
    
    studentsList.innerHTML = '';
    appData.students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${student.id}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.name}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.class || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.major}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.password}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        studentsList.appendChild(row);
    });
}('click', printResults);
    document.getElementById('exportStatsBtn')?.addEventListener('click', exportStatistics);
    
    // أزرار الطلاب
    document.getElementById('submitExam')?.addEventListener('click', submitExam);
    
    // النوافذ المنبثقة
    document.getElementById('modalCancel')?.addEventListener('click', hideModal);
    document.getElementById('modalSave')?.addEventListener('click', handleModalSave);
    document.getElementById('modal')?.addEventListener('click', handleModalOutsideClick);
    
    // التنقل في الإدمن
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// تحميل البيانات المحفوظة
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('examSystemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.assign(appData, parsedData);
            console.log('تم تحميل البيانات المحفوظة بنجاح');
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

// حفظ البيانات
function saveData() {
    try {
        const dataString = JSON.stringify(appData);
        if (dataString.length > 5000000) { // حد 5 ميجابايت
            alert('تحذير: حجم البيانات كبير جداً. قد تحتاج لحذف بعض البيانات القديمة.');
            return false;
        }
        localStorage.setItem('examSystemData', dataString);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        if (error.name === 'QuotaExceededError') {
            alert('مساحة التخزين ممتلئة. الرجاء حذف بعض البيانات أو تصدير البيانات لحفظها خارجياً.');
        } else {
            alert('خطأ في حفظ البيانات: ' + error.message);
        }
        return false;
    }
}

// تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const userType = document.getElementById('user-type').value;
    const idNumber = document.getElementById('id-number').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!idNumber || !password) {
        alert('الرجاء إدخال جميع البيانات المطلوبة');
        return;
    }
    
    if (userType === 'admin') {
        if (idNumber === 'admin' && password === 'admin123') {
            showAdminDashboard();
        } else {
            alert('بيانات المدير غير صحيحة');
        }
    } else if (userType === 'student') {
        const student = appData.students.find(s => s.id === idNumber && s.password === password);
        if (student) {
            if (!/^[0-9]{5}$/.test(password)) {
                alert('كلمة المرور يجب أن تكون مكونة من 5 أرقام فقط');
                return;
            }
            showStudentInterface(student);
        } else {
            alert('بيانات الطالب غير صحيحة');
        }
    }
}

// تسجيل الخروج
function handleLogout() {
    // إيقاف المؤقت إذا كان يعمل
    if (appData.examTimer) {
        clearInterval(appData.examTimer);
        appData.examTimer = null;
    }
    
    // إزالة الطالب من المتصلين إذا كان طالباً
    if (appData.currentStudentId) {
        appData.connectedStudents = appData.connectedStudents.filter(s => s.id !== appData.currentStudentId);
        appData.currentStudentId = null;
        saveData();
    }
    
    hideAllScreens();
    document.getElementById('loginScreen').classList.remove('hidden');
    
    // مسح النموذج
    document.getElementById('loginForm').reset();
}

// إخفاء جميع الشاشات
function hideAllScreens() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('studentWaitingScreen').classList.add('hidden');
    document.getElementById('studentExamScreen').classList.add('hidden');
}

// عرض لوحة تحكم الإدمن
function showAdminDashboard() {
    hideAllScreens();
    document.getElementById('adminDashboard').classList.remove('hidden');
    updateAllDisplays();
    
    // بدء الحفظ التلقائي
    setInterval(() => {
        saveData();
    }, 30000); // كل 30 ثانية
}

// عرض واجهة الطالب
function showStudentInterface(student) {
    appData.currentStudentId = student.id;
    
    // إضافة الطالب للمتصلين
    if (!appData.connectedStudents.find(s => s.id === student.id)) {
        appData.connectedStudents.push({
            id: student.id,
            name: student.name,
            major: student.major,
            subject: student.subject,
            status: 'متصل',
            examStatus: 'في انتظار الموافقة',
            score: null,
            connectionTime: new Date().toLocaleString()
        });
        saveData();
    }
    
    
    // فحص حالة الاختبار
    checkExamStatus(student.id);
}

// فحص حالة الاختبار للطالب
function checkExamStatus(studentId) {
    const connectedStudent = appData.connectedStudents.find(s => s.id === studentId);
    if (connectedStudent) {
        const statusElement = document.getElementById('examStatus');
        if (statusElement) {
            statusElement.textContent = connectedStudent.examStatus;
        }
        
        // إذا تمت الموافقة وبدء الاختبار، انتقل لشاشة الاختبار
        if (connectedStudent.examStatus === 'جاري الاختبار') {
            setTimeout(() => {
                showExamScreen();
            }, 1000);
        }
    }
    
    // فحص دوري لحالة الاختبار
    setTimeout(() => checkExamStatus(studentId), 3000);
}

// التنقل في لوحة الإدمن
function handleNavigation(e) {
    e.preventDefault();
    const contentType = e.target.getAttribute('data-content');
    if (contentType) {
        showContent(contentType);
    }
}

// عرض المحتوى المحدد
function showContent(contentType) {
    // إخفاء جميع أقسام المحتوى
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // عرض القسم المحدد
    const targetContent = document.getElementById(`${contentType}-content`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }
    
    // تحديث التنقل
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-content="${contentType}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // تحديث المحتوى حسب النوع
    switch (contentType) {
        case 'students':
            updateStudentsList();
            updateStudentsTree();
            break;
        case 'questions':
            updateQuestionsList();
            updateSubjectsTree();
            break;
        case 'database':
            updateDatabaseStats();
            break;
        case 'dashboard':
        default:
            updateAdminDashboard();
            break;
    }
}

// تحديث جميع العروض
function updateAllDisplays() {
    updateAdminDashboard();
    updateStudentsList();
    updateQuestionsList();
    updateSubjectsTree();
    updateStudentsTree();
    updateDatabaseStats();
}

// تحديث لوحة تحكم الإدمن
function updateAdminDashboard() {
    // تحديث العدادات
    document.getElementById('studentsCount').textContent = appData.students.length;
    document.getElementById('connectedStudentsCount').textContent = appData.connectedStudents.length;
    document.getElementById('questionsCount').textContent = appData.questions.length;
    
    // تحديث قائمة الطلاب المتصلين
    const connectedStudentsList = document.getElementById('connectedStudentsList');
    if (connectedStudentsList) {
        connectedStudentsList.innerHTML = '';
        
        appData.connectedStudents.forEach(student => {
            const score = student.score || '--';
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${student.id}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${student.name}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${student.major}</td>
                <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(student.examStatus)}">
                        ${student.examStatus}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm font-bold ${getScoreClass(score)}">
                    ${score}
                </td>
            `;
            connectedStudentsList.appendChild(row);
        });
    }
}

// تحديث قائمة الطلاب
function updateStudentsList() {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;
    
    studentsList.innerHTML = '';
    appData.students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${student.id}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.name}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.class || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.major}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${student.password}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        studentsList.appendChild(row);
    });
}

// تحديث الهيكل الشجري للطلاب (الصف → التخصص → المادة)
function updateStudentsTree() {
    const treeContainer = document.getElementById('studentsTree');
    if (!treeContainer) return;
    
    let treeHTML = '';
    
    // تجميع الطلاب حسب الصف ثم التخصص ثم المادة
    const studentsByClassification = {};
    
    appData.students.forEach(student => {
        const className = student.class || 'غير محدد';
        const major = student.major || 'غير محدد';
        const subject = student.subject || 'غير محدد';
        
        if (!studentsByClassification[className]) {
            studentsByClassification[className] = {};
        }
        if (!studentsByClassification[className][major]) {
            studentsByClassification[className][major] = {};
        }
        if (!studentsByClassification[className][major][subject]) {
            studentsByClassification[className][major][subject] = [];
        }
        
        studentsByClassification[className][major][subject].push(student);
    });
    
    Object.keys(studentsByClassification).forEach(className => {
        const classStudentsCount = Object.values(studentsByClassification[className])
            .flatMap(majorData => Object.values(majorData))
            .flatMap(subjectData => subjectData).length;
            
        treeHTML += `
            <div class="tree-item mb-3">
                <div class="tree-toggle flex items-center p-2 bg-blue-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                    <i class="fas fa-chevron-down ml-2"></i>
                    <i class="fas fa-layer-group ml-2"></i>
                    <span class="font-semibold">${className} (${classStudentsCount} طالب)</span>
                </div>
                <div class="tree-content mr-4">
        `;
        
        Object.keys(studentsByClassification[className]).forEach(major => {
            const majorStudentsCount = Object.values(studentsByClassification[className][major])
                .flatMap(subjectData => subjectData).length;
                
            treeHTML += `
                <div class="tree-item mb-2">
                    <div class="tree-toggle flex items-center p-2 bg-green-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                        <i class="fas fa-chevron-down ml-2"></i>
                        <i class="fas fa-graduation-cap ml-2"></i>
                        <span class="font-medium">${major} (${majorStudentsCount} طالب)</span>
                    </div>
                    <div class="tree-content mr-4">
            `;
            
            Object.keys(studentsByClassification[className][major]).forEach(subject => {
                const subjectStudents = studentsByClassification[className][major][subject];
                
                treeHTML += `
                    <div class="tree-item mb-1">
                        <div class="tree-toggle flex items-center p-2 bg-yellow-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                            <i class="fas fa-chevron-down ml-2"></i>
                            <i class="fas fa-book ml-2"></i>
                            <span>${subject} (${subjectStudents.length} طالب)</span>
                        </div>
                        <div class="tree-content mr-4">
                `;
                
                subjectStudents.forEach(student => {
                    treeHTML += `
                        <div class="flex items-center p-2 bg-gray-50 rounded mb-1">
                            <i class="fas fa-user ml-2"></i>
                            <span>${student.name} - ${student.id}</span>
                            <div class="mr-auto">
                                <button onclick="editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 ml-1">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                treeHTML += `
                        </div>
                    </div>
                `;
            });
            
            treeHTML += `
                    </div>
                </div>
            `;
        });
        
        treeHTML += `
                </div>
            </div>
        `;
    });
    
    treeContainer.innerHTML = treeHTML || '<p class="text-gray-500">لا توجد بيانات طلاب</p>';
}

// تحديث قائمة الأسئلة
function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    appData.questions.forEach((question, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${question.subject || 'غير محدد'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.text.substring(0, 50)}...</td>
            <td class="px-4 py-3 text-sm text-gray-700">${getQuestionTypeText(question.type)}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.correctAnswer}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${question.score}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="editQuestion(${index})" class="text-blue-600 hover:text-blue-800 ml-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteQuestion(${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        questionsList.appendChild(row);
    });
}

// تحديث الهيكل الشجري للمواد
function updateSubjectsTree() {
    const treeContainer = document.getElementById('subjectsTree');
    if (!treeContainer) return;
    
    let treeHTML = '';
    
    Object.keys(appData.subjects).forEach(classLevel => {
        treeHTML += `
            <div class="tree-item mb-3">
                <div class="tree-toggle flex items-center p-2 bg-blue-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                    <i class="fas fa-chevron-down ml-2"></i>
                    <i class="fas fa-layer-group ml-2"></i>
                    <span class="font-semibold">${classLevel}</span>
                    <button onclick="editClass('${classLevel}')" class="mr-auto text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="tree-content mr-4">
        `;
        
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            treeHTML += `
                <div class="tree-item mb-2">
                    <div class="tree-toggle flex items-center p-2 bg-green-100 rounded cursor-pointer" onclick="toggleTreeNode(this)">
                        <i class="fas fa-chevron-down ml-2"></i>
                        <i class="fas fa-graduation-cap ml-2"></i>
                        <span class="font-medium">${major}</span>
                        <button onclick="editMajor('${classLevel}', '${major}')" class="mr-auto text-green-600 hover:text-green-800">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="tree-content mr-4">
            `;
            
            appData.subjects[classLevel][major].forEach(subject => {
                treeHTML += `
                    <div class="flex items-center p-2 bg-yellow-50 rounded mb-1">
                        <i class="fas fa-book ml-2"></i>
                        <span>${subject}</span>
                        <button onclick="editSubject('${classLevel}', '${major}', '${subject}')" class="mr-auto text-yellow-600 hover:text-yellow-800">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            });
            
            treeHTML += `
                    </div>
                </div>
            `;
        });
        
        treeHTML += `
                </div>
            </div>
        `;
    });
    
    treeContainer.innerHTML = treeHTML;
}

// تحديث إحصائيات قاعدة البيانات
function updateDatabaseStats() {
    document.getElementById('totalStudentsStats').textContent = appData.students.length;
    document.getElementById('totalQuestionsStats').textContent = appData.questions.length;
    
    let subjectsCount = 0;
    Object.keys(appData.subjects).forEach(classLevel => {
        Object.keys(appData.subjects[classLevel]).forEach(major => {
            subjectsCount += appData.subjects[classLevel][major].length;
        });
    });
    document.getElementById('totalSubjectsStats').textContent = subjectsCount;
    document.getElementById('totalResultsStats').textContent = (appData.examResults || []).length;
}

// الوظائف المساعدة للحصول على فئات CSS
function getStatusClass(status) {
    switch (status) {
        case 'في انتظار الموافقة':
            return 'bg-yellow-100 text-yellow-800';
        case 'جاري الاختبار':
            return 'bg-blue-100 text-blue-800';
        case 'مكتمل':
            return 'bg-green-100 text-green-800';
        case 'تمت الموافقة':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getScoreClass(score) {
    if (score === '--' || score === null) return 'text-gray-600';
    const numScore = parseInt(score);
    if (numScore >= 80) return 'text-green-600';
    if (numScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

function getQuestionTypeText(type) {
    switch (type) {
        case 'multiple_choice':
            return 'اختيار من متعدد';
        case 'multiple_select':
            return 'اختيار متعدد';
        case 'essay':
            return 'مقالي';
        default:
            return 'غير محدد';
    }
}

// النوافذ المنبثقة
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal').classList.add('hidden');
    currentModalType = '';
    editingIndex = -1;
}

function handleModalOutsideClick(e) {
    if (e.target === document.getElementById('modal')) {
        hideModal();
    }
}

// عرض نافذة إضافة طالب
function showAddStudentModal() {
    currentModalType = 'student';
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">رقم الجلوس</label>
                <input type="text" id="studentId" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">اسم الطالب</label>
                <input type="text" id="studentName" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">الصف</label>
                <select id="studentClass" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    ${Object.keys(appData.subjects).map(classLevel => `<option value="${classLevel}">${classLevel}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">التخصص</label>
                <select id="studentMajor" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">اختر التخصص</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">المادة</label>
                <select id="studentSubject" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">اختر المادة</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">كلمة المرور (5 أرقام)</label>
                <input type="text" id="studentPassword" pattern="[0-9]{5}" maxlength="5" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
        </div>
    `;
    showModal('إضافة طالب جديد', content);
    
    // تحديث المواد عند تغيير التخصص أو الصف
    setTimeout(() => {
        document.getElementById('studentClass').addEventListener('change', updateStudentSubjects);
        document.getElementById('studentMajor').addEventListener('change', updateStudentSubjects);
        updateStudentSubjects();
    }, 100);
}

// تحديث قائمة التخصصات والمواد في نافذة الطالب
function updateStudentSubjects() {
    const classSelect = document.getElementById('studentClass');
    const majorSelect = document.getElementById('studentMajor');
    const subjectSelect = document.getElementById('studentSubject');
    
    if (!classSelect || !majorSelect || !subjectSelect) return;
    
    const selectedClass = classSelect.value;
    
    // تحديث التخصصات
    majorSelect.innerHTML = '<option value="">اختر التخصص</option>';
    if (selectedClass && appData.subjects[selectedClass]) {
        Object.keys(appData.subjects[selectedClass]).forEach(major => {
            const option = document.createElement('option');
            option.value = major;
            option.textContent = major;
            majorSelect.appendChild(option);
        });
    }
    
    // تحديث المواد
    const selectedMajor = majorSelect.value;
    subjectSelect.innerHTML = '<option value="">اختر المادة</option>';
    
    if (selectedClass && selectedMajor && appData.subjects[selectedClass] && appData.subjects[selectedClass][selectedMajor]) {
        appData.subjects[selectedClass][selectedMajor].forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }
}