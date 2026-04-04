const fs = require('fs');
const f = 'src/lib/weather-service.ts';
let c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');

// 1. Corriger getZonePrecipitation: "serre_tile" -> "serre", "garden" -> "jardin"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('getZonePrecipitation') && lines[i].includes('ZONE_MODIFIERS')) {
    lines[i] = 'export const getZonePrecipitation = (data: RealWeatherData, zoneId: string) => {';
    // Find the closing }
    let j = i;
    while (j < lines.length && !lines[j].includes('? 1.0 : 0')); j++;
    // Replace the whole function body
    const newFunc = [
      'export const getZonePrecipitation = (data: RealWeatherData, zoneId: string) => {',
      '  const zone = zoneId === "serre_tile" ? "serre" : zoneId === "garden" ? "jardin" : "pepiniere";',
      '  return (zone === "jardin" && data.current.isRaining) ? 1.0 : 0;',
      '};',
    ];
    // Remove the old function body (single line)
    lines.splice(i, 1, ...newFunc);
    console.log('getZonePrecipitation fixe');
    break;
  }
}

// 2. Corriger getRealEnvironment: pas un alias, mais une fonction qui calcule l'env params
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const getRealEnvironment = fetchRealWeather')) {
    const newFunc = [
      '/** Calcule les parametres environnementaux pour une zone donnee */',
      'export function getRealEnvironment(data: RealWeatherData, zoneId: string) {',
      '  const zone = zoneId === "serre_tile" ? "serre" : zoneId === "garden" ? "jardin" : "pepiniere";',
      '  const mod = ZONE_MODIFIERS[zone] || ZONE_MODIFIERS.pepiniere;',
      '  const sunHours = data.current.weatherCode <= 1 ? 8 : data.current.weatherCode <= 2 ? 6 : 3;',
      '  return {',
      '    temperature: data.current.temperature * (mod.protection ? 1.15 : 1.0),',
      '    humidity: data.current.humidity * (mod.protection ? 0.7 : 1.0),',
      '    sunlightHours: sunHours * (mod.protection ? 0.6 : 1.0),',
      '    soilQuality: mod.protection ? 80 : 65,',
      '  };',
      '}',
    ];
    lines.splice(i, 1, ...newFunc);
    console.log('getRealEnvironment fixe');
    break;
  }
}

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('OK - Weather service corrige');