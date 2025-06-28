// This plugin creates the TTS layout based on existing cards on the Card Grid Page
const eraNameList: string[] = [
  "Past",
  "Present",
  "Future",
  "Starter",
  "Curse"
]

const eraDict: { [key: string] : ComponentNode[];  } = {};

const CARD_GRID_PAGE_NAME = "Card Grid";
const CARD_TEMPLATE_COMPONENT_NAME = "#cardComponent";
const RARITY_VAR_NAME = "#rarityVar";
const ERA_VAR_NAME = "#eraVar";

const MAX_COLUMNS = 10;
const CARD_WIDTH = 825;
const CARD_HEIGHT = 1125;
const ERA_FRAME_SPLIT_DIST = 825;

CreateTTSLayout();

async function CreateTTSLayout()
{
  const currentPage = figma.currentPage;

  // Clear out the current page.
  ClearPage(currentPage);

  // Grab access to the template page

  try {    
    await CreateEraDict();
    PopulateAllEraGrids();
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

async function CreateEraDict() {
  const templatePage = await LoadPageByName(CARD_GRID_PAGE_NAME);

  for (const node of templatePage.children) {
    if (node.name === CARD_TEMPLATE_COMPONENT_NAME) {
      const cardComponent = node as ComponentNode;
      const cardEra = GetEraValue(cardComponent);

      if (cardEra != "") {
        AddToEraDict(cardEra, cardComponent);
      } else {
        console.warn(`Unable to add card - era not found`);
      }
    }
  }
}

async function LoadPageByName(pageName: string): Promise<PageNode> {
  const page = figma.root.children.find(p => p.name === pageName);
  if (!page) {
    throw new Error(`Page "${pageName}" not found`);
  }
  await page?.loadAsync();
  return page;
}

// Get the era value for this card. Returns empty string if
function GetEraValue(card : ComponentNode) : string {
  let era = "";

  const rarityNode = card.findOne(n => n.name === ERA_VAR_NAME && n.type === "TEXT") as TextNode | null;
  if (!rarityNode) {
    console.warn(`Couldn't find "${ERA_VAR_NAME}" in ${card.name}`);
    return "";
  }

  // Sanity Check
  era = rarityNode.characters.trim();
  let isEra = false;
  for (let i = 0; i < eraNameList.length; i++) {
    if (era === eraNameList[i]) {
      isEra = true;
      break;
    }
  }
  if (isEra === false) {
    console.warn(`Text "${era}" in ${card.name} isn't in Eras list!`);
    era = "";
  }

  return era;
}

function AddToEraDict(key: string, component: ComponentNode) {
  if(!eraDict[key]) {
    eraDict[key] = [];
  }
  eraDict[key].push(component);
}

function PopulateAllEraGrids() {
  let nextFrameXPos = 0;
  // For all eras in our list...
  for (let i = 0; i < eraNameList.length; i++) {
    let curEra = eraNameList[i];
    let numCards = eraDict[curEra].length;

    // Create and populate the era grid
    const currentFrame = CreateEraFrame(curEra);
    PopulateEraGrid(currentFrame, eraDict[curEra]);

    // Finish by re-sizing and placing the frame, then prepping for next one
    ResizeEraFrame(currentFrame, numCards);
    currentFrame.x = nextFrameXPos;
    nextFrameXPos = currentFrame.width + ERA_FRAME_SPLIT_DIST;
  }
}

function CreateEraFrame(frameName: string) : FrameNode {
  const gridFrame = figma.createFrame();
  gridFrame.name = frameName + " Deck";
  gridFrame.layoutMode = "NONE";
  figma.currentPage.appendChild(gridFrame);
  return gridFrame;
}

function PopulateEraGrid(frameGrid : FrameNode, cardComponents : ComponentNode[]) {
  for (let i = 0; i < cardComponents.length; i++) {
    const curCard = cardComponents[i];
    const rarityNumber = GetRarityValue(curCard);

    if (rarityNumber < 0) {
      console.warn(`Couldn't find rarity value for "${curCard.name}", continuing...`);
      continue;
    } else {
      // Create clones, place them on the grid
      for (let j = 0; j < rarityNumber; j++) {
        const clone = curCard.clone();
        frameGrid.appendChild(clone);
        const col = i % MAX_COLUMNS;
        const row = Math.floor(i / MAX_COLUMNS);
        clone.x = col * CARD_WIDTH;
        clone.y = row * CARD_HEIGHT;
      }
    }
  }
}

function ResizeEraFrame(eraFrame: FrameNode, numCards : number) {
  const columns = Math.max(numCards, MAX_COLUMNS);
  const rows = Math.ceil(numCards / MAX_COLUMNS);
  const width = columns * CARD_WIDTH;
  const height = rows * CARD_HEIGHT;
  eraFrame.resize(width, height);
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

