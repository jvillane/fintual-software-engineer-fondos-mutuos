# Portafolio de Acciones – Postulación a Software Engineer [Fondos Mutuos] en Fintual

Este repositorio contiene mi solución al ejercicio técnico propuesto por Fintual para el cargo **Software Engineer – Fondos Mutuos**. La idea principal es modelar un **portafolio de inversión** capaz de:

1. Almacenar una **distribución objetivo** (porcentaje por acción).
2. Mantener la **distribución real** (cantidad de acciones – se admiten fracciones).
3. Calcular si el portafolio está balanceado o no.
4. Generar una **sugerencia de rebalanceo** indicando qué acciones comprar y vender.
5. Aplicar dicha sugerencia modificando las posiciones reales.

La solución está implementada en **TypeScript** y las pruebas se ejecutan con **Jest + ts-jest**.

---

## Enunciado original (en inglés)

> Construct a simple Portfolio class that has a collection of Stocks. Assume each Stock has a "Current Price" method that receives the last available price. Also, the Portfolio class has a collection of "allocated" Stocks that represents the distribution of the Stocks the Portfolio is aiming (i.e. 40% META, 60% APPL)
>
> Provide a portfolio rebalance method to know which Stocks should be sold and which ones should be bought to have a balanced Portfolio based on the portfolio's allocation.
>
> Add documentation/comments to understand your thinking process and solution
>
> **Important:** If you use LLMs that's ok, but you must share the conversations.

---

## Estructura principal

```
src/
 ├── model/
 │   ├── stock.model.ts         // Entidad Stock
 │   └── portfolio.model.ts     // Entidad Portfolio + interfaz de rebalanceo
 ├── service/
 │   └── portfolio.service.ts   // Lógica de rebalanceo y utilidades
 └── tests/
     └── portfolio.test.ts      // Pruebas end-to-end con Jest
```

---

## Requisitos previos

* Node.js ≥ 18
* npm (incluido con Node)

---

## Instalación y ejecución de tests

```bash
# Clonar el repo y entrar al directorio
$ git clone <este-repositorio>
$ cd fintual-software-engineer-fondos-mutuos

# Instalar dependencias
$ npm install

# Ejecutar la suite de pruebas
$ npm test
```

El comando `npm test` lanzará Jest con `ts-jest`, compilará los archivos TypeScript en memoria y verificará que:

1. El portafolio inicialmente cumple su distribución.
2. Tras mover precios, el portafolio se desbalancea.
3. Se genera una sugerencia de rebalanceo con compras y ventas.
4. Al aplicar la sugerencia, la distribución vuelve a cumplirse dentro del umbral de tolerancia.

---

## Notas de diseño

* Se permiten **fracciones de acciones** para lograr un rebalanceo preciso.
* El cálculo de porcentajes reales se basa en el **valor monetario** de cada posición (`shares × precio`).
* El algoritmo usa una tolerancia configurable (por defecto `0.1 %`).
* Todo el código está documentado en español con JSDoc para facilitar la lectura.

---

## Conversaciones con LLMs

Este proyecto fue desarrollado con el apoyo de herramientas de IA (ChatGPT y las incorporadas en el IDE Cursor):

* La conversación para indagar en el contexto del problema fue realizada utilizando ChatGPT y puede ser revisada [aquí](https://chatgpt.com/share/6838a257-3384-8001-846a-b8bb2f01b25e).
* La conversación completa realizada en cursor se encuentra en la carpeta `.llm`.