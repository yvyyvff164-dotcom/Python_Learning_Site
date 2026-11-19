// Each calendar day has one reproducible exercise per course level in both languages.
export function dailyTasks(day) {
    const t = window.courseText;
    const task = (title, prompt, code, answer, explanation, url) => ({title, prompt, code, answer: String(answer), explanation, url});
    const result = t('Экранға қандай сан шығады?', 'Какое число появится на экране?');
    function number(salt, min, max) {
        let seed = Math.imul(day ^ Math.imul(salt, 2654435761), 2246822507);
        seed = Math.imul(seed ^ (seed >>> 13), 3266489909);
        return min + ((seed ^ (seed >>> 16)) >>> 0) % (max - min + 1);
    }
    const a = number(1, 3, 11), b = number(2, 2, 7), n = number(3, 3, 8);
    const price = 100 * number(4, 4, 18), discount = 5 * number(5, 2, 6);
    const temp = [a, -b, n, 0, a - b, b - n];
    const list = arr => '[' + arr.join(', ') + ']';
    const packs = number(6, 2, 6), extra = number(7, 1, 6);
    const word = ['Python', 'coding', 'script', 'module'][number(8, 0, 3)];
    const cut = number(9, 1, 3);
    const levels = [
        [
            () => task(t('Себеттегі дәптерлер', 'Тетради в корзине'), result,
                `packs = ${packs}\nper_pack = ${b}\nprint(packs * per_pack + ${extra})`, packs * b + extra,
                t('Алдымен бумалардағы дәптер санын есептеп, жеке дәптерлерді қосамыз.', 'Сначала умножаем число пачек на их размер, затем прибавляем отдельные тетради.'), '/variables'),
            () => task(t('Мәтіннен санға', 'Из строки в число'), result,
                `count = "${a}"\nprint(int(count) + ${b})`, a + b,
                t('int() мәтінді бүтін санға айналдырады. Содан кейін екі сан қосылады.', 'int() превращает строку в целое число. После этого Python складывает два числа.'), '/variables'),
            () => task(t('Қанша орын қалады?', 'Сколько мест останется?'), result,
                `seats = ${a * b + extra}\nused = ${a} * ${b}\nprint(seats - used)`, extra,
                t('Бос орын саны барлық орын мен алынған орын санының айырмасына тең.', 'Из общего количества мест вычитаем число занятых мест.'), '/print')
        ],
        [
            () => task(t('Цикл қадамы', 'Шаг цикла'), result,
                `total = 0\nfor i in range(1, ${2*n}, 2):\n    total += i\nprint(total)`, n*n,
                t(`Цикл 1-ден ${2*n-1}-ге дейінгі тақ сандарды қосады.`, `Цикл складывает нечётные числа от 1 до ${2*n-1} включительно.`), '/loops'),
            () => task(t('Цикл қай кезде тоқтайды?', 'Когда остановится цикл?'), result,
                `steps = 0\nvalue = ${n*b+1}\nwhile value > 0:\n    value -= ${b}\n    steps += 1\nprint(steps)`, n+1,
                t(`Алғашқы ${n} қадамнан кейін 1 қалады. Цикл тағы бір рет орындалады.`, `Через ${n} шагов останется 1. Цикл выполнится ещё один раз.`), '/loops'),
            () => task(t('Шарттың шекарасы', 'Граница условия'), result,
                `score = ${a}\nif score > ${a}:\n    score += 10\nelse:\n    score += ${b}\nprint(score)`, a+b,
                t('Мәндер тең болғандықтан, > шарты орындалмайды. else тармағы іске қосылады.', 'Значения равны, поэтому строгое условие > ложно. Выполняется ветка else.'), '/conditions')
        ],
        [
            () => task(t('Жолдың кесіндісі', 'Срез строки'), t('Экранға шығатын мәтінді тырнақшасыз жазыңыз.', 'Введите текст, который появится на экране, без кавычек.'),
                `word = "${word}"\nprint(word[${cut}:${cut+2}])`, word.slice(cut,cut+2),
                t('Сол жақ индекс кіреді, оң жақ индекс кірмейді. Таңдалған бөлікте екі таңба бар.', 'Левая граница входит в срез, правая не входит. В срезе два символа.'), '/strings'),
            () => task(t('Тізімдегі орын', 'Позиция в списке'), result,
                `scores = [${a}, ${n}, ${b}]\nscores.insert(1, ${extra})\nprint(scores[2])`, n,
                t('Жаңа элемент 1-индекске қойылады. Бұрын сол орында тұрған элемент 2-индекске жылжиды.', 'Вставка по индексу 1 сдвигает прежний элемент на позицию с индексом 2.'), '/add_remove'),
            () => task(t('Матрицаның бағаны', 'Столбец матрицы'), result,
                `grid = [[${a}, ${b}], [${extra}, ${n}]]\nprint(grid[0][1] + grid[1][1])`, b+n,
                t('Баған индексі 1. Әр жолдың екінші элементтерін қосыңыз.', 'Индекс столбца равен 1. Складываем вторые элементы обеих строк.'), '/arrays2')
        ],
        [
            () => task(t('Әдепкі аргумент', 'Аргумент по умолчанию'), result,
                `def scale(x, factor=${b}):\n    return x * factor\n\nprint(scale(${a}) - scale(1, ${extra}))`, a*b-extra,
                t('Бірінші шақыру әдепкі көбейткішті, екіншісі көрсетілген көбейткішті қолданады.', 'Первый вызов использует множитель по умолчанию, второй — указанный явно.'), '/custom-functions'),
            () => task(t('Функцияны екі рет шақыру', 'Два вызова функции'), result,
                `def advance(x):\n    return x + ${b}\n\nprint(advance(advance(${n})))`, n+2*b,
                t('Ішкі шақырудың нәтижесі сыртқы шақыруға беріледі. Қадам екі рет қосылады.', 'Результат внутреннего вызова становится аргументом внешнего. Шаг прибавляется дважды.'), '/custom-functions'),
            () => task(t('Ең кіші мәнді алып тастау', 'Сумма без минимума'), result,
                `def adjusted(values):\n    return sum(values) - min(values)\n\nprint(adjusted([${a}, ${b}, ${n}]))`, a+b+n-Math.min(a,b,n),
                t('Функция барлық мәндерді қосып, ең кіші мәнді бір рет шегереді.', 'Функция складывает все элементы и вычитает наименьший ровно один раз.'), '/functions')
        ],
        [
            () => task(t('Жобалық есеп · Жеңілдік', 'Мини-проект · Скидка'), t('Клиент қанша теңге төлейді? Жауапты санмен жазыңыз.', 'Сколько тенге заплатит покупатель? Введите число.'),
                `price = ${price}\nquantity = ${packs}\npercent = ${discount}\nsubtotal = price * quantity\nprint(subtotal - subtotal * percent // 100)`, price*packs*(100-discount)/100,
                t('Жеңілдік тауарлардың жалпы бағасынан есептеледі. Соны бастапқы сомадан шегереміз.', 'Берём процент от стоимости всей покупки и вычитаем скидку из исходной суммы.'), '/discount-calculator'),
            () => task(t('Жобалық есеп · Ауа райы', 'Мини-проект · Метеостанция'), t('Станция неше жылы күн тіркеді?', 'Сколько тёплых дней насчитала станция?'),
                `temperatures = ${list(temp)}\nwarm = 0\nfor value in temperatures:\n    if value > 0:\n        warm += 1\nprint(warm)`, temp.filter(v=>v>0).length,
                t('Нөлден қатаң үлкен мәндерді ғана санаңыз. Нөл есепке алынбайды.', 'Считаем только температуры строго выше нуля. Ноль в счётчик не попадает.'), '/weather-analysis'),
            () => task(t('Жобалық есеп · Бақ жоспары', 'Мини-проект · План сада'), t('Бос қақпаны қалдырғанда неше ағаш отырғызылады?', 'Сколько деревьев посадят, если оставить клетку для калитки?'),
                `trees = 0\nfor y in range(${packs}):\n    for x in range(${n}):\n        if (x, y) != (0, 0):\n            trees += 1\nprint(trees)`, packs*n-1,
                t('Жол санын баған санына көбейтіп, қақпаға арналған бір ұяшықты алып тастаймыз.', 'Умножаем число рядов на число столбцов и вычитаем одну клетку для калитки.'), '/coordinate-practice')
        ]
    ];
    return levels.map((variants, index) => variants[(day + index) % variants.length]());
}
