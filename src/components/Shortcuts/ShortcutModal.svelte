<script lang="ts">
  import Modal from "../Common/Modal.svelte";
  import LoadingButton from "@/components/Common/LoadingButton.svelte";
  import { shortcutModalState } from "@/stores/modals";

  let mode: "add" | "edit" | false;

  let is_mutating = false;

  const onSubmit = async () => {};
</script>

<Modal open={Boolean(mode)} closeModal={() => (mode = false)}>
  <span class="font-bold text-xl" slot="header"
    >{mode === "edit" ? "Edit Shortcut" : "Add Shortcut"}</span
  >
  <div class="mt-4 font-medium"></div>

  <LoadingButton
    class="btn btn-primary w-full rounded-md mt-6"
    disabled={is_mutating}
    on:click={onSubmit}
    loading={is_mutating}
  >
    <span slot="normalText"
      >{mode === "edit" ? "Edit Expense" : "Add Expense"}</span
    >
    <span slot="loadingText"
      >{mode === "edit" ? "Editing..." : "Adding..."}</span
    >
  </LoadingButton>
</Modal>
