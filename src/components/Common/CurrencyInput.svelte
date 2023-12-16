<script lang="ts">
  import CurrencyInput from "@canutin/svelte-currency-input";
  import { onMount, onDestroy } from "svelte";

  let wrapperRef: HTMLElement;

  let focus: boolean = false;
  let currencyInput: HTMLElement | null;

  let listeners: (() => void)[] = [];

  onMount(() => {
    const onFocus = () => {
      focus = true;
    };

    const onBlur = () => {
      focus = false;
    };

    const input = wrapperRef.querySelector(".currency-input");

    if (input) {
      input.addEventListener("focus", onFocus);
      input.addEventListener("blur", onBlur);

      listeners.push(onFocus, onBlur);
    }
  });

  onDestroy(() => {
    if (currencyInput) {
      currencyInput.removeEventListener("focus", listeners[0]);
      currencyInput.removeEventListener("blur", listeners[1]);
    }
  });
</script>

<div bind:this={wrapperRef} class="currency-wrapper">
  <CurrencyInput
    {...$$props}
    currency="IDR"
    isNegativeAllowed={false}
    inputClasses={{
      wrapper: `input w-full ${
        focus ? "!bg-app-input-bg-focus !border-app-input-outline-focus" : ""
      }`,
      formatted: `currency-input w-full bg-app-input-bg-normal focus:outline-none font-medium !text-app-text-light ${
        focus ? "!bg-app-input-bg-focus" : ""
      }`,
    }}
  />
</div>
