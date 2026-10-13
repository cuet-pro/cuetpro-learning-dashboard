/* Real CUET Pro logo (wordmark + tagline) — reusable brand mark.
   size: 'md' (44px → 36px on mobile) | 'sm' (36px); onDark adds the white
   rounded tile for contrast against the navy brand panel.
   Never apply a CSS filter to recolour it. */
export default function BrandLogo({ size = 'md', onDark = false }) {
  return (
    <span className={'brand-logo' + (onDark ? ' on-dark' : '')}>
      <img
        className={'brand-logo-img' + (size === 'sm' ? ' sm' : '')}
        src="/brand/cuetpro-logo.png"
        alt="CUET Pro — An Initiative by DU Toppers"
      />
    </span>
  )
}