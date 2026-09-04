'use client';

import React, { useState } from "react";

interface DataPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface AdminChartProps {
  data: DataPoint[];
}

export default function AdminChart({ data }: AdminChartProps) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-400 text-xs">
        No sales data available.
      </div>
    );
  }

  // Find max value to scale the chart height
  const values = data.map((d) => (metric === "revenue" ? d.revenue : d.orders));
  const maxValue = Math.max(...values, 10); // avoid division by zero

  // SVG dimensions
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate coordinates for SVG points
  const points = data.map((d, index) => {
    const val = metric === "revenue" ? d.revenue : d.orders;
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (val / maxValue) * chartHeight;
    return { x, y, value: val, label: d.label };
  });

  // Create path string
  const pathD = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Grid lines (y-axis splits)
  const gridLinesCount = 4;
  const gridValues = Array.from({ length: gridLinesCount + 1 }).map((_, i) => {
    const val = (maxValue / gridLinesCount) * i;
    const y = padding.top + chartHeight - (val / maxValue) * chartHeight;
    return { y, value: val };
  });

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Sales Performance
          </h3>
        </div>
        <div className="flex border border-neutral-200 rounded-xs overflow-hidden">
          <button
            onClick={() => {
              setMetric("revenue");
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              metric === "revenue" ? "bg-brand-sage text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => {
              setMetric("orders");
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              metric === "orders" ? "bg-brand-sage text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Y Axis Grid Lines */}
          {gridValues.map((line, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={width - padding.right}
                y2={line.y}
                stroke="rgba(17, 17, 17, 0.04)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={line.y + 4}
                textAnchor="end"
                className="text-[9px] fill-neutral-400 font-medium font-sans"
              >
                {metric === "revenue"
                  ? `₹${Math.round(line.value / 100).toLocaleString("en-IN")}`
                  : Math.round(line.value)}
              </text>
            </g>
          ))}

          {/* X Axis Labels */}
          {data.map((d, index) => {
            // Show every Nth label to avoid crowding
            const showLabel = data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1;
            if (!showLabel) return null;

            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[9px] fill-neutral-400 font-sans"
              >
                {d.label}
              </text>
            );
          })}

          {/* SVG Line path */}
          <path
            d={pathD}
            fill="none"
            stroke="#7C7A5A" /* brand-sage */
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive circles and hover targets */}
          {points.map((p, index) => (
            <g key={index}>
              {/* Invisible interactive hover zone */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Visual circle dot on hover or endpoint */}
              {(hoveredIndex === index || index === points.length - 1) && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill="#E694AA" /* brand-pink */
                  stroke="#7C7A5A"
                  strokeWidth={1}
                  className="pointer-events-none"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Floating Tooltip details */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-brand-black text-brand-offwhite text-[10px] p-2 shadow-md border border-white/10 pointer-events-none font-sans uppercase tracking-widest font-semibold flex flex-col gap-1 rounded-xs"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 25}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-[8px] text-neutral-400">{points[hoveredIndex].label}</div>
            <div className="text-white">
              {metric === "revenue"
                ? `₹${(points[hoveredIndex].value / 100).toLocaleString("en-IN")}`
                : `${points[hoveredIndex].value} Orders`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
