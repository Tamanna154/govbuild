/**
 * Curated authentic Gujarat Government building and civil infrastructure imagery
 * Provides realistic facility images based on building type, naming, or attributes
 */

export const DEFAULT_BUILDING_FALLBACK = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';

export const getBuildingImage = (building?: {
  id?: string;
  buildingId?: string;
  name?: string;
  type?: string;
  imageUrl?: string;
}): string => {
  if (building?.imageUrl) return building.imageUrl;

  const name = (building?.name || '').toLowerCase();
  const type = (building?.type || '').toLowerCase();
  const bId = (building?.buildingId || '').toLowerCase();

  // Swarnim Sankul 1 & 2 / New Sachivalaya, Gandhinagar
  if (name.includes('sankul') || name.includes('secretariat') || bId.includes('gnd-001') || bId.includes('gnd-002') || type.includes('secretariat')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
  }

  // Gujarat High Court Complex, Sola, Ahmedabad
  if (name.includes('court') || name.includes('judicial') || type.includes('court') || bId.includes('ahm-002')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80';
  }

  // Civil Hospital & Asarwa Trauma Center, Ahmedabad
  if (name.includes('hospital') || name.includes('medical') || name.includes('trauma') || type.includes('hospital') || bId.includes('ahm-001')) {
    return 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80';
  }

  // Ahmedabad District Collectorate / Gandhinagar Seva Sadan
  if (name.includes('collector') || name.includes('sewa sadan') || name.includes('bhavan') || type.includes('collector') || bId.includes('ahm-003') || bId.includes('gnd-003')) {
    return 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80';
  }

  // State Data Centre / Tech Facility / Command Centre
  if (name.includes('data') || name.includes('datacenter') || name.includes('command') || name.includes('it center') || bId.includes('gnd-004')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80';
  }

  // Government Engineering College (GEC) / Polytechnic / Institute
  if (name.includes('polytechnic') || name.includes('college') || name.includes('engineering') || name.includes('institute') || type.includes('training') || bId.includes('gnd-005')) {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';
  }

  // Multi-Storey Administrative Towers (Bahumali Bhavan)
  if (name.includes('multistorey') || name.includes('tower') || name.includes('complex') || bId.includes('ahm-004')) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
  }

  // Standard Gujarat State Institutional Building
  return DEFAULT_BUILDING_FALLBACK;
};
