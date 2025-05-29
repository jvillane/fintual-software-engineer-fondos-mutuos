export default class Stock {
  /** Símbolo/Ticker de la acción (p.ej. "AAPL") */
  private readonly _symbol: string;

  /** Precio actual de mercado */
  private _currentPrice: number;

  constructor(symbol: string, initialPrice: number) {
    if (!symbol) {
      throw new Error("El símbolo de la acción es obligatorio");
    }
    if (initialPrice < 0) {
      throw new Error("El precio inicial no puede ser negativo");
    }
    this._symbol = symbol;
    this._currentPrice = initialPrice;
  }

  /**
   * Obtiene el símbolo de la acción.
   */
  public get symbol(): string {
    return this._symbol;
  }

  /**
   * Obtiene el precio actual de la acción.
   */
  public get currentPrice(): number {
    return this._currentPrice;
  }

  /**
   * Actualiza el precio actual de la acción.
   * @throws Error si el precio es negativo.
   */
  public set currentPrice(newPrice: number) {
    if (newPrice < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    this._currentPrice = newPrice;
  }
}
