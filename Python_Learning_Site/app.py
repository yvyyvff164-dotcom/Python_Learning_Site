import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Загружаем переменные окружения (нужно для локальной разработки)
load_dotenv()

# БЕЗОПАСНОСТЬ: ключ берётся только из переменных окружения хостинга.
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Явно привязываем Flask к путям проекта (нужно для Vercel)
current_dir = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(current_dir, 'templates'),
    static_folder=os.path.join(current_dir, 'static'),
    static_url_path='/static'
)


# --- Деңгейлер мен сабақтар ---
LEVELS = [
    {
        "title": "1-деңгей. Python негіздері",
        "short": "Python негіздері",
        "desc": "print, input, айнымалылар, деректер типтері, арифметика",
        "icon": "📖",
        "color": "#22c55e",
        "lessons": [
            {"title": "Python деген не?", "url": "/python"},
            {"title": "Print командасы", "url": "/print"},
            {"title": "Айнымалылар", "url": "/variables"},
        ],
    },
    {
        "title": "2-деңгей. Алгоритмдер",
        "short": "Алгоритмдер",
        "desc": "Блок-схема, if/elif/else, логикалық операторлар, for/while",
        "icon": "🔀",
        "color": "#3b82f6",
        "lessons": [
            {"title": "Блок-схема (FlowRun)", "url": "/flowchart"},
            {"title": "Шарттар", "url": "/conditions"},
            {"title": "Циклдер", "url": "/loops"},
        ],
    },
    {
        "title": "3-деңгей. Деректермен жұмыс",
        "short": "Деректермен жұмыс",
        "desc": "Жолдар, тізімдер, матрицалар, сұрыптау, сөздіктер",
        "icon": "🗂️",
        "color": "#eab308",
        "lessons": [
            {"title": "Мәтіндік жолдар", "url": "/strings"},
            {"title": "Форматтау (f-strings)", "url": "/formatting"},
            {"title": "Бірөлшемді массив", "url": "/arrays1"},
            {"title": "Екіөлшемді массив", "url": "/arrays2"},
            {"title": "Элемент қосу/жою", "url": "/add_remove"},
            {"title": "Сұрыптау", "url": "/sorting"},
        ],
    },
    {
        "title": "4-деңгей. Бағдарлама құрастыру",
        "short": "Бағдарлама құрастыру",
        "desc": "Функциялар, кітапханалар, қателерді өңдеу, файлдар",
        "icon": "🧩",
        "color": "#f97316",
        "lessons": [
            {"title": "Функциялар", "url": "/functions"},
            {"title": "Өз функцияларың (def)", "url": "/custom-functions"},
        ],
    },
    {
        "title": "5-деңгей. Жобалық жұмыс",
        "short": "Жобалық жұмыс",
        "desc": "Ойындар, калькулятор, деректерді талдау, қорытынды жоба",
        "icon": "🎓",
        "color": "#8b5cf6",
        "lessons": [],
    },
]


# Делает `levels` доступной в ЛЮБОМ шаблоне (index.html, base.html и т.д.)
@app.context_processor
def inject_levels():
    return {"levels": LEVELS}


# --- Главная страница: шапка, о сайте, уровни и прогресс ---
@app.route("/")
def home():
    return render_template("index.html")


# --- Маршруты обучающих страниц ---
@app.route("/python")
def python_page():
    return render_template("python.html")

@app.route("/print")
def print_page():
    return render_template("print.html")

@app.route("/variables")
def variables():
    return render_template("variables.html")

@app.route("/conditions")
def conditions():
    return render_template("conditions.html")

@app.route("/functions")
def functions():
    return render_template("functions.html")

@app.route("/custom-functions")
def custom_functions():
    return render_template("custom_functions.html")

@app.route("/sorting")
def sorting():
    return render_template("sorting.html")

@app.route("/arrays1")
def arrays1():
    return render_template("arrays1.html")

@app.route("/arrays2")
def arrays2():
    return render_template("arrays2.html")

@app.route("/add_remove")
def add_remove():
    return render_template("add_remove.html")

@app.route("/loops")
def loops():
    return render_template("loops.html")

@app.route("/strings")
def strings_page():
    return render_template("strings.html")

@app.route("/formatting")
def formatting_page():
    return render_template("formatting.html")

@app.route("/flowchart")
def flowchart():
    return render_template("flowchart.html")


# --- МАРШРУТ: Прием вопросов к ИИ ---
@app.route("/api/chat", methods=["POST"])
def ask_ai():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Пустой запрос"}), 400

    if not OPENROUTER_API_KEY:
        return jsonify({"response": "Ошибка: Ключ API не настроен в Environment Variables на Vercel"}), 500

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.5-flash",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "system",
                        "content": "Ты ментор и учитель по Python на образовательном сайте. Отвечай кратко, понятным языком, давай примеры кода. Отвечай на том языке, на котором пишет пользователь."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            },
            timeout=9  # лимит бесплатных функций Vercel
        )

        result = response.json()

        if "choices" in result and len(result["choices"]) > 0:
            ai_reply = result["choices"][0]["message"]["content"]
            return jsonify({"response": ai_reply})
        elif "error" in result:
            error_msg = result["error"].get("message", "Неизвестная ошибка")
            print(f"❌ Ошибка OpenRouter API: {error_msg}")
            return jsonify({"response": f"Ошибка ИИ: {error_msg}"})
        else:
            return jsonify({"response": "ИИ не смог сформировать ответ."})

    except Exception as e:
        print(f"❌ Ошибка при отправке запроса: {e}")
        return jsonify({"response": f"Ошибка соединения с ИИ: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
