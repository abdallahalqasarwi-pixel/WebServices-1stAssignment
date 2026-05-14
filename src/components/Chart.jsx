import { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';

export default function Chart({ data, height = 320, color = '#0891b2', dark = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const chart = createChart(containerRef.current, {
      height,
      width: containerRef.current.clientWidth,
      layout: {
        background: { color: 'transparent' },
        textColor: dark ? '#cbd5e1' : '#475569',
      },
      grid: {
        vertLines: { color: dark ? '#1e293b' : '#e2e8f0' },
        horzLines: { color: dark ? '#1e293b' : '#e2e8f0' },
      },
      rightPriceScale: {
        borderColor: dark ? '#334155' : '#cbd5e1',
      },
      timeScale: {
        borderColor: dark ? '#334155' : '#cbd5e1',
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceLineVisible: false,
    });

    const cleanData = Array.isArray(data)
      ? data
          .filter((point) => point?.time && Number.isFinite(Number(point.value)))
          .map((point) => ({ time: point.time, value: Number(point.value) }))
      : [];

    lineSeries.setData(cleanData);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.contentRect?.width) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [color, dark, data, height]);

  return <div className="h-full min-h-[240px] w-full" ref={containerRef} />;
}
