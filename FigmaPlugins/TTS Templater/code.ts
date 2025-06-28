// This plugin creates the TTS layout based on existing cards on the Card Grid Page
const CARD_GRID_PAGE_NAME = "Card Grid";
const CARD_TEMPLATE_COMPONENT_NAME = "#cardComponent";
const RARITY_VAR_NAME = "#rarityVar";
const ERA_VAR_NAME = "#eraVar";

const eras: string[] = [
  "Past",
  "Present",
  "Future",
  "Starter",
  "Curse"
]

const CARD_WIDTH = 825;
const CARD_HEIGHT = 1125;

CreateTTSLayout();

async function CreateTTSLayout()
{
  const currentPage = figma.currentPage;

  // Clear out the current page.
  ClearPage(currentPage);

  // Grab access to the template page

  try {
    const templatePage = await loadPageByName(CARD_GRID_PAGE_NAME);
  
    // Start iterating through all of the cards on the template page
    let cardIndex = 0;
    const maxColumns = 10;

    // Iterate through the children of the template page
    // These should be the individual cards
    for (const templateNode of templatePage.children) {
      // If we've found a card template, start the copying process
      if (templateNode.name === CARD_TEMPLATE_COMPONENT_NAME) {
        // Get the card template as a component node
        const cardTemplateComponent = templateNode as ComponentNode;

        // Find the rarity node
        const rarityNumber = GetRarityValue(cardTemplateComponent);
        if (rarityNumber < 0) {
          console.warn(`Couldn't find rarity value for "${cardTemplateComponent.name}", continuing...`);
          continue;
        } else {
          // Create clones, place them on the template
          for (let i = 0; i < rarityNumber; i++) {
            const clone = cardTemplateComponent.clone();
            const col = cardIndex % maxColumns;
            const row = Math.floor(cardIndex / maxColumns);
            clone.x = col * CARD_WIDTH;
            clone.y = row * CARD_HEIGHT;
            currentPage.appendChild(clone);
            cardIndex++;
          }
        }
      }
    }
    
  } catch (error) {
    console.log((error as Error).message);
  } finally {
    figma.closePlugin();
  }
}

function ClearPage(page: PageNode) {
    // Clear out the current page.
    for (const node of page.children) {
      node.remove();
    }
}

async function loadPageByName(pageName: string): Promise<PageNode> {
  const page = figma.root.children.find(p => p.name === pageName);
  if (!page) {
    throw new Error(`Page "${pageName}" not found`);
  }
  await page?.loadAsync();
  return page;
}

function GetRarityValue(card : ComponentNode) : number {

  // Find the rarity node, sanity check
  const rarityNode = card.findOne(n => n.name === RARITY_VAR_NAME && n.type === "TEXT") as TextNode | null;
  if (!rarityNode) {
    console.warn(`Couldn't find "${RARITY_VAR_NAME}" in ${card.name}`);
    return -1;
  }

  // Convert to a number, sanity check
  const rarityText = rarityNode.characters.trim();
  const rarityNumber = parseInt(rarityText, 10);
  if (isNaN(rarityNumber)) {
    console.warn(`Invalid rarity number "${rarityText}" in ${card.name}`);
    return -1;
  }

  return rarityNumber;
}



