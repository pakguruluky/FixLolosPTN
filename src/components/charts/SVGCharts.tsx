import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// 1. Handcrafted Bar Chart SVG
export interface BarChartProps {
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
  maxVal?: number;
  height?: number;
  unit?: string;
}

export const BarChartSVG: React.FC<BarChartProps> = ({
  labels,
  values,
  colors = ['#7C3AED'],
  title,
  maxVal,
  height = 220,
  unit = '',
}) => {
  const calculatedMax = maxVal || Math.max(...values, 100);
  const chartHeight = height - 50;

  return (
    <div className="w-full bg-white dark:bg-[#160E2E] p-4 rounded-xl border border-purple-100 dark:border-purple-950/40">
      {title && <h4 className="text-sm font-bold text-gray-800 dark:text-purple-100 mb-3">{title}</h4>}
      <svg viewBox={`0 0 ${labels.length * 75 + 40} ${height}`} className="w-full h-auto max-h-[260px] overflow-visible">
        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - ratio * (chartHeight - 30) + 15;
          const valLabel = Math.round(ratio * calculatedMax);
          return (
            <g key={idx}>
              <line x1="30" y1={y} x2={labels.length * 75 + 30} y2={y} stroke="currentColor" className="text-gray-100 dark:text-purple-900/30" strokeDasharray="3 3" />
              <text x="25" y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400 dark:fill-purple-400/60 font-mono">
                {valLabel}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {values.map((val, idx) => {
          const barHeight = Math.max(0, (val / calculatedMax) * (chartHeight - 30));
          const x = 40 + idx * 75;
          const y = chartHeight + 15 - barHeight;
          const color = colors[idx % colors.length];

          return (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width="36"
                height={barHeight}
                rx="6"
                fill={color}
                className="transition-all duration-300 hover:opacity-85"
              />
              <text
                x={x + 18}
                y={y - 6}
                textAnchor="middle"
                className="text-[11px] font-bold fill-gray-700 dark:fill-purple-200"
              >
                {val}
                {unit}
              </text>
              <text
                x={x + 18}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-[10px] fill-gray-600 dark:fill-purple-300 font-medium"
              >
                {labels[idx]?.length > 10 ? labels[idx].substring(0, 9) + '…' : labels[idx]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 2. Handcrafted Pie Chart SVG
export interface PieChartProps {
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
  size?: number;
}

export const PieChartSVG: React.FC<PieChartProps> = ({
  labels,
  values,
  colors = ['#7C3AED', '#E8A020', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'],
  title,
  size = 220,
}) => {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const radius = size / 2.6;
  const center = size / 2;

  let currentAngle = -Math.PI / 2;
  const slices = values.map((val, idx) => {
    const angle = (val / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Label position
    const midAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.65;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);
    const pct = Math.round((val / total) * 100);

    return {
      pathData,
      color: colors[idx % colors.length],
      label: labels[idx],
      value: val,
      pct,
      lx,
      ly,
      showLabel: angle > 0.25, // > 0.25 rad sesuai spesifikasi
    };
  });

  return (
    <div className="w-full bg-white dark:bg-[#160E2E] p-4 rounded-xl border border-purple-100 dark:border-purple-950/40 flex flex-col items-center">
      {title && <h4 className="text-sm font-bold text-gray-800 dark:text-purple-100 mb-3 w-full text-left">{title}</h4>}
      <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, idx) => (
            <g key={idx}>
              <path d={s.pathData} fill={s.color} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
              {s.showLabel && (
                <text x={s.lx} y={s.ly + 4} textAnchor="middle" className="text-[11px] font-bold fill-white font-mono drop-shadow">
                  {s.pct}%
                </text>
              )}
            </g>
          ))}
          {/* Inner circle for donut touch */}
          <circle cx={center} cy={center} r={radius * 0.35} className="fill-white dark:fill-[#160E2E]" />
        </svg>

        <div className="flex flex-col gap-1.5 text-xs">
          {slices.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600 dark:text-purple-200 truncate max-w-[130px]">{s.label}</span>
              <span className="font-semibold text-gray-800 dark:text-white ml-auto">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Handcrafted Radar Chart SVG (Bagian 12: 4 level grid, TPS purple, Literasi red)
export interface RadarChartProps {
  labels: string[];
  values: number[];
  maxVal?: number;
  title?: string;
  size?: number;
}

export const RadarChartSVG: React.FC<RadarChartProps> = ({
  labels,
  values,
  maxVal = 800,
  title,
  size = 320,
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const total = labels.length;
  const levels = [0.25, 0.5, 0.75, 1.0]; // 4 level grid

  const getCoordinates = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = radius * ratio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points
  const points = values
    .map((val, idx) => {
      const ratio = Math.min(1, Math.max(0, val / maxVal));
      const { x, y } = getCoordinates(idx, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  // TPS subtes: PU, PBM, PPU, PK (idx 0..3) -> Ungu (#7C3AED)
  // Literasi subtes: LBI, LBE, PM (idx 4..6) -> Merah (#DC2626)
  return (
    <div className="w-full bg-white dark:bg-[#160E2E] p-4 rounded-xl border border-purple-100 dark:border-purple-950/40 flex flex-col items-center">
      {title && <h4 className="text-sm font-bold text-gray-800 dark:text-purple-100 mb-2 w-full text-left">{title}</h4>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible max-w-full">
        {/* 4 level concentric grids */}
        {levels.map((lvl, lIdx) => {
          const gridPoints = labels
            .map((_, idx) => {
              const { x, y } = getCoordinates(idx, lvl);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <g key={lIdx}>
              <polygon
                points={gridPoints}
                fill="none"
                stroke="currentColor"
                className="text-gray-200 dark:text-purple-900/30"
                strokeWidth="1"
              />
              <text
                x={center}
                y={center - radius * lvl + 10}
                className="text-[9px] fill-gray-400 dark:fill-purple-400 font-mono text-center"
                textAnchor="middle"
              >
                {Math.round(lvl * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Radial axes */}
        {labels.map((_, idx) => {
          const { x, y } = getCoordinates(idx, 1);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-gray-200 dark:text-purple-900/30"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="rgba(124, 58, 237, 0.25)"
          stroke="#7C3AED"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data dots & labels */}
        {values.map((val, idx) => {
          const ratio = Math.min(1, Math.max(0, val / maxVal));
          const { x, y } = getCoordinates(idx, ratio);
          const { x: lx, y: ly } = getCoordinates(idx, 1.2);
          const isTPS = idx < 4;
          const color = isTPS ? '#7C3AED' : '#DC2626';

          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="4.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly + (ly > center ? 4 : -2)}
                textAnchor="middle"
                className="text-[10px] font-bold"
                fill={color}
              >
                {labels[idx]} ({val})
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-300">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Subtes TPS (60%)
        </span>
        <span className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Subtes Literasi & PM (40%)
        </span>
      </div>
    </div>
  );
};

// 4. Rasio Bar 60:40 SNBT
export const RatioBar6040: React.FC<{
  tpsScore?: number;
  literasiScore?: number;
  tertimbang?: number;
}> = ({ tpsScore = 0, literasiScore = 0, tertimbang = 0 }) => {
  return (
    <div className="w-full bg-white dark:bg-[#160E2E] p-4 rounded-xl border border-purple-100 dark:border-purple-950/40">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-purple-200">Bobot Formula SNBT 2027</span>
        <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
          Skor Tertimbang: {tertimbang.toFixed(2)}
        </span>
      </div>
      <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner">
        <div className="w-[60%] bg-purple-600 dark:bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center">
          TPS (60%) : {tpsScore > 0 ? tpsScore.toFixed(1) : '-'}
        </div>
        <div className="w-[40%] bg-red-600 dark:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
          Literasi (40%) : {literasiScore > 0 ? literasiScore.toFixed(1) : '-'}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 dark:text-purple-300/70 mt-1.5">
        <span>PU, PBM, PPU, PK (@15%)</span>
        <span>LBI, LBE, PM (@13.33%)</span>
      </div>
    </div>
  );
};

// 5. Chart.js Line Chart (untuk Rapor Rata-rata & TO Trends dengan target lines)
export interface ChartJSLineProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    borderDash?: number[];
    tension?: number;
  }[];
  title?: string;
  minVal?: number;
  maxVal?: number;
}

export const ChartJSLine: React.FC<ChartJSLineProps> = ({
  labels,
  datasets,
  title,
  minVal = 0,
  maxVal = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.borderColor,
          backgroundColor: d.backgroundColor || 'transparent',
          borderDash: d.borderDash,
          borderWidth: 2.5,
          tension: d.tension ?? 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Plus Jakarta Sans', size: 11 },
            },
          },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            min: minVal,
            max: maxVal,
            grid: { color: 'rgba(150, 150, 150, 0.1)' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, datasets, minVal, maxVal]);

  return (
    <div className="w-full bg-white dark:bg-[#160E2E] p-4 rounded-xl border border-purple-100 dark:border-purple-950/40">
      {title && <h4 className="text-sm font-bold text-gray-800 dark:text-purple-100 mb-3">{title}</h4>}
      <div className="h-[240px] w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
