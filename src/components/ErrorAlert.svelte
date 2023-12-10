<script lang="ts">
  import { ExclamationTriangle, Icon } from "svelte-hero-icons";

  export let error: string;
  export let addMarginBottom: boolean = false;
</script>

{#if error}
  <div
    class="flex items-center gap-2 alert-bg rounded-md py-3 px-4 text-app-theme-red {addMarginBottom
      ? 'mb-3'
      : ''}"
  >
    <div class="">
      <Icon src={ExclamationTriangle} size="20" />
    </div>
    <span class="flex-auto font-medium">
      {error}
    </span>
  </div>
{/if}

<style>
  .alert-bg {
    background: #f0626233;
  }
</style>
