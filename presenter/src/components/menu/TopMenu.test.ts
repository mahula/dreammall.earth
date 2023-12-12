import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { VApp } from 'vuetify/components'

import AnchorLink from '#components/nav/AnchorLink.vue'

import LogoImage from './LogoImage.vue'
import TopMenu from './TopMenu.vue'

describe('FooterMenu', () => {
  const wrapper = mount(VApp, {
    slots: {
      default: h(TopMenu),
    },
  })

  it('renders three columns', () => {
    expect(wrapper.find('.v-row').exists()).toBeTruthy()
    expect(wrapper.findAll('.v-row > div')).toHaveLength(3)
  })

  describe('first column', () => {
    it('contains logo', () => {
      expect(wrapper.findAll('.v-row > div')[0].findComponent(LogoImage)).toBeTruthy()
    })
  })

  describe('second column', () => {
    const column = wrapper.findAll('.v-row > div')[1]

    it('contains 3 children -> AnchorLink', () => {
      expect(column.findAllComponents(AnchorLink)).toHaveLength(3)
    })

    describe('first anchor link', () => {
      const anchor = column.findAllComponents(AnchorLink)[0]

      it('has href #about', () => {
        expect(anchor.attributes('href')).toBe('#about')
      })

      it('has label menu.about', () => {
        expect(anchor.text()).toBe("$t('menu.header.about')")
      })
    })

    describe('second anchor link', () => {
      const anchor = column.findAllComponents(AnchorLink)[1]

      it('has href #products', () => {
        expect(anchor.attributes('href')).toBe('#products')
      })

      it('has label menu.products', () => {
        expect(anchor.text()).toBe("$t('menu.header.products')")
      })
    })

    describe('third anchor link', () => {
      const anchor = column.findAllComponents(AnchorLink)[2]

      it('has href #contact', () => {
        expect(anchor.attributes('href')).toBe('#contact')
      })

      it('has label menu.contact', () => {
        expect(anchor.text()).toBe("$t('menu.header.contact')")
      })
    })
  })

  describe('third column', () => {
    it('is placeholder', () => {
      expect(wrapper.findAll('.v-row > div')[2].findAll('div')).toHaveLength(0)
    })
  })
})
