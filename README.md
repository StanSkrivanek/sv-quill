# Simple Notes

A simple note app demo using Svelte 5 and Quill to store notes in SQLite database.

---

## Installation

1. Install dependencies

```bash
npm install
```

2. Create empty folder `data` in the project root.

```bash
mkdir data
```

3. Run dev server

```bash
npm run dev
```

SQLite database will be created in the `data` folder of the project root automatically.

---

## Features

- Create, Edit and Delete notes
- limit on image size to 200kb width and height
- saving images in db together with HTML content as base64.
- saving notes in SQLite database
- simple pagination
