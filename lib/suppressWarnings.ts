// Suppress next-themes script injection warning (harmless but noisy)
if (typeof console !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag while rendering')
    ) {
      return; // Suppress this specific warning
    }
    originalError(...args);
  };
}