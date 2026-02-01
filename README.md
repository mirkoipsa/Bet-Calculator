# 📊 BetCalc Pro - Calculadora de Apuestas Inteligente

![Estado del Proyecto](https://img.shields.io/badge/Estado-Terminado-green)
![Tecnología](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-blue)
![API](https://img.shields.io/badge/APIs-TheOddsAPI%20%7C%20Gemini-orange)

**BetCalc Pro** es una aplicación web moderna diseñada para ayudar a los usuarios a calcular rendimientos potenciales en apuestas deportivas, gestionar riesgos y obtener información en tiempo real.

El proyecto destaca por su integración con APIs externas para obtener cuotas en vivo y un **Asistente de IA** integrado para resolver dudas sobre términos y estrategias de apuestas.

---

## ✨ Características Principales

### 🧮 Calculadora de Probabilidades
* Cálculo automático de **Cuota Total**, **Ganancia Bruta** y **Ganancia Neta**.
* Interfaz dinámica: permite agregar o eliminar filas de partidos ilimitadamente.
* Soporte para múltiples formatos de cuota (Decimal).

### 🏆 Cuotas en Tiempo Real (API Integration)
* Conexión con **The Odds API** para obtener partidos y cuotas actualizadas.
* Cobertura de ligas principales:
    * ⚽ **Fútbol:** Premier League, La Liga, Serie A, Bundesliga, Ligue 1.
    * 🏀 **Baloncesto:** NBA.
    * 🏈 **Fútbol Americano:** NFL.
* **Sistema de Caché Inteligente:** Implementación de `localStorage` para minimizar el consumo de la API.

### 🤖 Asistente de IA (Chatbot)
* Integración con **Google Gemini API** (Modelo `gemini-2.5-flash`).
* Bot con personalidad definida ("Experto en apuestas") mediante *System Instructions*.
* Interfaz flotante tipo chat.

### 🎨 UI/UX Profesional
* Diseño **Dark Mode**.
* Totalmente **Responsive** (adaptable a móviles y escritorio).
* Secciones modales para "Destacados", "Info" y "Avisos Legales".

---

## 🛠️ Tecnologías Utilizadas

Este proyecto fue construido **sin frameworks**, utilizando estándares web puros para demostrar dominio del lenguaje base:

* **HTML5:** Estructura semántica.
* **CSS3:** Flexbox, Grid, Variables CSS, Animaciones y Media Queries.
* **JavaScript (ES6+):**
    * `fetch` / `async-await` para consumo de APIs.
    * Manipulación del DOM.
    * Gestión de `localStorage`.
* **APIs Externas:**
    * [The Odds API](https://the-odds-api.com/) (Datos deportivos).
    * [Google AI Studio](https://aistudio.google.com/) (Inteligencia Artificial).

---

## ⚠️ Disclaimer (Aviso Legal)

**BetCalc Pro es una herramienta puramente informativa y educativa.**
* No somos una casa de apuestas.
* No garantizamos ganancias financieras.
* Promovemos el **Juego Responsable**. Si tienes problemas con el juego, busca ayuda profesional.
* Debes ser mayor de 18 años para utilizar herramientas relacionadas con apuestas.

---

* 2026 BetCalc Pro. Todos los derechos reservados.*
