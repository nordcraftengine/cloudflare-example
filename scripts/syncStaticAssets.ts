// Copy files from the static-assets directory to the dist directory using fs
// This script is executed by the build process
import { RESET_STYLES } from '@nordcraft/core/dist/styling/theme.const'
import * as fs from 'fs'
import { splitRoutes } from './routes'

// assets/_static/ folder
fs.rmdirSync(`${__dirname}/../assets/_static`, { recursive: true })
fs.mkdirSync(`${__dirname}/../assets/_static`, { recursive: true })
;[
  'page.main.esm.js',
  'page.main.esm.js.map',
  'custom-element.main.esm.js',
].forEach((f) =>
  fs.copyFileSync(
    `${__dirname}/../node_modules/@nordcraft/runtime/dist/${f}`,
    `${__dirname}/../assets/_static/${f}`,
  ),
)
fs.writeFileSync(`${__dirname}/../assets/_static/reset.css`, RESET_STYLES)

// dist/ folder
fs.rmdirSync(`${__dirname}/../dist`, { recursive: true })
fs.mkdirSync(`${__dirname}/../dist`, { recursive: true })
const projectFile = fs.readFileSync(`${__dirname}/../__project__/project.json`)
const json = JSON.parse(projectFile.toString())
const { project, routes, components, files, styles, code } = splitRoutes(json)
// Create a stylesheet for each component
Object.entries(styles).forEach(([name, style]) => {
  fs.writeFileSync(
    `${__dirname}/../assets/_static/${name.toLowerCase()}.css`,
    style,
  )
})
// Create a js file with custom code for each component
Object.entries(code).forEach(([name, c]) => {
  fs.writeFileSync(
    `${__dirname}/../assets/_static/cc_${name.toLowerCase()}.js`,
    c,
  )
})
const jsiFy = (obj: any) => `export default ${JSON.stringify(obj)}`
fs.writeFileSync(`${__dirname}/../dist/project.js`, jsiFy(project))
fs.writeFileSync(`${__dirname}/../dist/routes.js`, jsiFy(routes))
// fs.writeFileSync(
//   `${__dirname}/../dist/components.js`,
//   JSON.stringify(Object.entries(components).map(([name]) => name)),
// )
fs.mkdirSync(`${__dirname}/../dist/components`, { recursive: true })
Object.entries(files).forEach(([name, file]) => {
  fs.writeFileSync(
    `${__dirname}/../dist/components/${name.toLowerCase()}.js`,
    jsiFy(file.files),
  )
})
// Object.entries(components).forEach(([name, file]) => {
//   fs.writeFileSync(
//     `${__dirname}/../dist/components/${name.toLowerCase()}.js`,
//     JSON.stringify(file),
//   )
// })
