// @ts-ignore
import React from 'react'

type MicroElementType = HTMLElement & Record<string, unknown>

// lifecycles
const eventLifeCycles = ['oncreated', 'onbeforemount', 'onmounted', 'onunmount', 'onerror', 'ondatachange']

export default function jsxCustomEvent (
  type: string | CallableFunction,
  props: Record<string, unknown> | null,
  ...children: any[]
): void {
  const newProps = Object.assign({}, props)

  if (/^micro-app(-\S+)?/.test(type as string) && props) {
    // ref will call when create, update, unmount
    newProps.ref = (element: MicroElementType | null) => {
      if (typeof props.ref === 'function') {
        props.ref(element)
      } else if (typeof props.ref === 'object') {
        (props.ref as any).current = element
      }

      // when unmount and update the element is null
      if (element) {
        // Update data when the prev and next data are different
        if (toString.call(props.data) === '[object Object]' && element.data !== props.data) {
          element.data = props.data
        }

        for (const key in props) {
          if (
            Object.prototype.hasOwnProperty.call(props, key) &&
            eventLifeCycles.includes(key.toLowerCase()) &&
            typeof props[key] === 'function' &&
            (!element[key] || element[key] !== props[key])
          ) {
            const eventName = key.toLowerCase().replace('on', '')
            if (element[key]) {
              // @ts-ignore
              element.removeEventListener(eventName, element[key], false)
            }
            // @ts-ignore
            element.addEventListener(eventName, props[key], false)
            element[key] = props[key]
          }
        }
      }
    }
  }

  return React.createElement.apply(null, [type, newProps, ...children])
}
