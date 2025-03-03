# REST API Application з використанням Node.js

Цей проект є REST API додатком, який дозволяє отримувати, додавати, оновлювати та видаляти дані з бази даних через HTTP запити з використанням Node.js та фреймворку Express.

## Опис

REST API додаток забезпечує взаємодію між клієнтом та сервером за допомогою стандартного HTTP протоколу. Клієнти можуть здійснювати запити до серверу для отримання, додавання, оновлення та видалення даних з бази даних.

## Вимоги

Для запуску REST API додатку на Node.js необхідно мати наступні компоненти:

- Node.js 14 або вище
- Фреймворк Express

## Інсталяція

Щоб встановити REST API додаток, склонуйте репозиторій з GitHub та встановіть залежності, виконавши наступні команди в терміналі:

```bash
git clone https://github.com/alexveryk/REST-API-application
cd rest-api-app
npm install
```

## Використання

Для запуску REST API додатку виконайте наступну команду в терміналі:

```bash
npm start
```

Ця команда запустить додаток на локальному сервері. Далі ви можете виконувати HTTP запити до серверу, використовуючи різні методи, такі як GET, POST, PUT та DELETE.

## Додавання контакту до бази даних

Щоб додати контакт до бази даних, необхідно виконати наступні кроки:

1. Відправити POST запит на адресу `/contacts` з наступними даними в тілі запиту:

```json
{
  "name": "Alec Howard",
  "email": "Donec.elementum@scelerisquescelerisquedui.net",
  "phone": "(111) 111-2233"
}
```

2. Сервер додасть ці дані до бази даних та поверне відповідь з кодом 201 CREATED та даними контакту, що було додано:

```json
{
  "id": 1,
  "name": "Alec Howard",
  "email": "Donec.elementum@scelerisquescelerisquedui.net",
  "phone": "(111) 111-2233"
}
```

### Отримання всіх контактів

Метод: GET

Шлях: `/`

Параметри: відсутні

Приклад відповіді:

```json
[
  {
    "id": 1,
    "name": "Alec Howard",
    "email": "Donec.elementum@scelerisquescelerisquedui.net",
    "phone": "(111) 111-2233"
  },
  {
    "id": 2,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "(123) 456-7890"
  }
]
```

### Отримання контакту за його ідентифікатором

Метод: GET

Шлях: `/:contactId`

Параметри:

- `contactId` - ідентифікатор контакту

Приклад відповіді:

```json
{
  "id": 1,
  "name": "Alec Howard",
  "email": "Donec.elementum@scelerisquescelerisquedui.net",
  "phone": "(111) 111-2233"
}
```

Якщо контакт з таким ідентифікатором не знайдено, сервер поверне відповідь з кодом статусу 404 та повідомленням про те, що контакт не знайдено:

```json
{
  "error": "Contact with id: 3 not found"
}
```

### Оновлення контакту за його ідентифікатором

Метод: PUT

Шлях: `/:contactId`

Параметри:

- `contactId` - ідентифікатор контакту, який треба оновити

Приклад тіла запиту:

```json
{
  "name": "Alec Howard",
  "email": "Donec.elementum@scelerisquescelerisquedui.net",
  "phone": "(111) 111-2233"
}
```

Приклад відповіді:

```json
{
  "id": 1,
  "name": "Alec Howard",
  "email": "Donec.elementum@scelerisquescelerisquedui.net",
  "phone": "(111) 111-2233"
}
```

Якщо контакт з таким ідентифікатором не знайдено, сервер поверне відповідь з кодом статусу 404 та повідомленням про те, що контакт не знайдено:

```json
{
  "error": "Contact with id: <contactId> not found."
}
```

### Видалення контакту за його ідентифікатором

Метод: DELETE

Шлях: `/:contactId`

Параметри:

- `contactId` - ідентифікатор контакту, який треба видалити

Приклад відповіді:

```json
{
  "message": "contact deleted"
}
```

Якщо контакт з таким ідентифікатором не знайдено, сервер поверне відповідь з кодом статусу 404 та повідомленням про те, що контакт не знайдено:

```json
{
  "error": "Contact with id: <contactId> not found."
}
```

### Oновлення статусу контакту за його ідентифікатором

Метод: PATCH

Шлях: `/:contactId/favorite`

Параметри:

- `contactId` - ідентифікатор контакту, в якому треба оновити статус

Приклад тіла запиту:

```json
{
  "favorite": true
}
```

Приклад відповіді:

```json
{
  "_id": "6468d210d9a44b408da57673",
  "name": "Allen Raymond",
  "email": "nulla.ante@vestibul.co.uk",
  "phone": "(992) 914-3792",
  "favorite": false
}
```

Якщо контакт з таким ідентифікатором не знайдено, сервер поверне відповідь з кодом статусу 404 та повідомленням про те, що контакт не знайдено:

```json
{
  "error": "Not found."
}
```
