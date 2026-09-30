import { create } from 'zustand';
import {
  ForecastHorizon,
  Language,
  RiskLevel,
  UserRole,
  StateOption,
  DistrictOption,
  BlockOption,
  PanchayatOption,
  CropInfo,
  CropStage,
} from '../../shared/types';
import { CROPS_REGISTRY } from '../../shared/constants';

interface AppState {
  // Locale & Role
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Forecast Horizon
  selectedHorizon: ForecastHorizon;
  setSelectedHorizon: (horizon: ForecastHorizon) => void;

  // Geographic hierarchy populated from GET /api/locations
  states: StateOption[];
  setStates: (statesList: StateOption[]) => void;

  // Selected Location Hierarchy
  selectedState: StateOption | null;
  selectedDistrict: DistrictOption | null;
  selectedBlock: BlockOption | null;
  selectedPanchayat: PanchayatOption | null;
  activeCoords: { latitude: number; longitude: number };

  setStateById: (stateId: string) => void;
  setDistrictById: (districtId: string) => void;
  setBlockById: (blockId: string) => void;
  setPanchayatById: (panchayatId: string) => void;
  setDirectCoords: (coords: { latitude: number; longitude: number; name?: string }) => void;

  getActiveLocationId: () => string;
  getActiveLocationName: () => string;

  // Crop selection
  selectedCrop: CropInfo;
  setSelectedCropById: (cropId: string) => void;
  selectedCropStage: CropStage;
  setSelectedCropStage: (stage: CropStage) => void;

  // Global Filter / Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRisk: RiskLevel | 'ALL';
  setFilterRisk: (risk: RiskLevel | 'ALL') => void;
}

const defaultCrop = CROPS_REGISTRY[0];
const defaultCoords = { latitude: 21.257, longitude: 77.511 }; // Achalpur / Vidarbha agricultural zone

export const useAppStore = create<AppState>((set, get) => ({
  language: 'en',
  setLanguage: (lang: Language) => set({ language: lang }),

  userRole: 'farmer',
  setUserRole: (role: UserRole) => set({ userRole: role }),

  selectedHorizon: 14,
  setSelectedHorizon: (horizon: ForecastHorizon) => set({ selectedHorizon: horizon }),

  states: [],
  setStates: (statesList: StateOption[]) => {
    const firstState = statesList[0] || null;
    const firstDistrict = firstState?.districts[0] || null;
    const firstBlock = firstDistrict?.blocks[0] || null;
    const firstPanchayat = firstBlock?.panchayats[0] || null;

    const lat = firstPanchayat?.latitude || firstBlock?.latitude || defaultCoords.latitude;
    const lon = firstPanchayat?.longitude || firstBlock?.longitude || defaultCoords.longitude;

    set({
      states: statesList,
      selectedState: firstState,
      selectedDistrict: firstDistrict,
      selectedBlock: firstBlock,
      selectedPanchayat: firstPanchayat,
      activeCoords: { latitude: lat, longitude: lon },
    });
  },

  selectedState: null,
  selectedDistrict: null,
  selectedBlock: null,
  selectedPanchayat: null,
  activeCoords: defaultCoords,

  setStateById: (stateId: string) => {
    const state = get().states.find((s) => s.id === stateId) || null;
    if (!state) return;
    const district = state.districts[0] || null;
    const block = district?.blocks[0] || null;
    const panchayat = block?.panchayats[0] || null;
    const lat = panchayat?.latitude || block?.latitude || defaultCoords.latitude;
    const lon = panchayat?.longitude || block?.longitude || defaultCoords.longitude;

    set({
      selectedState: state,
      selectedDistrict: district,
      selectedBlock: block,
      selectedPanchayat: panchayat,
      activeCoords: { latitude: lat, longitude: lon },
    });
  },

  setDistrictById: (districtId: string) => {
    const currentState = get().selectedState;
    if (!currentState) return;
    const district = currentState.districts.find((d) => d.id === districtId) || null;
    if (!district) return;
    const block = district.blocks[0] || null;
    const panchayat = block?.panchayats[0] || null;
    const lat = panchayat?.latitude || block?.latitude || defaultCoords.latitude;
    const lon = panchayat?.longitude || block?.longitude || defaultCoords.longitude;

    set({
      selectedDistrict: district,
      selectedBlock: block,
      selectedPanchayat: panchayat,
      activeCoords: { latitude: lat, longitude: lon },
    });
  },

  setBlockById: (blockId: string) => {
    const currentDistrict = get().selectedDistrict;
    if (!currentDistrict) return;
    const block = currentDistrict.blocks.find((b) => b.id === blockId) || null;
    if (!block) return;
    const panchayat = block.panchayats[0] || null;
    const lat = panchayat?.latitude || block?.latitude || defaultCoords.latitude;
    const lon = panchayat?.longitude || block?.longitude || defaultCoords.longitude;

    set({
      selectedBlock: block,
      selectedPanchayat: panchayat,
      activeCoords: { latitude: lat, longitude: lon },
    });
  },

  setPanchayatById: (panchayatId: string) => {
    const currentBlock = get().selectedBlock;
    if (!currentBlock) return;
    const panchayat = currentBlock.panchayats.find((p) => p.id === panchayatId) || null;
    const lat = panchayat?.latitude || currentBlock.latitude || defaultCoords.latitude;
    const lon = panchayat?.longitude || currentBlock.longitude || defaultCoords.longitude;

    set({
      selectedPanchayat: panchayat,
      activeCoords: { latitude: lat, longitude: lon },
    });
  },

  setDirectCoords: ({ latitude, longitude }) => {
    set({ activeCoords: { latitude, longitude } });
  },

  getActiveLocationId: () => {
    const state = get();
    return (
      state.selectedPanchayat?.id ||
      state.selectedBlock?.id ||
      state.selectedDistrict?.id ||
      state.selectedState?.id ||
      'blk-mh-amr-ach'
    );
  },

  getActiveLocationName: () => {
    const state = get();
    const parts = [
      state.selectedPanchayat?.name,
      state.selectedBlock?.name,
      state.selectedDistrict?.name,
      state.selectedState?.name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Achalpur, Amravati, Maharashtra';
  },

  selectedCrop: defaultCrop,
  setSelectedCropById: (cropId: string) => {
    const crop = CROPS_REGISTRY.find((c) => c.id === cropId) || defaultCrop;
    set({
      selectedCrop: crop,
      selectedCropStage: crop.stages[1] || 'Sowing & Germination',
    });
  },

  selectedCropStage: 'Sowing & Germination',
  setSelectedCropStage: (stage: CropStage) => set({ selectedCropStage: stage }),

  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  filterRisk: 'ALL',
  setFilterRisk: (risk: RiskLevel | 'ALL') => set({ filterRisk: risk }),
}));
