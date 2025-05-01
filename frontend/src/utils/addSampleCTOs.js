export const addSampleCTOs = () => {
  const sampleCTOs = [];
  localStorage.setItem('ctos', JSON.stringify(sampleCTOs));
  return sampleCTOs;
};

export const clearAllData = () => {
  localStorage.removeItem('ctos');
  localStorage.removeItem('olts');
  localStorage.removeItem('splitters');
  localStorage.removeItem('fiberPaths');
  localStorage.removeItem('networkElements');
}; 