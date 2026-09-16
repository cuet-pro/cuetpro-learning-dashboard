/* Economics notes index — every chapter the notes dashboard knows about.
   Extracted from the dashboard source. Chapters with topics are the ones already
   written (ready: true) and can be opened one at a time via
   /econ-notes/index.html?chapter=<id>&topic=<id>&embed=1 ; the rest show as coming soon. */
export const ECON_UNITS = [
  { key: "micro", name: "Microeconomics", chapters: [
    { id: "intro-microeconomics", num: 1, title: "Introduction to Microeconomics", desc: "What microeconomics studies, and the central problems every economy must solve.", ready: false, topics: [
    ], },
    { id: "consumer-behaviour", num: 2, title: "Theory of Consumer Behaviour", desc: "Consumer's equilibrium via the utility approach, and demand — its determinants, curve, and price elasticity.", ready: false, topics: [
    ], },
    { id: "production-costs", num: 3, title: "Production and Costs", desc: "Production function, shapes of the TP/MP/AP curves, cost & revenue concepts, and producer's equilibrium.", ready: false, topics: [
    ], },
    { id: "perfect-competition", num: 4, title: "The Theory of the Firm Under Perfect Competition", desc: "Features of perfect competition, profit maximisation, price determination, and supply & its price elasticity.", ready: false, topics: [
    ], },
    { id: "market-equilibrium", num: 5, title: "Market Equilibrium: Applications", desc: "Market equilibrium, excess demand and excess supply, and applications like price ceiling and price flooring.", ready: false, topics: [
    ], },
  ] },
  { key: "macro", name: "Macroeconomics", chapters: [
    { id: "intro-macroeconomics", num: 1, title: "Introduction to Macroeconomics", desc: "What macroeconomics studies, and the basic concepts that set up the rest of the course.", ready: false, topics: [
    ], },
    { id: "national-income", num: 2, title: "National Income Accounting", desc: "Final vs intermediate goods, the circular flow, the three measurement methods, and the GDP-to-PDI aggregate ladder.", ready: true, topics: [
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
    ], },
    { id: "money-banking", num: 3, title: "Money and Banking", desc: "Functions of money, transaction and speculative demand, the RBI, credit creation, and the policy tools that control money supply.", ready: true, topics: [
      { id: "barter-functions", num: 1, title: "Barter System & Functions of Money", frequency: 2, years: { 2022: 1, 2023: 1 } },
      { id: "demand-transaction", num: 2, title: "Demand for Money — Transaction Motive", frequency: 1, years: { 2023: 1 } },
      { id: "demand-speculative", num: 3, title: "Demand for Money — Speculative Motive", frequency: 1, years: { 2024: 1 } },
      { id: "central-bank", num: 4, title: "Central Bank (RBI)", frequency: 2, years: { 2023: 1, 2024: 1 } },
      { id: "commercial-banks", num: 5, title: "Commercial Banks & Money Creation", frequency: 2, years: { 2022: 1, 2025: 1 } },
      { id: "money-multiplier", num: 6, title: "Money Multiplier & Credit Creation", frequency: 4, years: { 2022: 1, 2023: 1, 2024: 1, 2025: 1 } },
      { id: "policy-tools", num: 7, title: "Policy Tools — Repo, CRR, OMO", frequency: 3, years: { 2022: 1, 2023: 1, 2024: 1 } },
      { id: "money-supply-measures", num: 8, title: "Measures of Money Supply (M1–M4)", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "demonetisation", num: 9, title: "Demonetisation — Case Study", frequency: 1, years: { 2025: 1 } },
    ], },
    { id: "income-employment", num: 4, title: "Determination of Income and Employment", desc: "The Keynesian income-determination model — consumption function, the multiplier, and the Paradox of Thrift.", ready: true, topics: [
      { id: "ex-ante-post", num: 1, title: "Ex Ante vs Ex Post", frequency: 1, years: { 2022: 1 } },
      { id: "consumption-function", num: 2, title: "Consumption Function & MPC/MPS/APC/APS", frequency: 3, years: { 2022: 1, 2023: 1, 2024: 1 } },
      { id: "investment-function", num: 3, title: "Investment Function", frequency: 1, years: { 2023: 1 } },
      { id: "ad-equilibrium", num: 4, title: "Aggregate Demand & Equilibrium (Two-Sector)", frequency: 3, years: { 2023: 1, 2024: 1, 2025: 1 } },
      { id: "graphical-equilibrium", num: 5, title: "Graphical Determination of Equilibrium", frequency: 2, years: { 2024: 1, 2025: 1 } },
      { id: "autonomous-change", num: 6, title: "Effect of an Autonomous Change in AD", frequency: 2, years: { 2022: 1, 2023: 1 } },
      { id: "multiplier", num: 7, title: "The Multiplier Mechanism", frequency: 3, years: { 2022: 1, 2024: 1, 2025: 1 } },
      { id: "paradox-thrift", num: 8, title: "Paradox of Thrift", frequency: 1, years: { 2025: 1 } },
      { id: "full-employment", num: 9, title: "Full Employment, Deficient & Excess Demand", frequency: 2, years: { 2023: 1, 2024: 1 } },
    ], },
    { id: "govt-budget", num: 5, title: "Government Budget and the Economy", desc: "Budget meaning and objectives, receipts and expenditure, deficit measures, fiscal policy, FRBMA, and GST.", ready: true, topics: [
      { id: "budget-meaning", num: 1, title: "Government Budget — Meaning & Components", frequency: 2, years: { 2022: 1, 2023: 1 } },
      { id: "budget-objectives", num: 2, title: "Objectives of the Budget", frequency: 1, years: { 2024: 1 } },
      { id: "classification-receipts", num: 3, title: "Classification of Receipts", frequency: 3, years: { 2022: 1, 2023: 1, 2024: 1 } },
      { id: "classification-expenditure", num: 4, title: "Classification of Expenditure", frequency: 2, years: { 2023: 1, 2024: 1 } },
      { id: "deficit-measures", num: 5, title: "Balanced/Surplus/Deficit Budget & Deficit Measures", frequency: 3, years: { 2022: 1, 2023: 1, 2025: 1 } },
      { id: "fiscal-policy-ad", num: 6, title: "Box 5.1 — Fiscal Policy in the AD Model", frequency: 1, years: { 2022: 1 } },
      { id: "proportional-tax-stabilisers", num: 7, title: "Box 5.1 — Proportional Taxes & Automatic Stabilisers", frequency: 1, years: { 2023: 1 } },
      { id: "debt-deficit-debate", num: 8, title: "Government Debt & the Deficit Debate", frequency: 2, years: { 2024: 1, 2025: 1 } },
      { id: "frbma", num: 9, title: "Box 5.2 — FRBMA 2003", frequency: 1, years: { 2025: 1 } },
      { id: "gst", num: 10, title: "Box 5.3 — GST", frequency: 2, years: { 2022: 1, 2023: 1 } },
    ], },
    { id: "open-economy", num: 6, title: "Open Economy Macroeconomics", desc: "Balance of payments, foreign exchange rate regimes, and how the exchange rate is determined.", ready: false, topics: [
    ], },
  ] },
  { key: "ied", name: "Indian Economic Development", chapters: [
    { id: "eve-of-independence", num: 1, title: "Indian Economy on the Eve of Independence", desc: "The state of agriculture, industry, and foreign trade under British colonial rule.", ready: false, topics: [
    ], },
    { id: "economy-1950-1990", num: 2, title: "Indian Economy 1950–1990", desc: "Planning goals, and the pre-1991 policies for agriculture, industry, and foreign trade.", ready: false, topics: [
    ], },
    { id: "lpg-appraisal", num: 3, title: "Liberalisation, Privatisation and Globalisation: An Appraisal", desc: "The 1991 economic reforms and their impact — features and appraisal of the LPG policy.", ready: false, topics: [
    ], },
    { id: "human-capital", num: 4, title: "Human Capital Formation in India", desc: "How people become a productive resource, and the growth of India's education sector.", ready: false, topics: [
    ], },
    { id: "rural-development", num: 5, title: "Rural Development", desc: "Credit and marketing systems, the role of cooperatives, agricultural diversification, and organic farming.", ready: false, topics: [
    ], },
    { id: "employment-growth", num: 6, title: "Employment: Growth, Informalisation and Other Issues", desc: "Growth and changes in workforce participation across the formal and informal sectors.", ready: false, topics: [
    ], },
    { id: "environment-sustainable-dev", num: 7, title: "Environment and Sustainable Development", desc: "The state of India's environment, and strategies for sustainable development.", ready: false, topics: [
    ], },
    { id: "comparative-development", num: 8, title: "Comparative Development Experiences of India and its Neighbours", desc: "A comparison with neighbouring countries — growth, population, sectoral development, and strategies.", ready: false, topics: [
    ], },
  ] },
]

export const ECON_CHAPTERS = ECON_UNITS.flatMap(u => u.chapters.filter(c => c.ready))
