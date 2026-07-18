import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { AnalysisResult } from '@/types/analysis';

export async function exportScanPdf(scan: AnalysisResult): Promise<void> {
  const rows = scan.metrics
    .slice(0, 24)
    .map(
      (m) =>
        `<tr><td>${m.label}</td><td>${m.score}</td><td>${m.value} ${m.unit}</td><td>${m.normRange}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>FaceMetrics AI – Scan</title>
  <style>
    body { font-family: -apple-system, Segoe UI, sans-serif; color: #111; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #666; font-size: 12px; }
    .score { font-size: 48px; font-weight: 700; margin: 16px 0; }
    .grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0 24px; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 12px 16px; min-width: 120px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #eee; text-align: left; padding: 8px 4px; }
    .note { background: #f5f5f5; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>FaceMetrics AI</h1>
  <div class="muted">${new Date(scan.createdAt).toLocaleString('de-DE')} · ${scan.scanType === '360' ? '360°-Scan' : 'Foto'}</div>
  <div class="score">${scan.overallScore}</div>
  <div class="muted">Gesamtscore (KI-Schätzung)</div>
  <div class="grid">
    <div class="card"><b>${scan.symmetryScore}</b><br/><span class="muted">Symmetrie</span></div>
    <div class="card"><b>${scan.proportionsScore}</b><br/><span class="muted">Proportionen</span></div>
    <div class="card"><b>${scan.goldenRatioScore}</b><br/><span class="muted">Golden Ratio</span></div>
    <div class="card"><b>${scan.jawlineScore ?? '–'}</b><br/><span class="muted">Jawline</span></div>
    <div class="card"><b>${scan.profileScore ?? '–'}</b><br/><span class="muted">Profil</span></div>
  </div>
  <p class="muted">${scan.disclaimer}</p>
  <p>${scan.coachSummary}</p>
  <h2>Messwerte</h2>
  <table>
    <thead><tr><th>Merkmal</th><th>Score</th><th>Wert</th><th>Norm</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="note">
    <b>Hinweis:</b> Schönheit und Attraktivität sind subjektiv. Diese Auswertung ersetzt keine medizinische Beratung.
    ${scan.scoreBreakdown ? `<br/><br/>${scan.scoreBreakdown}` : ''}
  </div>
</body>
</html>`;

  const file = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Scan als PDF exportieren',
      UTI: 'com.adobe.pdf',
    });
  }
}
