import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent
} from 'react';
import { debounce } from 'lodash';
import styles from './KPChart.module.css';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import type { 
  HouseCusp as BaseHouseCusp, 
  KPChartData, 
  PlanetPosition,
  PlanetName
} from '@/types/kpAstrology';

// Point interface for type safety
interface Point {
  x: number;
  y: number;
}

// Extended interfaces for positioned elements
interface PositionedElement extends Point {
  angle: number;
}

// Extended PlanetPosition with rendering-specific properties
interface PositionedPlanet extends Omit<PlanetPosition, 'x' | 'y' | 'angle'>, PositionedElement {
  radius: number;
  isRetrograde: boolean;
}

// Extended HouseCusp with rendering-specific properties
interface PositionedHouseCusp extends PositionedElement {
  number: number;
  sign: string;
  signIndex: number;
  start: number;
  end: number;
  planets: PlanetName[];
  labelPosition: Point;
  lineStart: Point;
  lineEnd: Point;
}

interface TooltipContent {
  title: string;
  details: Array<{ label: string; value: string | number }>;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  pinned: boolean;
  content: TooltipContent | null;
}

interface ChartDimensions {
  size: number;
  center: number;
  radius: number;
  planetRadius: number;
  houseLabelRadius: number;
  zodiacLabelRadius: number;
}

// Chart configuration interface
interface ChartConfig {
  maxSize: number;
  minSize: number;
  planetRadiusRatio: number;
  houseLabelRadiusRatio: number;
  zodiacLabelRadiusRatio: number;
  tooltipOffset: number;
  minEdgeMargin: number;
  transitionDuration: number;
  debounceDelay: number;
  longPressDuration: number;
  planetDotRadius: number;
  planetHoverRadius: number;
  planetLabelOffset: number;
  houseLineWidth: number;
  houseHoverLineWidth: number;
  houseLabelFontSize: number;
  zodiacLabelFontSize: number;
  zodiacHoverFontSize: number;
  aspectRatio: number;
  padding: number;
}

// Chart configuration
const CHART_CONFIG: ChartConfig = {
  maxSize: 800,
  minSize: 280,
  planetRadiusRatio: 0.4,
  houseLabelRadiusRatio: 0.85,
  zodiacLabelRadiusRatio: 0.7,
  tooltipOffset: 15,
  minEdgeMargin: 20,
  transitionDuration: 200,
  debounceDelay: 30,
  longPressDuration: 500,
  planetDotRadius: 6,
  planetHoverRadius: 8,
  planetLabelOffset: 18,
  houseLineWidth: 1,
  houseHoverLineWidth: 1.5,
  houseLabelFontSize: 10,
  zodiacLabelFontSize: 10,
  zodiacHoverFontSize: 11,
  aspectRatio: 1,
  padding: 20,
} as const;

// Default zodiac signs if not provided
const DEFAULT_ZODIAC_SIGNS: readonly string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Planet colors with CSS variables fallback
const PLANET_COLORS: Record<PlanetName, string> = Object.freeze({
  sun: 'var(--planet-sun, #FFD700)',
  moon: 'var(--planet-moon, #F0F0F0)',
  mars: 'var(--planet-mars, #FF4500)',
  mercury: 'var(--planet-mercury, #A9A9A9)',
  jupiter: 'var(--planet-jupiter, #DAA520)',
  venus: 'var(--planet-venus, #FFD700)',
  saturn: 'var(--planet-saturn, #708090)',
  rahu: 'var(--planet-rahu, #000000)',
  ketu: 'var(--planet-ketu, #4B0082)',
});

// Zodiac sign colors
const ZODIAC_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A373', '#F4A261', '#E9C46A',
  '#2A9D8F', '#E76F51', '#F4A261', '#E9C46A'
] as const;

// Type guards
const isTouchEvent = (
  e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent
): e is React.TouchEvent | TouchEvent => 'touches' in e;

const isSVGElement = (target: EventTarget | null): target is SVGElement => 
  target instanceof SVGElement;

// Helper to get the current time in milliseconds
const now = (): number => Date.now();

// Helper to get point on circle
const getPointOnCircle = (
  center: number,
  radius: number,
  angleInDegrees: number
): Point => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
};

