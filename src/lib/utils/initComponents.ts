import sortBy from 'lodash/sortBy';
import { getComponents, setComponentInstance } from './componentStore';

/**
 * Called to init components for the elements in the DOM.
 *
 * Once the component tree for the passed rootELement is fully constructed, the adopted() lifecycle
 * method will be called on all new components that implement that method.
 * When the adopted() method is called, it means that the component is fully adopted by all its
 * parents and the application is fully mounted.
 *
 * @param {HTMLElement} rootElement Only components on or in this element will be constructed, this
 * means you can update a new section of HTML at a later time.
 */
export default function initComponents(rootElement: HTMLElement): void {
  const list = [];

  getComponents().forEach(component => {
    const BlockConstructor = component;
    const displayName = BlockConstructor.displayName;

    if (rootElement.getAttribute('data-component') === displayName) {
      list.push({
        component,
        element: rootElement,
        depth: getComponentDepth(rootElement as HTMLElement),
      });
    }

    // find all DOM elements that belong the this block
    Array.from(rootElement.querySelectorAll(`[data-component="${displayName}"]`)).forEach(
      element => {
        list.push({
          component,
          element,
          depth: getComponentDepth(element as HTMLElement),
        });
      },
    );
  });

  // sort list by deepest element first
  // this will make sure that child components are constructed
  // before any parents, allowing the parents to directly reference them
  const sortedList = sortBy(list, ['depth']).reverse();

  const newInstances = [];

  // create all corresponding classes
  sortedList.forEach(({ component, element }) => {
    const BlockConstructor = component;
    const displayName = BlockConstructor.displayName;

    // we don't want an error in one component to stop creating all other components
    try {
      const instance = new BlockConstructor(element);
      setComponentInstance(displayName, { instance, element });
      newInstances.push(instance);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
    }
  });

  newInstances.forEach(instance => {
    if (typeof instance.adopted === 'function') {
      instance.adopted();
    }
  });
}

/**
 * Returns the depth of an element in the DOM
 *
 * @param {HTMLElement} element
 * @return {number}
 */
function getComponentDepth(element: HTMLElement): number {
  let depth = 0;
  let el = element;
  while (el.parentElement) {
    ++depth;
    el = el.parentElement;
  }
  return depth;
}
