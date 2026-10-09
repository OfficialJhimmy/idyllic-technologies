import Image from "next/image";
import { mediaFileUrl } from "@/lib/seo";

type Props = { image: { storagePath: string; alt: string; width: number; height: number }; sizes: string; className?: string; priority?: boolean; fill?: boolean };

/** An image from the media library, with its real size and alt text. */
export function MediaImage({ image, sizes, className = "", priority = false, fill = false }: Props) {
  return fill ? (
    <Image src={mediaFileUrl(image.storagePath)} alt={image.alt} fill sizes={sizes} priority={priority} className={className} />
  ) : (
    <Image src={mediaFileUrl(image.storagePath)} alt={image.alt} width={image.width} height={image.height} sizes={sizes} priority={priority} className={className} />
  );
}
