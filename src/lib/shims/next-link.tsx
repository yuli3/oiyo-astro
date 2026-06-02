import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, passHref: _ph, legacyBehavior: _lb, asChild: _ac, ...props }, ref) => (
    <a ref={ref} href={href} {...props} />
  ),
);
Link.displayName = 'Link';

export default Link;
