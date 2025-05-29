/**
 * Mantiene la información de un portafolio de inversión.
 * 1) targetDistribution: porcentaje objetivo que se asigna a cada acción/ticker.
 * 2) actualDistribution: número de acciones poseídas realmente para cada acción/ticker.
 */
export default class Portfolio {
  /**
   * Distribución objetivo por porcentaje (0‒100). Ej: { "AAPL": 30, "GOOGL": 20 }
   */
  private _targetDistribution: Map<string, number>;

  /**
   * Distribución real por número de acciones. Ej: { "AAPL": 15, "GOOGL": 3 }
   */
  private _actualDistribution: Map<string, number>;

  constructor(
    targetDistribution: Record<string, number> = {},
    actualDistribution: Record<string, number> = {}
  ) {
    this._targetDistribution = new Map();
    this._actualDistribution = new Map();

    this.setTargetDistribution(targetDistribution);
    this.setActualDistribution(actualDistribution);
  }

  /**
   * Obtiene la distribución objetivo.
   */
  public get targetDistribution(): Map<string, number> {
    return new Map(this._targetDistribution);
  }

  /**
   * Obtiene la distribución real en acciones.
   */
  public get actualDistribution(): Map<string, number> {
    return new Map(this._actualDistribution);
  }

  /**
   * Reemplaza por completo la distribución objetivo.
   * @throws Error si la suma no es 100 o hay porcentajes negativos.
   */
  public setTargetDistribution(target: Record<string, number>): void {
    this.validatePercentages(target);
    this._targetDistribution.clear();
    for (const [symbol, pct] of Object.entries(target)) {
      this._targetDistribution.set(symbol, pct);
    }
  }

  /**
   * Establece la cantidad de acciones para cada símbolo.
   * @throws Error si alguna cantidad es negativa.
   */
  public setActualDistribution(actual: Record<string, number>): void {
    for (const shares of Object.values(actual)) {
      if (shares < 0) {
        throw new Error("La cantidad de acciones no puede ser negativa");
      }
    }
    this._actualDistribution.clear();
    for (const [symbol, shares] of Object.entries(actual)) {
      this._actualDistribution.set(symbol, shares);
    }
  }

  /**
   * Actualiza/añade la distribución objetivo para un símbolo concreto.
   * Tras la actualización, se vuelve a validar que el total de porcentajes sea 100.
   */
  public updateTargetForSymbol(symbol: string, percent: number): void {
    const temp = Object.fromEntries(this._targetDistribution);
    temp[symbol] = percent;
    this.setTargetDistribution(temp);
  }

  /**
   * Añade o actualiza la cantidad de acciones que se tienen de un símbolo.
   */
  public updateActualForSymbol(symbol: string, shares: number): void {
    if (shares < 0) {
      throw new Error("La cantidad de acciones no puede ser negativa");
    }
    this._actualDistribution.set(symbol, shares);
  }

  /**
   * Valida que los porcentajes sean correctos (>=0) y sumen 100.
   */
  private validatePercentages(target: Record<string, number>): void {
    let total = 0;
    for (const pct of Object.values(target)) {
      if (pct < 0) {
        throw new Error("Los porcentajes no pueden ser negativos");
      }
      total += pct;
    }
    if (Math.abs(total - 100) > 1e-6) {
      throw new Error(
        `Los porcentajes deben sumar 100. El total actual es ${total.toFixed(2)}`
      );
    }
  }
}

/**
 * Indica qué acciones y cuántas vender para cumplir con la distribución objetivo.
 */
export interface PortfolioRebalanceSuggestion {
  /** Acciones a vender para reducir sobreponderación */
  sells: Array<{
    symbol: string;
    shares: number;
  }>;

  /** Acciones a comprar para subsanar infraponderación */
  buys: Array<{
    symbol: string;
    shares: number;
  }>;
}
