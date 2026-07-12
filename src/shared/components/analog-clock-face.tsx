interface AnalogClockFaceProps {
  hourRotation: number;
  minuteRotation: number;
  showHands?: boolean;
}

export function AnalogClockFace({
  hourRotation,
  minuteRotation,
  showHands = true,
}: AnalogClockFaceProps) {
  return (
    <>
      <svg className="size-full" viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r="96"
          className="fill-background stroke-primary/15"
          strokeWidth="5"
        />
        {Array.from({ length: 12 }, (_, index) => {
          const number = index + 1;
          const position = getClockPoint(number === 12 ? 0 : number * 30, 78);

          return (
            <text
              key={number}
              x={position.x}
              y={position.y}
              className="fill-foreground text-[13px] font-bold"
              dominantBaseline="central"
              textAnchor="middle"
            >
              {number}
            </text>
          );
        })}
      </svg>
      <svg
        className="pointer-events-none absolute inset-0 z-20 size-full"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        {showHands ? (
          <>
            <g
              className="clock-hand"
              style={{
                transform: `rotate(${hourRotation}deg)`,
                transformOrigin: "100px 100px",
              }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="54"
                className="stroke-primary"
                strokeLinecap="round"
                strokeWidth="5"
              />
            </g>
            <g
              className="clock-hand"
              style={{
                transform: `rotate(${minuteRotation}deg)`,
                transformOrigin: "100px 100px",
              }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="34"
                className="stroke-primary/75"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </g>
            <circle
              cx="100"
              cy="100"
              r="6"
              className="fill-primary stroke-background"
              strokeWidth="3"
            />
          </>
        ) : null}
      </svg>
    </>
  );
}

function getClockPoint(rotation: number, radius: number) {
  const angle = ((rotation - 90) * Math.PI) / 180;

  return {
    x: 100 + Math.cos(angle) * radius,
    y: 100 + Math.sin(angle) * radius,
  };
}
