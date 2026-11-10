import { BOOKING_TREND } from '../data/adminData';
import './BookingChart.css';

export type ChartPoint = {
  month: string;
  value: number;
};

type Props = {
  data?: ChartPoint[];
  ariaLabel?: string;
};

const WIDTH = 560;
const HEIGHT = 240;
const PAD = { top: 24, right: 16, bottom: 36, left: 44 };

function niceMax(value: number) {
  if (value <= 0) return 10;
  const padded = value * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function buildTicks(maxY: number) {
  return [0, maxY / 3, (maxY * 2) / 3, maxY].map((n) => Math.round(n));
}

function formatTick(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return String(value);
}

export function BookingChart({
  data = BOOKING_TREND,
  ariaLabel = 'Monthly booking statistics',
}: Props) {
  const series = data.length > 0 ? data : [{ month: '—', value: 0 }];
  const maxValue = Math.max(...series.map((item) => item.value), 0);
  const maxY = niceMax(maxValue);
  const yTicks = buildTicks(maxY);

  function yScale(value: number) {
    const inner = HEIGHT - PAD.top - PAD.bottom;
    return PAD.top + inner - (value / maxY) * inner;
  }

  function xScale(index: number) {
    const inner = WIDTH - PAD.left - PAD.right;
    if (series.length <= 1) return PAD.left + inner / 2;
    return PAD.left + (index / (series.length - 1)) * inner;
  }

  const points = series.map((item, i) => ({
    ...item,
    x: xScale(i),
    y: yScale(item.value),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD.bottom} L ${points[0].x} ${HEIGHT - PAD.bottom} Z`;

  return (
    <div className="booking-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              className="booking-chart__grid"
            />
            <text x={PAD.left - 10} y={yScale(tick) + 4} className="booking-chart__tick" textAnchor="end">
              {formatTick(tick)}
            </text>
          </g>
        ))}

        <path d={areaPath} className="booking-chart__area" />
        <path d={linePath} className="booking-chart__line" />

        {points.map((p) => (
          <g key={`${p.month}-${p.x}`}>
            <circle cx={p.x} cy={p.y} r={4.5} className="booking-chart__dot" />
            <text x={p.x} y={HEIGHT - 12} className="booking-chart__label" textAnchor="middle">
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
