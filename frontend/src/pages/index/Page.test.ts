import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Component, h } from 'vue'
import { VApp } from 'vuetify/components'

import { joinMyRoomQuery } from '#queries/joinMyRoomQuery'
import { AUTH } from '#src/env'
import { useAuthStore } from '#stores/authStore'
import { mockClient } from '#tests/mock.apolloClient'

import IndexPage from './+Page.vue'
import { title } from './+title'

const joinMyRoomQueryMock = vi.fn()

mockClient.setRequestHandler(
  joinMyRoomQuery,
  joinMyRoomQueryMock.mockResolvedValue({ data: { joinMyRoom: 'http://some.url' } }),
)

describe('IndexPage', () => {
  const Wrapper = () => {
    return mount(VApp, {
      slots: {
        default: h(IndexPage as Component),
      },
    })
  }

  let wrapper: ReturnType<typeof Wrapper>

  describe('without apollo error', () => {
    beforeEach(() => {
      joinMyRoomQueryMock.mockResolvedValue({ data: { getRoom: 'http://some.url' } })
      wrapper = Wrapper()
    })

    it('title returns default title', () => {
      expect(title()).toBe('DreamMall')
    })

    it('renders', () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    describe('room button', () => {
      // const consoleSpy = vi.spyOn(global.console, 'log')
      const windowOpenSpy = vi.spyOn(window, 'open')

      beforeEach(async () => {
        await wrapper.find('button.room-button').trigger('click')
      })

      it('calls the API', () => {
        expect(joinMyRoomQueryMock).toBeCalled()
      })

      it.skip('opens url in new tab', () => {
        expect(windowOpenSpy).toBeCalledWith('http://some.url/', '_blank')
      })
    })

    describe('admin button', () => {
      const authStore = useAuthStore()

      describe('as normal user', () => {
        it('does not exist', () => {
          expect(wrapper.find('button.admin-button').exists()).toBe(false)
        })
      })

      describe('as admin user', () => {
        beforeEach(() => {
          AUTH.ADMIN_GROUP = 'ADMIN_GROUP'
          AUTH.ADMIN_REDIRECT_URI = 'https://url-to-admin.com'
          authStore.save({
            access_token: 'access_token',
            profile: {
              aud: 'aud',
              sub: 'sub',
              exp: 1,
              iat: 1,
              iss: 'iss',
              groups: ['ADMIN_GROUP'],
            },
            token_type: 'token_type',
            session_state: null,
            state: null,
            expires_at: new Date().valueOf() + 100,
            expires_in: 0,
            expired: false,
            scopes: ['email'],
            toStorageString: () => 'toStorageString',
          })
        })

        it('exists', () => {
          expect(wrapper.find('button.admin-button').exists()).toBe(true)
        })

        describe('click', () => {
          beforeEach(async () => {
            await wrapper.find('button.admin-button').trigger('click')
          })

          it('redirects to admin url', () => {
            expect(global.window.location.href).toBe('https://url-to-admin.com/')
          })
        })
      })
    })
  })

  describe('with error', () => {
    const authStore = useAuthStore()

    beforeEach(() => {
      vi.clearAllMocks()
      joinMyRoomQueryMock.mockRejectedValue({ message: 'Aua!' })
    })

    describe('as admin user', () => {
      beforeEach(() => {
        AUTH.ADMIN_GROUP = 'ADMIN_GROUP'
        AUTH.ADMIN_REDIRECT_URI = 'https://url-to-admin.com'
        authStore.save({
          access_token: 'access_token',
          profile: {
            aud: 'aud',
            sub: 'sub',
            exp: 1,
            iat: 1,
            iss: 'iss',
            groups: ['ADMIN_GROUP'],
          },
          token_type: 'token_type',
          session_state: null,
          state: null,
          expires_at: new Date().valueOf() + 100,
          expires_in: 0,
          expired: false,
          scopes: ['email'],
          toStorageString: () => 'toStorageString',
        })
      })

      it('exists', () => {
        expect(wrapper.find('button.admin-button').exists()).toBe(true)
      })

      describe('click', () => {
        beforeEach(async () => {
          await wrapper.find('button.admin-button').trigger('click')
        })

        it('redirects to admin url', () => {
          expect(global.window.location.href).toBe('https://url-to-admin.com/')
        })
      })
    })
  })

  describe.skip('with apollo error', () => {
    beforeEach(() => {
      wrapper.unmount()
      vi.clearAllMocks()
      joinMyRoomQueryMock.mockRejectedValue({ message: 'Aua!', data: undefined })
      wrapper = Wrapper()
    })

    describe('room button', () => {
      const consoleSpy = vi.spyOn(global.console, 'log')

      beforeEach(async () => {
        await wrapper.find('button.room-button').trigger('click')
      })

      it('logs error message', () => {
        expect(consoleSpy).toBeCalledWith('Aua!')
      })
    })
  })
})
