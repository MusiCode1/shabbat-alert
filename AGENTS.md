# כללי פיתוח

## ArkType - חובה בכל גבול עם העולם החיצוני

תמיד להשתמש ב-ArkType לכל נתון שמגיע מחוץ לקוד (רשת, משתמש, DB).

### אסור:
```typescript
const data = await res.json() as MyType;           // ❌
const msg = JSON.parse(raw) as WsServerMessage;    // ❌
```

### מותר:
```typescript
const data = MySchema.assert(await res.json());    // ✅ throws on failure
const msg = MySchema(JSON.parse(raw));
if (msg instanceof type.errors) return;            // ✅ safe check
```

### הגדרת טיפוסים - סכמה קודם, טיפוס נגזר:
```typescript
export const AlertSchema = type({ title: 'string', cities: 'string[]' });
export type Alert = typeof AlertSchema.infer;  // לא interface נפרד
```

### גבולות שחייבים validation:
- תגובות HTTP (`fetch`)
- הודעות WebSocket
- נתוני socket.io - חתימה `(raw: unknown)` + validation
