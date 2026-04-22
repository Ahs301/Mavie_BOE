# 📘 Playbook Outbound: Despachos de Abogados (Vertical 1)

> **Objetivo:** Captar despachos especializados en derecho administrativo, licitaciones y subvenciones públicas, ofreciéndoles automatizar la vigilancia del BOE y DOUE para que nunca pierdan un caso o plazo de sus clientes.
> **Audiencia:** Socios fundadores, directores o gerentes de despachos de abogados en España.
> **Ángulo de venta:** Ahorro de horas semanales y cero riesgo de error humano. No es una herramienta más, es un seguro de tranquilidad.

---

## 🛠️ 1. Scraping y Preparación de Leads

Antes de enviar el primer correo, asegúrate de tener una base de datos cualificada:
1. **Palabras clave para el scraper (`ScrapperEmpresasBOE`):**
   - `"despacho de abogados derecho administrativo"`
   - `"abogados licitaciones publicas"`
   - `"bufete abogados subvenciones"`
   - `"abogados contratacion publica"`
2. **Filtrado:** Descarta los que sean bufetes generalistas que solo hacen divorcios o penal. Nos interesan los que tratan con el Estado.
3. **Personalización:** El scraper ya saca el nombre del negocio y la ciudad, vitales para las variables `{{nombre_empresa}}` y `{{ciudad}}`.

---

## 📧 2. Secuencia de 3 Emails (Cadencia de Drip Campaign)

Esta secuencia está diseñada para ser enviada vía Brevo (y los demás SMTP rotatorios). Se enviarán en D+0, D+3 y D+7.

### ✉️ Email 1: El Contacto Frío (D+0)
**Asunto:** Licitaciones y BOE para `{{nombre_empresa}}` (Pregunta rápida)

**Cuerpo:**
```html
<p>Hola,</p>

<p>Soy Josep, fundador de Mavie.</p>

<p>Os escribo porque trabajo con despachos en <strong>{{ciudad}}</strong> que gestionan temas de derecho administrativo y contratación pública. Constantemente me decían que revisar el BOE, el DOUE y los boletines autonómicos a mano era una pérdida de tiempo enorme (y siempre estaba el miedo a que se pasara un plazo importante).</p>

<p>He desarrollado un sistema automatizado (Radar BOE) que hace este rastreo 24/7 por vosotros. Filtra por vuestras palabras clave exactas y os manda una alerta directa al correo solo cuando sale algo relevante para el despacho o para vuestros clientes.</p>

<p>Nada de entrar a 5 portales distintos cada mañana. Solo recibís lo que importa.</p>

<p>¿Tendría sentido que os enseñe cómo funciona en una llamada de 10 minutos esta semana? Si no encaja, no pasa nada, pero os garantizo que os puede ahorrar horas de trabajo.</p>

<p>Un saludo,</p>

<p>
<strong>Josep Cervera</strong><br>
Fundador de <a href="https://mavieautomations.com">Mavie Automations</a>
</p>
```
*💡 **Por qué funciona:** Es directo, nombra su ciudad y ataca el dolor principal (perder tiempo y el miedo a que se pase un plazo).*

---

### ✉️ Email 2: La Prueba Social / Follow-up (D+3)
**Asunto:** Re: Licitaciones y BOE para `{{nombre_empresa}}` (Pregunta rápida)

**Cuerpo:**
```html
<p>Hola de nuevo,</p>

<p>Sé que los despachos vais a tope, así que seré muy breve.</p>

<p>Solo quería añadir un ejemplo real: la semana pasada, uno de nuestros clientes detectó 3 nuevas oportunidades de licitación en su sector específico que probablemente se le habrían pasado usando los métodos manuales habituales. Simplemente recibió el aviso en su bandeja de entrada mientras tomaba el café.</p>

<p>Si delegar la vigilancia del BOE en un sistema automático os suena bien, avisadme y os enseño la plataforma por dentro en unos minutos.</p>

<p>¿Qué os parece?</p>

<p>Un saludo,</p>

<p>
<strong>Josep Cervera</strong><br>
Fundador de <a href="https://mavieautomations.com">Mavie Automations</a>
</p>
```
*💡 **Por qué funciona:** Responde en el mismo hilo (Re:). Aporta prueba social ("uno de nuestros clientes detectó 3 oportunidades") para generar confianza.*

---

### ✉️ Email 3: El Break-up (D+7)
**Asunto:** Último correo / Radar BOE

**Cuerpo:**
```html
<p>Hola,</p>

<p>Supongo que no es el mejor momento para hablar sobre la automatización del BOE en el despacho, o simplemente estáis cubiertos por ahora.</p>

<p>No os molestaré más con este tema. Si en algún momento en el futuro sentís que revisar boletines oficiales os quita demasiado tiempo que podríais dedicar a casos reales, sabéis dónde encontrarme.</p>

<p>Os dejo el enlace por si queréis echarle un ojo a vuestro ritmo: <a href="https://mavieautomations.com/soluciones/boe">Radar BOE para Despachos</a>.</p>

<p>¡Mucho éxito este año!</p>

<p>Un saludo,</p>

<p>
<strong>Josep Cervera</strong><br>
Fundador de <a href="https://mavieautomations.com">Mavie Automations</a>
</p>
```
*💡 **Por qué funciona:** Usa psicología inversa. Al decir que te retiras, muchas veces la gente reacciona y responde. Si no lo hacen, dejas la puerta abierta y el enlace para tráfico pasivo.*

---

## 📊 3. Configuración de Tracking (Brevo/SendGrid)

Para que el worker de captación sepa quién abre y hace clic:
1. Asegúrate de que las URLs en los emails (`https://mavieautomations.com`) tengan UTMs o el píxel de tracking habilitado (esto lo hace `src/templates/templates.js` automáticamente al inyectar el pixel).
2. El Asunto de cada correo debe ser idéntico en las respuestas para que Gmail y Outlook los agrupen en "Hilos" (Threads). Nuestro sistema `opts.inReplyTo` de `sender.js` ya se encarga de esto a nivel de cabeceras.

---

> ✅ **Próximo paso operativo para Josep:**
> 1. Exporta el CSV desde el scraper (con leads de abogados).
> 2. Pásalo por el worker de captación (`node src/cli.js import --file abogados.csv`).
> 3. ¡Dispara la campaña!
