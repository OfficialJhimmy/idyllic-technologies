import Image from "next/image";
import { mediaUrl } from "@/lib/media/url";

type Props = { path: string; alt: string; width: number; height: number; sizes?: string; className?: string };

/** Product plate: a soft square surface with the image contained, so cut outs and photos share one crop. */
export function MediaThumb({ path, alt, width, height, sizes = "(min-width: 1024px) 12rem, 45vw", className = "" }: Props) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-card bg-sunken ${className}`}>
      <Image src={mediaUrl(path)} alt={alt} width={width} height={height} sizes={sizes} className="h-full w-full object-contain p-2" />
    </div>
  );
}
