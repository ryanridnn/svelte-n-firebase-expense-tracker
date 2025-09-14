<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import Home from "@/components/Home/Home.svelte";
  import Login from "@/components/Login/Login.svelte";
  import AuthRedirector from "@/components/Layout/AuthRedirector.svelte";
  import Layout from "@/components/Layout/Layout.svelte";
  import Shortcuts from "@/components/Shortcuts/Shortcuts.svelte";
</script>

<Router>
  <main class="bg-app-bg-100 min-h-screen text-app-text-light">
    <AuthRedirector />
    <Layout>
      <Route path="/"><Home /></Route>
      <Route path="/login"><Login /></Route>
      <Route path="/shortcuts"><Shortcuts /></Route>
    </Layout>
  </main>
</Router>

<style></style>
