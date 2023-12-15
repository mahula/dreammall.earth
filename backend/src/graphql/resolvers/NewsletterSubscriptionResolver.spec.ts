/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApolloServer } from '@apollo/server'
import { NewsletterSubscription } from '@prisma/client'

import { prisma } from '#src/prisma'
import { createServer } from '#src/server/server'

jest.mock('#config/config', () => {
  return {
    BREVO_KEY: '',
    BREVO_CONTACT_REQUEST_TO_NAME: 'Peter Lustig',
    BREVO_CONTACT_REQUEST_TO_EMAIL: 'peter@lustig.de',
    BREVO_TEMPLATE_CONTACT_BASE: '1',
    BREVO_TEMPLATE_CONTACT_USER: '2',
  }
})

let testServer: ApolloServer

beforeAll(async () => {
  testServer = await createServer()
})

describe('NewsletterSubscriptionResolver', () => {
  describe('subscribeToNewsletter mutation', () => {
    describe('with correct data', () => {
      it('returns true', async () => {
        const response = await testServer.executeOperation({
          query: `mutation($email: String!) {
                    subscribeToNewsletter(email: $email) 
                  }`,
          variables: {
            email: 'peter@lustig.de',
          },
        })
        expect(response.body).toMatchObject({
          kind: 'single',
          singleResult: {
            data: {
              subscribeToNewsletter: true,
            },
          },
        })
      })

      it('has the newsletter subscription form stored in the database', async () => {
        const result: NewsletterSubscription[] = await prisma.newsletterSubscription.findMany()
        expect(result).toHaveLength(1)
        expect(result).toEqual([
          {
            id: expect.any(Number),
            email: 'peter@lustig.de',
            createdAt: expect.any(Date),
            brevoSuccess: null,
          },
        ])
      })
    })
  })
})
