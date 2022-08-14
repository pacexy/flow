import { useColorScheme } from '@literal-ui/hooks'

import { db } from '@ink/reader/db'

import { Button } from '../Button'
import { Page } from '../Page'

export const Settings: React.FC = () => {
  const { scheme, toggle } = useColorScheme()
  return (
    <Page headline="Settings">
      <div className="space-y-4">
        <div>
          <label className="typescale-body-medium text-outline">
            Color scheme
            <select
              className="typescale-body-medium text-on-surface-variant ml-3 p-0.5"
              value={scheme}
              onChange={toggle}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            db?.books.clear()
            db?.covers.clear()
            db?.files.clear()
          }}
        >
          Clear cache
        </Button>
      </div>
    </Page>
  )
}
