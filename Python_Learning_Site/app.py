import os
from urllib.parse import urlencode
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for, abort
from dotenv import load_dotenv
from course_locale import lesson_word, russian_levels

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
            {"title": "Python деген не?", "url": "/python", "keywords": "python бағдарлама синтаксис бастау"},
            {"title": "Print командасы", "url": "/print", "keywords": "print sep end шығару нәтиже"},
            {"title": "Айнымалылар", "url": "/variables", "keywords": "int float str bool input айнымалы дерек түрі"},
        ],
    },
    {
        "title": "2-деңгей. Алгоритмдер",
        "short": "Алгоритмдер",
        "desc": "Блок-схема, if/elif/else, логикалық операторлар, for/while",
        "icon": "🔀",
        "color": "#3b82f6",
        "lessons": [
            {"title": "Блок-схема (FlowRun)", "url": "/flowchart", "keywords": "flowrun flowchart блок схема алгоритм"},
            {"title": "Шарттар", "url": "/conditions", "keywords": "if elif else and or not шарт салыстыру"},
            {"title": "Циклдер", "url": "/loops", "keywords": "for while range цикл қайталау"},
        ],
    },
    {
        "title": "3-деңгей. Деректермен жұмыс",
        "short": "Деректермен жұмыс",
        "desc": "Жолдар, тізімдер, матрицалар, сұрыптау, сөздіктер",
        "icon": "🗂️",
        "color": "#eab308",
        "lessons": [
            {"title": "Мәтіндік жолдар", "url": "/strings", "keywords": "str string split strip upper lower мәтін индекс кесінді"},
            {"title": "Форматтау (f-strings)", "url": "/formatting", "keywords": "f-string f-strings format дәлдік пішімдеу"},
            {"title": "Бірөлшемді массив", "url": "/arrays1", "keywords": "list тізім индекс len массив"},
            {"title": "Екіөлшемді массив", "url": "/arrays2", "keywords": "list matrix матрица жол баған индекс"},
            {"title": "Элемент қосу/жою", "url": "/add_remove", "keywords": "list append insert pop remove del тізім"},
            {"title": "Сұрыптау", "url": "/sorting", "keywords": "list sort sorted reverse сұрыптау"},
        ],
    },
    {
        "title": "4-деңгей. Бағдарлама құрастыру",
        "short": "Бағдарлама құрастыру",
        "desc": "Функциялар, кітапханалар, қателерді өңдеу, файлдар",
        "icon": "🧩",
        "color": "#f97316",
        "lessons": [
            {"title": "Функциялар", "url": "/functions", "keywords": "len sum min max abs round функция"},
            {"title": "Өз функцияларың (def)", "url": "/custom-functions", "keywords": "def return параметр аргумент функция"},
        ],
    },
    {
        "title": "5-деңгей. Жобалық жұмыс",
        "short": "Жобалық жұмыс",
        "desc": "Калькулятор, ойын, деректерді талдау және бақ жоспары",
        "icon": "🎓",
        "color": "#8b5cf6",
        "lessons": [
            {"title": "Жеңілдік калькуляторы", "url": "/discount-calculator", "keywords": "пайыз баға жеңілдік есептеу жоба"},
            {"title": "Санды тап ойыны", "url": "/guess-number", "keywords": "randint random while ойын жоба"},
            {"title": "Ауа райы деректерін талдау", "url": "/weather-analysis", "keywords": "min max sum mean график температура дерек жоба"},
            {"title": "Координаталар және циклдер", "url": "/coordinate-practice", "keywords": "for range тор фигура бақ жоспар координата жоба"},
        ],
    },
]


RUSSIAN_COURSE = russian_levels(LEVELS)
LANG_COOKIE = "pls_language"


def language():
    return "ru" if request.cookies.get(LANG_COOKIE) == "ru" else "kk"


def text(kk, ru):
    return ru if language() == "ru" else kk


def language_url(choice=None):
    path = url_for(request.endpoint, **(request.view_args or {}))
    params = [(k, v) for k, v in request.args.items(multi=True) if k != "lang"]
    if choice:
        params.append(("lang", choice))
    return path + ("?" + urlencode(params) if params else "")


@app.before_request
def switch_language():
    choice = request.args.get("lang")
    if (request.method == "GET" and choice in ("kk", "ru") and request.endpoint
            and request.endpoint not in ("static", "ask_ai")):
        response = redirect(language_url(), code=303)
        response.set_cookie(LANG_COOKIE, choice, max_age=31536000, httponly=True,
                            secure=request.is_secure, samesite="Lax")
        response.cache_control.no_store = True
        return response


@app.after_request
def language_headers(response):
    if request.endpoint and request.endpoint != "static":
        response.headers["Content-Language"] = language()
        response.vary.add("Cookie")
        response.cache_control.private = True
    return response


