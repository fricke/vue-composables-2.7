import Vue, { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import type { Wrapper } from "@vue/test-utils";

function mountComposable<Composable extends () => object>(
  composable: Composable,
): Wrapper<Vue & ReturnType<Composable>> {
  const TestComponentWithComposable = defineComponent({
    setup() {
      return composable();
    },
    template: "<div/>",
  });

  const mountedComponent = mount(
    TestComponentWithComposable,
  ) as Wrapper<Vue & ReturnType<typeof composable>>;
  return mountedComponent;
}

export default mountComposable;
