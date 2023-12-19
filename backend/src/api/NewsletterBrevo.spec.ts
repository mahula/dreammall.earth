/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line import/no-namespace
import * as SibApiV3Sdk from '@getbrevo/brevo'
import { ContactForm } from '@prisma/client'

import config from '#config/config'
import { prisma } from '#src/prisma'

import {
  createBrevoInstance,
  createSmtpEmail,
  sendContactFormEmail,
  sendSmtpEmail,
} from './NewsletterBrevo'

config.BREVO_KEY = 'MY KEY'
config.BREVO_CONTACT_REQUEST_TO_NAME = 'Peter Lustig'
config.BREVO_CONTACT_REQUEST_TO_EMAIL = 'peter@lustig.de'
config.BREVO_TEMPLATE_CONTACT_BASE = 1
config.BREVO_TEMPLATE_CONTACT_USER = 2

const mockSendTransacEmail = jest.fn().mockResolvedValue({
  response: 'success',
})

jest.mock('@getbrevo/brevo', () => {
  const originalModule = jest.requireActual<typeof import('@getbrevo/brevo')>('@getbrevo/brevo')
  return {
    __esModule: true,
    ...originalModule,
    TransactionalEmailsApi: jest.fn().mockImplementation(() => {
      return {
        setApiKey: jest.fn(),
        sendTransacEmail: mockSendTransacEmail,
      }
    }),
    SendSmtpEmail: jest.fn().mockImplementation(() => {
      return {}
    }),
  }
})

const consoleLogMock = jest.fn()
// eslint-disable-next-line no-console
console.log = consoleLogMock

let contactForm: ContactForm

beforeEach(async () => {
  await prisma.contactForm.deleteMany()
  contactForm = await prisma.contactForm.create({
    data: {
      firstName: 'Bibi',
      lastName: 'Bloxberg',
      content: 'Hello DreamMall!',
      email: 'bibi@bloxberg.de',
    },
  })
})