@app.context_processor
def inject_levels():
    return {"levels": RUSSIAN_COURSE if language() == "ru" else LEVELS,
            "language": language(), "text": text, "language_url": language_url,
            "lesson_word": lesson_word}


def course_page(name):
    templates = [f"ru/{name}", name] if language() == "ru" else name
    return render_template(templates)


# --- Главная страница: шапка, о сайте, уровни и прогресс ---
@app.route("/")
def home():
    return course_page("index.html")


# --- Маршруты обучающих страниц ---
@app.route("/practice")
def practice():
    return course_page("practice_hub.html")


@app.route("/daily")
def daily():
    return render_template("daily.html")


def arcade_games():
    return {
        "bugs": (text("Қатені тап", "Охота на баги"), text("Кодтағы қатені түзетіп, ойын алаңындағы қозғалысты қалпына келтіріңіз.", "Исправьте код и посмотрите, как оживает игровое поле.")),
        "predict": (text("Нәтижені болжа", "Предскажи результат"), text("Кодты ойша орындап, төрт жауаптың бірін таңдаңыз.", "Выполните код в уме и выберите один из четырёх ответов.")),
        "build": (text("Бағдарламаны құрастыр", "Собери программу"), text("Блоктарды ретімен орналастырып, олардан Python бағдарламасын жинаңыз.", "Перетаскивайте блоки и собирайте из них программу на Python.")),
        "translate": (text("Шартты Python тіліне аудар", "С человеческого на Python"), text("Мәтіндік шарт бойынша код жазыңыз. Оны мысалдармен тексереміз.", "Превратите условие из нескольких фраз в код и проверьте его на примерах.")),
    }


@app.get("/games")
def games():
    return render_template("games.html", games=arcade_games())


@app.get("/games/<game>")
def mini_game(game):
    catalog = arcade_games()
    if game not in catalog:
        abort(404)
    return render_template("mini_game.html", game=game, title=catalog[game][0])


@app.get("/profile")
def profile():
    return render_template("profile.html")


@app.route("/python")
def python_page():
    return course_page("python.html")

@app.route("/print")
def print_page():
    return course_page("print.html")

@app.route("/variables")
def variables():
    return course_page("variables.html")

@app.route("/conditions")
def conditions():
    return course_page("conditions.html")

@app.route("/functions")
def functions():
    return course_page("functions.html")

@app.route("/custom-functions")
def custom_functions():
    return course_page("custom_functions.html")

@app.route("/sorting")
def sorting():
    return course_page("sorting.html")

@app.route("/arrays1")
def arrays1():
    return course_page("arrays1.html")

@app.route("/arrays2")
def arrays2():
    return course_page("arrays2.html")

@app.route("/add_remove")
def add_remove():
    return course_page("add_remove.html")

@app.route("/loops")
def loops():
    return course_page("loops.html")

@app.route("/strings")
def strings_page():
    return course_page("strings.html")

@app.route("/formatting")
def formatting_page():
    return course_page("formatting.html")

@app.route("/flowchart")
def flowchart():
    return course_page("flowchart.html")


@app.route("/discount-calculator")
def discount_calculator():
    return course_page("discount_calculator.html")


@app.route("/guess-number")
def guess_number():
    return course_page("guess_number.html")


@app.route("/weather-analysis")
def weather_analysis():
    return course_page("weather_analysis.html")


@app.route("/coordinate-practice")
def coordinate_practice():
    return course_page("coordinate_practice.html")


# --- МАРШРУТ: Прием вопросов к ИИ ---
@app.route("/api/chat", methods=["POST"])
def ask_ai():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": text("Сұрағыңызды жазыңыз.", "Введите вопрос.")}), 400

    if not OPENROUTER_API_KEY:
        return jsonify({"response": text("Көмекші әзірге қолжетімсіз.", "Помощник пока недоступен.")}), 500

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
                        "content": "Ты преподаватель Python. Давай понятные краткие объяснения и примеры кода. "
                                   + text("Язык курса — казахский.", "Язык курса — русский.")
                                   + " Отвечай на языке вопроса или на явно запрошенном языке. "
                                     "Если вопрос состоит только из кода, используй язык курса."
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
            return jsonify({"response": text("Көмекші жауап бере алмады. Қайта көріңіз.",
                                             "Помощнику не удалось ответить. Попробуйте ещё раз.")})
        else:
            return jsonify({"response": text("Көмекші жауап дайындай алмады.", "Помощнику не удалось подготовить ответ.")})

    except Exception as e:
        print(f"❌ Ошибка при отправке запроса: {e}")
        return jsonify({"response": text("Көмекшіге қосылу мүмкін болмады.", "Не удалось подключиться к помощнику.")}), 500

if __name__ == "__main__":
    app.run(debug=True)
