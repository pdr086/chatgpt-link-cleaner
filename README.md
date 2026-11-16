# Ссылки без меток ChatGPT

Расширение для Firefox и Zen скрывает от сайта, что вы открыли ссылку из ChatGPT. Оно удаляет `utm_source=chatgpt.com` и другие метки, явно указывающие на ChatGPT, до первого запроса к сайту. Например, `https://example.org/article?lang=ru&utm_source=chatgpt.com#intro` превратится в `https://example.org/article?lang=ru#intro`.

При переходе со страниц `chatgpt.com` и `chat.openai.com` расширение скрывает адрес источника из заголовка `Referer` и свойства `document.referrer`. Метки удаляются и из ссылок, вставленных в адресную строку.

## Установка

1. Скачайте [готовый ZIP](dist/chatgpt-link-cleaner-firefox.zip) через кнопку **Download raw file** на странице файла. Распаковывать архив не нужно.
2. В Firefox 140+ или Zen откройте `about:debugging#/runtime/this-firefox`.
3. Нажмите **«Загрузить временное дополнение»** и выберите скачанный ZIP. При установке из исходников выберите [`extension/manifest.json`](extension/manifest.json).
4. Обновите вкладку ChatGPT, если она была открыта до установки.

Дополнение загружается до перезапуска браузера. Для постоянной установки в обычном Firefox нужна [подпись Mozilla](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

## Доступ к сайтам и приватность

Доступ ко всем HTTP- и HTTPS-сайтам нужен для очистки переходов на любой домен. Расширение обрабатывает адреса и заголовки локально и не отправляет телеметрию.

Очистка скрывает прямые признаки перехода из ChatGPT. Сайт может специально проверить, удаляется ли подставленная им метка `utm_source=chatgpt.com`, и использовать результат как дополнительный признак при фингерпринтинге.