describe('NewsletterBrevo', () => {
  describe('createBrevoInstance', () => {
    let result: SibApiV3Sdk.TransactionalEmailsApi

    beforeEach(() => {
      jest.clearAllMocks()
      result = createBrevoInstance()
    })

    it('calls TransactionalEmailsApi constructor', () => {
      expect(SibApiV3Sdk.TransactionalEmailsApi).toHaveBeenCalledTimes(1)
    })

    it('sets the API key', () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(result.setApiKey).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(result.setApiKey).toHaveBeenCalledWith(0, 'MY KEY')
    })
  })

  describe('createSmtpEmail', () => {
    let result: SibApiV3Sdk.SendSmtpEmail

    beforeEach(() => {
      jest.clearAllMocks()
      result = createSmtpEmail(
        42,
        [
          {
            name: 'Peter Lustig',
            email: 'peter@lustig.de',
          },
        ],
        {
          name: 'Bibi Bloxberg',
          email: 'bibi@bloxberg.de',
        },
        {
          name: 'Bibi Bloxberg',
          email: 'bibi@bloxberg.de',
        },
        {
          ...contactForm,
        },
      )
    })

    it('returns sendSmtpEmail object', () => {
      expect(result).toEqual({
        templateId: 42,
        to: [
          {
            name: 'Peter Lustig',
            email: 'peter@lustig.de',
          },
        ],
        sender: {
          name: 'Bibi Bloxberg',
          email: 'bibi@bloxberg.de',
        },
        replyTo: {
          name: 'Bibi Bloxberg',
          email: 'bibi@bloxberg.de',
        },
        params: {
          ...contactForm,
        },
      })
    })
  })

  describe('sendSmtpEmail', () => {
    describe('with success', () => {
      beforeEach(async () => {
        jest.clearAllMocks()
        await sendSmtpEmail(
          createSmtpEmail(
            42,
            [
              {
                name: 'Peter Lustig',
                email: 'peter@lustig.de',
              },
            ],
            {
              name: 'Bibi Bloxberg',
              email: 'bibi@bloxberg.de',
            },
            {
              name: 'Bibi Bloxberg',
              email: 'bibi@bloxberg.de',
            },
            {
              ...contactForm,
            },
          ),
          contactForm,
        )
      })

      it('calls TransactionalEmailsApi constructor', () => {
        expect(SibApiV3Sdk.TransactionalEmailsApi).toHaveBeenCalledTimes(1)
      })

      it('does update the database', async () => {
        const result: ContactForm[] = await prisma.contactForm.findMany()
        expect(result).toHaveLength(1)
        expect(result).toEqual([
          {
            id: expect.any(Number),
            firstName: 'Bibi',
            lastName: 'Bloxberg',
            content: 'Hello DreamMall!',
            email: 'bibi@bloxberg.de',
            createdAt: expect.any(Date),
            brevoSuccess: expect.any(Date),
          },
        ])
      })
    })

    describe('with error', () => {
      beforeEach(async () => {
        jest.clearAllMocks()
        mockSendTransacEmail.mockRejectedValue({
          error: 'error',
        })
        await sendSmtpEmail(
          createSmtpEmail(
            42,
            [
              {
                name: 'Peter Lustig',
                email: 'peter@lustig.de',
              },
            ],
            {
              name: 'Bibi Bloxberg',
              email: 'bibi@bloxberg.de',
            },
            {
              name: 'Bibi Bloxberg',
              email: 'bibi@bloxberg.de',
            },
            {
              ...contactForm,
            },
          ),
          contactForm,
        )
      })

      it('calls TransactionalEmailsApi constructor', () => {
        expect(SibApiV3Sdk.TransactionalEmailsApi).toHaveBeenCalledTimes(1)
      })

      it('does not update the database', async () => {
        const result: ContactForm[] = await prisma.contactForm.findMany()
        expect(result).toHaveLength(1)
        expect(result).toEqual([
          {
            id: expect.any(Number),
            firstName: 'Bibi',
            lastName: 'Bloxberg',
            content: 'Hello DreamMall!',
            email: 'bibi@bloxberg.de',
            createdAt: expect.any(Date),
            brevoSuccess: null,
          },
        ])
      })

      it('calls the console.log in error path', () => {
        expect(consoleLogMock).toHaveBeenCalledWith({ error: 'error' })
      })
    })
  })

  describe('sendContactFormEmail', () => {
    describe('brevo key given', () => {
      beforeEach(async () => {
        jest.clearAllMocks()
        await sendContactFormEmail(contactForm)
      })

      it('calls sendSmtpEmail twice', () => {
        expect(mockSendTransacEmail).toBeCalledTimes(2)
      })

      it('sends email to base', () => {
        expect(mockSendTransacEmail).toBeCalledWith({
          templateId: 1,
          to: [
            {
              name: 'Peter Lustig',
              email: 'peter@lustig.de',
            },
          ],
          sender: {
            name: 'Bibi Bloxberg',
            email: 'bibi@bloxberg.de',
          },
          replyTo: {
            name: 'Bibi Bloxberg',
            email: 'bibi@bloxberg.de',
          },
          params: {
            email: contactForm.email,
            firstname: contactForm.firstName,
            lastname: contactForm.lastName,
            content: contactForm.content,
          },
        })
      })

      it('sends email to client', () => {
        expect(mockSendTransacEmail).toBeCalledWith({
          templateId: 2,
          to: [
            {
              name: 'Bibi Bloxberg',
              email: 'bibi@bloxberg.de',
            },
          ],
          sender: {
            name: 'Peter Lustig',
            email: 'peter@lustig.de',
          },
          replyTo: {
            name: 'Peter Lustig',
            email: 'peter@lustig.de',
          },
          params: {
            firstname: contactForm.firstName,
            lastname: contactForm.lastName,
            content: contactForm.content,
          },
        })
      })
    })

    describe('without brevo key', () => {
      beforeEach(async () => {
        jest.clearAllMocks()
        config.BREVO_KEY = ''
        await sendContactFormEmail(contactForm)
      })

      it('does not call sendSmtpEmail', () => {
        expect(mockSendTransacEmail).not.toBeCalled()
      })
    })
  })
})
