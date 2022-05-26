const fm = require('gray-matter')

module.exports = async function (src) {
  const callback = this.async()
  const { content, data } = fm(src)

  const code =
    // based on `baseUrl` in `tsconfig.json`
    `import {withLayout} from 'apps/reader/src/components';

export default withLayout(${JSON.stringify(data)})

` + content

  return callback(null, code)
}
