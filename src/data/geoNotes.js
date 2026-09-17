/* Geography notes index — every book, chapter and topic the geography dashboard knows.
   Extracted from public/geo-notes/index.html. Chapters with hasContent open one topic at a
   time via /geo-notes/index.html?book=<id>&chapter=<id>&topic=<id>&embed=1 */
export const GEO_UNITS = [
  { key: "b1", name: "Indian People and Economy", emoji: "\ud83d\udcd8", chapters: [
    { id: "b1c1", num: 1, title: "Population: Distribution, Density, Growth and Composition", desc: "How India's population is distributed and how densely it is packed across space, how it has grown through four historical phases, and how it breaks down by age, residence, language, religion and work.", ready: true, topics: [
      { id: "dist", num: 1, title: "Distribution of Population", frequency: 0, years: {}, tier: "medium" },
      { id: "density", num: 2, title: "Density of Population", frequency: 0, years: {}, tier: "high" },
      { id: "growth", num: 3, title: "Growth of Population", frequency: 0, years: {}, tier: "high" },
      { id: "regional", num: 4, title: "Regional Variation in Growth", frequency: 0, years: {}, tier: "medium" },
      { id: "adolescent", num: 5, title: "Adolescent Population", frequency: 0, years: {}, tier: "low" },
      { id: "ruralurban", num: 6, title: "Rural–Urban Composition", frequency: 0, years: {}, tier: "high" },
      { id: "language", num: 7, title: "Linguistic Composition", frequency: 0, years: {}, tier: "high" },
      { id: "religion", num: 8, title: "Religious Composition", frequency: 0, years: {}, tier: "high" },
      { id: "working", num: 9, title: "Composition of Working Population", frequency: 0, years: {}, tier: "high" },
    ], },
    { id: "b1c2", num: 2, title: "Human Settlements", desc: "Types and patterns of rural and urban settlements, and the problems that come with urbanisation in India.", ready: true, topics: [
      { id: "settlement", num: 1, title: "Human Settlements — Meaning & Types", frequency: 0, years: {}, tier: "high" },
      { id: "ruraltypes", num: 2, title: "Types of Rural Settlement", frequency: 0, years: {}, tier: "high" },
      { id: "urbandef", num: 3, title: "Urban Settlements — Census Definition", frequency: 0, years: {}, tier: "high" },
      { id: "evolution", num: 4, title: "Evolution of Towns in India", frequency: 0, years: {}, tier: "high" },
      { id: "urbanisation", num: 5, title: "Urbanisation in India", frequency: 0, years: {}, tier: "high" },
      { id: "functional", num: 6, title: "Functional Classification of Towns", frequency: 0, years: {}, tier: "high" },
    ], },
    { id: "b1c3", num: 3, title: "Land Resources and Agriculture", desc: "Land-use categories, cropping seasons and patterns, and India's agricultural development strategy.", ready: true, topics: [
      { id: "landuse", num: 1, title: "Land Use Categories & Changes", frequency: 0, years: {}, tier: "high" },
      { id: "cpr", num: 2, title: "Common Property Resources & Agricultural Land", frequency: 0, years: {}, tier: "medium" },
      { id: "cropseasons", num: 3, title: "Cropping Seasons & Types of Farming", frequency: 0, years: {}, tier: "high" },
      { id: "cereals", num: 4, title: "Foodgrains — Cereals", frequency: 0, years: {}, tier: "high" },
      { id: "pulsesoilseeds", num: 5, title: "Pulses and Oilseeds", frequency: 0, years: {}, tier: "medium" },
      { id: "cashcrops", num: 6, title: "Fibre & Plantation Crops", frequency: 0, years: {}, tier: "high" },
      { id: "agridevelopment", num: 7, title: "Agricultural Development in India", frequency: 0, years: {}, tier: "high" },
      { id: "agriproblems", num: 8, title: "Problems of Indian Agriculture", frequency: 0, years: {}, tier: "medium" },
    ], },
    { id: "b1c4", num: 4, title: "Water Resources", desc: "Sources and availability of water, water scarcity, and methods of conservation and management.", ready: true, topics: [
      { id: "waterresources", num: 1, title: "Water Resources of India", frequency: 0, years: {}, tier: "medium" },
      { id: "waterdemand", num: 2, title: "Water Demand and Utilisation", frequency: 0, years: {}, tier: "high" },
      { id: "waterproblems", num: 3, title: "Emerging Water Problems", frequency: 0, years: {}, tier: "low" },
      { id: "waterconservation", num: 4, title: "Water Conservation and Management", frequency: 0, years: {}, tier: "medium" },
    ], },
    { id: "b1c5", num: 5, title: "Mineral and Energy Resources", desc: "Distribution of major minerals and conventional and non-conventional sources of energy in India.", ready: true, topics: [
      { id: "mineraltypes", num: 1, title: "Types of Mineral Resources & Distribution", frequency: 0, years: {}, tier: "medium" },
      { id: "ferrousminerals", num: 2, title: "Ferrous Minerals — Iron Ore & Manganese", frequency: 0, years: {}, tier: "high" },
      { id: "nonferrousminerals", num: 3, title: "Non-Ferrous & Non-Metallic Minerals", frequency: 0, years: {}, tier: "medium" },
      { id: "conventionalenergy", num: 4, title: "Conventional Energy Sources", frequency: 0, years: {}, tier: "high" },
      { id: "nonconventionalenergy", num: 5, title: "Non-Conventional Energy & Conservation", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b1c6", num: 6, title: "Planning and Sustainable Development in Indian Context", desc: "Target-area planning, the Indira Gandhi Canal Command Area, and sustainable development in the Indian Desert.", ready: true, topics: [
      { id: "planningapproaches", num: 1, title: "Planning Approaches — Sectoral, Regional & NITI Aayog", frequency: 0, years: {}, tier: "medium" },
      { id: "droughthill", num: 2, title: "Drought Prone Area & Hill Area Development Programmes", frequency: 0, years: {}, tier: "low" },
      { id: "bharmaurcasestudy", num: 3, title: "Case Study — ITDP Bharmaur", frequency: 0, years: {}, tier: "low" },
      { id: "sustainabledevelopment", num: 4, title: "Sustainable Development", frequency: 0, years: {}, tier: "medium" },
      { id: "igcanalcasestudy", num: 5, title: "Case Study — Indira Gandhi Canal Command Area", frequency: 0, years: {}, tier: "medium" },
    ], },
    { id: "b1c7", num: 7, title: "Transport and Communication", desc: "Modes and networks of transport and communication that bind India's regions together.", ready: true, topics: [
      { id: "roadtransport", num: 1, title: "Road Transport", frequency: 0, years: {}, tier: "high" },
      { id: "railtransport", num: 2, title: "Rail Transport", frequency: 0, years: {}, tier: "medium" },
      { id: "waterairtransport", num: 3, title: "Water & Air Transport, and Pipelines", frequency: 0, years: {}, tier: "medium" },
      { id: "communicationnetworks", num: 4, title: "Communication Networks", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b1c8", num: 8, title: "International Trade", desc: "The basis of India's foreign trade, its changing composition and direction, and major sea and air ports.", ready: true, topics: [
      { id: "tradepattern", num: 1, title: "Changing Pattern of India\\", frequency: 0, years: {}, tier: "medium" },
      { id: "directiontrade", num: 2, title: "Direction of Trade", frequency: 0, years: {}, tier: "low" },
      { id: "seaports", num: 3, title: "Sea Ports as Gateways of International Trade", frequency: 0, years: {}, tier: "medium" },
      { id: "airtransporttrade", num: 4, title: "Airports in International Trade", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b1c9", num: 9, title: "Geographical Perspective on Selected Issues and Problems", desc: "Environmental pollution, urban waste disposal, rural–urban migration and land degradation.", ready: true, topics: [
      { id: "environmentalpollution", num: 1, title: "Environmental Pollution", frequency: 0, years: {}, tier: "high" },
      { id: "urbanwastedisposal", num: 2, title: "Urban Waste Disposal", frequency: 0, years: {}, tier: "medium" },
      { id: "ruralurbanmigration", num: 3, title: "Rural–Urban Migration", frequency: 0, years: {}, tier: "medium" },
      { id: "slumsproblems", num: 4, title: "Problems of Slums", frequency: 0, years: {}, tier: "medium" },
      { id: "landdegradation", num: 5, title: "Land Degradation", frequency: 0, years: {}, tier: "medium" },
    ], },
  ] },
  { key: "b2", name: "Fundamentals of Human Geography", emoji: "\ud83c\udf0d", chapters: [
    { id: "b2c1", num: 1, title: "Human Geography: Nature and Scope", desc: "The nature and scope of human geography, and the evolving relationship between people and their environment.", ready: true, topics: [
      { id: "naturehumangeography", num: 1, title: "Nature of Human Geography", frequency: 0, years: {}, tier: "medium" },
      { id: "fieldssubfields", num: 2, title: "Fields and Sub-fields of Human Geography", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b2c2", num: 2, title: "The World Population: Distribution, Density and Growth", desc: "Global patterns of population distribution and density, and the stages of demographic transition.", ready: true, topics: [
      { id: "worlddistdensity", num: 1, title: "Patterns of Population Distribution & Density", frequency: 0, years: {}, tier: "high" },
      { id: "worldpopgrowth", num: 2, title: "Population Growth — Concepts & Components", frequency: 0, years: {}, tier: "high" },
      { id: "migrationworld", num: 3, title: "Migration — Push & Pull Factors", frequency: 0, years: {}, tier: "medium" },
      { id: "demographictransition", num: 4, title: "Demographic Transition & Population Control", frequency: 0, years: {}, tier: "high" },
    ], },
    { id: "b2c3", num: 3, title: "Human Development", desc: "The concept of human development and the indicators and approaches used to measure it.", ready: true, topics: [
      { id: "growthdevelopment", num: 1, title: "Growth, Development & the Concept of Human Development", frequency: 0, years: {}, tier: "medium" },
      { id: "hdiapproaches", num: 2, title: "HDI & Approaches to Human Development", frequency: 0, years: {}, tier: "high" },
      { id: "internationalcomparisons", num: 3, title: "International Comparisons of Human Development", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b2c4", num: 4, title: "Primary Activities", desc: "Hunting and gathering, pastoralism, agriculture and mining across the major world regions.", ready: true, topics: [
      { id: "huntinggatheringpastoral", num: 1, title: "Hunting, Gathering & Pastoralism", frequency: 0, years: {}, tier: "medium" },
      { id: "subsistenceagriculture", num: 2, title: "Subsistence Agriculture", frequency: 0, years: {}, tier: "high" },
      { id: "commercialagriculture", num: 3, title: "Plantation, Commercial Grain & Mixed Farming", frequency: 0, years: {}, tier: "high" },
      { id: "specializedagriculture", num: 4, title: "Dairy, Mediterranean & Market Gardening", frequency: 0, years: {}, tier: "medium" },
      { id: "miningactivity", num: 5, title: "Mining", frequency: 0, years: {}, tier: "medium" },
    ], },
    { id: "b2c5", num: 5, title: "Secondary Activities", desc: "Types of manufacturing and the factors that influence where industry locates.", ready: true, topics: [
      { id: "manufacturingcharacteristics", num: 1, title: "Manufacturing & Industrial Location", frequency: 0, years: {}, tier: "high" },
      { id: "industryclassification", num: 2, title: "Classification of Manufacturing Industries", frequency: 0, years: {}, tier: "medium" },
      { id: "hightechindustry", num: 3, title: "High-Tech Industry & Technopolies", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b2c6", num: 6, title: "Tertiary and Quaternary Activities", desc: "Trade, transport, tourism and knowledge-based services in the modern world economy.", ready: true, topics: [
      { id: "tertiaryactivitiestypes", num: 1, title: "Tertiary Activities — Trade, Transport & Communication", frequency: 0, years: {}, tier: "medium" },
      { id: "servicestourism", num: 2, title: "Services & Tourism", frequency: 0, years: {}, tier: "high" },
      { id: "quaternaryquinary", num: 3, title: "Quaternary & Quinary Activities", frequency: 0, years: {}, tier: "low" },
    ], },
    { id: "b2c7", num: 7, title: "Transport and Communication", desc: "World transport networks by land, water and air, and the growth of modern communication.", ready: true, topics: [
      { id: "roadtransportworld", num: 1, title: "Road Transport of the World", frequency: 0, years: {}, tier: "medium" },
      { id: "railtransportworld", num: 2, title: "Railways of the World", frequency: 0, years: {}, tier: "high" },
      { id: "watertransportworld", num: 3, title: "Water Transport — Sea Routes, Canals & Inland Waterways", frequency: 0, years: {}, tier: "medium" },
      { id: "airtransportworld", num: 4, title: "Air Transport & Pipelines", frequency: 0, years: {}, tier: "low" },
      { id: "communicationworld", num: 5, title: "Communications — From Telegraph to Cyberspace", frequency: 0, years: {}, tier: "medium" },
    ], },
    { id: "b2c8", num: 8, title: "International Trade", desc: "The basis and changing pattern of world trade, and the role of international trade organisations.", ready: true, topics: [
      { id: "historytrade", num: 1, title: "History & Basis of International Trade", frequency: 0, years: {}, tier: "medium" },
      { id: "tradetypesorgs", num: 2, title: "Balance of Trade, Free Trade & the WTO", frequency: 0, years: {}, tier: "low" },
      { id: "portsgateways", num: 3, title: "Ports — Gateways of International Trade", frequency: 0, years: {}, tier: "low" },
    ], },
  ] },
]

export const GEO_CHAPTERS = GEO_UNITS.flatMap(u => u.chapters.filter(c => c.ready))
