import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { Flame } from 'lucide-react';

export interface WasteItem {
  productId: string;
  productName: string;
  sku: string;
  wasteValue: number;
  wasteQty: number;
}

interface Props {
  items: WasteItem[];
}

const BAR_HEIGHT = 22;
const BAR_GAP = 10;
const LABEL_WIDTH = 110;
const VALUE_WIDTH = 48;
const BAR_AREA = 300 - LABEL_WIDTH - VALUE_WIDTH - 8;
const PADDING_TOP = 8;

export default function WasteCard({ items }: Props) {
  const top5 = [...items]
    .sort((a, b) => b.wasteValue - a.wasteValue)
    .slice(0, 5);

  const maxVal = top5.length > 0 ? Math.max(...top5.map(i => i.wasteValue)) : 1;
  const svgHeight = PADDING_TOP * 2 + top5.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <h2 className="font-bold text-[var(--text-primary)] text-base leading-tight">Damage & Waste</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Top 5 by value lost</p>
        </div>
      </div>

      {top5.length === 0 ? (
        <EmptyState
          title="No waste recorded"
          description="No damage reports have been filed."
          icon={<Flame className="h-8 w-8" />}
        />
      ) : (
        <svg
          viewBox={`0 0 300 ${svgHeight}`}
          width="100%"
          aria-label="Waste by product bar chart"
          className="overflow-visible"
        >
          {top5.map((item, idx) => {
            const y = PADDING_TOP + idx * (BAR_HEIGHT + BAR_GAP);
            const barWidth = Math.max(4, (item.wasteValue / maxVal) * BAR_AREA);
            const barX = LABEL_WIDTH + 4;

            return (
              <g key={item.productId}>
                {/* Product label */}
                <text
                  x={LABEL_WIDTH}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-secondary)"
                  className="truncate"
                >
                  {item.productName.length > 14
                    ? item.productName.slice(0, 13) + '…'
                    : item.productName}
                </text>

                {/* Background track */}
                <rect
                  x={barX}
                  y={y}
                  width={BAR_AREA}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill="var(--bg-secondary)"
                />

                {/* Orange bar */}
                <rect
                  x={barX}
                  y={y}
                  width={barWidth}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill="var(--orange-500)"
                  opacity={0.9}
                />

                {/* Value label */}
                <text
                  x={barX + BAR_AREA + 6}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--text-primary)"
                >
                  ${item.wasteValue.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
