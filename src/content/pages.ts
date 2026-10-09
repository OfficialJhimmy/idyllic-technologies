/**
 * Approved copy for the corporate site, taken word for word from "Idyllic Website Content.pdf".
 * Do not correct spelling, grammar or capitalisation here. Spelling errors in the source are kept on
 * purpose until Idyllic approves a change. Anything the PDF does not supply is marked TODO.
 * Home page statistics, the work process figures, contact details and team members are editable values
 * in the site_values table (seeded from src/content/site-values.ts), not here.
 */

export const company = {
  name: "Idyllic Technologies",
  /** Footer and "Who we are" statement. */
  statement:
    "Idyllic Technologies is Nigeria's leading renewable energy company that is focused on selling and distribution of high quality renewable products from OEM (Original Equipment Manufacturers) with proven track records.",
  overview:
    "We are a global renewable energy company focused on distribution of high-quality renewable products from OEM (Original Equipment Manufacturers) with proven track records. Our team of experienced engineers are on ground to attend to the needs of our customers 24/7.",
  helpLabel: "Need Help? Call us now:",
  officeLabel: "Visit Our Office:",
  /** Wording kept as supplied, including "All Right Reserved". Only the year changed: {year} is filled in with the current year. */
  copyright: "Copyright © {year} Idyllic Technologies, All Right Reserved",
} as const;

export const hero = {
  title: "Let The Sun Do The Work",
  body: "Energize the future with the power of solar energy.",
  detail:
    "Idyllic Technologies delivers clean, sustainable, and reliable electricity solutions designed for both businesses and homes. Harness innovative solar technology to reduce costs, minimize environmental impact, and enjoy uninterrupted energy, while contributing to a greener, smarter, and more efficient future for everyone.",
  image: { src: "/photos/hero.webp", alt: "Rows of solar panels on a metal roof under a sunrise sky", width: 2400, height: 1350 },
} as const;

export type Industry = { id: string; title: string; body: string; image: { src: string; alt: string; width: number; height: number } };

export const industriesIntro = { title: "Industries We Cover", body: company.overview } as const;

export const industries: readonly Industry[] = [
  {
    id: "banking-financial-services",
    title: "Banking & Financial Services",
    body: "Idyllic Technologies delivers customized energy solutions for the banking and financial sector.",
    image: { src: "/photos/industry-banking.webp", alt: "Rows of server racks in a dark, blue-lit data hall", width: 1400, height: 1400 },
  },
  {
    id: "capital-projects-infrastructure",
    title: "Capital Projects & Infrastructure",
    body: "Specialized capabilities to help clients face the challenges of today.",
    image: { src: "/photos/industry-infrastructure.webp", alt: "Electrical meters and pipework fixed to a plastered wall", width: 1400, height: 933 },
  },
  {
    id: "hospitality",
    title: "Hospitality",
    body: "Our Hybrid solution provide alternative energy solution which in turn reduces cost of operations",
    image: { src: "/photos/industry-hospitality.webp", alt: "A technician in a yellow hard hat servicing an outdoor cooling unit", width: 1400, height: 933 },
  },
  {
    id: "travel-transport-logistics",
    title: "Travel, Transport & Logistics",
    body: "Idyllic Technologies delivers innovative alternative energy solutions for the Travel and Logistics industry",
    image: { src: "/photos/industry-travel.webp", alt: "Wind turbines in a field under an evening sky", width: 1400, height: 933 },
  },
  {
    id: "healthcare-life-sciences",
    title: "Healthcare & Life Sciences",
    body: "We provide affordable protection for network and telecom equipment, IDF, servers, storage, VoIP and distributed IT,",
    image: { src: "/photos/industry-healthcare.webp", alt: "A long server room lit in cool blue light", width: 1400, height: 862 },
  },
  {
    id: "energy-power-products",
    title: "Energy, Power & Products",
    body: "We have made the demand and supply of electricity more convenient by making alternative energy solutions available at an affordable cost",
    image: { src: "/photos/industry-energy.webp", alt: "Solar panels and wind turbines beside a power station at sunset", width: 1400, height: 800 },
  },
];

export const whyIdyllic: readonly { title: string; body: string }[] = [
  {
    title: "We love to make things easy",
    body: "At Idyllic Technologies, we strive to make every interaction effortless and seamless for our customers, partners, and team members. We listen, support, and provide solutions that simplify their experience, because we genuinely care about their success and satisfaction.",
  },
  {
    title: "Commitment to innovation",
    body: "We like to think a bit deeper about things, proud of our ability to find pragmatic solutions. We always think a few steps ahead of everyone else.",
  },
  {
    title: "Building trusted partnership",
    body: "We work side-by-side with our clients to execute strategic recommendations and build lasting, value-driven relationships.",
  },
];

