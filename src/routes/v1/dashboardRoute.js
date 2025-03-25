import express from 'express'
import { dashboardController } from '~/controllers/dashboardController'
import { authMiddlewares } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/access')
  .get(authMiddlewares.isAuthorized, dashboardController.access)

export const dashboardRoute = Router
