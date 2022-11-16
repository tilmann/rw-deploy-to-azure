import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda'

import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const handler = createGraphQLHandler({
    loggerConfig: { logger, options: {} },
    directives,
    sdls,
    services,
    // cors: {
    //   origin: process.env.BASE_URL,
    //   credentials: true,
    // },
    onException: () => {
      // Disconnect from your database with an unhandled exception.
      db.$disconnect()
    },
  })
  context.log('HTTP trigger function processed a request.')

  context.log('The request body:', req.body)
  context.log('The request headers:', req.headers)

  try {
    const event = {
      httpMethod: req.method,
      isBase64Encoded: false,
      body: req.body,
      headers: req.headers,
      path: '/users',
    } as unknown as APIGatewayProxyEvent

    const lambdaContext = {} as LambdaContext

    const response = await handler(event, lambdaContext)

    context.log('GraphQL response:', response)

    context.res = {
      status: response.statusCode,
      body: response.body,
      headers: response.headers,
    }
  } catch (e) {
    context.log.error('Error:', e)
    context.res = {
      status: 500,
      body: e.message,
    }
  }
}

export default httpTrigger
