import type {
  Component,
  RouteDeclaration,
} from '@toddledev/core/dist/component/component.types'
import { isPageComponent } from '@toddledev/core/dist/component/isPageComponent'
import { createStylesheet } from '@toddledev/core/dist/styling/style.css'
import { theme as defaultTheme } from '@toddledev/core/dist/styling/theme.const'
import { takeIncludedComponents } from '@toddledev/ssr/dist/components/utils'
import type {
  ProjectFiles,
  Route,
  ToddleProject,
} from '@toddledev/ssr/dist/ssr.types'
import {
  generateCustomCodeFile,
  hasCustomCode,
  takeReferencedFormulasAndActions,
} from '@toddledev/ssr/src/custom-code/codeRefs'
import { removeTestData } from '@toddledev/ssr/src/rendering/testData'

interface Routes {
  pages: Record<string, { name: string; route: RouteDeclaration }>
  routes: Record<string, Route>
}

type Files = Record<
  string,
  { component: Component; files: ProjectFiles & { customCode: boolean } }
>

export const splitRoutes = (json: {
  files: ProjectFiles
  project: ToddleProject
}): {
  project: { project: ToddleProject; config: ProjectFiles['config'] }
  routes: Routes
  files: Files
  styles: Record<string, string>
  code: Record<string, string>
  components: Partial<Record<string, Component>>
} => {
  const filesMap: Files = {}
  const stylesMap: Record<string, string> = {}
  const codeMap: Record<string, string> = {}
  const { files } = json

  const routes: Routes = {
    routes: { ...(files.routes ?? {}) },
    pages: {},
  }
  Object.entries(files.components).forEach(([name, component]) => {
    if (component) {
      if (isPageComponent(component)) {
        routes.pages[name] = {
          name,
          route: {
            path: component.route.path,
            query: component.route.query,
          },
        }
        const components = takeIncludedComponents({
          root: component,
          projectComponents: files.components,
          packages: files.packages,
          includeRoot: true,
        })
        const theme =
          (files.themes
            ? Object.values(files.themes)[0]
            : files.config?.theme) ?? defaultTheme
        const styles = createStylesheet(component, components, theme, {
          // The reset stylesheet is loaded separately
          includeResetStyle: false,
          // Font faces are created from a stylesheet referenced in the head
          createFontFaces: false,
        })
        stylesMap[name] = styles
        let customCode = false
        if (hasCustomCode(component, files)) {
          customCode = true
          const code = takeReferencedFormulasAndActions({
            component,
            files,
          })
          const output = generateCustomCodeFile({
            code,
            componentName: component.name,
            projectId: 'toddle',
          })
          codeMap[name] = output
        }
        filesMap[name] = {
          component: removeTestData(component),
          files: {
            customCode,
            config: files.config,
            themes: files.themes,
            components: Object.fromEntries(
              components.map((c) => [c.name, removeTestData(c)]),
            ),
            // Routes are not necessary in output files for components
            routes: undefined,
          },
        }
      }
    }
  })

  return {
    routes,
    components: files.components,
    files: filesMap,
    styles: stylesMap,
    code: codeMap,
    project: { project: json.project, config: files.config },
  }
}
