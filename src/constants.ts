import { Formula } from "./types";

export const ACCOUNTING_FORMULAS: Formula[] = [
  {
    name: "Accounting Equation (হিসাব সমীকরণ)",
    formula: "Assets = Liabilities + Owner's Equity (সম্পদ = দায় + মালিকানা স্বত্ব)",
    description: "The fundamental basis of accounting."
  },
  {
    name: "Gross Profit (মোট লাভ)",
    formula: "Net Sales - Cost of Goods Sold (নিট বিক্রয় - বিক্রীত পণ্যের ব্যয়)",
    description: "Profit before operating expenses."
  },
  {
    name: "Net Profit (নিট লাভ)",
    formula: "Gross Profit - Operating Expenses + Other Income (মোট লাভ - পরিচালন ব্যয় + অন্যান্য আয়)",
    description: "The final profit after all expenses."
  },
  {
    name: "Working Capital (চলতি মূলধন)",
    formula: "Current Assets - Current Liabilities (চলতি সম্পদ - চলতি দায়)",
    description: "Capital available for day-to-day operations."
  },
  {
    name: "Straight Line Depreciation (সরলরৈখিক অবচয়)",
    formula: "(Cost - Salvage Value) / Useful Life ((ক্রয়মূল্য - ভগ্নাবশেষ মূল্য) / আয়ুষ্কাল)",
    description: "Equal depreciation expense each year."
  },
  {
    name: "Current Ratio (চলতি অনুপাত)",
    formula: "Current Assets / Current Liabilities (চলতি সম্পদ / চলতি দায়)",
    description: "Measures short-term liquidity."
  }
];
