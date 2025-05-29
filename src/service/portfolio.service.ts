import Portfolio, {
  PortfolioRebalanceSuggestion,
} from "../model/portfolio.model";
import Stock from "../model/stock.model";

/**
 * Servicio que opera sobre instancias de {@link Portfolio}
 */
export default class PortfolioService {
  private static readonly DEFAULT_TOLERANCE_PERCENT = 0.1; // 0.5 %

  /**
   * Imprime en consola la distribución objetivo y la real.
   */
  public static printDistributions(portfolio: Portfolio, stocks: Stock[]): void {
    const priceMap = new Map(stocks.map((s) => [s.symbol, s.currentPrice]));

    // Mostrar distribución objetivo (%):
    console.log(
      "Target Distribution (%):",
      Object.fromEntries(portfolio.targetDistribution)
    );

    // Calcular porcentaje actual basado en valor monetario
    let totalValue = 0;
    const valueBySymbol: Record<string, number> = {};

    for (const [symbol, shares] of portfolio.actualDistribution) {
      const price = priceMap.get(symbol);
      if (price === undefined) {
        throw new Error(`Falta el precio de la acción ${symbol}`);
      }
      const value = shares * price;
      valueBySymbol[symbol] = value;
      totalValue += value;
    }

    const percentObj: Record<string, number> = {};
    for (const [symbol, value] of Object.entries(valueBySymbol)) {
      const pct = totalValue === 0 ? 0 : (value / totalValue) * 100;
      percentObj[symbol] = parseFloat(pct.toFixed(2));
    }

    console.log(
      "Actual Distribution (shares):",
      Object.fromEntries(portfolio.actualDistribution),
      "\nActual Distribution (percent):",
      percentObj
    );
  }

  /**
   * Valida si la distribución objetivo se cumple.
   * @param tolerancePct Tolerancia en porcentaje para considerar que se cumple.
   * @returns `true` si cada símbolo está dentro de la tolerancia.
   */
  public static isTargetMet(
    portfolio: Portfolio,
    stocks: Stock[],
    tolerancePct: number = PortfolioService.DEFAULT_TOLERANCE_PERCENT
  ): boolean {
    const deviations = this.calculateDeviations(portfolio, stocks);
    return deviations.every((d) => Math.abs(d.diffPct) <= tolerancePct);
  }

  /**
   * Genera una sugerencia de rebalanceo vendiendo lo que esté por encima del objetivo.
   */
  public static getRebalanceSuggestion(
    portfolio: Portfolio,
    stocks: Stock[],
    tolerancePct: number = PortfolioService.DEFAULT_TOLERANCE_PERCENT
  ): PortfolioRebalanceSuggestion {
    const deviations = this.calculateDeviations(portfolio, stocks);
    const sells: PortfolioRebalanceSuggestion["sells"] = [];
    const buys: PortfolioRebalanceSuggestion["buys"] = [];

    for (const { symbol, diffValue, diffPct, price } of deviations) {
      if (diffPct > tolerancePct) {
        // Sobreponderado ⇒ vender fracción exacta
        const sharesToSell = diffValue / price; // diffValue es positivo
        if (sharesToSell > 1e-6) sells.push({ symbol, shares: parseFloat(sharesToSell.toFixed(4)) });
      } else if (diffPct < -tolerancePct) {
        // Infraponderado ⇒ comprar fracción exacta
        const sharesToBuy = -diffValue / price; // diffValue negativo, por eso negamos
        if (sharesToBuy > 1e-6) buys.push({ symbol, shares: parseFloat(sharesToBuy.toFixed(4)) });
      }
    }

    return { sells, buys };
  }

  /**
   * Aplica una sugerencia de rebalanceo al portfolio.
   * Reduce las acciones indicadas en la sugerencia.
   */
  public static applyRebalanceSuggestion(
    portfolio: Portfolio,
    _stocks: Stock[],
    suggestion: PortfolioRebalanceSuggestion
  ): void {
    // Procesar ventas
    for (const { symbol, shares } of suggestion.sells) {
      const currentShares = portfolio.actualDistribution.get(symbol) || 0;
      if (shares - currentShares > 1e-6) {
        throw new Error(
          `No es posible vender ${shares} acciones de ${symbol}; solo se poseen ${currentShares}`
        );
      }
      portfolio.updateActualForSymbol(symbol, currentShares - shares);
    }

    // Procesar compras
    for (const { symbol, shares } of suggestion.buys) {
      const currentShares = portfolio.actualDistribution.get(symbol) || 0;
      portfolio.updateActualForSymbol(symbol, currentShares + shares);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Representa la desviación de cada símbolo respecto a su peso objetivo.
   */
  private static calculateDeviations(
    portfolio: Portfolio,
    stocks: Stock[]
  ): Array<{
    symbol: string;
    targetPct: number;
    actualPct: number;
    diffPct: number;
    price: number;
    diffValue: number;
  }> {
    // Mapa de precios
    const priceMap = new Map(stocks.map((s) => [s.symbol, s.currentPrice]));

    // Calcular valor total actual del portafolio.
    let totalValue = 0;
    for (const [symbol, shares] of portfolio.actualDistribution) {
      const price = priceMap.get(symbol);
      if (price === undefined) {
        throw new Error(`Falta el precio de la acción ${symbol}`);
      }
      totalValue += shares * price;
    }
    if (totalValue === 0) {
      throw new Error("El valor total del portafolio es 0");
    }

    const deviations = [] as Array<{
      symbol: string;
      targetPct: number;
      actualPct: number;
      diffPct: number;
      price: number;
      diffValue: number;
    }>;

    // Evaluar cada símbolo presente en objetivo.
    for (const [symbol, targetPct] of portfolio.targetDistribution) {
      const shares = portfolio.actualDistribution.get(symbol) || 0;
      const price = priceMap.get(symbol);
      if (price === undefined) {
        throw new Error(`Falta el precio de la acción ${symbol}`);
      }
      const actualValue = shares * price;
      const actualPct = (actualValue / totalValue) * 100;
      const diffPct = actualPct - targetPct;
      const diffValue = actualValue - (targetPct / 100) * totalValue;

      deviations.push({
        symbol,
        targetPct,
        actualPct,
        diffPct,
        price,
        diffValue,
      });
    }

    return deviations;
  }
}
