import { PRESETS, PRESET_KEYS } from '../presets';
import './PresetSelector.css';

interface PresetSelectorProps {
  currentPreset: string;
  onPresetChange: (presetKey: string) => void;
  cameraMode: 'fixed' | 'orbit';
  seed: number;
  onSeedChange: (seed: number) => void;
  defaultSeed: number;
}

function PresetSelector({ 
  currentPreset, 
  onPresetChange, 
  cameraMode,
  seed,
  onSeedChange,
  defaultSeed
}: PresetSelectorProps) {
  const preset = PRESETS[currentPreset];

  const handleSeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      return; // 空の場合は何もしない
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      // 0-999999の範囲にクランプ
      const clamped = Math.max(0, Math.min(999999, parsed));
      onSeedChange(clamped);
    }
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    onSeedChange(randomSeed);
  };

  const handleResetSeed = () => {
    onSeedChange(defaultSeed);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('URLをコピーしました！');
  };

  return (
    <div className="preset-selector-container">
      <div className="preset-selector">
        <h3>🌍 ワールドプリセット</h3>
        
        <label htmlFor="preset-dropdown">プリセットを選択:</label>
        <select
          id="preset-dropdown"
          value={currentPreset}
          onChange={(e) => onPresetChange(e.target.value)}
        >
          {PRESET_KEYS.map((key) => (
            <option key={key} value={key}>
              {PRESETS[key].name}
            </option>
          ))}
        </select>

        {preset && (
          <div className="preset-description">
            {preset.description}
          </div>
        )}

        <div className="seed-control">
          <label htmlFor="seed-input">🎲 シード値:</label>
          <div className="seed-input-group">
            <input
              id="seed-input"
              type="number"
              min="0"
              max="999999"
              step="1"
              value={seed}
              onChange={handleSeedInputChange}
            />
            <button 
              className="seed-button random-button"
              onClick={handleRandomSeed}
              title="ランダムなシード値を生成"
            >
              🎲
            </button>
            <button 
              className="seed-button reset-button"
              onClick={handleResetSeed}
              title="デフォルト値にリセット"
            >
              ↺
            </button>
            <button 
              className="seed-button copy-button"
              onClick={handleCopyURL}
              title="URLをコピー（シード値を共有）"
            >
              📋
            </button>
          </div>
        </div>

        <div className="camera-mode-info">
          <strong>カメラモード:</strong> {cameraMode === 'fixed' ? '固定カメラ' : '自由カメラ'}
          <br />
          <small>Ctrl+C で切替</small>
        </div>
      </div>
    </div>
  );
}

export default PresetSelector;
