<script lang="ts">
  import { userLoaded } from "@/stores/user";
</script>

{#if $userLoaded}
  <slot />
{/if}
