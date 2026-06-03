import React from 'react';
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
}
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, fill, priority: _p, quality: _q, placeholder: _ph, blurDataURL: _b, ...props }, ref) => (
    <img ref={ref} src={src} alt={alt} {...(fill ? { style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } } : {})} {...props} />
  )
);
Image.displayName = 'Image';
export default Image;
