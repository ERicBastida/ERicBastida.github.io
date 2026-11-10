export type FlagCode = 'ar' | 'us'

const US_STRIPES = Array.from({ length: 7 }, (_, row) => (row * 2 * 20) / 13)
const US_STARS = [1.5, 4, 6.5, 9].flatMap((y, row) =>
  [1.6, 4.4, 7.2, 10].map((x) => ({ x: x + (row % 2) * 0.7, y })),
)

export function Flag({ code, className }: { code: FlagCode; className: string }) {
  if (code === 'ar') {
    return (
      <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#74acdf" />
        <rect y="6.67" width="30" height="6.66" fill="#fff" />
        <circle cx="15" cy="10" r="2.3" fill="#f6b40e" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      {US_STRIPES.map((y) => (
        <rect key={y} y={y} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="12" height={(20 * 7) / 13} fill="#3c3b6e" />
      {US_STARS.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" fill="#fff" />
      ))}
    </svg>
  )
}
