<script lang="ts">
  export let loading: boolean;
</script>

<button {...$$props} on:click>
  {#if loading}
    <div class="flex gap-2 justify-center items-center mr-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-loader-2 animate-spin"
        ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
      >
      <slot name="loadingText" />
    </div>
  {:else}
    <slot name="normalText" />
  {/if}
</button>
