import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { Request } from '@whatwg-node/fetch'

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
    onException: () => {
      // Disconnect from your database with an unhandled exception.
      db.$disconnect()
    },
  })
  context.log('HTTP trigger function processed a request.')

  try {
    const request = new Request(req.url, {
      method: req.method,
      body: req.rawBody,
      headers: req.headers,
    })

    context.log('The request:', request)

    const response = await handler(request as any, context as any)
    // const responseText = await response.text()
    context.log('GraphQL response:', response)

    context.res = {
      status: response.statusCode,
      body: JSON.stringify(response),
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
