type Props = {
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ title, description, align = 'left' }: Props) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : ''}>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="body-muted mt-3">{description}</p> : null}
    </div>
  )
}
