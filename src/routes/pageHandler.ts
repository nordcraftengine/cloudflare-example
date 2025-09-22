import { isPageComponent } from '@nordcraft/core/dist/component/isPageComponent'
import { matchPageForUrl } from '@nordcraft/ssr/dist/routing/routing'
import type { MiddlewareHandler } from 'hono'
import type { HonoEnv } from '../../hono'
import { nordcraftPage } from './nordcraftPage'

export const pageHandler: MiddlewareHandler<HonoEnv> = async (ctx, next) => {
  const url = new URL(ctx.req.url)
  const pageMatch = matchPageForUrl({
    url,
    pages: Object.values(ctx.var.project.files.components).filter(
      (c) => c !== undefined && isPageComponent(c),
    ),
  })
  if (pageMatch) {
    const component = ctx.var.project.files.components[pageMatch.name]
    if (!component || !isPageComponent(component)) {
      return next()
    }
    return nordcraftPage({
      hono: ctx,
      page: component,
      status: pageMatch.name === '404' ? 404 : 200,
    })
  }
  return next()
}
