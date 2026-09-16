/* Economics notes dashboard (Alt – Sidebar Topics) chapter + topic index.
   Extracted from the source dashboard so Study Kit can show a chapter breakdown
   and open one chapter at a time: /econ-notes/index.html?chapter=<id>&topic=<id>&embed=1 */
export const ECON_CHAPTERS = [
  {
    id: "national-income", num: 2, title: "National Income Accounting",
    desc: "Final vs intermediate goods, the circular flow, the three measurement methods, and the GDP-to-PDI aggregate ladder.",
    topics: [
      { id: "goods", num: 1, title: "Final & Intermediate Goods", frequency: 3, years: { 2022: 1, 2023: 2 } },
      { id: "stocks-flows", num: 2, title: "Stocks & Flows", frequency: 2, years: { 2024: 1, 2025: 1 } },
      { id: "investment-depreciation", num: 3, title: "Investment & Depreciation", frequency: 1, years: { 2025: 1 } },
      { id: "circular-flow", num: 4, title: "Circular Flow", frequency: 2, years: { 2022: 1, 2023: 1 } },
      { id: "product-method", num: 5, title: "Product Method", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "expenditure-method", num: 6, title: "Expenditure Method", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "income-method", num: 7, title: "Income Method", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "factor-cost-prices", num: 8, title: "Factor Cost & Prices", frequency: 1, years: { 2022: 1 } },
      { id: "aggregate-ladder", num: 9, title: "GDP → PDI Ladder", frequency: 3, years: { 2022: 1, 2024: 1, 2025: 1 } },
      { id: "ndi-private", num: 10, title: "NDI & Private Income", frequency: 1, years: { 2024: 1 } },
      { id: "nominal-real", num: 11, title: "Nominal vs Real GDP & CPI/WPI", frequency: 3, years: { 2022: 1, 2023: 1, 2025: 1 } },
      { id: "gdp-welfare", num: 12, title: "GDP & Welfare", frequency: 1, years: { 2024: 1 } },
    ],
  },
  {
    id: "money-banking", num: 3, title: "Money and Banking",
    desc: "Functions of money, transaction and speculative demand, the RBI, credit creation, and the policy tools that control money supply.",
    topics: [
      { id: "barter-functions", num: 1, title: "Barter System & Functions of Money", frequency: 2, years: { 2022: 1, 2023: 1 } },
      { id: "demand-transaction", num: 2, title: "Demand for Money — Transaction Motive", frequency: 1, years: { 2023: 1 } },
      { id: "demand-speculative", num: 3, title: "Demand for Money — Speculative Motive", frequency: 1, years: { 2024: 1 } },
      { id: "central-bank", num: 4, title: "Central Bank (RBI)", frequency: 2, years: { 2023: 1, 2024: 1 } },
      { id: "commercial-banks", num: 5, title: "Commercial Banks & Money Creation", frequency: 2, years: { 2022: 1, 2025: 1 } },
      { id: "money-multiplier", num: 6, title: "Money Multiplier & Credit Creation", frequency: 4, years: { 2022: 1, 2023: 1, 2024: 1, 2025: 1 } },
      { id: "policy-tools", num: 7, title: "Policy Tools — Repo, CRR, OMO", frequency: 3, years: { 2022: 1, 2023: 1, 2024: 1 } },
      { id: "money-supply-measures", num: 8, title: "Measures of Money Supply (M1–M4)", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "demonetisation", num: 9, title: "Demonetisation — Case Study", frequency: 1, years: { 2025: 1 } },
    ],
  },
]
