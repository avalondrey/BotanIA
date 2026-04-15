/**
 * LiaPanel — Proactive suggestions panel
 * Shows Lia's suggested actions based on garden state
 */

'use client';

import { useState, useRef } from 'react';
import { useAgent } from '@/lib/hooks/useAgent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface LiaPanelProps {
  compact?: boolean;
}

interface ImageAssetState {
  plantDefId: string;
  displayName: string;
  asset: {
    type: string;
    expectedPath: string;
    prompt: string;
    foundPath?: string;
    status: string;
    stageNumber?: number;
    shopId?: string;
    varietyId?: string;
  };
  cardDataInfo: any;
}

interface SpriteStageEntry {
  stageNumber: number;
  stageName: string;
  description: string;
  expectedFilename: string;
  userFilename: string;
  status: string;
  foundPath?: string;
}

interface SpriteEditorState {
  plantDefId: string;
  displayName: string;
  category: 'vegetable' | 'fruit-tree';
  stages: SpriteStageEntry[];
  cardDataInfo: any;
}

export function LiaPanel({ compact = false }: LiaPanelProps) {
  const { pendingSuggestions, dismissSuggestion, runProactiveScan } = useAgent();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [editingPlant, setEditingPlant] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<ImageAssetState | null>(null);
  const [imagePath, setImagePath] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spriteEditor, setSpriteEditor] = useState<SpriteEditorState | null>(null);
  const spriteFileInputRef = useRef<HTMLInputElement>(null);
  const [spriteUploadingStage, setSpriteUploadingStage] = useState<number | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/agent/scan-plants', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.data);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleEditName = (plant: any) => {
    setEditingPlant(plant.plantDefId);
    setEditName(plant.displayName || plant.plantDefId);
  };

  const handleSaveName = async (plantDefId: string) => {
    try {
      const res = await fetch('/api/agent/update-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantDefId, displayName: editName }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult((prev: any) => ({
          ...prev,
          results: prev.results.map((r: any) =>
            r.plantDefId === plantDefId ? { ...r, displayName: editName } : r
          ),
        }));
      }
    } catch (e) {
      console.error('Update name error:', e);
    } finally {
      setEditingPlant(null);
    }
  };

  const handleAssetClick = (plant: any, asset: any) => {
    setImagePath('');
    setRegisterMessage('');

    // If clicking on a plant-stage asset, open the full sprite editor for all 6 stages
    if (asset.type === 'plant-stage' && plant.imageAssets) {
      const isTree = plant.cardDataInfo?.category === 'fruit-tree';
      const stageCount = isTree ? 5 : 6;
      const stageNamesVeg = ['Graine', 'Levée', 'Plantule', 'Croissance', 'Floraison', 'Récolte'];
      const stageNamesTree = ['Scion', 'Jeune arbre', 'Arbre moyen', 'Arbre établi', 'Arbre mature'];
      const stageNames = isTree ? stageNamesTree : stageNamesVeg;
      const stageDescs = isTree
        ? [
            '~20cm mini scion in 20cm terracotta pot, just planted, single small stem',
            '~40cm young tree in pot, small branches beginning, fresh green leaves',
            '~80cm tree in pot, defined branching structure, leaves filling out',
            '~150cm tree in pot, flowers or small fruits appearing, full canopy',
            '~200cm mature tree in pot, full production with visible fruits, majestic',
          ]
        : [
            'tiny seed just planted, barely visible, soil surface, miniature sprout',
            'small sprout with 2 cotyledon leaves breaking soil, pale green, 2-3cm tall',
            '4-6 true leaves, delicate stem, more established, 5-8cm tall',
            'full foliage, 8-10 leaves, stronger stem, bushy appearance, 15-20cm tall',
            'mature plant with first flowers or fruits visible, full structure',
            'full production — abundant fruits visible, harvest ready, lush plant',
          ];

      const stages: SpriteStageEntry[] = [];
      for (let n = 1; n <= stageCount; n++) {
        const stageAsset = plant.imageAssets.find((a: any) => a.type === (isTree ? 'tree-stage' : 'plant-stage') && a.stageNumber === n);
        stages.push({
          stageNumber: n,
          stageName: stageNames[n - 1] || `Stage ${n}`,
          description: stageDescs[n - 1] || '',
          expectedFilename: `${plant.plantDefId}-stage-${n}.png`,
          userFilename: stageAsset?.foundPath?.split('/').pop() || '',
          status: stageAsset?.status || '❌',
          foundPath: stageAsset?.foundPath,
        });
      }

      setSpriteEditor({
        plantDefId: plant.plantDefId,
        displayName: plant.displayName,
        category: plant.cardDataInfo?.category || 'vegetable',
        stages,
        cardDataInfo: plant.cardDataInfo,
      });
      return;
    }

    // Otherwise open the single asset dialog
    setSelectedAsset({
      plantDefId: plant.plantDefId,
      displayName: plant.displayName,
      asset,
      cardDataInfo: plant.cardDataInfo,
    });
  };

  const handleCopyPrompt = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.asset.prompt);
      setRegisterMessage('✓ Prompt copié!');
      setTimeout(() => setRegisterMessage(''), 2000);
    }
  };

  const handleRegisterFromPath = async () => {
    if (!selectedAsset || !imagePath.trim()) return;
    setIsRegistering(true);
    setRegisterMessage('');
    try {
      const res = await fetch('/api/agent/register-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedPath: selectedAsset.asset.expectedPath,
          sourcePath: imagePath.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegisterMessage(`✓ ${data.message}`);
        // Refresh scan
        setTimeout(handleScan, 500);
      } else {
        setRegisterMessage(`✗ ${data.error}`);
      }
    } catch (e: any) {
      setRegisterMessage(`✗ ${e.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAsset) return;
    setIsRegistering(true);
    setRegisterMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expectedPath', selectedAsset.asset.expectedPath);
      const res = await fetch('/api/agent/register-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setRegisterMessage(`✓ ${data.message}`);
        setTimeout(handleScan, 500);
      } else {
        setRegisterMessage(`✗ ${data.error}`);
      }
    } catch (e: any) {
      setRegisterMessage(`✗ ${e.message}`);
    } finally {
      setIsRegistering(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const assetTypeLabel: Record<string, string> = {
    'plant-stage': '🌱 Plant stage',
    'tree-stage': '🌳 Tree stage',
    'packet': '📦 Packet',
    'card': '🃏 Card',
    'pot': '🪴 Pot',
    'evolution-card': '✨ Evolution card',
    'equipment': '🔧 Equipment',
  };

  const categoryIcons: Record<string, string> = {
    water: '💧',
    plant: '🌱',
    calendar: '📅',
    disease: '🦠',
    purchase: '🛒',
    harvest: '⚡',
  };

  const priorityBorder: Record<string, string> = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  if (compact) {
    return (
      <div className="border-t">
        <div className="p-2 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">💡 Suggestions de Lia</p>
            <Button variant="ghost" size="sm" onClick={runProactiveScan} className="text-xs h-auto p-1" title="Actualiser les suggestions">🔄</Button>
          </div>
          <div className="space-y-1">
            {pendingSuggestions.slice(0, 3).map((sug) => (
              <div key={sug.id} className={`text-xs p-2 bg-background rounded border-l-2 ${priorityBorder[sug.priority] || 'border-l-gray-500'}`}>
                <div className="flex items-center gap-1">
                  <span>{categoryIcons[sug.category] || '💡'}</span>
                  <span className="font-medium">{sug.title}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{sug.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg shadow-lg overflow-hidden" style={{ width: 'var(--ui-panel-width)' }}>
      <div className="p-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">💡 Suggestions de Lia</p>
            <p className="text-xs opacity-80 mt-0.5">{pendingSuggestions.length} suggestion{pendingSuggestions.length > 1 ? 's' : ''}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleScan} disabled={isScanning} className="text-xs">
            {isScanning ? '🔄' : '🔍'} Scan
          </Button>
        </div>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="max-h-96 overflow-y-auto">
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold">📋 Rapport de Scan</p>
              <button onClick={() => setScanResult(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="text-xs space-y-1 mb-2">
              <p>✅ Complet: {scanResult.summary.complete}</p>
              <p>⚠️ Partiel: {scanResult.summary.partial}</p>
              <p>❌ Incomplet: {scanResult.summary.incomplete}</p>
            </div>
          </div>

          {scanResult.results.filter((r: any) => r.overallStatus !== '✅ COMPLET').slice(0, 8).map((plant: any) => (
            <div key={plant.plantDefId} className="p-3 border-b last:border-b-0">
              {/* Plant header */}
              <div className="flex items-center justify-between mb-2">
                {editingPlant === plant.plantDefId ? (
                  <div className="flex gap-1 flex-1">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-5 text-[10px] flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleSaveName(plant.plantDefId)} />
                    <button onClick={() => handleSaveName(plant.plantDefId)} className="text-[10px] text-green-600 font-bold">✓</button>
                    <button onClick={() => setEditingPlant(null)} className="text-[10px] text-muted-foreground">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-sm">{plant.displayName} <span className="text-muted-foreground text-[10px]">({plant.plantDefId})</span></p>
                      {plant.plantCategory && <p className="text-[9px] text-muted-foreground">🏷️ {plant.plantCategory}</p>}
                    </div>
                    <button onClick={() => handleEditName(plant)} className="text-[10px] text-blue-500 ml-auto mr-1" title="Modifier le nom">✎</button>
                  </div>
                )}
              </div>

              {/* Image Assets */}
              {plant.imageAssets && plant.imageAssets.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">🎨 Images</p>
                  {plant.imageAssets.map((asset: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAssetClick(plant, asset)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded text-[10px] text-left transition-colors hover:bg-muted/50 ${
                        asset.status === '✅' ? 'text-green-600' : asset.status === '❓' ? 'text-yellow-600' : 'text-orange-500'
                      }`}
                    >
                      <span>{asset.status}</span>
                      <span className="flex-1 truncate">
                        {assetTypeLabel[asset.type] || asset.type}
                        {asset.stageNumber ? ` ${asset.stageNumber}` : ''}
                      </span>
                      <span className="text-muted-foreground truncate">{asset.foundPath ? '✓' : asset.expectedPath.split('/').pop()}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Card data preview */}
              {plant.cardDataPreview && (
                <div className="mt-2 text-[9px] text-muted-foreground space-y-0.5">
                  {plant.cardDataPreview.tBase != null && <p>🌡️ tBase: {plant.cardDataPreview.tBase}°C</p>}
                  {plant.cardDataPreview.totalDaysToHarvest != null && <p>📆 Harvest: {plant.cardDataPreview.totalDaysToHarvest}j</p>}
                  {plant.cardDataPreview.waterNeedMmPerDay != null && <p>💧 Eau: {plant.cardDataPreview.waterNeedMmPerDay}mm/j</p>}
                  {plant.cardDataPreview.companions?.length > 0 && (
                    <p>🤝 {plant.cardDataPreview.companions.slice(0, 3).join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="max-h-48 overflow-y-auto">
        {pendingSuggestions.map((sug) => (
          <div key={sug.id} className={`p-3 border-b last:border-b-0 border-l-4 ${priorityBorder[sug.priority] || 'border-l-gray-500'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{categoryIcons[sug.category] || '💡'}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{sug.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{sug.description}</p>
                <div className="flex gap-1 mt-2">
                  <Button variant="outline" size="sm" className="text-xs h-auto py-0.5 px-2" onClick={() => dismissSuggestion(sug.id)}>Ignorer</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sprite Editor Dialog — all 6 stages at once */}
      <Dialog open={!!spriteEditor} onOpenChange={(open) => !open && setSpriteEditor(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {spriteEditor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  🌱 Sprites — {spriteEditor.displayName}
                  <span className="text-muted-foreground text-[10px]">({spriteEditor.plantDefId})</span>
                </DialogTitle>
                <p className="text-[10px] text-muted-foreground">Editeur de sprites — 6 stades de croissance</p>
              </DialogHeader>

              {/* Sprite specs banner */}
              <div className="bg-muted/50 rounded p-2 text-[9px] space-y-0.5 border">
                <p className="font-bold text-[10px] mb-1">📐 Spécifications techniques des sprites</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <p><span className="font-semibold">Format:</span> PNG 512×512px</p>
                  <p><span className="font-semibold">Style:</span> Manga cel-shaded</p>
                  <p><span className="font-semibold">Borduers:</span> Thick black manga borders</p>
                  <p><span className="font-semibold">Esthétique:</span> Kawaii / Cute</p>
                  <p><span className="font-semibold">Fond:</span> Beige kraft paper (transparent pour sprites)</p>
                  <p><span className="font-semibold">Type:</span> {spriteEditor.category === 'fruit-tree' ? '🌳 Arbre fruitier (5 stades)' : '🌱 Légume (6 stades)'}</p>
                </div>
              </div>

              {/* Stage list */}
              <div className="space-y-2">
                {spriteEditor.stages.map((stage) => (
                  <div key={stage.stageNumber} className={`p-2 rounded border text-[10px] ${stage.status === '✅' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[11px]">Stage {stage.stageNumber}</span>
                        <span className="font-semibold">— {stage.stageName}</span>
                        <span className={stage.status === '✅' ? 'text-green-600' : 'text-orange-500'}>{stage.status}</span>
                      </div>
                      {stage.foundPath && (
                        <span className="text-green-600 text-[9px]">✓ {stage.foundPath}</span>
                      )}
                    </div>

                    <p className="text-muted-foreground italic mb-1">{stage.description}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground shrink-0">Fichier attendu:</span>
                      <code className="text-[9px] bg-muted px-1 py-0.5 rounded">{stage.expectedFilename}</code>
                    </div>

                    {/* Input for user's custom filename */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground shrink-0">Ton fichier:</span>
                      <Input
                        value={stage.userFilename}
                        onChange={(e) => {
                          setSpriteEditor(prev => prev ? {
                            ...prev,
                            stages: prev.stages.map(s =>
                              s.stageNumber === stage.stageNumber
                                ? { ...s, userFilename: e.target.value }
                                : s
                            ),
                          } : null);
                        }}
                        placeholder="mon-walnut-stage-3.png"
                        className="text-[10px] h-6 flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload all button */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1"
                    onClick={() => spriteFileInputRef.current?.click()}
                  >
                    📁 Uploader les images ( PNG )
                  </Button>
                  <input
                    ref={spriteFileInputRef}
                    type="file"
                    accept="image/png"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length || !spriteEditor) return;
                      setIsRegistering(true);
                      setRegisterMessage('');
                      const results: string[] = [];
                      for (const file of files) {
                        // Match by stage number in filename or order
                        const match = file.name.match(/stage-(\d+)/);
                        const stageNum = match ? parseInt(match[1]) : null;
                        if (!stageNum) continue;
                        const stage = spriteEditor.stages.find(s => s.stageNumber === stageNum);
                        if (!stage) continue;
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('expectedPath', `/plants/${stage.expectedFilename}`);
                          const res = await fetch('/api/agent/register-image', { method: 'POST', body: formData });
                          const data = await res.json();
                          results.push(data.success ? `Stage ${stageNum}: ✓` : `Stage ${stageNum}: ✗ ${data.error}`);
                        } catch { results.push(`Stage ${stageNum}: ✗ Erreur`); }
                      }
                      setRegisterMessage(results.join(' | ') || 'Aucun fichier matching');
                      setIsRegistering(false);
                      if (results.some(r => r.includes('✓'))) setTimeout(handleScan, 800);
                      if (spriteFileInputRef.current) spriteFileInputRef.current.value = '';
                    }}
                  />
                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs flex-1"
                    disabled={
                      isRegistering ||
                      !spriteEditor.stages.some(s => s.userFilename.trim())
                    }
                    onClick={async () => {
                      const stagesWithNames = spriteEditor.stages.filter(s => s.userFilename.trim());
                      if (!stagesWithNames.length) return;
                      setIsRegistering(true);
                      setRegisterMessage('');
                      const results: string[] = [];
                      for (const stage of stagesWithNames) {
                        try {
                          const res = await fetch('/api/agent/register-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              expectedPath: `/plants/${stage.expectedFilename}`,
                              sourcePath: stage.userFilename.trim(),
                            }),
                          });
                          const data = await res.json();
                          results.push(data.success
                            ? `S${stage.stageNumber}: ✓ ${stage.expectedFilename}`
                            : `S${stage.stageNumber}: ✗ ${data.error}`);
                        } catch (e: any) { results.push(`S${stage.stageNumber}: ✗ ${e.message}`); }
                      }
                      setRegisterMessage(results.join(' | ') || 'Erreur');
                      setIsRegistering(false);
                      if (results.some(r => r.includes('✓'))) setTimeout(handleScan, 800);
                    }}
                  >
                    {isRegistering ? '⏳ Envoi...' : '🌿 Valider & Envoyer à BotanIA'}
                  </Button>
                </div>
                {registerMessage && (
                  <p className={`text-[10px] ${registerMessage.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                    {registerMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Prompt Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">
                  {assetTypeLabel[selectedAsset.asset.type] || selectedAsset.asset.type}
                  {selectedAsset.asset.stageNumber ? ` ${selectedAsset.asset.stageNumber}` : ''}
                  {' — '}
                  {selectedAsset.displayName}
                </DialogTitle>
                <p className="text-[10px] text-muted-foreground">{selectedAsset.asset.expectedPath}</p>
              </DialogHeader>

              {/* Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Prompt Manga</p>
                  <Button size="sm" variant="outline" className="text-[10px] h-auto py-0.5 px-2" onClick={handleCopyPrompt}>
                    📋 Copier
                  </Button>
                </div>
                <Textarea
                  value={selectedAsset.asset.prompt}
                  readOnly
                  className="text-[10px] font-mono h-32 resize-none"
                />
              </div>

              {/* Status */}
              {selectedAsset.asset.foundPath && (
                <p className="text-xs text-green-600">✓ Image déjà présente: {selectedAsset.asset.foundPath}</p>
              )}

              {/* File upload */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Uploader une image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png"
                  onChange={handleFileUpload}
                  className="text-xs"
                />
              </div>

              {/* Indicate path */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Ou indiquer un chemin existant</p>
                <div className="flex gap-2">
                  <Input
                    value={imagePath}
                    onChange={e => setImagePath(e.target.value)}
                    placeholder="C:\Images\tomato-stage-3.png"
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleRegisterFromPath}
                    disabled={isRegistering || !imagePath.trim()}
                    className="text-xs"
                  >
                    {isRegistering ? '⏳' : '→'}
                  </Button>
                </div>
              </div>

              {/* Message */}
              {registerMessage && (
                <p className={`text-xs ${registerMessage.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {registerMessage}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}