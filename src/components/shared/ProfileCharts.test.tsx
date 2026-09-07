import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AttachmentAxesChart from './AttachmentAxesChart'
import RiasecHexagonChart from './RiasecHexagonChart'

describe('profile result charts', () => {
  it('exposes all six RIASEC values without relying on color', () => {
    const html = renderToStaticMarkup(<RiasecHexagonChart
      labels={{ R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' }}
      scores={{ R: 80, I: 70, A: 60, S: 50, E: 40, C: 30 }}
      title="Interest profile"
    />)
    expect(html).toContain('Realistic 80%')
    expect(html).toContain('Conventional 30%')
    expect(html).toContain('R · 80')
  })

  it('exposes both continuous attachment dimensions', () => {
    const html = renderToStaticMarkup(<AttachmentAxesChart anxiety={62} anxietyLabel="Anxiety" avoidance={38} avoidanceLabel="Avoidance" title="Current tendency" />)
    expect(html).toContain('Anxiety 62%, Avoidance 38%')
    expect(html).not.toContain('secure')
  })
})
