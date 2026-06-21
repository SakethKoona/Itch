import type { Block } from './types'

export type EnvTemplate = {
  id: string
  name: string
  tagline: string
  blocks: Block[]
}

export const TEMPLATES: EnvTemplate[] = [
  {
    id: 'tpl-inventory',
    name: 'Inventory Manager',
    tagline: 'Agent monitors stock and places restocking orders',
    blocks: [
      {
        id: 'tpl-inv-env', type: 'env', x: 40, y: 40,
        description: 'A retail inventory management system. The agent monitors stock levels across a product catalog and makes restocking decisions when items fall below their reorder point.',
      },
      {
        id: 'tpl-inv-tool1', type: 'tool', x: 40, y: 200,
        name: 'check_inventory', inputs: [],
        functionality: 'Returns current stock levels for all products, including quantity on hand, reorder point, and supplier lead time.',
      },
      {
        id: 'tpl-inv-tool2', type: 'tool', x: 40, y: 340,
        name: 'place_order', inputs: [],
        functionality: 'Places a purchase order for a specified product and quantity with the supplier. Returns an order confirmation number.',
      },
      {
        id: 'tpl-inv-task1', type: 'task', x: 360, y: 40,
        prompt: 'Three products in the catalog are below their reorder point. Check inventory and place orders to bring all products back to safe stock levels.',
        graders: [
          { id: 'tpl-inv-g1', graderType: 'state', weight: 60, condition: 'All products are at or above their reorder point after the agent acts.' },
          { id: 'tpl-inv-g2', graderType: 'answer', weight: 40, condition: "Agent's response names the specific SKUs it restocked and the quantities ordered." },
        ],
      },
      {
        id: 'tpl-inv-task2', type: 'task', x: 360, y: 260,
        prompt: 'A flash sale is planned for next week. Check which high-demand products have less than 2 weeks of stock remaining and pre-order additional inventory.',
        graders: [
          { id: 'tpl-inv-g3', graderType: 'state', weight: 50, condition: 'All high-demand products have at least 14 days of stock after the agent acts.' },
          { id: 'tpl-inv-g4', graderType: 'answer', weight: 30, condition: "Agent explains its reasoning for which products it chose to pre-order." },
          { id: 'tpl-inv-g5', graderType: 'answer', weight: 20, condition: 'Agent mentions the upcoming flash sale as the motivation for pre-ordering.' },
        ],
      },
    ],
  },
  {
    id: 'tpl-support',
    name: 'Customer Support',
    tagline: 'Agent resolves support tickets using account data',
    blocks: [
      {
        id: 'tpl-sup-env', type: 'env', x: 40, y: 40,
        description: 'A customer support environment for a SaaS product. The agent reads open tickets, looks up account details, and resolves issues by updating ticket status and drafting replies.',
      },
      {
        id: 'tpl-sup-tool1', type: 'tool', x: 40, y: 200,
        name: 'lookup_ticket', inputs: [],
        functionality: 'Retrieves the full details and conversation history of a support ticket by ticket ID. Returns customer name, issue description, and current status.',
      },
      {
        id: 'tpl-sup-tool2', type: 'tool', x: 40, y: 340,
        name: 'resolve_ticket', inputs: [],
        functionality: 'Marks a ticket as resolved and posts a reply to the customer. Requires ticket ID, resolution summary, and reply message.',
      },
      {
        id: 'tpl-sup-task1', type: 'task', x: 360, y: 40,
        prompt: "Ticket #4821: customer reports they can't log in after a password reset. Look up the ticket and resolve it with a clear explanation for the customer.",
        graders: [
          { id: 'tpl-sup-g1', graderType: 'state', weight: 50, condition: 'Ticket #4821 is marked as resolved in the system.' },
          { id: 'tpl-sup-g2', graderType: 'answer', weight: 50, condition: "Agent's reply to the customer includes actionable steps to fix the login issue." },
        ],
      },
      {
        id: 'tpl-sup-task2', type: 'task', x: 360, y: 220,
        prompt: 'There are 5 open tickets from today. Prioritize and resolve the most urgent one first, explaining your prioritization decision.',
        graders: [
          { id: 'tpl-sup-g3', graderType: 'state', weight: 40, condition: 'At least one ticket from today is marked as resolved.' },
          { id: 'tpl-sup-g4', graderType: 'answer', weight: 35, condition: "Agent explains why it chose the ticket it did as most urgent." },
          { id: 'tpl-sup-g5', graderType: 'answer', weight: 25, condition: "Agent's customer reply is empathetic and professional in tone." },
        ],
      },
    ],
  },
  {
    id: 'tpl-research',
    name: 'Research Assistant',
    tagline: 'Agent searches and synthesizes information to answer questions',
    blocks: [
      {
        id: 'tpl-res-env', type: 'env', x: 40, y: 40,
        description: 'A research environment where the agent answers complex questions by searching the web and reading source documents. The agent must cite its sources and synthesize findings clearly.',
      },
      {
        id: 'tpl-res-tool1', type: 'tool', x: 40, y: 200,
        name: 'web_search', inputs: [],
        functionality: 'Searches the web for a query and returns the top 10 results with titles, URLs, and text snippets.',
      },
      {
        id: 'tpl-res-tool2', type: 'tool', x: 40, y: 340,
        name: 'fetch_document', inputs: [],
        functionality: 'Fetches and returns the full text content of a webpage or document given its URL.',
      },
      {
        id: 'tpl-res-task1', type: 'task', x: 360, y: 40,
        prompt: 'What are the three most widely cited papers on reinforcement learning from human feedback (RLHF)? Provide their titles, authors, and publication years.',
        graders: [
          { id: 'tpl-res-g1', graderType: 'answer', weight: 60, condition: 'Agent names at least 3 RLHF papers with correct author attributions.' },
          { id: 'tpl-res-g2', graderType: 'answer', weight: 40, condition: 'Agent provides publication years for each paper and cites sources.' },
        ],
      },
      {
        id: 'tpl-res-task2', type: 'task', x: 360, y: 220,
        prompt: 'Compare the safety approaches of two leading AI labs. Summarize their key differences in under 200 words.',
        graders: [
          { id: 'tpl-res-g3', graderType: 'answer', weight: 50, condition: 'Agent identifies and compares concrete safety techniques from each lab.' },
          { id: 'tpl-res-g4', graderType: 'answer', weight: 30, condition: 'Summary is 200 words or fewer.' },
          { id: 'tpl-res-g5', graderType: 'answer', weight: 20, condition: 'Agent cites at least one primary source from each lab.' },
        ],
      },
    ],
  },
]

export function forkTemplate(template: EnvTemplate): { name: string; blocks: Block[] } {
  // Remap all IDs to fresh UUIDs so the fork is independent
  const idMap = new Map<string, string>()
  const fresh = (old: string) => {
    if (!idMap.has(old)) idMap.set(old, crypto.randomUUID())
    return idMap.get(old)!
  }

  const blocks: Block[] = template.blocks.map(block => {
    if (block.type === 'task') {
      return {
        ...block,
        id: fresh(block.id),
        graders: block.graders.map(g => ({ ...g, id: fresh(g.id) })),
      }
    }
    return { ...block, id: fresh(block.id) }
  })

  return { name: template.name, blocks }
}
