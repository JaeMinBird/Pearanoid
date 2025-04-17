<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { vaultStore, isLocked, isInitialized } from '$lib/stores/vaultStore';

	let { children } = $props();
	
	onMount(() => {
		// Initialize the vault store
		vaultStore.initialize();
	});
	
	// Handle lock button click
	function handleLock() {
		vaultStore.lock();
	}
</script>

<div class="min-h-screen flex flex-col">
	<header class="bg-white border-b border-neutral-300">
		<div class="container mx-auto px-4 py-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
					<span class="text-white font-mono font-bold text-xs">P</span>
				</div>
				<h1 class="text-xl font-display font-bold">Pearanoid</h1>
			</div>
			{#if !$isLocked && $isInitialized}
				<nav>
					<ul class="flex gap-6 items-center">
						<li><a href="/" class="text-neutral-700 hover:text-primary transition-colors">Passwords</a></li>
						<li><a href="/generate" class="text-neutral-700 hover:text-primary transition-colors">Generator</a></li>
						<li><a href="/settings" class="text-neutral-700 hover:text-primary transition-colors">Settings</a></li>
						<li>
							<button 
								onclick={handleLock}
								class="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-1 px-3 rounded text-sm transition-colors flex items-center"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
								</svg>
								Lock
							</button>
						</li>
					</ul>
				</nav>
			{/if}
		</div>
	</header>

	<main class="flex-1 container mx-auto px-4 py-8">
		{@render children()}
	</main>

	<footer class="bg-neutral-100 border-t border-neutral-300 py-6">
		<div class="container mx-auto px-4 text-center text-neutral-600 text-sm">
			<p>Pearanoid &copy; {new Date().getFullYear()} — A self-hosted, encrypted password manager</p>
		</div>
	</footer>
</div>
