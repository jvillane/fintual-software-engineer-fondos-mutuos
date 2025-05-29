import { describe, it, expect } from "@jest/globals";
import Portfolio from "../model/portfolio.model";
import PortfolioService from "../service/portfolio.service";
import Stock from "../model/stock.model";

/**
 * Escenario end-to-end de rebalanceo de portafolio.
 */
describe("PortfolioService rebalance workflow", () => {
  it("should meet target, get rebalance suggestion when out of balance, and meet target after applying it", () => {
    // 1) Crear 3 acciones con precio inicial 100
    const stocks = [
      new Stock("AAPL", 100),
      new Stock("GOOGL", 100),
      new Stock("MSFT", 100),
    ];

    // 2) Crear portafolio con target 30/30/40 y shares consistentes
    const targetDistribution = {
      AAPL: 30,
      GOOGL: 30,
      MSFT: 40,
    };

    const actualDistribution = {
      AAPL: 30, // 30 * 100 = 3000   (30 %)
      GOOGL: 30, // 3000            (30 %)
      MSFT: 40, // 4000             (40 %)
    };

    const portfolio = new Portfolio(targetDistribution, actualDistribution);
    console.log("Initial distribution:");
    PortfolioService.printDistributions(portfolio, stocks);

    // 3) Verificar que inicialmente se cumple la distribución objetivo
    expect(PortfolioService.isTargetMet(portfolio, stocks)).toBe(true);

    // 4) Cambiar precio de AAPL y GOOGL para desbalancear el portafolio
    stocks[0].currentPrice = 120; // AAPL sube 20 %
    stocks[1].currentPrice = 80; // GOOGL baja 20 %

    // Ahora la distribución ya no se cumple
    expect(PortfolioService.isTargetMet(portfolio, stocks)).toBe(false);

    // 5) Generar sugerencia de rebalanceo
    const suggestion = PortfolioService.getRebalanceSuggestion(portfolio, stocks);
    console.log("Rebalance suggestion:");
    console.log(suggestion);

    // Debe haber algo que vender y algo que comprar
    expect(suggestion.sells.length).toBeGreaterThan(0);
    expect(suggestion.buys.length).toBeGreaterThan(0);

    // 6) Aplicar la sugerencia al portafolio
    PortfolioService.applyRebalanceSuggestion(portfolio, stocks, suggestion);
    console.log("After rebalance:");
    PortfolioService.printDistributions(portfolio, stocks);

    // 7) Validar que nuevamente se cumpla la distribución objetivo
    expect(PortfolioService.isTargetMet(portfolio, stocks)).toBe(true);
  });
});
