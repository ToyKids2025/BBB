
// Script para limpar dados antigos
if (typeof window !== 'undefined') {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  console.log('✅ Cache e dados locais limpos');
}