interface KPChartProps {
  chartData: KPChartData;
  className?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  onPlanetClick?: (planet: PositionedPlanet) => void;
  onHouseClick?: (house: PositionedHouseCusp) => void;
  onZodiacSignClick?: (sign: string, index: number) => void;
  onChartClick?: () => void;
  onPlanetHover?: (planet: PositionedPlanet | null) => void;
  onHouseHover?: (house: PositionedHouseCusp | null) => void;
  onZodiacSignHover?: (sign: string, index: number | null) => void;
}

/**
 * KP Astrology Chart Component
 * Renders an interactive KP astrology chart with planets, houses, and zodiac signs
 */
const KPChartSVG: React.FC<KPChartProps> = ({
  chartData,
  className = '',
  ariaLabel,
  ariaLabelledBy,
  onPlanetClick,
  onHouseClick,
  onZodiacSignClick,
  onChartClick,
  onPlanetHover,
  onHouseHover,
  onZodiacSignHover,
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // State
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    size: 0,
    center: 0,
    radius: 0,
    planetRadius: 0,
    houseLabelRadius: 0,
    zodiacLabelRadius: 0,
  });

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    pinned: false,
    content: null,
  });

  // Calculate chart dimensions based on container size
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerSize = Math.min(
      containerRect.width,
      containerRect.height,
      CHART_CONFIG.maxSize
    ) - (CHART_CONFIG.padding * 2);

    const size = Math.max(containerSize, CHART_CONFIG.minSize);
    const center = size / 2;
    const radius = (size / 2) - CHART_CONFIG.minEdgeMargin;

    setDimensions({
      size,
      center,
      radius,
      planetRadius: radius * CHART_CONFIG.planetRadiusRatio,
      houseLabelRadius: radius * CHART_CONFIG.houseLabelRadiusRatio,
      zodiacLabelRadius: radius * CHART_CONFIG.zodiacLabelRadiusRatio,
    });
  }, []);

  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = debounce(() => {
      updateDimensions();
    }, CHART_CONFIG.debounceDelay);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  // Initialize dimensions on mount
  useEffect(() => {
    updateDimensions();
  }, [updateDimensions]);

  // Position planets and houses
  const { positionedPlanets, positionedHouses } = useMemo(() => {
    const { center, planetRadius } = dimensions;
    const positionedPlanets: PositionedPlanet[] = [];
    const positionedHouses: PositionedHouseCusp[] = [];

    // Position planets
    chartData.planets.forEach(planet => {
      const angle = (planet.degree / 30) * 30; // Convert to sign-based angle
      const point = getPointOnCircle(center, planetRadius, angle);
      
      positionedPlanets.push({
        ...planet,
        x: point.x,
        y: point.y,
        angle,
        radius: CHART_CONFIG.planetDotRadius,
        isRetrograde: planet.retrograde || false,
      });
    });

    // Position houses
    chartData.houses.forEach((house, index) => {
      const startAngle = (house.start / 30) * 30;
      const endAngle = (house.end / 30) * 30;
      const midAngle = (startAngle + endAngle) / 2;
      
      const labelPos = getPointOnCircle(center, dimensions.houseLabelRadius, midAngle);
      const lineStart = getPointOnCircle(center, dimensions.radius * 0.9, startAngle);
      const lineEnd = getPointOnCircle(center, dimensions.radius * 0.95, startAngle);

      positionedHouses.push({
        ...house,
        x: center,
        y: center,
        angle: midAngle,
        signIndex: Math.floor(house.start / 30) % 12,
        labelPosition: labelPos,
        lineStart,
        lineEnd,
      });
    });

    return { positionedPlanets, positionedHouses };
  }, [chartData, dimensions]);

  // Handle planet click
  const handlePlanetClick = useCallback((planet: PositionedPlanet) => {
    if (onPlanetClick) {
      onPlanetClick(planet);
    }
  }, [onPlanetClick]);

  // Handle house click
  const handleHouseClick = useCallback((house: PositionedHouseCusp) => {
    if (onHouseClick) {
      onHouseClick(house);
    }
  }, [onHouseClick]);

  // Handle zodiac sign click
  const handleZodiacSignClick = useCallback((sign: string, index: number) => {
    if (onZodiacSignClick) {
      onZodiacSignClick(sign, index);
    }
  }, [onZodiacSignClick]);

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip.visible && !tooltip.pinned && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltip(prev => ({
        ...prev,
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      }));
    }
  }, [tooltip.visible, tooltip.pinned]);

  // Render planet
  const renderPlanet = (planet: PositionedPlanet) => {
    const fill = PLANET_COLORS[planet.name] || '#999';
    return (
      <g
        key={`planet-${planet.name}`}
        className={styles.planet}
        onClick={() => handlePlanetClick(planet)}
        onMouseEnter={() => {
          setTooltip({
            visible: true,
            x: planet.x,
            y: planet.y - 20,
            pinned: false,
            content: {
              title: planet.name.charAt(0).toUpperCase() + planet.name.slice(1),
              details: [
                { label: 'Sign', value: chartData.zodiacSigns?.[Math.floor(planet.angle / 30)] || 'Unknown' },
                { label: 'Degree', value: `${planet.degree.toFixed(2)}°` },
                { label: 'Nakshatra', value: planet.nakshatra },
              ],
            },
          });
          if (onPlanetHover) onPlanetHover(planet);
        }}
        onMouseLeave={() => {
          if (!tooltip.pinned) {
            setTooltip(prev => ({ ...prev, visible: false }));
          }
          if (onPlanetHover) onPlanetHover(null);
        }}
      >
        <circle
          cx={planet.x}
          cy={planet.y}
          r={planet.radius}
          fill={fill}
          stroke="#fff"
          strokeWidth="1.5"
        />
        {planet.isRetrograde && (
          <text
            x={planet.x}
            y={planet.y + 4}
            textAnchor="middle"
            fontSize="8"
            fill="#fff"
          >
            R
          </text>
        )}
      </g>
    );
  };

  // Render house
  const renderHouse = (house: PositionedHouseCusp) => {
    const sign = chartData.zodiacSigns?.[house.signIndex] || `Sign ${house.signIndex + 1}`;
    const fill = ZODIAC_COLORS[house.signIndex % ZODIAC_COLORS.length];
    
    return (
      <g
        key={`house-${house.number}`}
        className={styles.house}
        onClick={() => handleHouseClick(house)}
        onMouseEnter={() => {
          setTooltip({
            visible: true,
            x: house.labelPosition.x,
            y: house.labelPosition.y - 30,
            pinned: false,
            content: {
              title: `House ${house.number}`,
              details: [
                { label: 'Sign', value: sign },
                { label: 'Degrees', value: `${house.start.toFixed(1)}° - ${house.end.toFixed(1)}°` },
                { label: 'Planets', value: house.planets.join(', ') || 'None' },
              ],
            },
          });
          if (onHouseHover) onHouseHover(house);
        }}
        onMouseLeave={() => {
          if (!tooltip.pinned) {
            setTooltip(prev => ({ ...prev, visible: false }));
          }
          if (onHouseHover) onHouseHover(null);
        }}
      >
        {/* House cusp line */}
        <line
          x1={house.lineStart.x}
          y1={house.lineStart.y}
          x2={house.lineEnd.x}
          y2={house.lineEnd.y}
          stroke={fill}
          strokeWidth={CHART_CONFIG.houseLineWidth}
        />
        
        {/* House number */}
        <text
          x={house.labelPosition.x}
          y={house.labelPosition.y}
          textAnchor="middle"
          fontSize={CHART_CONFIG.houseLabelFontSize}
          fill="currentColor"
        >
          {house.number}
        </text>
      </g>
    );
  };

  // Render zodiac signs
  const renderZodiacSigns = () => {
    const { center, zodiacLabelRadius } = dimensions;
    const angleStep = 360 / 12;
    
    return chartData.zodiacSigns?.map((sign, index) => {
      const angle = index * angleStep;
      const point = getPointOnCircle(center, zodiacLabelRadius, angle);
      const fill = ZODIAC_COLORS[index % ZODIAC_COLORS.length];
      
      return (
        <g
          key={`zodiac-${sign}`}
          className={styles.zodiacSign}
          onClick={() => handleZodiacSignClick(sign, index)}
          onMouseEnter={() => {
            setTooltip({
              visible: true,
              x: point.x,
              y: point.y - 20,
              pinned: false,
              content: {
                title: sign,
                details: [
                  { label: 'Element', value: getZodiacElement(sign) },
                  { label: 'Quality', value: getZodiacQuality(sign) },
                  { label: 'Ruler', value: getZodiacRuler(sign) },
                ],
              },
            });
            if (onZodiacSignHover) onZodiacSignHover(sign, index);
          }}
          onMouseLeave={() => {
            if (!tooltip.pinned) {
              setTooltip(prev => ({ ...prev, visible: false }));
            }
            if (onZodiacSignHover) onZodiacSignHover('', null);
          }}
        >
          <text
            x={point.x}
            y={point.y}
            textAnchor="middle"
            fontSize={CHART_CONFIG.zodiacLabelFontSize}
            fill={fill}
            fontWeight="bold"
          >
            {sign.charAt(0)}
          </text>
        </g>
      );
    }) || null;
  };

  // Helper functions for zodiac sign details
  const getZodiacElement = (sign: string): string => {
    const elements: Record<string, string> = {
      Aries: 'Fire',
      Taurus: 'Earth',
      Gemini: 'Air',
      Cancer: 'Water',
      Leo: 'Fire',
      Virgo: 'Earth',
      Libra: 'Air',
      Scorpio: 'Water',
      Sagittarius: 'Fire',
      Capricorn: 'Earth',
      Aquarius: 'Air',
      Pisces: 'Water',
    };
    return elements[sign] || 'Unknown';
  };

  const getZodiacQuality = (sign: string): string => {
    const qualities: Record<string, string> = {
      Aries: 'Cardinal',
      Taurus: 'Fixed',
      Gemini: 'Mutable',
      Cancer: 'Cardinal',
      Leo: 'Fixed',
      Virgo: 'Mutable',
      Libra: 'Cardinal',
      Scorpio: 'Fixed',
      Sagittarius: 'Mutable',
      Capricorn: 'Cardinal',
      Aquarius: 'Fixed',
      Pisces: 'Mutable',
    };
    return qualities[sign] || 'Unknown';
  };

  const getZodiacRuler = (sign: string): string => {
    const rulers: Record<string, string> = {
      Aries: 'Mars',
      Taurus: 'Venus',
      Gemini: 'Mercury',
      Cancer: 'Moon',
      Leo: 'Sun',
      Virgo: 'Mercury',
      Libra: 'Venus',
      Scorpio: 'Pluto',
      Sagittarius: 'Jupiter',
      Capricorn: 'Saturn',
      Aquarius: 'Uranus',
      Pisces: 'Neptune',
    };
    return rulers[sign] || 'Unknown';
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.content) return null;

    return (
      <div
        ref={tooltipRef}
        className={styles.tooltip}
        style={{
          position: 'absolute',
          left: `${tooltip.x + CHART_CONFIG.tooltipOffset}px`,
          top: `${tooltip.y + CHART_CONFIG.tooltipOffset}px`,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          pointerEvents: 'none',
          maxWidth: '250px',
        }}
      >
        <div className={styles.tooltipTitle}>
          {tooltip.content.title}
        </div>
        <div className={styles.tooltipContent}>
          {tooltip.content.details.map((detail, index) => (
            <div key={index} className={styles.tooltipDetail}>
              <span className={styles.tooltipLabel}>{detail.label}:</span>{' '}
              <span className={styles.tooltipValue}>{detail.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Calculate chart dimensions
  const chartSize = dimensions.size || 0;
  const viewBox = `0 0 ${chartSize} ${chartSize}`;

  return (
    <div
      ref={containerRef}
      className={`${styles.chartContainer} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (!tooltip.pinned) {
          setTooltip(prev => ({ ...prev, visible: false }));
        }
      }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        onClick={(e) => {
          if (e.target === svgRef.current && onChartClick) {
            onChartClick();
          }
        }}
      >
        {/* Background circle */}
        <circle
          cx={dimensions.center}
          cy={dimensions.center}
          r={dimensions.radius}
          fill="none"
          stroke="#eee"
          strokeWidth="1"
        />

        {/* Render houses */}
        {positionedHouses.map(renderHouse)}

        {/* Render zodiac signs */}
        {renderZodiacSigns()}

        {/* Render planets */}
        {positionedPlanets.map(renderPlanet)}
      </svg>

      {/* Tooltip */}
      {renderTooltip()}
    </div>
  );
};

export default KPChartSVG;
