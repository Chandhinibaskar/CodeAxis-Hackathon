// Small sample reference set (same shape as the shared API contract) so judges can try the app quickly.
export const SAMPLE_REFERENCE = {
  brand_guidelines: [
    { id: 'VOICE-01', text: 'Use clear, friendly language. Address readers as "you" or "teams", never "guys".' },
    { id: 'CLAIM-01', text: 'Superlatives such as "best" or "#1" need a cited third-party ranking.' }],
  approved_terms: [
    { id: 'TERM-01', preferred: 'Lumora Invoices', avoid: ['Smart Invoices'] },
    { id: 'TERM-02', preferred: 'customer', avoid: ['consumer'] }],
  approved_facts: [
    { id: 'FACT-01', text: 'Lumora Flow reduces billing time by up to 40% (2025 customer study).' },
    { id: 'FACT-02', text: 'Plans start at $12 per seat per month.' }] }
export const SAMPLE_DRAFT = 'Lumora Flow is the best in the world and cuts billing time by 90%. Hey guys, try our Smart Invoices. Every consumer loves it, and our billing never fails.'
export const EMPTY_REFERENCE = { brand_guidelines: [], approved_terms: [], approved_facts: [] }
