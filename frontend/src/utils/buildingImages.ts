/**
 * Curated high-resolution Gujarat Government building and civil infrastructure imagery
 * Provides realistic facility images based on building type, naming, or attributes
 */

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

  // Swarnim Sankul / Secretariat (Gandhinagar)
  if (name.includes('sankul') || name.includes('secretariat') || bId.includes('gnd-001') || type.includes('secretariat')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80';
  }

  // Civil Hospital / Medical Institute
  if (name.includes('hospital') || name.includes('medical') || name.includes('trauma') || type.includes('hospital')) {
    return 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80';
  }

  // High Court / District & Sessions Court
  if (name.includes('court') || name.includes('judicial') || type.includes('court')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80';
  }

  // Collectorate / Bhavan / Administrative Centre
  if (name.includes('collector') || name.includes('sewa sadan') || name.includes('bhavan') || type.includes('collector')) {
    return 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80';
  }

  // State Data Centre / Tech Facility
  if (name.includes('data') || name.includes('datacenter') || name.includes('command') || name.includes('it center')) {
    return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80';
  }

  // Engineering / Polytechnic / Training Academy
  if (name.includes('polytechnic') || name.includes('college') || name.includes('training') || name.includes('institute') || type.includes('training')) {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80';
  }

  // Revenue / Multi-storey Civil Towers
  if (name.includes('multistorey') || name.includes('tower') || name.includes('complex')) {
    return 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1000&q=80';
  }

  // Standard Gujarat State Institutional Building
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80';
};
