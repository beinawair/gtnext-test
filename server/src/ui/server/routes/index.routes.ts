import { MainRouter } from './main/main.router'
import { V1Routes } from './v1.routes'

/* eslint-disable @typescript-eslint/naming-convention */
export const Routes = {
  '/': MainRouter,
  '/v1': V1Routes,
}
/* eslint-enable @typescript-eslint/naming-convention */
