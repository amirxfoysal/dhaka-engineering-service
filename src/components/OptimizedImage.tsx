import { toWebpPath, bannerSrcSet, isLocalRasterPath } from '../utils/imageDelivery';

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  /** High-priority LCP image */
  priority?: boolean;
  loading?: 'lazy' | 'eager';
};

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  priority = false,
  loading,
}: Props) {
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const fetchPriority = priority ? 'high' : undefined;
  const webp = isLocalRasterPath(src) ? toWebpPath(src) : null;
  const webpSrcSet = bannerSrcSet(src, 'webp');
  const jpgSrcSet = bannerSrcSet(src, 'jpg');

  if (webp || webpSrcSet) {
    return (
      <picture>
        {webpSrcSet ? (
          <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        ) : webp ? (
          <source type="image/webp" srcSet={webp} />
        ) : null}
        {jpgSrcSet ? <source type="image/jpeg" srcSet={jpgSrcSet} sizes={sizes} /> : null}
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          sizes={sizes}
          loading={resolvedLoading}
          decoding={priority ? 'sync' : 'async'}
          {...(fetchPriority ? { fetchPriority } : {})}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      loading={resolvedLoading}
      decoding={priority ? 'sync' : 'async'}
      {...(fetchPriority ? { fetchPriority } : {})}
    />
  );
}
