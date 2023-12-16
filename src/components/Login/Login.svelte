<script lang="ts">
  import { signIn } from "@/firebase/users";
  import { useNavigate } from "svelte-navigator";

  const navigate = useNavigate();

  const onSignIn = async () => {
    await signIn();
    navigate("/");
  };
</script>

<div class="flex items-end min-h-screen p-4">
  <div class="main-gradient w-full p-5 py-6 rounded-xl">
    <div class="text-4xl font-bold mb-2">Expense Tracker</div>
    <div class="font-semibold mb-4">
      Created by <a
        href="https://github.com/ryanridnn"
        target="_blank"
        class="text-app-theme-yellow">Ryan Ridwan</a
      >
    </div>

    <button on:click={onSignIn} class="btn btn-primary w-full"
      >Login with Google</button
    >
    <!-- <button on:click={logOut} class="btn btn-danger w-full mt-2">Log Out</button> -->
  </div>
</div>
