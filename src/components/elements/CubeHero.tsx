import { useId, type SVGProps } from "react";

type CubeMarkProps = SVGProps<SVGSVGElement> & {
  src: string;
};

export default function CubeHero({ className, src, ...props }: CubeMarkProps) {
  const clipId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1024"
      height="1024"
      viewBox="0 0 1024 1024"
      className={className}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <path
            d="M123.94 49.91H486.72c42.56 0 77.66 34.62 77.73 77.28l.03 17.98c.07 41.65 21.82 62.65 63.24 62.65l91.97 .01c31.87 0 57.8 25.97 57.8 57.830V392.57c.01 41.81 21.27 63.24 63.13 63.25l59.61 .01c42.81 .01 77.57 35 77.57 77.75V896.33c0 42.91-34.82 77.76-77.74 77.76H537.28c-42.64 0-77.7-34.69-77.73-77.41l-.03-30.41c-.03-44.8-23.6-62.81-66.54-62.81h-133c-36.2 0-61.160-24.27-61.16-60.67c0-36.67 .05-73.33 0-109.99c-.06-41.73-19.42-64.44-62.21-64.6l-13.49-.05c-42.52-.16-76.92-35.4-76.92-77.73V127.67c0-42.91 34.82-77.76 77.74-77.76Z"
            clipRule="evenodd"
          />
        </clipPath>
      </defs>
      <image
        href={src}
        x="0"
        y="0"
        width="1024"
        height="1024"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}