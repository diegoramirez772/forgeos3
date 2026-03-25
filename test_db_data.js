const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    const dRes = await fetch(`${API_URL}/domain-profiles`);
    const domains = await dRes.json();
    console.log('Domains:', Array.isArray(domains) ? domains.length : 'Error');
    
    const pRes = await fetch(`${API_URL}/tool-packs`);
    const packs = await pRes.json();
    console.log('Tool Packs:', Array.isArray(packs) ? packs.length : 'Error');
    
    const prRes = await fetch(`${API_URL}/policy-presets`);
    const presets = await prRes.json();
    console.log('Presets:', Array.isArray(presets) ? presets.length : 'Error');
  } catch (err) {
    console.error('Error connecting to backend:', err.message);
  }
}

test();
