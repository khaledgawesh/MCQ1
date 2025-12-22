import json

DATA_FILE = 'data.json'

def load_data():
    """Loads data from the JSON file."""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"grades": [], "students": [], "attendance": []}

def save_data(data):
    """Saves data to the JSON file."""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def add_student(grade_id, student_name):
    """Adds a new student to a specific grade."""
    data = load_data()

    # Check if grade exists
    if not any(g['id'] == grade_id for g in data['grades']):
        print(f"Error: Grade with ID {grade_id} not found.")
        return

    student = {
        "id": len(data['students']) + 1,
        "name": student_name,
        "grade_id": grade_id
    }
    data['students'].append(student)
    save_data(data)
    print(f"Student '{student_name}' added successfully to grade {grade_id}.")

def add_subject_to_grade(grade_id, subject_name):
    """Adds a new subject to a specific grade."""
    data = load_data()

    grade_found = False
    for grade in data['grades']:
        if grade['id'] == grade_id:
            grade_found = True
            # Check if subject already exists
            if subject_name in grade['subjects']:
                print(f"Error: Subject '{subject_name}' already exists in this grade.")
                return

            grade['subjects'].append(subject_name)
            save_data(data)
            print(f"Subject '{subject_name}' added successfully to grade {grade_id}.")
            break

    if not grade_found:
        print(f"Error: Grade with ID {grade_id} not found.")

def get_student_by_id(student_id):
    """Finds a student by their ID."""
    data = load_data()
    for student in data['students']:
        if student['id'] == student_id:
            return student
    return None

def record_attendance(student_id, subject_name, date, status):
    """Records attendance for a student."""
    data = load_data()

    # Validate student exists
    student = get_student_by_id(student_id)
    if not student:
        print(f"Error: Student with ID {student_id} not found.")
        return

    # Validate status
    if status not in ['present', 'absent']:
        print("Error: Invalid status. Must be 'present' or 'absent'.")
        return

    attendance_record = {
        "student_id": student_id,
        "subject": subject_name,
        "date": date,
        "status": status
    }

    data['attendance'].append(attendance_record)
    save_data(data)
    print(f"Attendance recorded for student {student_id} in '{subject_name}' as '{status}'.")

def calculate_absence_report():
    """Calculates absence statistics for each student."""
    data = load_data()
    report = []

    for student in data['students']:
        student_report = {
            "student_id": student['id'],
            "student_name": student['name'],
            "grade_id": student['grade_id'],
            "subjects": []
        }

        # Find the grade and its subjects
        grade_info = next((g for g in data['grades'] if g['id'] == student['grade_id']), None)
        if not grade_info:
            continue

        for subject in grade_info['subjects']:
            # Get all attendance records for this student and subject
            all_records = [
                r for r in data['attendance']
                if r['student_id'] == student['id'] and r['subject'] == subject
            ]

            total_classes = len(all_records)
            if total_classes == 0:
                continue

            absent_count = len([r for r in all_records if r['status'] == 'absent'])
            absence_percentage = (absent_count / total_classes) * 100 if total_classes > 0 else 0

            # Determine student status based on absence percentage
            status = "مسموح"
            if absence_percentage >= 25:
                status = "محروم"
            elif absence_percentage >= 20:
                status = "تحذير أول"

            subject_stats = {
                "subject_name": subject,
                "total_classes": total_classes,
                "absent_count": absent_count,
                "absence_percentage": round(absence_percentage, 2),
                "status": status
            }
            student_report['subjects'].append(subject_stats)

        if student_report['subjects']:
            report.append(student_report)

    return report

import csv

