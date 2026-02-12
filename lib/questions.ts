export interface Question {
  id: string;
  label: string;
  prompt: string;
  placeholder: string;
}

export const BUSINESS_PLAN_QUESTIONS: Question[] = [
  {
    id: "business_name",
    label: "Business Name",
    prompt: "What is the name of your business?",
    placeholder: "e.g., TechFlow Solutions",
  },
  {
    id: "business_description",
    label: "Business Description",
    prompt:
      "Describe your business in detail. What does it do, and what makes it unique?",
    placeholder: "e.g., A SaaS platform that automates marketing workflows...",
  },
  {
    id: "target_market",
    label: "Target Market",
    prompt:
      "Who is your target market? Describe your ideal customer demographics and psychographics.",
    placeholder:
      "e.g., Small to medium businesses in the e-commerce sector...",
  },
  {
    id: "problem",
    label: "Problem Being Solved",
    prompt:
      "What specific problem does your business solve? Why does this problem matter?",
    placeholder:
      "e.g., Businesses waste 20+ hours per week on manual marketing tasks...",
  },
  {
    id: "solution",
    label: "Solution / Product",
    prompt:
      "Describe your product or service. How does it solve the problem better than alternatives?",
    placeholder:
      "e.g., An AI-powered platform that automates campaign creation...",
  },
  {
    id: "revenue_model",
    label: "Revenue Model",
    prompt:
      "How will your business make money? Describe your pricing strategy and revenue streams.",
    placeholder:
      "e.g., Monthly SaaS subscription with three tiers: Starter ($29), Pro ($79), Enterprise ($199)...",
  },
  {
    id: "customer_acquisition",
    label: "Customer Acquisition",
    prompt:
      "How will you acquire customers? What marketing and sales channels will you use?",
    placeholder:
      "e.g., Content marketing, SEO, paid ads on Google and LinkedIn...",
  },
  {
    id: "competitive_landscape",
    label: "Competitive Landscape",
    prompt:
      "Who are your main competitors? What gives you a competitive advantage?",
    placeholder:
      "e.g., Main competitors include Mailchimp and HubSpot. Our advantage is...",
  },
  {
    id: "operations",
    label: "Operations Model",
    prompt:
      "How will your business operate day-to-day? Describe your operations, tools, and processes.",
    placeholder:
      "e.g., Fully remote team using agile development methodology...",
  },
  {
    id: "team",
    label: "Leadership Team",
    prompt:
      "Who is on your founding/leadership team? What relevant experience do they bring?",
    placeholder:
      "e.g., CEO: Jane Smith (10 years in SaaS), CTO: John Doe (ex-Google engineer)...",
  },
  {
    id: "financial_projections",
    label: "Financial Projections",
    prompt:
      "What are your financial projections for the next 3 years? Include revenue, costs, and key assumptions.",
    placeholder:
      "e.g., Year 1: $100K revenue, Year 2: $500K, Year 3: $1.5M...",
  },
  {
    id: "funding_needs",
    label: "Funding Needs",
    prompt:
      "How much funding do you need and how will it be used? If self-funded, describe your financial runway.",
    placeholder:
      "e.g., Seeking $500K seed funding for product development and initial marketing...",
  },
  {
    id: "goals_milestones",
    label: "Goals & Milestones",
    prompt:
      "What are your key milestones for the next 12-18 months? What does success look like?",
    placeholder:
      "e.g., Q1: Launch MVP, Q2: 100 paying customers, Q3: Series A prep...",
  },
];

export const TOTAL_STEPS = BUSINESS_PLAN_QUESTIONS.length;
