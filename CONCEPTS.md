# NotifyHub - Concepts & Revision Notes

---

## Backend

### 1. Helmet (`helmet`)
- **Kya hai?** Ye ek Express security middleware hai jo HTTP response headers ko secure karta hai.
- **Kyu use hota hai?**
  - `X-Powered-By: Express` header ko hide karta hai taaki attackers ko backend tech stack na pata chale.
  - Clickjacking attacks (`X-Frame-Options`) aur MIME-sniffing vulnerabilities (`X-Content-Type-Options: nosniff`) se bachata hai.
  - Production me secure HTTPS connection aur XSS protection ke rules enforce karta hai.

### 2. Global Error Handler Middleware (`errorMiddleware.js`) [📌 Baad me detail me samajhna hai]
- **Kya hai?** Ye Express ka special middleware hai jisme 4 parameters hote hain: `(err, req, res, next)`.
- **Kyu use hota hai?**
  - Jab bhi kisi controller ya service me koi error aata hai (`next(error)`), toh server crash hone ke bajaye ye middleware use catch karta hai.
  - Database errors (jaise duplicate email `code 11000`), validation errors, aur invalid JWT errors ko user-friendly JSON format (`{ success: false, message, code }`) me convert karta hai.
  - Production me sensitive stack traces aur internal code paths leak hone se roktay hai.

### 3. Project Routes (`projectRoutes.js`) [📌 Baad me detail me samajhna hai]
- **Kya samajhna hai?**
  - `router.use(protect)`: Router-level middleware se saare project routes ko ek sath protect karna.
  - Project CRUD endpoints (`POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`).
  - Special Actions: Status toggle (`PATCH /:id/status`) aur API Key regenerate karna (`POST /:id/api-key`).

### 4. Template HTML Escaping & Injection Protection [📌 Baad me detail me samajhna hai]
- **Kya samajhna hai?**
  - Dynamic variables (`{{name}}`) ko email HTML me inject karte waqt characters (`<`, `>`, `&`, `"`, `'`) ko escape karna.
  - Email clients me malicious script execution aur HTML injection attacks se bachav.

### 5. Email Sending Service (`emailService.js`) [📌 Kal ache se samajhna hai]
- **Kya samajhna hai?**
  - Single recipient validation aur project-template isolation check.
  - Dynamic template variables ko replace karke render karna.
  - Nodemailer se actual send karna aur chahe success ho ya fail, `EmailLog` create karna.

### 6. MongoDB Query Operators & Pagination Math [📌 Baad me detail me samajhna hai]
- **Kya samajhna hai?**
  - Query Operators: `$in` (list me se match), `$options: 'i'` (case-insensitive), `$gte` / `$lte` (date range).
  - Pagination Formula: `skip = (page - 1) * limit` aur DoS protection ke liye `Math.max` / `Math.min` bounds.

---

## Client

*(Frontend ke concepts jab aap bolenge tab yaha add honge)*

