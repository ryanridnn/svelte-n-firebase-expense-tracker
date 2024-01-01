<script lang="ts">
  import { Icon, XMark } from "svelte-hero-icons";

  export let open: boolean;
  export let closeModal: () => void;
</script>

<div
  class="fixed z-[99] w-full bottom-0 left-0 transition duration-300 {open
    ? ''
    : 'translate-y-[100%]'}"
>
  <div
    class="bg-app-bg-300 rounded-t-3xl max-h-screen overflow-hidden flex flex-col"
  >
    <div class="flex justify-between py-6 min-h-0 px-5">
      <div>
        <slot name="header" />
      </div>
      <button on:click={closeModal} class="">
        <Icon src={XMark} size="28" />
      </button>
    </div>
    <div class="h-full overflow-y-auto min-h-0 px-5 pb-5">
      <slot />
    </div>
  </div>
</div>

<div
  on:click={closeModal}
  class="fixed top-0 left-0 w-screen h-screen bg-black {open
    ? 'opacity-[.2] pointer-events-auto z-[10]'
    : 'opacity-[0] pointer-events-none'}"
></div>
