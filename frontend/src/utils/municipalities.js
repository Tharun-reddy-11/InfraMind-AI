export const MUNICIPAL_CORPORATIONS = [
  // Andhra Pradesh
  { id: 'TMC', name: 'Tirupati Municipal Corporation (TMC)', city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192, defaultPin: '517501' },
  { id: 'GVMC', name: 'Greater Visakhapatnam Municipal Corporation (GVMC)', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, defaultPin: '530001' },
  { id: 'VMC', name: 'Vijayawada Municipal Corporation (VMC)', city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, defaultPin: '520001' },
  { id: 'GMC', name: 'Guntur Municipal Corporation (GMC)', city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, defaultPin: '522002' },
  { id: 'KMC_AP', name: 'Kurnool Municipal Corporation (KMC)', city: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373, defaultPin: '518001' },
  { id: 'RMC', name: 'Rajahmundry Municipal Corporation (RMC)', city: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040, defaultPin: '533101' },
  { id: 'NMC_AP', name: 'Nellore Municipal Corporation (NMC)', city: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865, defaultPin: '524001' },
  { id: 'KKD', name: 'Kakinada Municipal Corporation (KMC)', city: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475, defaultPin: '533001' },
  { id: 'KDP', name: 'Kadapa Municipal Corporation (KMC)', city: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lng: 78.8242, defaultPin: '516001' },
  { id: 'AMC', name: 'Anantapur Municipal Corporation (AMC)', city: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, defaultPin: '515001' },
  { id: 'EMC', name: 'Eluru Municipal Corporation (EMC)', city: 'Eluru', state: 'Andhra Pradesh', lat: 16.7107, lng: 81.0952, defaultPin: '534001' },
  { id: 'OMC', name: 'Ongole Municipal Corporation (OMC)', city: 'Ongole', state: 'Andhra Pradesh', lat: 15.5057, lng: 80.0499, defaultPin: '523001' },

  // Telangana
  { id: 'GHMC', name: 'Greater Hyderabad Municipal Corporation (GHMC)', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, defaultPin: '500001' },
  { id: 'GWMC', name: 'Greater Warangal Municipal Corporation (GWMC)', city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941, defaultPin: '506001' },
  { id: 'NMC_TG', name: 'Nizamabad Municipal Corporation (NMC)', city: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941, defaultPin: '503001' },
  { id: 'KMC_TG', name: 'Karimnagar Municipal Corporation (KMC)', city: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288, defaultPin: '505001' },
  { id: 'KHM', name: 'Khammam Municipal Corporation (KMC)', city: 'Khammam', state: 'Telangana', lat: 17.2473, lng: 80.1514, defaultPin: '507001' },
  { id: 'RMC_TG', name: 'Ramagundam Municipal Corporation (RMC)', city: 'Ramagundam', state: 'Telangana', lat: 18.7557, lng: 79.4744, defaultPin: '505208' },
  { id: 'MBNR', name: 'Mahbubnagar Municipal Corporation', city: 'Mahbubnagar', state: 'Telangana', lat: 16.7488, lng: 77.9947, defaultPin: '509001' },
];

export function getMunicipalityByCity(city) {
  if (!city) return MUNICIPAL_CORPORATIONS[0];
  const found = MUNICIPAL_CORPORATIONS.find(m => m.city.toLowerCase() === city.toLowerCase());
  return found || MUNICIPAL_CORPORATIONS[0];
}
