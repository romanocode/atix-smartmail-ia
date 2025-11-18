# 🎯 Guía de Prueba Rápida - 5 Minutos

## ✅ Pre-requisitos Completados
- ✅ Base de datos sincronizada
- ✅ API de OpenAI configurada y probada
- ✅ Servidor corriendo en http://localhost:3000

---

## 🚀 Prueba el Sistema Ahora

### Paso 1: Abrir la Aplicación (10 segundos)
```
Abre tu navegador en: http://localhost:3000
```

### Paso 2: Login (20 segundos)
1. Click en **"Continuar con Google"**
2. Selecciona tu cuenta
3. Autoriza la aplicación
4. Serás redirigido al Dashboard

### Paso 3: Importar Emails de Prueba (30 segundos)
1. Click en **"Emails"** en el menú lateral
2. Click en botón **"Importar JSON"**
3. Selecciona el archivo: `public/assets/sample-emails.json`
4. Espera confirmación: **"Importados 10 emails"**

### Paso 4: Procesar con IA (1 minuto)
1. Selecciona **TODOS** los emails (checkbox arriba de la tabla)
2. Click en botón morado **"Procesar con IA (10)"**
3. Espera 10-15 segundos
4. Verás aparecer:
   - 🔵 Badges de categoría (cliente/lead/interno/spam)
   - 🔴🟡🟢 Badges de prioridad (alta/media/baja)

### Paso 5: Ver Kanban (30 segundos)
1. Click en **"Tablero Kanban"** en el menú lateral
2. Deberías ver tareas en la columna **"Por hacer"**
3. **Arrastra una card** a "En progreso"
4. Verifica que se guardó el cambio

### Paso 6: Verificar Detalles (30 segundos)
1. Click en cualquier email o card
2. Se abrirá un **modal con detalles**
3. Verás:
   - Email completo
   - Categoría y prioridad detectadas
   - Descripción de la tarea (si tiene)

---

## 📊 Qué Esperar Ver

### En la Vista de Emails
```
✅ 10 emails importados
✅ Filtros: Por categoría, prioridad, procesado
✅ Badges de colores:
   - Azul = cliente
   - Verde = lead
   - Gris = interno
   - Rojo = spam
```

### En el Kanban
```
✅ Solo emails CON tareas
✅ 3 columnas funcionales
✅ Drag & drop operativo
✅ Cards ordenadas por prioridad
```

### Estadísticas en Dashboard
```
✅ Total de emails
✅ Sin procesar
✅ Tareas pendientes
✅ Tareas completadas
```

---

## 🎨 Ejemplos de Categorización Real

Basado en los 10 emails de prueba, la IA debería detectar algo como:

| Email | Categoría Esperada | Prioridad | Tarea |
|-------|-------------------|-----------|-------|
| "Propuesta Q4" | cliente | alta | ✅ Sí |
| "Nuevo prospecto" | lead | alta | ✅ Sí |
| "Reunión equipo" | interno | media | ❌ No |
| "Oferta limitada" | spam | baja | ❌ No |

---

## 🧪 Test de Validación

Después de procesar, verifica:

- [ ] Al menos 1 email categorizado como **cliente**
- [ ] Al menos 1 email categorizado como **lead**
- [ ] Al menos 1 email con prioridad **alta**
- [ ] Al menos 3-5 emails con **tareas detectadas** (hasTask=true)
- [ ] El Kanban muestra las tareas
- [ ] Drag & drop funciona y persiste los cambios

---

## 💡 Tips

### Si el Kanban está vacío:
- Verifica que procesaste los emails con IA
- Solo aparecen emails con `hasTask=true`
- Revisa la consola del navegador (F12)

### Si aparece error al procesar:
- Verifica que OpenAI tenga créditos
- Dashboard: https://platform.openai.com/usage
- Mínimo recomendado: $5 USD

### Para ver logs de la IA:
Abre la consola del servidor (terminal donde corre `npm run dev`)

---

## 📸 Capturas Esperadas

### Dashboard
```
📊 Estadísticas
   Total Emails: 10
   Sin Procesar: 0
   Tareas Pendientes: 5-7
   Tareas Completadas: 0
```

### Kanban
```
Por hacer         | En progreso | Completado
-------------------|-------------|------------
📋 5-7 cards       | 0 cards     | 0 cards
(con badges de     |             |
 prioridad)        |             |
```

---

## ⏱️ Tiempo Total Estimado

- Login: 20s
- Importar: 30s
- Procesar: 60s
- Kanban: 30s
- Verificar: 30s

**Total: ~3 minutos** ⚡

---

## 🎉 ¡Listo!

Si todo funcionó correctamente:
1. ✅ Viste categorización automática
2. ✅ Viste detección de tareas
3. ✅ El Kanban funciona con drag & drop
4. ✅ Los cambios se guardan en la base de datos

**Tu sistema Email-to-Kanban está 100% operativo** 🚀

---

## 📞 Siguiente Paso

Ahora puedes:
- Importar tus propios emails (formato JSON)
- Procesar cientos de emails
- Gestionar tareas en el Kanban
- Exportar selecciones

**¡A usar el sistema!** 🎯
