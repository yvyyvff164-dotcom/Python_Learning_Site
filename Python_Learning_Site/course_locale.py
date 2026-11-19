"""Russian titles and search terms, keyed by the course's stable lesson URLs."""

LEVELS_RU = {
    "Python негіздері": ("Основы Python", "print, input, переменные, типы данных и арифметика"),
    "Алгоритмдер": ("Алгоритмы", "Блок-схемы, if/elif/else, логические операторы и циклы for/while"),
    "Деректермен жұмыс": ("Работа с данными", "Строки, списки, матрицы, сортировка и словари"),
    "Бағдарлама құрастыру": ("Разработка программ", "Функции, библиотеки, обработка ошибок и файлы"),
    "Жобалық жұмыс": ("Проектная работа", "Калькулятор, игра, анализ данных и план сада"),
}

LESSONS_RU = {
    "/python": ("Что такое Python?", "python программа синтаксис начало программирование"),
    "/print": ("Команда print", "print sep end вывод результат печать экран"),
    "/variables": ("Переменные", "int float str bool input переменная типы данных ввод"),
    "/flowchart": ("Блок-схемы (FlowRun)", "flowrun flowchart блок схема алгоритм конструктор"),
    "/conditions": ("Условия", "if elif else and or not условие сравнение ветвление"),
    "/loops": ("Циклы", "for while range цикл повторение"),
    "/strings": ("Строки", "str string split strip upper lower текст индекс срез"),
    "/formatting": ("Форматирование строк", "f-string f-strings f-строки format точность форматирование"),
    "/arrays1": ("Одномерные массивы", "list список индекс len массив"),
    "/arrays2": ("Двумерные массивы", "list matrix матрица строка столбец индекс"),
    "/add_remove": ("Добавление и удаление элементов", "list append insert pop remove del список"),
    "/sorting": ("Сортировка", "list sort sorted reverse сортировка порядок"),
    "/functions": ("Функции", "len sum min max abs round функция функции"),
    "/custom-functions": ("Свои функции с def", "def return параметр аргумент функция"),
    "/discount-calculator": ("Калькулятор скидок", "процент цена скидка расчёт проект покупки"),
    "/guess-number": ("Игра «Угадай число»", "randint random while игра число проект"),
    "/weather-analysis": ("Анализ данных о погоде", "min max sum mean график температура данные проект погода"),
    "/coordinate-practice": ("Координаты и циклы", "for range сетка фигура сад план координаты проект"),
}


def lesson_word(count):
    if count % 10 == 1 and count % 100 != 11:
        return "урок"
    if 2 <= count % 10 <= 4 and not 12 <= count % 100 <= 14:
        return "урока"
    return "уроков"


def russian_levels(levels):
    translated = []
    for number, level in enumerate(levels, start=1):
        name, description = LEVELS_RU.get(level["short"], (level["short"], level["desc"]))
        lessons = []
        for lesson in level["lessons"]:
            title, keywords = LESSONS_RU.get(lesson["url"], (lesson["title"], lesson.get("keywords", "")))
            lessons.append({**lesson, "title": title, "keywords": keywords})
        translated.append({
            **level, "title": f"Уровень {number}. {name}", "short": name,
            "desc": description, "lessons": lessons,
        })
    return translated
