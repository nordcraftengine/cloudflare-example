import { isPageComponent } from '@nordcraft/core/dist/component/isPageComponent'
import type { NotFoundHandler } from 'hono'
import type { HonoEnv } from '../../hono'
import { nordcraftPage } from '../routes/nordcraftPage'

export const notFoundLoader: NotFoundHandler<HonoEnv> = async (ctx) => {
  const component = ctx.var.project.files.components['404']
  if (!component || !isPageComponent(component)) {
    return ctx.text('Not Found', {
      status: 404,
    })
  }
  return nordcraftPage({
    hono: ctx,
    page: component,
    status: 404,
  })
}