def generate_csv_report(report_data):
    """Generates a CSV file from the report data."""
    if not report_data:
        print("No data to generate report.")
        return

    with open('report.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
        fieldnames = [
            'اسم الطالب', 'المادة', 'عدد الحصص',
            'الغياب', 'النسبة', 'الحالة'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for student_report in report_data:
            for subject in student_report['subjects']:
                writer.writerow({
                    'اسم الطالب': student_report['student_name'],
                    'المادة': subject['subject_name'],
                    'عدد الحصص': subject['total_classes'],
                    'الغياب': subject['absent_count'],
                    'النسبة': f"{subject['absence_percentage']}%",
                    'الحالة': subject['status']
                })
    print("\nReport 'report.csv' generated successfully.")


def display_students():
    """Displays a list of all students."""
    data = load_data()
    print("\n--- قائمة الطلاب ---")
    if not data['students']:
        print("لا يوجد طلاب مسجلون.")
        return
    for student in data['students']:
        print(f"  ID: {student['id']}, الاسم: {student['name']}, الصف ID: {student['grade_id']}")

def main_menu():
    """Displays the main menu and handles user interaction."""
    # Initialize data file if it's empty
    initial_data = load_data()
    if not initial_data['grades']:
        initial_data['grades'] = [
            {"id": 1, "name": "الصف الأول", "subjects": []},
            {"id": 2, "name": "الصف الثاني", "subjects": []},
            {"id": 3, "name": "الصف الثالث", "subjects": []},
            {"id": 4, "name": "الصف الرابع", "subjects": []}
        ]
        save_data(initial_data)

    while True:
        print("\n--- القائمة الرئيسية ---")
        print("1. إضافة طالب جديد")
        print("2. إضافة مادة إلى صف")
        print("3. تسجيل الحضور والغياب")
        print("4. عرض الطلاب المسجلين")
        print("5. توليد تقرير الغياب (CSV)")
        print("6. الخروج")

        choice = input("اختر رقم العملية: ")

        if choice == '1':
            grade_id = int(input("أدخل ID الصف (1-4): "))
            student_name = input("أدخل اسم الطالب: ")
            add_student(grade_id, student_name)
        elif choice == '2':
            grade_id = int(input("أدخل ID الصف (1-4): "))
            subject_name = input("أدخل اسم المادة: ")
            add_subject_to_grade(grade_id, subject_name)
        elif choice == '3':
            student_id = int(input("أدخل ID الطالب: "))
            subject_name = input("أدخل اسم المادة: ")
            date = input("أدخل التاريخ (YYYY-MM-DD): ")
            status = input("أدخل الحالة (present/absent): ").lower()
            record_attendance(student_id, subject_name, date, status)
        elif choice == '4':
            display_students()
        elif choice == '5':
            report_data = calculate_absence_report()
            generate_csv_report(report_data)
        elif choice == '6':
            print("تم الخروج من البرنامج.")
            break
        else:
            print("خيار غير صحيح، يرجى المحاولة مرة أخرى.")

def run_test_scenario():
    """Runs a full test scenario to verify all functionalities."""
    print("--- بدء سيناريو الاختبار ---")

    # 1. تنظيف البيانات
    print("\n1. تنظيف البيانات...")
    save_data({
        "grades": [
            {"id": 1, "name": "الصف الأول", "subjects": []},
            {"id": 2, "name": "الصف الثاني", "subjects": []},
            {"id": 3, "name": "الصف الثالث", "subjects": []},
            {"id": 4, "name": "الصف الرابع", "subjects": []}
        ],
        "students": [],
        "attendance": []
    })
    print("تم تنظيف البيانات بنجاح.")

    # 2. إضافة بيانات تجريبية
    print("\n2. إضافة مواد وطلاب...")
    add_subject_to_grade(2, "الكيمياء")
    add_subject_to_grade(2, "الأحياء")
    add_student(2, "خالد") # ID will be 1
    add_student(2, "مريم") # ID will be 2
    print("تمت إضافة المواد والطلاب.")

    # 3. تسجيل حضور وغياب
    print("\n3. تسجيل الحضور والغياب...")
    # خالد - الكيمياء (1 غياب من 5) -> 20% -> تحذير أول
    record_attendance(1, "الكيمياء", "2023-11-01", "present")
    record_attendance(1, "الكيمياء", "2023-11-03", "present")
    record_attendance(1, "الكيمياء", "2023-11-05", "absent")
    record_attendance(1, "الكيمياء", "2023-11-07", "present")
    record_attendance(1, "الكيمياء", "2023-11-09", "present")
    # خالد - الأحياء (حضور كامل)
    record_attendance(1, "الأحياء", "2023-11-02", "present")

    # مريم - الكيمياء (1 غياب من 4) -> 25% -> محروم
    record_attendance(2, "الكيمياء", "2023-11-01", "present")
    record_attendance(2, "الكيمياء", "2023-11-03", "absent")
    record_attendance(2, "الكيمياء", "2023-11-05", "present")
    record_attendance(2, "الكيمياء", "2023-11-07", "present")
    # مريم - الأحياء (حضور كامل)
    record_attendance(2, "الأحياء", "2023-11-02", "present")
    print("تم تسجيل الحضور والغياب.")

    # 4. توليد التقرير
    print("\n4. توليد التقرير...")
    report_data = calculate_absence_report()
    generate_csv_report(report_data)

    print("\n--- اكتمل سيناريو الاختبار بنجاح ---")
    print("يمكنك الآن استخدام القائمة الرئيسية أو الخروج.")


if __name__ == "__main__":
    # The program starts by showing the main menu.
    main_menu()