export const productsIntro = {
  title: "Our Products",
  body: "We operate as a global renewable energy solutions provider, specializing in the sourcing and distribution of premium renewable energy products that enable residential, commercial, and industrial users to achieve dependable and sustainable power independence.",
} as const;

export const team = {
  title: "Our Team",
  body: "At the heart of everything we do is a team committed to innovation, reliability, and customer satisfaction. We don’t just provide power solutions; we build systems you can trust.",
  ceoPhoto: { src: "/photos/tonia-ozoede.webp", alt: "Tonia Ozoede, CEO & Founder of Idyllic Technologies", width: 810, height: 1080 },
} as const;

export const about = {
  title: "About Us",
  whoWeAre: { title: "Who We are", body: "Idyllic technologies limited is an Alternative Energy company" },
  valueProposition: { title: "Our value proposition", body: "We focus on Customer satisfaction" },
  qualityAssurance: { title: "Our quality assurance", body: "All our product come with guarantee" },
  headline: "Idyllic Technologies is Nigeria leading renewable energy solution",
  culture: [
    "At Idyllic Technologies we love what we do and our employees are what makes Idyllic Technologies a great place to work! We provide a collaborative, challenging work environment where our employees enjoy coming into work each day to accomplish great things together. Our team are passionate, highly motivated, innovative skilled problem-solvers who thrive in a culture of excellence and operate with integrity in all that they do.",
    "If you are a driven self-starter and want to be part of our long-term success story, join us in our mission to tackle climate change and provide sustainable and reliable power to the African continent.",
  ],
  ceo: { name: "Tonia Ozoede", role: "CEO & Founder" },
  image: { src: "/photos/engineers.webp", alt: "Three engineers in white hard hats looking over plans beside rows of solar panels", width: 1600, height: 1065 },
} as const;

export const workProcess = {
  title: "Our Work Process",
  body: "Energize the future with solar power, Sustainable Solar Electricity for Clean, reliable energy for your business or home",
  steps: [
    { title: "Customer solution", body: "We Provide Complete custom made System Solutions" },
    { title: "Strategic planning", body: "Our installation come with detail strategic planning" },
    { title: "Get a Solution", body: "Services and outstanding Quality is our brand identity" },
  ],
} as const;

export const responsibility = {
  title: "Corporate Responsibility",
  body: "Idyllic Technologies tackle climate change and provide sustainable and reliable power to the African continent.",
  pillars: [
    { title: "Education", body: "At Idyllic Technologies, education is one major tool that we use to drive oneness and community unity and interrelation" },
    // TODO(content): the PDF names Environment and Community but gives no copy for them. Ask Idyllic.
    { title: "Environment", body: null },
    { title: "Community", body: null },
  ],
  image: { src: "/photos/responsibility.webp", alt: "A single wind turbine on a green hillside above the sea", width: 1200, height: 1797 },
} as const;

export const mission = {
  title: "Mission & Values",
  mission: {
    title: "Our Mission",
    quote: "“Providing innovative and requires solutions with best of skills.”",
    body: "Our mission at Idyllic Technologies is to become the leading company in Nigeria representing the BEST international quality brands in alternative power source, giving best quality standard that will impact positively on the business of our customers.",
  },
  vision: {
    title: "Our Vision",
    quote: "“Fulfilling clients’ requirements to have long term relationships.”",
    body: "We are dedicated to ensuring that our products and services fully meet the requirements of our customers at all times. Our goal is to achieve a high level of customer satisfaction.",
  },
  values: {
    title: "Core Values",
    quote: "“We are a value-driven organization. Our values reflect the thinking of our founder, Tonia Ozoede.”",
    items: ["Clients’ Satisfaction", "Team Work", "Clients’ Respect", "Clients’ Loyalty", "Clients’ Integrity"],
  },
} as const;

export const cta = {
  title: "For Business Process",
  body: "Call Us at +2347037973666 or click below to get a quote",
  image: { src: "/photos/cta.webp", alt: "A field of solar panels under a sky of large white clouds", width: 2000, height: 1333 },
} as const;

export const contactPage = {
  title: "Contact",
  welcome: "Welcome to Idyllic Technologies",
  queries: "Any queries? Call us.",
  career: {
    title: "Career",
    body: "Do you want to build a career with us? Idyllic Technologies has over the years welcome season and aspiring professionals into the workforce, Kindly send us a mail with your updated CV;",
  },
  branches: "2+ Branches Worldwide.",
  sendLabel: "Send Message Us",
} as const;

export const marketplaceNote = {
  /** The PDF's closing line, for the products page. */
  body: "Thank you for your interest in Idyllic Technologies Products. To shop now visit our market place www.shop.idyllictechnologies.com",
} as const;

export const blogPage = { title: "News & Events" } as const;
export const faqPage = { title: "FAQs" } as const;
